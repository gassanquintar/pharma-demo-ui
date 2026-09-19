# Spec Técnico — Frontend de Demo (Proyecto 3)

2026-09-18 · @Someone

## 1. Contexto y objetivo

Los Proyectos 1 y 2 exponen APIs REST correctas y evaluadas, pero una entrevista se vive en pantalla: una API respondida con `curl` no comunica lo mismo que una interfaz que se pueda usar en vivo. Este proyecto es esa interfaz.

**Objetivo de la v1:** una aplicación React de una sola página, con estética de chat (inspirada en Claude), que permita interactuar en vivo con el asistente RAG del Proyecto 1 y con el agente de farmacovigilancia del Proyecto 2, sin más ambición que esa.

**Esto no es un producto ni el foco técnico del portfolio.** El peso de la demostración de AI engineering está en los Proyectos 1 y 2; este frontend existe porque el rol es "Full-Stack AI Engineering" y porque una demo visual ayuda en la entrevista — no porque necesite el mismo rigor de evaluación, guardrails o arquitectura de dominio que los otros dos. Por eso esta spec es deliberadamente más corta.

## 2. Alcance

**Incluido en la v1:**

- Layout único tipo chat, con un selector (`Tabs`) entre "Consultas regulatorias" (Proyecto 1) y "Triage de farmacovigilancia" (Proyecto 2)
- Vista Proyecto 1: input de pregunta, burbujas de conversación, citas visibles por respuesta, estado visual distinto para "evidencia insuficiente"
- Vista Proyecto 2: input de medicamento, informe renderizado como tarjetas de hallazgos con badge de color por clasificación
- Manejo de estados de carga y error de red (los backends pueden tardar, tener rate limiting, o no estar corriendo)

**Fuera de alcance en la v1:**

- Autenticación, multi-usuario, persistencia de conversación entre sesiones (recargar la página reinicia el estado)
- Routing complejo, diseño responsive elaborado (una demo de portátil no lo necesita)
- Cualquier lógica de negocio propia — el FE nunca decide qué es "evidencia insuficiente" o cómo clasificar un hallazgo, solo renderiza lo que cada API ya decidió

**Independencia:** repositorio propio (p. ej. `pharma-ai-demo-ui`), sin paquetes compartidos con los otros dos. Consume ambas APIs solo por HTTP, con sus URLs configurables por variable de entorno — así puede apuntar a los backends corriendo en local o, si se despliegan, a sus URLs públicas, sin cambios de código.

## 3. Stack técnico

**Framework:** React + Vite + TypeScript

**UI:** MUI (Material UI) — componentes: `Tabs`, `Card`, `Chip`, `TextField`, `CircularProgress`, `Alert`. Tema oscuro/claro simple con la paleta por defecto de MUI, sin sistema de diseño propio

**Cliente HTTP:** `fetch` nativo envuelto en dos módulos finos (`ragClient.ts`, `triageClient.ts`), uno por API — nunca un cliente genérico que mezcle ambos contratos

**Estado:** `useState`/`useContext` de React — ver justificación en la sección 6

**Estructura de carpetas:**

```
src/
  components/
    chat/           # burbujas, input, layout compartido
    rag/            # tarjeta de cita, estado "evidencia insuficiente"
    triage/         # tarjeta de hallazgo, badge de clasificación
  api/
    ragClient.ts
    triageClient.ts
    types.ts        # tipos que reflejan los contratos de las secciones 5/6/8 de los Proyectos 1 y 2
  context/
    ConversationContext.tsx
  App.tsx
```

**Contenedores:** Docker opcional solo para servir el build estático (`nginx` o `vite preview`) si se quiere una demo desplegada; para la entrevista, `npm run dev` local es suficiente — coste $0 en cualquier caso.

## 4. Vistas y componentes

**Layout compartido:** cabecera fija con el `Tabs` de MUI para cambiar entre las dos vistas; panel de conversación con scroll; input fijo abajo con botón de enviar (deshabilitado mientras hay una respuesta en curso).

**Vista Proyecto 1 — Consultas regulatorias:**

- Burbuja de usuario (derecha): la pregunta tal cual se escribió
- Burbuja de respuesta (izquierda): el texto de `answer`, seguido de las `citations` como `Chip`s expandibles (medicamento + sección o, si `type: safety_notice`, la fecha de publicación en vez de la sección)
- Si `confidence: "insufficient"`: burbuja con estilo neutro (no rojo/error), mostrando el `reason` — es una respuesta válida del sistema, no un fallo
- Si la nota de seguridad es más reciente que la ficha técnica (`currency_alert` presente): un `Alert` de severidad "info" dentro de la burbuja, no un error

**Vista Proyecto 2 — Triage de farmacovigilancia:**

- "Burbuja" de usuario: el nombre del medicamento consultado
- "Respuesta": el `executive_summary`, seguido de una `Card` por cada elemento de `findings`, con:
  - `Chip` de color por `classification`: verde (`known`), ámbar (`potential_new_signal`), azul (`already_flagged_by_regulator`), gris (`unconfirmed`)
  - el nombre de la `reaction` y un resumen legible de su `evidence` (conteo de FAERS, referencias de literatura, sección o nota de la ficha técnica)
- Un pie con `execution_metadata` (herramientas llamadas, iteraciones de verificación) en texto pequeño, para poder señalarlo en la entrevista sin que domine la interfaz

