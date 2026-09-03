// middleware/auth.middleware.ts
import { verifyAccessToken } from '#src/utils/jwt/tokens.ts';
import { Response, NextFunction, Request, RequestHandler } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { isValidSession } from '#src/services/token.service.ts';
import { z, ZodError } from 'zod/v3';
import { sendApiError } from '#src/utils/api-response.ts';
import { findUserById } from '#src/services/user.service.ts';

const getAccessTokenFromRequest = (req: AuthRequest) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return req.cookies?.accessToken;
};

// Resolves a request's bearer/cookie token into an authenticated identity,
// or null if the token is missing/invalid — shared by the required and
// optional auth middlewares so the verification rule only lives once.
const resolveAuthenticatedUser = async (req: AuthRequest) => {
  const token = getAccessTokenFromRequest(req);
  if (!token) return null;

  const getData = await verifyAccessToken(token);
  const { userId, sessionId } = getData || {};
  if (!userId || !sessionId) return null;

  const isActiveSession = await isValidSession(userId, sessionId);
  if (!isActiveSession) return null;

  const user = await findUserById(userId);
  if (!user || !user.isActive) return null;

  return { userId, sessionId, role: user.role };
};

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const identity = await resolveAuthenticatedUser(req);
    if (!identity) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    (req as AuthRequest).userId = identity.userId;
    (req as AuthRequest).sessionId = identity.sessionId;
    (req as AuthRequest).role = identity.role;
    next();
  } catch (err) {
    return sendApiError(res, {
      status: 401,
      message: 'Invalid or expired token',
    });
  }
};

// Same as authMiddleware but never rejects — attaches req.userId when a
// valid session is present, otherwise leaves the request anonymous. Use for
// public routes that personalize their response when the caller is logged in.
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const identity = await resolveAuthenticatedUser(req);
    if (identity) {
      (req as AuthRequest).userId = identity.userId;
      (req as AuthRequest).sessionId = identity.sessionId;
      (req as AuthRequest).role = identity.role;
    }
  } catch {
    // ignore — treat as anonymous
  }
  next();
};

export const validateRequest =
  <T extends z.ZodTypeAny>(schema: T) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);

      // Important: overwrite body with validated + transformed data
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendApiError(res, {
          status: 400,
          message: error.errors[0]?.message || 'Validation error',
          errors: error.flatten().fieldErrors,
        });
        return;
      }

      next(error);
    }
  };


  //authenticate update