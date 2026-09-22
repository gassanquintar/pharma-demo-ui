import type { TriageClient, TriageReport, TriageRequest } from "../api/types";

// Doble de TriageClient: devuelve un informe fijo y registra los medicamentos recibidos.
export function fakeTriageClient(report: TriageReport | Error) {
  const requests: TriageRequest[] = [];
  const client: TriageClient = {
    async askTriage(request) {
      requests.push(request);
      if (report instanceof Error) throw report;
      return report;
    },
  };
  return { client, requests };
}
