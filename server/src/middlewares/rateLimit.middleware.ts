import rateLimit, { Options } from 'express-rate-limit';
import { sendApiError } from '#src/utils/api-response.ts';

const handler: Options['handler'] = (req, res) => {
  sendApiError(res, {
    status: 429,
    message: 'Too many requests, please try again later',
  });
};

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

export const generalRateLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const writeRateLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.RATE_LIMIT_WRITE_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
