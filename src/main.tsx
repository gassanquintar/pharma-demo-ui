import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createRagClient } from "./api/ragClient";
import { ConversationProvider } from "./context/ConversationContext";

// Único punto de composición: aquí se construye el adaptador concreto del puerto RagClient.
const ragApiUrl = import.meta.env.VITE_RAG_API_URL;
if (!ragApiUrl) throw new Error("Falta VITE_RAG_API_URL (ver .env.example)");
const ragClient = createRagClient(ragApiUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConversationProvider ragClient={ragClient}>
      <App />
    </ConversationProvider>
  </StrictMode>,
);
