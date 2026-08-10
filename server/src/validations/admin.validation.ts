import { z } from 'zod/v3';
import { categoryValues, statusValues } from '#src/validations/post.validation.ts';
import { reportReasonValues } from '#src/validations/report.validation.ts';

export const AdminListPostsQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
  category: z.enum(categoryValues).optional(),
  status: z.enum(statusValues).optional(),
  resolved: z
    .enum(['true', 'false'])
    .optional()
    .transform(value => (value === undefined ? undefined : value === 'true')),
  deleted: z.enum(['true', 'false', 'all']).optional(),
});

export const AdminListUsersQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'BANNED']).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const UpdateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BANNED']),
});

export const AdminListReportsQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED']).optional(),
  reason: z.enum(reportReasonValues).optional(),
});

export const UpdateReportSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED']).optional(),
  adminResponse: z.string().trim().max(1000).optional(),
});
