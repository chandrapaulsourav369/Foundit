import { Request, Response } from 'express';

export interface AuthRequest extends Request {
  // express-serve-static-core types params as `string | string[]` to allow
  // for wildcard route captures; none of our routes use those, so narrow
  // it back to plain string params for every handler using AuthRequest.
  params: Record<string, string>;
  userId?: string;
  sessionId?: string;
  role?: 'USER' | 'ADMIN';
}

export type ApiResponse = Response;
