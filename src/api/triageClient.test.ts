import { afterEach, expect, test, vi } from "vitest";
import { createTriageClient } from "./triageClient";

afterEach(() => vi.unstubAllGlobals());

test("askTriage hace POST /v1/triage y devuelve el cuerpo", async () => {
  const body = {
    drug: "ibuprofeno",
    executive_summary: "resumen",
    findings: [],
    execution_metadata: { tools_called: 0, verification_iterations: 0 },
  };
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", fetchMock);

  const result = await createTriageClient("http://api").askTriage({
    drug: "ibuprofeno",
  });

  expect(result).toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(
    "http://api/v1/triage",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ drug: "ibuprofeno" }),
    }),
  );
});

test("askTriage lanza error si la API no responde ok", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
  await expect(
    createTriageClient("http://api").askTriage({ drug: "x" }),
  ).rejects.toThrow("500");
});
