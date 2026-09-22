import type { QuestionRequest, QuestionResponse, RagClient } from "./types";

export function createRagClient(baseUrl: string): RagClient {
  return {
    async askQuestion(request: QuestionRequest): Promise<QuestionResponse> {
      const response = await fetch(`${baseUrl}/v1/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok)
        throw new Error(`El asistente RAG respondió ${response.status}`);
      return (await response.json()) as QuestionResponse;
    },
  };
}
