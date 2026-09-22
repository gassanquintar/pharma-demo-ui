import { afterEach, expect, test, vi } from "vitest";
import { RateLimitedError } from "./httpErrors";
import { createRagClient } from "./ragClient";

afterEach(() => vi.unstubAllGlobals());

test("askQuestion hace POST /v1/questions y devuelve el cuerpo", async () => {
  const body = { answer: "2.400 mg", citations: [], confidence: "high" };
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", fetchMock);

  const result = await createRagClient("http://api").askQuestion({
    question: "¿Dosis?",
  });

  expect(result).toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(
    "http://api/v1/questions",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ question: "¿Dosis?" }),
    }),
  );
});

test("askQuestion lanza error si la API no responde ok", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
  await expect(
    createRagClient("http://api").askQuestion({ question: "x" }),
  ).rejects.toThrow("500");
});

test("askQuestion lanza RateLimitedError con Retry-After si la API responde 429", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ "Retry-After": "12" }),
    }),
  );
  const error = await createRagClient("http://api")
    .askQuestion({ question: "x" })
    .catch((e) => e);
  expect(error).toBeInstanceOf(RateLimitedError);
  expect(error.retryAfterSeconds).toBe(12);
});

test("askQuestion lanza un error claro si fetch falla (backend caído)", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  await expect(
    createRagClient("http://api").askQuestion({ question: "x" }),
  ).rejects.toThrow("No se pudo conectar con el asistente RAG");
});
