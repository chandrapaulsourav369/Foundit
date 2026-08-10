import express from 'express';
import logger from './config/logger.ts';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import session from 'express-session';
import passport from 'passport';

import authRoutes from './routes/auth.route.ts';
import usersRoutes from './routes/user.route.ts';
import postRoutes from './routes/post.route.ts';
import conversationRoutes from './routes/conversation.route.ts';
import notificationRoutes from './routes/notification.route.ts';
import reportRoutes from './routes/report.route.ts';
import adminRoutes from './routes/admin.route.ts';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  generalRateLimiter,
  writeRateLimiter,
} from '#src/middlewares/rateLimit.middleware.ts';
import {
  getOptionalEnv,
  getSameSiteEnv,
  isProduction,
} from '#src/utils/env.ts';

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const app = express();
app.use(helmet());
app.use(generalRateLimiter);
app.use((req, res, next) => {
  if (WRITE_METHODS.has(req.method)) {
    return writeRateLimiter(req, res, next);
  }
  next();
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  getOptionalEnv('FRONTEND_URL'),
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: getOptionalEnv('SESSION_SECRET', 'dev-session-secret'),
    resave: false,
    saveUninitialized: true,
    // store: new PrismaSessionStore(),
    cookie: {
      secure: isProduction(),
      sameSite: getSameSiteEnv(),
      maxAge: 15 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('Hello from FoundIt!');

  res.status(200).send('Hello from FoundIt!');
});

const healthPayload = () => ({
  status: 'OK',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
});

app.get('/health', (req, res) => {
  sendApiSuccess(res, { data: healthPayload() });
});

app.head('/health', (req, res) => {
  res.status(200).end();
});

app.get('/api', (req, res) => {
  sendApiSuccess(res, { message: 'FoundIt API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', usersRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  sendApiError(res, { status: 404, message: 'Route not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err instanceof Error ? err.stack : String(err)}`);
  if (res.headersSent) {
    return next(err);
  }
  sendApiError(res, { status: 500, message: 'Internal server error' });
});

export default app;
