import { z } from 'zod';

const id = z.number().int().positive();

export const criarUniaoSchema = z.object({ pessoaAId: id, pessoaBId: id });

// Exportação que estava faltando na API:
export const criarFiliacaoLoteSchema = z.object({
  filhosIds: z.array(id).min(1, 'Selecione pelo menos um filho'),
  genitorId: id,
  papel: z.enum(['PAI', 'MAE']),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type CriarUniao = z.infer<typeof criarUniaoSchema>;
export type CriarFiliacaoLote = z.infer<typeof criarFiliacaoLoteSchema>;