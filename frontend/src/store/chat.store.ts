import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types/chat.types';

export type ChatStatus = 'idle' | 'streaming' | 'error';

type ChatState = {
  messages: Message[];
  status: ChatStatus;
  error: string | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  appendToLastAssistant: (delta: string) => void;
  removeLastAssistantIfEmpty: () => void;
  setStatus: (status: ChatStatus) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      status: 'idle',
      error: null,
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      appendToLastAssistant: (delta) =>
        set((state) => {
          const messages = [...state.messages];
          const last = messages.at(-1);
          if (last?.role === 'assistant') {
            messages[messages.length - 1] = {
              ...last,
              content: last.content + delta,
            };
          }
          return { messages };
        }),
      removeLastAssistantIfEmpty: () =>
        set((state) => {
          const last = state.messages.at(-1);
          if (last?.role === 'assistant' && !last.content.trim()) {
            return { messages: state.messages.slice(0, -1) };
          }
          return state;
        }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),
      clearMessages: () => set({ messages: [], status: 'idle', error: null }),
    }),
    {
      name: 'ai-chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
