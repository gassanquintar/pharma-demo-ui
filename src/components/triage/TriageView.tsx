import { Alert, Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useTriage } from "../../context/TriageContext";
import MessageBubble from "../chat/MessageBubble";
import MessageInput from "../chat/MessageInput";
import ReportBubble from "./ReportBubble";

export default function TriageView() {
  const { triageMessages, triagePending, askTriage } = useTriage();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [triageMessages]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {triageMessages.map((message, index) => {
          switch (message.kind) {
            case "drug":
              return (
                <MessageBubble key={index} align="right">
                  {message.text}
                </MessageBubble>
              );
            case "report":
              return <ReportBubble key={index} report={message.report} />;
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
      <MessageInput
        disabled={triagePending}
        onSend={askTriage}
        label="Medicamento"
      />
    </Box>
  );
}
