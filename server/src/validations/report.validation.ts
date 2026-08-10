import { z } from 'zod/v3';

export const reportReasonValues = [
  'SPAM_DUPLICATE',
  'INAPPROPRIATE',
  'WRONG_CATEGORY',
  'SUSPECTED_SCAM',
  'OTHER',
] as const;

export const CreateReportSchema = z.object({
  postId: z.string().trim().min(1, 'postId is required'),
  reason: z.enum(reportReasonValues),
  details: z.string().trim().max(1000).optional(),
});
