---
description: Cierra la Fase N invocando test-runner, spec-compliance-checker y architecture-reviewer, en ese orden
---

Vamos a intentar cerrar la Fase $ARGUMENTS del roadmap. Sigue este orden
exacto y no te saltes ningún paso:

1. Invoca al subagente `test-runner` para la Fase $ARGUMENTS.
   - Si falla, detente aquí, muéstrame el fallo tal cual lo reportó el
     subagente, y no continúes con los siguientes pasos.
2. Si los tests pasan, invoca al subagente `spec-compliance-checker` para
   la Fase $ARGUMENTS.
   - Si algún criterio no está cumplido, detente aquí y muéstrame la tabla
     de criterios tal cual la devolvió el subagente.
3. Si el cumplimiento de spec está completo, invoca al subagente
   `architecture-reviewer` para la Fase $ARGUMENTS.
   - Si el veredicto es RECHAZADA, detente aquí y muéstrame la lista de
     violaciones tal cual.
4. Solo si los tres subagentes aprueban, resume en 2-3 líneas qué quedó
   cubierto en esta fase y proponme el mensaje de commit en el formato
   `feat(fase-$ARGUMENTS): <resumen>`, referenciando el criterio de
   aceptación cubierto. No hagas el commit tú mismo — proponlo y espera
   confirmación.

No marques la fase como cerrada en ningún otro caso que no sea "los tres
subagentes aprobaron".
