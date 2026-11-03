import type { FastifyInstance } from 'fastify';
import type { Db } from '../../db/client.js';
import { exigirLogin } from '../../shared/autenticacao.js';
import { ErroNegocio } from '../../shared/erros.js';
import { conferirSenha, hashSenha } from '../../shared/senha.js';
import { loginSchema, trocarSenhaSchema } from './auth.schema.js';
import { authRepository } from './auth.repository.js';

const SETE_DIAS = 60 * 60 * 24 * 7;

export function authRoutes(db: Db) {
  const repo = authRepository(db);
  const cookie = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SETE_DIAS,
  };

  return async (app: FastifyInstance) => {
    app.post('/auth/login', async (req, reply) => {
      const { login, senha } = loginSchema.parse(req.body);
      const u = await repo.buscarPorLogin(login);
      if (!u || !(await conferirSenha(senha, u.senhaHash))) {
        throw new ErroNegocio('Login ou senha inválidos', 401);
      }
      const token = app.jwt.sign(
        { usuarioId: u.id, pessoaId: u.pessoaId, papel: u.papel },
        { expiresIn: '7d' },
      );
      reply.setCookie('token', token, cookie);
      return repo.buscarPerfil(u.id);
    });

    app.post('/auth/logout', async (_req, reply) => {
      reply.clearCookie('token', { path: '/' });
      return reply.status(204).send();
    });

    app.get('/auth/me', { onRequest: [exigirLogin] }, async (req) => {
      const perfil = await repo.buscarPerfil(req.user.usuarioId);
      if (!perfil) throw new ErroNegocio('Sessão inválida', 401);
      return perfil;
    });

    app.post('/auth/trocar-senha', { onRequest: [exigirLogin] }, async (req, reply) => {
      const { senhaAtual, novaSenha } = trocarSenhaSchema.parse(req.body);
      const id = req.user.usuarioId;
      const atual = await repo.buscarSenhaHash(id);
      if (!atual || !(await conferirSenha(senhaAtual, atual))) {
        throw new ErroNegocio('Senha atual incorreta', 422);
      }
      await repo.definirSenha(id, await hashSenha(novaSenha));
      return reply.status(204).send();
    });
  };
}
