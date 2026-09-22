import { RateLimitedError, retryAfterSeconds } from "./httpErrors";
import type { QuestionRequest, QuestionResponse, RagClient } from "./types";

export function createRagClient(baseUrl: string): RagClient {
  return {
    async askQuestion(request: QuestionRequest): Promise<QuestionResponse> {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/v1/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
      } catch {
        throw new Error("No se pudo conectar con el asistente RAG");
      }
      if (response.status === 429)
        throw new RateLimitedError(retryAfterSeconds(response));
      if (!response.ok)
        throw new Error(`El asistente RAG respondió ${response.status}`);
      return (await response.json()) as QuestionResponse;
    },
  };
}
