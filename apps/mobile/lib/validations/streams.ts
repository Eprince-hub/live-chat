import { z } from 'zod';

export const streamSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.string().min(1, 'Please select a category'),
  isPrivate: z.boolean(),
  enableChat: z.boolean(),
});

export type StreamFormData = z.infer<typeof streamSchema>;
