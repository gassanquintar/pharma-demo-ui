import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Puerto fijo: CORS del Proyecto 1 solo permite este origen (pharma-rag-assistant/infra/settings.py).
  server: { port: 5174, strictPort: true },
  test: { environment: "jsdom", setupFiles: ["./src/test-setup.ts"] },
});
