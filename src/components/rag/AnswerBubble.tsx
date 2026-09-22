import { Alert } from "@mui/material";
import { isInsufficientEvidence, type QuestionResponse } from "../../api/types";
import MessageBubble from "../chat/MessageBubble";
import CitationChip from "./CitationChip";
import InsufficientEvidenceBubble from "./InsufficientEvidenceBubble";

export default function AnswerBubble({
  response,
}: {
  response: QuestionResponse;
}) {
  if (isInsufficientEvidence(response))
    return <InsufficientEvidenceBubble response={response} />;
  return (
    <MessageBubble align="left">
      {response.answer}
      {response.currency_alert && (
        <Alert severity="info" sx={{ mt: 1 }}>
          {response.currency_alert}
        </Alert>
      )}
      {response.citations.map((citation, index) => (
        <CitationChip key={index} citation={citation} />
      ))}
    </MessageBubble>
  );
}
