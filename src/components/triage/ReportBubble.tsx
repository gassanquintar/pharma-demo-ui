import { Typography } from "@mui/material";
import type { TriageReport } from "../../api/types";
import MessageBubble from "../chat/MessageBubble";
import FindingCard from "./FindingCard";

export default function ReportBubble({ report }: { report: TriageReport }) {
  return (
    <MessageBubble align="left">
      {report.executive_summary}
      {report.findings.map((finding, index) => (
        <FindingCard key={index} finding={finding} />
      ))}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        {report.execution_metadata.tools_called} herramientas llamadas ·{" "}
        {report.execution_metadata.verification_iterations} iteraciones de
        verificación
      </Typography>
    </MessageBubble>
  );
}
