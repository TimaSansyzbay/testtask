export type ChatRole = 'user' | 'assistant';

export type Message = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  messages: Array<{
    role: ChatRole;
    content: string;
  }>;
};
