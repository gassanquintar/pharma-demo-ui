import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { Finding } from "../../api/types";
import ClassificationBadge from "./ClassificationBadge";

// Resumen legible de evidence: conteo de FAERS, nº de referencias de literatura, sección de ficha
// técnica — el shape por fuente no está fijado más estrictamente en el contrato (SPEC.md sección 8).
function evidenceSummary(evidence: Finding["evidence"]): string {
  const parts: string[] = [];
  const adverseEvents = evidence.adverse_events as
    { recent_count?: number } | undefined;
  if (adverseEvents?.recent_count !== undefined)
    parts.push(`${adverseEvents.recent_count} reportes FAERS recientes`);

  const literature = evidence.literature as unknown[] | undefined;
  if (Array.isArray(literature) && literature.length > 0)
    parts.push(`${literature.length} referencias en literatura`);

  const label = evidence.label as
    { section?: string; confirmed?: boolean } | undefined;
  if (label?.section) parts.push(`ficha técnica sección ${label.section}`);

  return parts.join(" · ") || "sin evidencia detallada";
}

export default function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Card variant="outlined" sx={{ mt: 1 }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 0.5 }}
        >
          <Typography variant="subtitle2">{finding.reaction}</Typography>
          <ClassificationBadge classification={finding.classification} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {evidenceSummary(finding.evidence)}
        </Typography>
      </CardContent>
    </Card>
  );
}
