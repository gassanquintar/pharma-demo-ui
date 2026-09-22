// Error compartido por ragClient.ts y triageClient.ts: ninguno de los dos ports define
// esta forma de error (SPEC.md sección 5 — cabeceras de rate limiting comunes a ambas APIs).
export class RateLimitedError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(
      `Límite de peticiones alcanzado, reintentar en ${retryAfterSeconds}s`,
    );
    this.name = "RateLimitedError";
  }
}

// Retry-After llega en segundos (SPEC.md sección 6 del Proyecto 1); si falta o no es numérico,
// un valor por defecto razonable evita dejar el input bloqueado indefinidamente.
export function retryAfterSeconds(response: Response, fallback = 30): number {
  const header = Number(response.headers.get("Retry-After"));
  return Number.isFinite(header) && header > 0 ? header : fallback;
}
