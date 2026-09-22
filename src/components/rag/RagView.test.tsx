import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import type { QuestionResponse, RagClient } from "../../api/types";
import { ConversationProvider } from "../../context/ConversationContext";
import { fakeRagClient } from "../../testing/fakeRagClient";
import RagView from "./RagView";

async function ask(response: QuestionResponse | Error) {
  const { client, requests } = fakeRagClient(response);
  render(
    <ConversationProvider ragClient={client}>
      <RagView />
    </ConversationProvider>,
  );
  await userEvent.type(screen.getByLabelText("Pregunta"), "¿Dosis máxima?");
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
  return requests;
}

test("respuesta con citas: burbuja de usuario, respuesta y citas expandibles", async () => {
  const requests = await ask({
    answer: "2.400 mg al día",
    confidence: "high",
    citations: [
      {
        drug: "Ibuprofeno",
        registration_number: "1",
        section: "4.2 Posología",
        excerpt: "texto de la ficha",
      },
      {
        type: "safety_notice",
        drug: "Ibuprofeno",
        registration_number: "1",
        publication_date: "2026-01-10",
        excerpt: "texto de la nota",
      },
    ],
  });

  expect(requests).toEqual([{ question: "¿Dosis máxima?" }]);
  expect(await screen.findByText("2.400 mg al día")).toBeInTheDocument();
  expect(screen.getByText("¿Dosis máxima?")).toBeInTheDocument();

  const sheet = screen.getByRole("button", {
    name: "Ibuprofeno · 4.2 Posología",
  });
  expect(sheet).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(sheet);
  expect(sheet).toHaveAttribute("aria-expanded", "true");

  // nota de seguridad: fecha de publicación en vez de sección
  expect(
    screen.getByRole("button", { name: "Ibuprofeno · 2026-01-10" }),
  ).toBeInTheDocument();
});

test("currency_alert se muestra como Alert info, no como error", async () => {
  await ask({
    answer: "Respuesta",
    confidence: "high",
    citations: [],
    currency_alert: "La nota es más reciente que la ficha",
  });
  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent("La nota es más reciente que la ficha");
  expect(alert).toHaveClass("MuiAlert-colorInfo");
});

test("evidencia insuficiente: muestra el reason con estilo neutro, sin Alert de error", async () => {
  await ask({
    answer: null,
    citations: [],
    confidence: "insufficient",
    reason: "No se encontró información.",
  });
  expect(
    await screen.findByText("No se encontró información."),
  ).toBeInTheDocument();
  expect(screen.getByText("Evidencia insuficiente")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("fallo del cliente: muestra error y reactiva el envío", async () => {
  await ask(new Error("El asistente RAG respondió 500"));
  expect(await screen.findByRole("alert")).toHaveTextContent("respondió 500");
  await userEvent.type(screen.getByLabelText("Pregunta"), "otra");
  expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled();
});

test("mientras la petición está en curso, el botón de enviar se deshabilita", async () => {
  let resolveRequest: (response: QuestionResponse) => void = () => {};
  const client: RagClient = {
    askQuestion: () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
  };
  render(
    <ConversationProvider ragClient={client}>
      <RagView />
    </ConversationProvider>,
  );
  await userEvent.type(screen.getByLabelText("Pregunta"), "¿Dosis máxima?");
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

  expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();

  resolveRequest({
    answer: "2.400 mg al día",
    confidence: "high",
    citations: [],
  });
  expect(await screen.findByText("2.400 mg al día")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled(); // sin texto tras limpiar el input
});
