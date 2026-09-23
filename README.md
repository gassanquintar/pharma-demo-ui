# Pharma Demo UI (Proyecto 3)

Interfaz de chat en React + MUI para demostrar en vivo el asistente RAG
regulatorio (Proyecto 1) y el agente de farmacovigilancia (Proyecto 2).
No tiene dominio propio: solo consume las dos APIs por HTTP y renderiza lo
que cada una decide — ver `docs/SPEC.md` para el detalle completo.

## Requisitos

- Node 22
- [pnpm](https://pnpm.io/) — este repo no usa `npm` ni `yarn`
- Los Proyectos 1 y 2 corriendo en local (ver más abajo), con Docker

## Instalación

```bash
pnpm install
cp .env.example .env
```

Edita `.env` con las URLs de los dos backends (ver [Variables de entorno](#variables-de-entorno)).

```bash
pnpm dev
```

La app queda en `http://localhost:5174` — el puerto está fijado en
`vite.config.ts` porque ambos backends solo permiten ese origen por CORS.

## Levantar los tres repos

Este repo es solo la UI. Para una demo completa hacen falta los otros dos,
cada uno en su propia carpeta hermana:

**Proyecto 1 — `pharma-rag-assistant`** (asistente RAG regulatorio)

```bash
cd ../pharma-rag-assistant
cp .env.example .env
# edita .env: rellena LLM_API_KEY y cambia API_PORT=8000 por API_PORT=8100
# (así coincide con VITE_RAG_API_URL de este repo, más abajo)
docker compose up -d
```

Espera a que el contenedor `api` esté `healthy` (`docker compose ps`) — la
primera vez descarga ~3 GB de modelos y tarda varios minutos. Luego indexa
al menos un medicamento; sin este paso la API arranca vacía y toda pregunta
responde "evidencia insuficiente", no una demo funcional:

```bash
docker compose exec api python -m infra.cli ingest 67939
```

Expone `POST /v1/questions`. Su CORS solo permite `http://localhost:5174`
(`cors_allowed_origins` en `apps/rag-cima-api/infra/settings.py`) — si
cambias el puerto de esta UI, cámbialo también ahí.

**Proyecto 2 — `pharma-pv-agent`** (agente de farmacovigilancia)

```bash
cd ../pharma-pv-agent
cp .env.example .env   # añade tu ANTHROPIC_API_KEY; LABEL_VERIFIER=mock funciona sin el Proyecto 1
docker compose up -d
```

Expone `POST /v1/triage` en `http://localhost:8200` por defecto. Mismo CORS
fijo a `http://localhost:5174`.

Con los dos backends arriba y saludables (`GET /v1/health` en cada uno),
`pnpm dev` en este repo completa una consulta regulatoria y un triage de
punta a punta desde la interfaz.

## Variables de entorno

| Variable              | Qué es                                  | Por defecto             |
| ---------------------- | ---------------------------------------- | ------------------------ |
| `VITE_RAG_API_URL`     | Base URL del Proyecto 1 (`/v1/questions`) | `http://localhost:8100` |
| `VITE_TRIAGE_API_URL`  | Base URL del Proyecto 2 (`/v1/triage`)    | `http://localhost:8200` |

Ambas son obligatorias en runtime — `src/main.tsx` lanza un error explícito
al cargar la app en el navegador si falta alguna (no bloquea `pnpm build`,
que solo compila). Apuntar a URLs públicas en vez de local funciona igual,
sin cambios de código.

## Comandos

- `pnpm dev` — servidor de desarrollo (puerto 5174)
- `pnpm build` — `tsc --noEmit` + `vite build`
- `pnpm test` — tests unitarios (vitest + Testing Library), sin red ni Docker: usan
  dobles de `RagClient`/`TriageClient` (`src/testing/`)

## Por qué no Redux

El estado de esta app es acotado y no compartido entre módulos
independientes: la lista de mensajes por pestaña, si hay una respuesta en
curso, y el error de red actual. Eso es exactamente el caso de uso para
`useState` local por componente y un React Context por vista
(`ConversationContext`, `TriageContext`) para compartir el historial entre
el panel de conversación y el input, sin prop-drilling.

Redux (u otra librería de estado global) resuelve un problema — estado
complejo compartido entre muchas partes desconectadas de una app grande —
que esta aplicación no tiene. Añadirlo aquí sería sobre-ingeniería: elegir
la herramienta de estado más simple que resuelve el problema es una señal
más fuerte que usar Redux porque sí.

## Arquitectura, en una línea

Cada backend se consume a través de un puerto estrecho (`RagClient`,
`TriageClient` en `src/api/types.ts`) con un único adaptador `fetch`
(`ragClient.ts`, `triageClient.ts`) inyectado una sola vez, en
`src/main.tsx`. Los componentes de UI y los contexts nunca importan `fetch`
ni construyen un cliente concreto — así los tests corren con dobles, sin
red ni Docker.
