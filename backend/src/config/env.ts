import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1).transform((value) => value.trim()),
  /** Free-tier default — gemini-1.5-flash is retired; use *-flash-lite models */
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash-lite'),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(`Invalid environment variables:\n${formatted}`);
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();
