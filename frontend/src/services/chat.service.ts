import type { ChatRequest } from '@/types/chat.types';
import { resolveApiUrl } from '@/utils/apiUrl';

type StreamHandlers = {
  onDelta: (delta: string) => void;
  onError?: (message: string) => void;
};

function parseSseLine(
  line: string,
  handlers: StreamHandlers,
): 'done' | 'continue' {
  if (!line.startsWith('data: ')) {
    return 'continue';
  }

  const payload = line.slice(6).trim();

  if (payload === '[DONE]') {
    return 'done';
  }

  try {
    const data = JSON.parse(payload) as { delta?: string; error?: string };

    if (data.error) {
      handlers.onError?.(data.error);
      return 'done';
    }

    if (data.delta) {
      handlers.onDelta(data.delta);
    }
  } catch {
    // ignore malformed chunks
  }

  return 'continue';
}

export async function streamChat(
  messages: ChatRequest['messages'],
  handlers: StreamHandlers,
  signal?: AbortSignal,
  voiceMode?: boolean,
): Promise<void> {
  const response = await fetch(resolveApiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...(voiceMode && { voiceMode: true }) }),
    signal,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response stream');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (parseSseLine(line, handlers) === 'done') {
        return;
      }
    }
  }
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(resolveApiUrl('/health'));
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return response.json() as Promise<{ status: string }>;
}
