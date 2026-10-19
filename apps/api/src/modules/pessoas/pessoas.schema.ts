import { z } from 'zod';

export const criarPessoaSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(150),
  dataNascimento: z.string().date().nullish(),
  sexo: z.enum(['M', 'F']).nullish(),
});

// Atualização = substituição completa dos campos (mesmo formato do cadastro).
export const atualizarPessoaSchema = criarPessoaSchema;

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type CriarPessoa = z.infer<typeof criarPessoaSchema>;
