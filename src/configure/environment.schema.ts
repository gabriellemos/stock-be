import { z } from 'zod';

export const EnvSchema = z.object({
  DATABASE_HOST: z.string().regex(/mongodb:\/\/.+/),
  DATABASE_USER: z.string(),
  DATABASE_PASS: z.string(),
  DATABASE_NAME: z.string(),
});
