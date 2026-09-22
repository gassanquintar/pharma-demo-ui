// Refleja 1:1 el contrato de POST /v1/questions del Proyecto 1
// (pharma-rag-assistant/docs/SPEC.md, sección 6). Única fuente de forma de datos.

export interface QuestionRequest {
  question: string;
  filters?: Record<string, string>;
}

interface CitationBase {
  drug: string;
  registration_number: string;
  excerpt: string;
}

export interface TechnicalSheetCitation extends CitationBase {
  type?: undefined;
  section: string;
}

export interface SafetyNoticeCitation extends CitationBase {
  type: "safety_notice";
  publication_date: string;
}

export type Citation = TechnicalSheetCitation | SafetyNoticeCitation;

export interface AnsweredQuestion {
  answer: string;
  citations: Citation[];
  confidence: string;
  currency_alert?: string;
}

export interface InsufficientEvidence {
  answer: null;
  citations: [];
  confidence: "insufficient";
  reason: string;
}

export type QuestionResponse = AnsweredQuestion | InsufficientEvidence;

// El FE nunca decide qué es "evidencia insuficiente": solo lee lo que la API ya decidió.
export function isInsufficientEvidence(
  response: QuestionResponse,
): response is InsufficientEvidence {
  return response.confidence === "insufficient";
}

// Puerto: el FE consume el asistente RAG solo a través de esta interfaz.
export interface RagClient {
  askQuestion(request: QuestionRequest): Promise<QuestionResponse>;
}
