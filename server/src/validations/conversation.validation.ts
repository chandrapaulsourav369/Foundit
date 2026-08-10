import { z } from 'zod/v3';

export const CreateConversationSchema = z.object({
  postId: z.string().trim().min(1, 'postId is required'),
});

export const CreateMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be at most 2000 characters'),
});

export const ListMessagesQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});
