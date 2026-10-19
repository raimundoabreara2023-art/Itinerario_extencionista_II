import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Fastify from 'fastify';
import { sql } from 'drizzle-orm';
import { ZodError } from 'zod';
import type { Db } from './db/client.js';
import { ErroNegocio } from './shared/erros.js';
import { fotosRoutes } from './modules/fotos/fotos.routes.js';
import { familiasRoutes } from './modules/familias/familias.routes.js';
import { pessoasRoutes } from './modules/pessoas/pessoas.routes.js';

export async function createApp(opts: { db: Db; webOrigin: string; uploadDir: string }) {
  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: opts.webOrigin,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  });

  const uploadDir = path.resolve(opts.uploadDir);
  mkdirSync(path.join(uploadDir, 'fotos'), { recursive: true });
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  await app.register(fastifyStatic, { root: uploadDir, prefix: '/api/uploads/' });

  app.setErrorHandler((erro, _req, reply) => {
    if (erro instanceof ZodError) {
      return reply.status(400).send({ erro: 'Dados inválidos', detalhes: erro.flatten() });
    }
    if (erro instanceof ErroNegocio) {
      return reply.status(erro.status).send({ erro: erro.message });
    }
    app.log.error(erro);
    return reply.status(500).send({ erro: 'Erro interno' });
  });

  app.get('/api/health', async () => ({ ok: true }));
  app.get('/api/health/db', async () => {
    await opts.db.execute(sql`select 1`);
    return { ok: true, db: 'conectado' };
  });

  await app.register(pessoasRoutes(opts.db), { prefix: '/api' });
  await app.register(familiasRoutes(opts.db), { prefix: '/api' });
  await app.register(fotosRoutes(opts.db, uploadDir), { prefix: '/api' });
  return app;
}
