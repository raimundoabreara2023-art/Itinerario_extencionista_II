import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  PORT: z.coerce.number().int().default(3333),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter 32+ caracteres'),
});

export const env = schema.parse(process.env);
