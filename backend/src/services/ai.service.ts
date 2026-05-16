import type { Content } from '@google/generative-ai';
import { getGeminiClient } from '../config/gemini.client.js';
import { env } from '../config/env.js';
import type { ChatMessage } from '../types/chat.types.js';
import { AppError } from '../utils/AppError.js';

const SYSTEM_INSTRUCTION =
  'You are a helpful AI assistant in a chat application. Be concise, clear, and friendly. Format code with markdown when useful.';

const VOICE_SYSTEM_INSTRUCTION =
  'You are a helpful AI voice assistant. Keep ALL responses under 2-3 short sentences — no exceptions. ' +
  'Be direct and conversational. Never use bullet points, headers, numbered lists, or code blocks. ' +
  'If asked about code, describe it briefly in plain language instead of showing it.'

/** Free-tier models that support generateContent (verified via API list). */
const FALLBACK_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-lite',
] as const;

function getModelCandidates(): string[] {
  const preferred = env.GEMINI_MODEL.trim();
  return [...new Set([preferred, ...FALLBACK_MODELS])];
}

function toGeminiHistory(messages: ChatMessage[]): Content[] {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

function getErrorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isModelNotFound(error: unknown): boolean {
  const lower = getErrorText(error).toLowerCase();
  return (
    lower.includes('not found') ||
    lower.includes('404') ||
    lower.includes('is not supported')
  );
}

function isRateLimited(error: unknown): boolean {
  const lower = getErrorText(error).toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted')
  );
}

function mapGeminiError(error: unknown, triedModels: string[]): AppError {
  const message = getErrorText(error);
  const lower = message.toLowerCase();

  if (isRateLimited(error)) {
    return new AppError(
      'Gemini free-tier limit reached. Wait 1–2 minutes, or set GEMINI_MODEL=gemini-2.5-flash-lite in backend/.env',
      429,
    );
  }

  if (
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('api key') ||
    lower.includes('api_key_invalid')
  ) {
    const hint =
      env.NODE_ENV === 'development'
        ? 'Invalid Gemini API key. Create one at https://aistudio.google.com/apikey → set GEMINI_API_KEY in backend/.env → restart the server.'
        : 'AI service configuration error';
    return new AppError(hint, 500);
  }

  if (isModelNotFound(error)) {
    return new AppError(
      `No available Gemini model. Tried: ${triedModels.join(', ')}. Set GEMINI_MODEL=gemini-2.5-flash-lite in backend/.env`,
      502,
    );
  }

  if (lower.includes('timeout') || lower.includes('deadline')) {
    return new AppError('AI service timed out', 504);
  }

  if (env.NODE_ENV === 'development') {
    console.error('[Gemini]', message);
  }

  return new AppError('AI service unavailable', 502);
}

async function* streamWithModel(
  modelName: string,
  history: Content[],
  lastUserText: string,
  voiceMode?: boolean,
): AsyncGenerator<string> {
  const model = getGeminiClient().getGenerativeModel({
    model: modelName,
    systemInstruction: voiceMode ? VOICE_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastUserText);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

export async function* streamChatCompletion(
  messages: ChatMessage[],
  voiceMode?: boolean,
): AsyncGenerator<string> {
  if (messages.length === 0) {
    throw new AppError('No messages provided', 400);
  }

  const last = messages.at(-1);
  if (!last || last.role !== 'user') {
    throw new AppError('Last message must be from the user', 400);
  }

  const history = toGeminiHistory(messages.slice(0, -1));
  const candidates = getModelCandidates();
  const errors: Array<{ model: string; error: unknown }> = [];

  for (let i = 0; i < candidates.length; i += 1) {
    const modelName = candidates[i]!;
    const hasAnother = i < candidates.length - 1;

    try {
      if (modelName !== env.GEMINI_MODEL && errors.length > 0) {
        console.warn(`[Gemini] Falling back to model: ${modelName}`);
      }
      yield* streamWithModel(modelName, history, last.content, voiceMode);
      return;
    } catch (error) {
      errors.push({ model: modelName, error });

      const retry =
        hasAnother && (isModelNotFound(error) || isRateLimited(error));

      if (!retry) {
        throw mapGeminiError(
          error,
          errors.map((entry) => entry.model),
        );
      }
    }
  }

  throw mapGeminiError(
    errors.at(-1)?.error ?? new Error('All models failed'),
    errors.map((entry) => entry.model),
  );
}
