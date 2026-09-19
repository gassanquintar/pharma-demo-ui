---
description: Lee la Fase N de docs/SPEC.md y propone el diseño antes de implementar
---

Vamos a empezar la Fase $ARGUMENTS del roadmap.

1. Lee en `docs/SPEC.md` la sección completa de la Fase $ARGUMENTS: qué
   incluye y su criterio de aceptación exacto. Lee también cualquier
   sección anterior de la spec que esa fase referencie (dominio, puertos,
   contratos de API relevantes).
2. Antes de escribir ninguna línea de código, proponme brevemente:
   - qué entidades/puertos/casos de uso nuevos o modificados hacen falta
   - qué archivos vas a crear o tocar (rutas exactas)
   - cómo vas a testear esta fase en aislamiento (qué dobles/mocks hacen
     falta si el criterio de aceptación aún no requiere la integración
     real)
3. Espera mi confirmación (o mis ajustes) sobre ese diseño antes de
   implementar. Si el diseño es directo y de bajo riesgo, puedes proponerlo
   e implementarlo en la misma respuesta, pero dejándolo explícito primero.
4. Al implementar, sigue estrictamente las reglas de arquitectura de
   `CLAUDE.md` (regla de dependencia, puertos estrechos, DI desde el punto
   de composición, lenguaje ubicuo).

No avances a ninguna fase posterior a la $ARGUMENTS, ni "adelantes" trabajo
de fases futuras aunque parezca conveniente.
