import { Box, Chip, Collapse, Typography } from "@mui/material";
import { useState } from "react";
import type { Citation } from "../../api/types";

// Ficha técnica: medicamento + sección. Nota de seguridad: medicamento + fecha de publicación.
function citationLabel(citation: Citation): string {
  return citation.type === "safety_notice"
    ? `${citation.drug} · ${citation.publication_date}`
    : `${citation.drug} · ${citation.section}`;
}

export default function CitationChip({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mt: 1 }}>
      <Chip
        size="small"
        variant="outlined"
        color={citation.type === "safety_notice" ? "warning" : "default"}
        label={citationLabel(citation)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      />
      <Collapse in={open}>
        <Typography
          variant="caption"
          component="blockquote"
          sx={{ m: 0, mt: 0.5, pl: 1.5, borderLeft: 2, borderColor: "divider" }}
        >
          {citation.excerpt}
        </Typography>
      </Collapse>
    </Box>
  );
}
