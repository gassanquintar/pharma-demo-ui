import type { TriageClient, TriageReport, TriageRequest } from "./types";

export function createTriageClient(baseUrl: string): TriageClient {
  return {
    async askTriage(request: TriageRequest): Promise<TriageReport> {
      const response = await fetch(`${baseUrl}/v1/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok)
        throw new Error(
          `El agente de farmacovigilancia respondió ${response.status}`,
        );
      return (await response.json()) as TriageReport;
    },
  };
}
