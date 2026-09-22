import { Chip, type ChipProps } from "@mui/material";
import type { Classification } from "../../api/types";

// Verde/ámbar/azul/gris por clasificación (SPEC.md sección 4) — distinguible de un vistazo, sin leer texto.
const BADGE: Record<
  Classification,
  { label: string; color: ChipProps["color"] }
> = {
  known: { label: "Conocida", color: "success" },
  potential_new_signal: { label: "Posible señal nueva", color: "warning" },
  already_flagged_by_regulator: { label: "Ya notificada", color: "info" },
  unconfirmed: { label: "Sin confirmar", color: "default" },
};

export default function ClassificationBadge({
  classification,
}: {
  classification: Classification;
}) {
  const badge = BADGE[classification];
  return <Chip size="small" label={badge.label} color={badge.color} />;
}
