import { Typography } from "@mui/material";
import type { InsufficientEvidence } from "../../api/types";
import MessageBubble from "../chat/MessageBubble";

// Respuesta válida del sistema, no un fallo: estilo neutro, nunca rojo/error.
export default function InsufficientEvidenceBubble({
  response,
}: {
  response: InsufficientEvidence;
}) {
  return (
    <MessageBubble align="left" neutral>
      <Typography
        variant="caption"
        sx={{ display: "block", fontWeight: 600, textTransform: "uppercase" }}
      >
        Evidencia insuficiente
      </Typography>
      {response.reason}
    </MessageBubble>
  );
}
