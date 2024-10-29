import { z } from 'zod';

export const EnvSchema = z.object({
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  DATABASE_HOST: z.string().regex(/mongodb:\/\/.+/),
  DATABASE_USER: z.string(),
  DATABASE_PASS: z.string(),
  DATABASE_NAME: z.string(),
  SERVICE_ACCOUNT_CREDENTIALS: z.string(),
  SPREADSHEET_ID: z.string(),
});
