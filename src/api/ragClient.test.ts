import { afterEach, expect, test, vi } from "vitest";
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
