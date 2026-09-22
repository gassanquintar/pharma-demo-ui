import { Alert, Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useConversation } from "../../context/ConversationContext";
import MessageBubble from "../chat/MessageBubble";
import MessageInput from "../chat/MessageInput";
import AnswerBubble from "./AnswerBubble";

export default function RagView() {
  const { ragMessages, ragPending, askRagQuestion } = useConversation();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [ragMessages]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {ragMessages.map((message, index) => {
          switch (message.kind) {
            case "question":
              return (
                <MessageBubble key={index} align="right">
                  {message.text}
                </MessageBubble>
              );
            case "answer":
              return <AnswerBubble key={index} response={message.response} />;
            case "failure":
              return (
                <Alert key={index} severity="error" sx={{ mb: 1.5 }}>
                  {message.message}
                </Alert>
              );
          }
        })}
        <div ref={end} />
      </Box>
      <MessageInput disabled={ragPending} onSend={askRagQuestion} />
    </Box>
  );
}
