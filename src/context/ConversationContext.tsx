import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { QuestionResponse, RagClient } from "../api/types";

export type ConversationMessage =
  | { kind: "question"; text: string }
  | { kind: "answer"; response: QuestionResponse }
  | { kind: "failure"; message: string };

interface Conversation {
  ragMessages: ConversationMessage[];
  ragPending: boolean;
  askRagQuestion: (question: string) => Promise<void>;
}

const ConversationContext = createContext<Conversation | null>(null);

export function ConversationProvider({
  ragClient,
  children,
}: {
  ragClient: RagClient;
  children: ReactNode;
}) {
  const [ragMessages, setRagMessages] = useState<ConversationMessage[]>([]);
  const [ragPending, setRagPending] = useState(false);

  const askRagQuestion = useCallback(
    async (question: string) => {
      setRagMessages((messages) => [
        ...messages,
        { kind: "question", text: question },
      ]);
      setRagPending(true);
      try {
        const response = await ragClient.askQuestion({ question });
        setRagMessages((messages) => [
          ...messages,
          { kind: "answer", response },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error desconocido";
        setRagMessages((messages) => [
          ...messages,
          { kind: "failure", message },
        ]);
      } finally {
        setRagPending(false);
      }
    },
    [ragClient],
  );

  const value = useMemo(
    () => ({ ragMessages, ragPending, askRagQuestion }),
    [ragMessages, ragPending, askRagQuestion],
  );
  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation(): Conversation {
  const conversation = useContext(ConversationContext);
  if (!conversation)
    throw new Error("useConversation requiere <ConversationProvider>");
  return conversation;
}
