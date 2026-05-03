const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required.' })
    .trim()
    .min(1, 'Title cannot be empty.'),
  description: z.string().optional(),
  category: z.string().optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be in YYYY-MM-DD format.')
    .refine((val) => !isNaN(new Date(val).getTime()), 'due_date must be a valid calendar date.')
    .optional(),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty.').optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be in YYYY-MM-DD format.')
      .refine((val) => !isNaN(new Date(val).getTime()), 'due_date must be a valid calendar date.')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

module.exports = { createTaskSchema, updateTaskSchema };
