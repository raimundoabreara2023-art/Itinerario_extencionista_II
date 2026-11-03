import type { FastifyReply, FastifyRequest } from 'fastify';

type Payload = { usuarioId: number; pessoaId: number; papel: 'ADMIN' | 'MEMBRO' };

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Payload;
    user: Payload;
  }
}

export async function exigirLogin(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ erro: 'Não autenticado' });
  }
}

/** ADMIN faz tudo; MEMBRO só lê, e edita o próprio cadastro/foto. */
export async function exigirPermissao(req: FastifyRequest, reply: FastifyReply) {
  const u = req.user;
  if (u.papel === 'ADMIN' || req.method === 'GET' || req.method === 'HEAD') return;
  const m = /^\/api\/pessoas\/(\d+)(\/foto)?$/.exec(req.url.split('?')[0]!);
  const proprio = m !== null && Number(m[1]) === u.pessoaId;
  if (proprio && (m![2] || req.method === 'PUT')) return;
  return reply.status(403).send({ erro: 'Sem permissão para esta ação' });
}
