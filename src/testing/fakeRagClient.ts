import type {
  QuestionRequest,
  QuestionResponse,
  RagClient,
} from "../api/types";

// Doble de RagClient: devuelve una respuesta fija y registra las preguntas recibidas.
export function fakeRagClient(response: QuestionResponse | Error) {
  const requests: QuestionRequest[] = [];
  const client: RagClient = {
    async askQuestion(request) {
      requests.push(request);
      if (response instanceof Error) throw response;
      return response;
    },
  };
  return { client, requests };
}
