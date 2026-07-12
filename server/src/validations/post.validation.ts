import { z } from 'zod/v3';

export const categoryValues = [
  'PHONE',
  'WALLET',
  'ID_CARD',
  'PET',
  'KEYS',
  'ELECTRONICS',
  'BAG',
  'DOCUMENT',
  'CLOTHING',
  'OTHER',
] as const;

export const statusValues = ['LOST', 'FOUND'] as const;

const postImageSchema = z.object({
  url: z.string().url({ message: 'Invalid image URL' }),
  order: z.number().int().min(0),
});

export const CreatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description must be at most 2000 characters'),
  category: z.enum(categoryValues),
  status: z.enum(statusValues),
  location: z.string().trim().min(1, 'Location is required'),
  itemDate: z.coerce.date(),
  images: z
    .array(postImageSchema)
    .max(5, 'A post can have at most 5 images')
    .default([]),
});

export const UpdatePostSchema = CreatePostSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

export const ListPostsQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
  category: z.enum(categoryValues).optional(),
  status: z.enum(statusValues).optional(),
  resolved: z
    .enum(['true', 'false'])
    .optional()
    .transform(value => (value === undefined ? undefined : value === 'true')),
});
