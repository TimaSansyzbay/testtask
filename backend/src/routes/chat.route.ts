import { Router } from 'express';
import { postChat } from '../controllers/chat.controller.js';
import { chatRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { chatSchema } from '../validators/chat.validator.js';

export const chatRouter = Router();

chatRouter.use(chatRateLimiter);
chatRouter.post('/', validateBody(chatSchema), postChat);
