import { useCallback, useRef } from 'react';
import { streamChat } from '@/services/chat.service';
import { useChatStore } from '@/store/chat.store';
import type { ChatRole, Message } from '@/types/chat.types';
import { getErrorMessage } from '@/utils/errors';

function createMessage(role: ChatRole, content: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

function toApiMessages(messages: Message[]) {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .map(({ role, content }) => ({ role, content }));
}

export function useChat() {
  const messages = useChatStore((state) => state.messages);
  const status = useChatStore((state) => state.status);
  const error = useChatStore((state) => state.error);
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessages = useChatStore((state) => state.setMessages);
  const appendToLastAssistant = useChatStore(
    (state) => state.appendToLastAssistant,
  );
  const removeLastAssistantIfEmpty = useChatStore(
    (state) => state.removeLastAssistantIfEmpty,
  );
  const setStatus = useChatStore((state) => state.setStatus);
  const setError = useChatStore((state) => state.setError);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const abortRef = useRef<AbortController | null>(null);

  const isLoading = status === 'streaming';

  const runStream = useCallback(
    async (history: ReturnType<typeof toApiMessages>, voiceMode?: boolean) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const assistantMessage = createMessage('assistant', '');
      addMessage(assistantMessage);
      setStatus('streaming');
      setError(null);

      try {
        await streamChat(
          history,
          {
            onDelta: (delta) => appendToLastAssistant(delta),
            onError: (message) => setError(message),
          },
          abortRef.current.signal,
          voiceMode,
        );
        setStatus('idle');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setStatus('idle');
          return;
        }
        removeLastAssistantIfEmpty();
        setError(getErrorMessage(err));
        setStatus('error');
      }
    },
    [
      addMessage,
      appendToLastAssistant,
      removeLastAssistantIfEmpty,
      setError,
      setStatus,
    ],
  );

  const sendMessage = useCallback(
    async (content: string, options?: { voiceMode?: boolean }) => {
      const trimmed = content.trim();
      if (!trimmed || useChatStore.getState().status === 'streaming') return;

      const userMessage = createMessage('user', trimmed);
      const history = toApiMessages([...messages, userMessage]);

      addMessage(userMessage);
      await runStream(history, options?.voiceMode);
    },
    [addMessage, messages, runStream],
  );

  const regenerate = useCallback(async () => {
    if (useChatStore.getState().status === 'streaming') return;

    const current = useChatStore.getState().messages;
    let lastUserIndex = -1;
    for (let i = current.length - 1; i >= 0; i -= 1) {
      if (current[i]?.role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const trimmed = current.slice(0, lastUserIndex + 1);
    setMessages(trimmed);
    await runStream(toApiMessages(trimmed));
  }, [runStream, setMessages]);

  const retry = useCallback(async () => {
    if (status !== 'error') return;
    setError(null);
    await regenerate();
  }, [regenerate, setError, status]);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, [setStatus]);

  const lastMessage = messages.at(-1);
  const canRegenerate =
    !isLoading &&
    messages.length > 0 &&
    lastMessage?.role === 'assistant' &&
    Boolean(lastMessage.content);

  return {
    messages,
    status,
    error,
    isLoading,
    canRegenerate,
    sendMessage,
    regenerate,
    retry,
    stopGenerating,
    clearMessages,
  };
}
