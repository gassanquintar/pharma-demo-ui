import { RateLimitedError, retryAfterSeconds } from "./httpErrors";
import type { TriageClient, TriageReport, TriageRequest } from "./types";

export function createTriageClient(baseUrl: string): TriageClient {
  return {
    async askTriage(request: TriageRequest): Promise<TriageReport> {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/v1/triage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
      } catch {
        throw new Error(
          "No se pudo conectar con el agente de farmacovigilancia",
        );
      }
      if (response.status === 429)
        throw new RateLimitedError(retryAfterSeconds(response));
      if (!response.ok)
        throw new Error(
          `El agente de farmacovigilancia respondió ${response.status}`,
        );
      return (await response.json()) as TriageReport;
    },
  };
}
