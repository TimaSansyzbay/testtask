import type { Request, Response, NextFunction } from 'express';
import { streamChatCompletion } from '../services/ai.service.js';
import type { ChatRequestBody } from '../types/chat.types.js';

export async function postChat(
  req: Request<object, object, ChatRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { messages, voiceMode } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    for await (const delta of streamChatCompletion(messages, voiceMode)) {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    if (res.headersSent) {
      const message =
        error instanceof Error ? error.message : 'Stream failed';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
      return;
    }
    next(error);
  }
}
