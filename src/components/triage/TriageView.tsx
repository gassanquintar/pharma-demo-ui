import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { useTriage } from "../../context/TriageContext";
import MessageBubble from "../chat/MessageBubble";
import MessageInput from "../chat/MessageInput";
import ReportBubble from "./ReportBubble";

export default function TriageView() {
  const { triageMessages, triagePending, triageRateLimited, askTriage } =
    useTriage();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [triageMessages, triagePending]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {triageMessages.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 4 }}
          >
            Escribe el nombre de un medicamento para empezar.
          </Typography>
        )}
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
            case "rateLimited":
              return (
                <Alert key={index} severity="warning" sx={{ mb: 1.5 }}>
                  Límite de peticiones alcanzado, reintenta en{" "}
                  {message.retryAfterSeconds}s
                </Alert>
              );
          }
        })}
        {triagePending && (
          <MessageBubble align="left">
            <CircularProgress size={20} />
          </MessageBubble>
        )}
        <div ref={end} />
      </Box>
      <MessageInput
        disabled={triagePending || triageRateLimited}
        onSend={askTriage}
        label="Medicamento"
      />
    </Box>
  );
}
