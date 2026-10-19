import { z } from 'zod';

const id = z.number().int().positive();

export const criarUniaoSchema = z.object({ pessoaAId: id, pessoaBId: id });
export const criarFiliacaoSchema = z.object({
  filhoId: id,
  genitorId: id,
  papel: z.enum(['PAI', 'MAE']),
});
export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type CriarUniao = z.infer<typeof criarUniaoSchema>;
export type CriarFiliacao = z.infer<typeof criarFiliacaoSchema>;
