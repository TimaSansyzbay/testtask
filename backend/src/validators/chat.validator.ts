import { z } from 'zod';

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(50),
  voiceMode: z.boolean().optional(),
});

export type ChatSchema = z.infer<typeof chatSchema>;
