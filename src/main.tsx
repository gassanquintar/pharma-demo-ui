import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createRagClient } from "./api/ragClient";
import { createTriageClient } from "./api/triageClient";
import { ConversationProvider } from "./context/ConversationContext";
import { TriageProvider } from "./context/TriageContext";

// Único punto de composición: aquí se construyen los adaptadores concretos de RagClient y TriageClient.
const ragApiUrl = import.meta.env.VITE_RAG_API_URL;
if (!ragApiUrl) throw new Error("Falta VITE_RAG_API_URL (ver .env.example)");
const ragClient = createRagClient(ragApiUrl);

const triageApiUrl = import.meta.env.VITE_TRIAGE_API_URL;
if (!triageApiUrl)
  throw new Error("Falta VITE_TRIAGE_API_URL (ver .env.example)");
const triageClient = createTriageClient(triageApiUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConversationProvider ragClient={ragClient}>
      <TriageProvider triageClient={triageClient}>
        <App />
      </TriageProvider>
    </ConversationProvider>
  </StrictMode>,
);
