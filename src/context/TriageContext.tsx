import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TriageClient, TriageReport } from "../api/types";

export type TriageMessage =
  | { kind: "drug"; text: string }
  | { kind: "report"; report: TriageReport }
  | { kind: "failure"; message: string };

interface Triage {
  triageMessages: TriageMessage[];
  triagePending: boolean;
  askTriage: (drug: string) => Promise<void>;
}

const TriageContext = createContext<Triage | null>(null);

export function TriageProvider({
  triageClient,
  children,
}: {
  triageClient: TriageClient;
  children: ReactNode;
}) {
  const [triageMessages, setTriageMessages] = useState<TriageMessage[]>([]);
  const [triagePending, setTriagePending] = useState(false);

  const askTriage = useCallback(
    async (drug: string) => {
      setTriageMessages((messages) => [
        ...messages,
        { kind: "drug", text: drug },
      ]);
      setTriagePending(true);
      try {
        const report = await triageClient.askTriage({ drug });
        setTriageMessages((messages) => [
          ...messages,
          { kind: "report", report },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error desconocido";
        setTriageMessages((messages) => [
          ...messages,
          { kind: "failure", message },
        ]);
      } finally {
        setTriagePending(false);
      }
    },
    [triageClient],
  );

  const value = useMemo(
    () => ({ triageMessages, triagePending, askTriage }),
    [triageMessages, triagePending, askTriage],
  );
  return (
    <TriageContext.Provider value={value}>{children}</TriageContext.Provider>
  );
}

export function useTriage(): Triage {
  const triage = useContext(TriageContext);
  if (!triage) throw new Error("useTriage requiere <TriageProvider>");
  return triage;
}
