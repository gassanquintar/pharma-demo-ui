# CLAUDE — Guía de desarrollo

# Proyecto 3: Demo UI

## Fuente de verdad

La spec completa de este proyecto vive en `docs/SPEC.md` (exportada del Claude
Doc correspondiente). **Antes de escribir código, lee la sección de la fase
en la que estás trabajando en `docs/SPEC.md`.** Esta guía (`CLAUDE.md`) fija
convenciones que aplican a todas las fases; `docs/SPEC.md` fija el qué de
cada una.

## Stack

React + Vite + TypeScript + MUI (Node 22). Gestor de paquetes: pnpm, no usar npm ni yarn. Estado con `useState`/`useContext`,
sin Redux. HTTP con `fetch` nativo en un módulo por API (`ragClient.ts`,
`triageClient.ts`). Detalle completo en `docs/SPEC.md`, sección 3.

Comandos:

- `pnpm dev` — servidor de desarrollo.
- `pnpm build` — `tsc --noEmit` + `vite build`.

## Arquitectura: reglas no negociables

Este proyecto sigue **Clean Architecture + arquitectura hexagonal + DDD**,
con **SOLID** aplicado a los puertos y **DI** explícita. Estas reglas
gobiernan cada fase, no son una sugerencia inicial que se abandona bajo
presión de tiempo:

1. **Regla de dependencia:** `domain/` no importa nada de `adapters/`, de
   `infra/` ni de ninguna librería de infraestructura (HTTP clients, drivers
   de DB, SDKs de LLM). El dominio solo conoce `ports/`.
2. **Puertos estrechos (ISP + SRP):** cada puerto tiene una única
   responsabilidad. Si una interfaz empieza a acumular métodos de propósitos
   distintos, se divide en dos puertos.
3. **Sustituibilidad (LSP):** toda implementación de un puerto — real o
   doble/mock — debe ser intercambiable sin cambiar el comportamiento del
   caso de uso que la consume. Los tests del dominio nunca requieren un
   servicio externo real levantado.
4. **Extensión sin modificación (OCP):** una fuente de datos o proveedor
   nuevo se añade como un adaptador nuevo que implementa un puerto existente
   (o uno nuevo), sin tocar el dominio ni los casos de uso ya escritos.
5. **Inyección de dependencias:** las implementaciones concretas de los
   puertos se construyen en un único punto de composición (el bootstrap de
   la app / `Depends()` de FastAPI), nunca dentro de un caso de uso, un nodo
   de grafo o un componente de UI. Qué adaptador usar (real vs. mock, por
   ejemplo) se decide ahí por configuración, nunca con un `if` dentro del
   código de negocio.
6. **Lenguaje ubicuo (DDD):** nombres de entidades, puertos y casos de uso
   en el vocabulario del dominio (los de `docs/SPEC.md`), nunca genéricos
   como `Item`, `Record`, `Manager`, `Handler`, `Service` sin calificar.

## Flujo de trabajo: una fase a la vez

`docs/SPEC.md` define el roadmap en fases numeradas. Para cada fase:

1. **Diseño antes que código.** Lee la sección de la fase, propone
   brevemente las interfaces/entidades/endpoints antes de implementar nada.
2. **Implementa solo esa fase.** No adelantes trabajo de fases posteriores
   ni "por si acaso" — si algo parece necesario para una fase futura,
   anótalo, no lo construyas todavía.
3. **No marques una fase como terminada tú mismo.** El cierre de fase pasa
   siempre por `/close-phase <N>` (ver `.claude/commands/`), que invoca a
   los subagentes de testing, cumplimiento de spec y arquitectura. Una fase
   solo está cerrada cuando los tres aprueban.

## Testing

Todavía no hay framework de tests: `docs/SPEC.md` (sección 7) no prevé
evaluación ni dominio propio que testear. Por ahora la verificación es
`pnpm build` (typecheck + build). Si una fase añade tests, se añade aquí el
comando exacto (`pnpm test`).

- Los tests del dominio (`domain/`, `ports/` con dobles) corren sin Docker
  levantado y sin red.
- Los tests de un adaptador concreto sí pueden requerir su dependencia real
  (Docker Compose) — se marcan como tests de integración, separados de los
  unitarios.

## Formato y estilo

El hook `PostToolUse` en `.claude/settings.json` autoformatea cada archivo
justo después de escribirlo/editarlo — no hace falta pedirlo explícitamente
ni corregir formato a mano.

## Commits

Un commit (o unos pocos, atómicos) por fase cerrada. Mensaje en el formato
`feat(fase-N): <resumen>` referenciando qué criterio de aceptación de
`docs/SPEC.md` queda cubierto.
