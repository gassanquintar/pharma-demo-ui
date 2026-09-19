# Kit de arranque para Claude Code — proyectos INSUD

Este kit es genérico: se instala igual en los tres repos (`rag-cima-assistant`,
`pv-triage-agent`, `pharma-ai-demo-ui`), pero **`CLAUDE.md` hay que
personalizarlo por repo** (ver plantilla) porque cada uno tiene su propia spec
y su propio stack (Python/FastAPI los dos primeros, React/Vite el tercero).

## Instalación (repetir en cada repo)

1. Copia todo el contenido de este kit a la raíz del repo (incluida la
   carpeta oculta `.claude/`).
2. Exporta la spec de ese proyecto desde el Claude Doc a Markdown y guárdala
   como `docs/SPEC.md` en el repo — es la fuente de verdad que `CLAUDE.md`
   referencia constantemente.
3. Rellena las tres secciones marcadas `<!-- TODO -->` en `CLAUDE.md`
   (nombre del proyecto, stack exacto, comando de tests).
4. Da permisos de ejecución a los hooks:
   ```bash
   chmod +x .claude/hooks/*.sh
   ```
5. Arranca Claude Code en la raíz del repo:
   ```bash
   claude
   ```

## Qué incluye

- **`CLAUDE.md`** — contexto persistente: arquitectura, principios
  (DDD/Clean Architecture/SOLID/DI), convenciones de testing y el flujo de
  trabajo fase a fase basado en `docs/SPEC.md`.
- **`.claude/settings.json`** — permisos pre-aprobados para comandos
  habituales (git, pytest/npm, docker compose) y dos hooks:
  - `PostToolUse` → autoformatea el archivo justo editado (ruff/black para
    Python, prettier para TS/JS).
  - `PreToolUse` → antes de cualquier `git commit`, corre la suite de tests;
    si falla, bloquea el commit (exit code 2) en vez de dejarlo pasar.
- **`.claude/agents/`** — tres subagentes que corren en su propio contexto
  (no ensucian la conversación principal) y que **cierran** cada fase del
  roadmap:
  - `test-runner` — corre tests/eval y resume el resultado.
  - `spec-compliance-checker` — contrasta lo implementado contra el
    criterio de aceptación exacto de la fase en `docs/SPEC.md`.
  - `architecture-reviewer` — revisor escéptico de arquitectura: aplica el
    checklist de DDD/Clean Architecture/SOLID/DI de las specs y **puede
    rechazar** la fase con motivos concretos.
- **`.claude/commands/`** — dos slash commands:
  - `/start-phase <N>` — lee la Fase N de `docs/SPEC.md`, propone el
    diseño/interfaces antes de escribir código.
  - `/close-phase <N>` — invoca los tres subagentes en orden y solo si los
    tres aprueban, sugiere el mensaje de commit para cerrar la fase.

## Uso día a día

```
/start-phase 2
```
Claude Code lee la Fase 2 de la spec, propone el diseño, lo implementa.

```
/close-phase 2
```
Corre tests → chequeo de criterio de aceptación → revisión de arquitectura.
Si algo falla, te dice exactamente qué y por qué, en vez de marcar la fase
como terminada a medias.

## Nota sobre el modo "auto"

Por defecto este kit deja el modo de permisos estándar (te pregunta antes de
acciones sensibles). Si querés que Claude Code no te interrumpa en cada
comando ya pre-aprobado, podés poner `"defaultMode": "auto"` en
`.claude/settings.json` — pero hacelo a propósito, no como configuración por
defecto al copiar el kit.
