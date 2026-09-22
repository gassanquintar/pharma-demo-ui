import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { RateLimitedError } from "../../api/httpErrors";
import type { TriageClient, TriageReport } from "../../api/types";
import { TriageProvider } from "../../context/TriageContext";
import { fakeTriageClient } from "../../testing/fakeTriageClient";
import TriageView from "./TriageView";

async function ask(report: TriageReport | Error) {
  const { client, requests } = fakeTriageClient(report);
  render(
    <TriageProvider triageClient={client}>
      <TriageView />
    </TriageProvider>,
  );
  await userEvent.type(screen.getByLabelText("Medicamento"), "ibuprofeno");
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
  return requests;
}

test("informe con hallazgos: burbuja de medicamento, resumen, tarjetas y metadata", async () => {
  const requests = await ask({
    drug: "ibuprofeno",
    executive_summary: "Se identificaron 2 reacciones con reportes recientes.",
    findings: [
      {
        reaction: "hemorragia digestiva",
        classification: "known",
        evidence: {
          adverse_events: { source: "FAERS", recent_count: 42 },
          literature: [{ source: "PubMed", id: "1" }],
          label: { section: "4.8", confirmed: true },
        },
      },
      {
        reaction: "urticaria",
        classification: "potential_new_signal",
        evidence: { adverse_events: { recent_count: 5 } },
      },
    ],
    execution_metadata: { tools_called: 7, verification_iterations: 1 },
  });

  expect(requests).toEqual([{ drug: "ibuprofeno" }]);
  expect(screen.getByText("ibuprofeno")).toBeInTheDocument();
  expect(
    await screen.findByText(
      "Se identificaron 2 reacciones con reportes recientes.",
    ),
  ).toBeInTheDocument();

  expect(screen.getByText("hemorragia digestiva")).toBeInTheDocument();
  expect(screen.getByText("Conocida")).toBeInTheDocument();
  expect(
    screen.getByText(
      "42 reportes FAERS recientes · 1 referencias en literatura · ficha técnica sección 4.8",
    ),
  ).toBeInTheDocument();

  expect(screen.getByText("urticaria")).toBeInTheDocument();
  expect(screen.getByText("Posible señal nueva")).toBeInTheDocument();

  expect(
    screen.getByText("7 herramientas llamadas · 1 iteraciones de verificación"),
  ).toBeInTheDocument();
});

test("fallo del cliente: muestra error y reactiva el envío", async () => {
  await ask(new Error("El agente de farmacovigilancia respondió 500"));
  expect(await screen.findByRole("alert")).toHaveTextContent("respondió 500");
  await userEvent.type(screen.getByLabelText("Medicamento"), "otro");
  expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled();
});

test("mientras la petición está en curso, el botón de enviar se deshabilita", async () => {
  let resolveRequest: (report: TriageReport) => void = () => {};
  const client: TriageClient = {
    askTriage: () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
  };
  render(
    <TriageProvider triageClient={client}>
      <TriageView />
    </TriageProvider>,
  );
  await userEvent.type(screen.getByLabelText("Medicamento"), "ibuprofeno");
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

  expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
  expect(screen.getByRole("progressbar")).toBeInTheDocument();

  resolveRequest({
    drug: "ibuprofeno",
    executive_summary: "resumen",
    findings: [],
    execution_metadata: { tools_called: 1, verification_iterations: 0 },
  });
  expect(await screen.findByText("resumen")).toBeInTheDocument();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

test("rate limit (429): avisa, deshabilita el envío y lo reactiva tras Retry-After", async () => {
  // retryAfterSeconds fraccionario: el setTimeout real del contexto espera milisegundos de reloj,
  // no segundos — 0.05s aquí mantiene el test rápido sin recurrir a fake timers (chocan con userEvent).
  const { client } = fakeTriageClient(new RateLimitedError(0.05));
  render(
    <TriageProvider triageClient={client}>
      <TriageView />
    </TriageProvider>,
  );
  await userEvent.type(screen.getByLabelText("Medicamento"), "ibuprofeno");
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent("reintenta en 0.05s");
  expect(alert).toHaveClass("MuiAlert-colorWarning");
  expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();

  await userEvent.type(screen.getByLabelText("Medicamento"), "otro");
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled(),
  );
});
