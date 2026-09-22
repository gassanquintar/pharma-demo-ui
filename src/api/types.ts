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

// Refleja 1:1 el contrato de POST /v1/triage del Proyecto 2
// (pharma-pv-agent/docs/SPEC.md, sección 8).

export interface TriageRequest {
  drug: string;
}

export type Classification =
  | "known"
  | "potential_new_signal"
  | "already_flagged_by_regulator"
  | "unconfirmed";

export interface Finding {
  reaction: string;
  classification: Classification;
  // Shape por fuente (FAERS/PubMed/ficha técnica); el contrato no la fija más que eso.
  evidence: Record<string, unknown>;
}

export interface ExecutionMetadata {
  tools_called: number;
  verification_iterations: number;
}

export interface TriageReport {
  drug: string;
  executive_summary: string;
  findings: Finding[];
  execution_metadata: ExecutionMetadata;
}

// Puerto: el FE consume el agente de farmacovigilancia solo a través de esta interfaz.
export interface TriageClient {
  askTriage(request: TriageRequest): Promise<TriageReport>;
}
