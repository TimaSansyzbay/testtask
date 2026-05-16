import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { chatRouter } from './routes/chat.route.js';
import { healthRouter } from './routes/health.route.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
          cb(null, true);
        } else {
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/chat', chatRouter);

  app.use((req, res) => {
    if (env.NODE_ENV === 'development') {
      console.warn(`404 ${req.method} ${req.originalUrl}`);
    }
    res.status(404).json({ message: 'Not found' });
  });

  app.use(errorMiddleware);

  return app;
}
