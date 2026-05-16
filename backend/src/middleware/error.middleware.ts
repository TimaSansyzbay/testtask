import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Invalid request',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (env.NODE_ENV === 'development' && err instanceof Error) {
    console.error(err);
  } else if (!(err instanceof AppError)) {
    console.error('Unexpected error:', err);
  }

  res.status(500).json({ message: 'Internal server error' });
}