**Estados de carga y error (ambas vistas):** `CircularProgress` en la burbuja de respuesta mientras se espera; `Alert` de severidad "warning" si la API devuelve `429` (mostrando cuánto esperar, leyendo `Retry-After`); `Alert` de severidad "error" solo ante un fallo real de red o `5xx`.

**Efecto typewriter (ambas vistas):** la respuesta llega completa y ya verificada del backend — no hay streaming real de tokens, deliberadamente: el Proyecto 1 verifica la fidelidad de la respuesta *después* de generarla (sección 8 de esa spec) y puede descartarla, así que mostrar tokens según se generan implicaría poder "retractar" texto ya visto al usuario. En su lugar, el FE revela la respuesta ya completa progresivamente (carácter o palabra por palabra, con `setTimeout`/`setInterval`), lo que es visualmente indistinguible de un streaming real sin comprometer el guardrail de verificación. Aplica igual a la vista del Proyecto 2 sobre el `executive_summary`, por consistencia visual entre ambas pestañas.

## 5. Contrato de consumo

El FE no define contratos propios — consume exactamente los ya definidos en las otras dos specs, y `types.ts` los refleja 1:1:

- **Proyecto 1:** `POST /v1/questions` (sección 6 de esa spec) — request `{ question, filters? }`, response con `answer`, `citations[]` (cada una con `type`, y `section` o `publication_date` según corresponda), `confidence`, y opcionalmente `currency_alert`
- **Proyecto 2:** `POST /v1/triage` (sección 8 de esa spec) — request `{ drug }`, response con `executive_summary`, `findings[]` (cada uno con `reaction`, `classification`, `evidence`), `execution_metadata`
- Ambas URLs base configurables vía `VITE_RAG_API_URL` y `VITE_TRIAGE_API_URL`
- El FE respeta las cabeceras de rate limiting de ambas APIs (`X-RateLimit-Remaining`, `Retry-After` — sección 6 del Proyecto 1) para decidir cuándo deshabilitar el input en vez de dejar que el usuario reintente a ciegas

Si cualquiera de las dos specs cambia su contrato, el cambio se refleja primero en `types.ts` — es la única fuente de verdad de forma de datos dentro de este repo, y cualquier componente que la use se tipa contra ella, nunca contra la respuesta cruda de `fetch`.

## 6. Manejo de estado

**Decisión: sin Redux.** El estado de esta app es acotado y no compartido entre módulos independientes — la lista de mensajes por pestaña, si hay una respuesta en curso, y el error de red actual. Eso es exactamente el caso de uso para `useState` local por componente y un `ConversationContext` (React Context + `useReducer` si la lógica de mensajes crece) para compartir el historial entre el panel de conversación y el input, sin prop-drilling.

Redux (u otra librería de estado global) resuelve un problema — estado complejo compartido entre muchas partes desconectadas de una app grande — que esta aplicación no tiene. Añadirlo aquí sería sobre-ingeniería, y en una entrevista senior "elegí la herramienta de estado más simple que resuelve el problema" es una señal más fuerte que "usé Redux porque el puesto decía full-stack". El README debe explicar esta decisión explícitamente en una sección corta ("Por qué no Redux"), convirtiendo la ausencia de la librería en una demostración de criterio, no en una omisión.

## 7. Plan de implementación

Más corto que los otros dos: sin evaluación, sin dominio propio que testear en aislamiento. Aun así, cada fase se construye con Claude Code contra la sección correspondiente de esta spec.

**Fase 0 — Esqueleto:** proyecto Vite + React + TypeScript + MUI, layout compartido con `Tabs` vacías. Criterio: `npm run dev` levanta la app con las dos pestañas visibles, sin funcionalidad todavía.

**Fase 1 — Vista Proyecto 1:** `ragClient.ts`, `types.ts` para su contrato, burbujas de conversación, citas, estado "evidencia insuficiente" y `alerta_vigencia`. Criterio: contra el Proyecto 1 corriendo en local, una pregunta real devuelve una respuesta renderizada con sus citas.

**Fase 2 — Vista Proyecto 2:** `triageClient.ts`, tarjetas de hallazgos con badges de clasificación. Criterio: contra el Proyecto 2 corriendo en local (con su mock o real), un medicamento real devuelve un informe renderizado.

**Fase 3 — Estados de carga, error y rate limiting:** `CircularProgress`, manejo de `429`/`Retry-After`, manejo de fallos de red. Criterio: apagando deliberadamente uno de los dos backends, la vista correspondiente muestra un error claro sin romper la otra pestaña.

**Fase 4 — Pulido y README:** ajustes visuales finales, variables de entorno documentadas, sección "Por qué no Redux" en el README. Criterio: alguien externo puede clonar el repo, configurar las dos URLs de API, y tener la demo funcionando siguiendo solo el README.

## 8. Criterios de aceptación de la v1

1. Con los dos backends corriendo en local, se puede completar una consulta regulatoria y un triage de farmacovigilancia de punta a punta desde la interfaz, sin usar `curl` ni herramientas de desarrollador
2. El estado "evidencia insuficiente" y los distintos valores de `classification` son visualmente distinguibles de un vistazo, sin leer texto
3. Apagar uno de los dos backends no rompe la otra pestaña ni la aplicación completa
4. El repositorio no importa código ni tipos de los repos de los Proyectos 1 o 2 — solo los consume por HTTP
5. El README permite a alguien externo levantar la demo completa (los tres repos) siguiendo instrucciones claras, incluyendo la justificación de no usar Redux
