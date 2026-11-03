import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().trim().toLowerCase().min(1, 'Informe o login'),
  senha: z.string().min(1, 'Informe a senha'),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(8, 'A nova senha precisa ter ao menos 8 caracteres').max(100),
});
