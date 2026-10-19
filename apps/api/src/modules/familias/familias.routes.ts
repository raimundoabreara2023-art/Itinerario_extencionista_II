import type { FastifyInstance } from 'fastify';
import type { Db } from '../../db/client.js';
import { pessoasRepository } from '../pessoas/pessoas.repository.js';
import { criarFiliacaoSchema, criarUniaoSchema, idParamSchema } from './familias.schema.js';
import { familiasRepository } from './familias.repository.js';
import { familiasService } from './familias.service.js';

export function familiasRoutes(db: Db) {
  const service = familiasService(familiasRepository(db), pessoasRepository(db));
  return async (app: FastifyInstance) => {
    app.get('/unioes', async () => service.listarUnioes());
    app.post('/unioes', async (req, reply) =>
      reply.status(201).send(await service.criarUniao(criarUniaoSchema.parse(req.body))),
    );
    app.delete('/unioes/:id', async (req, reply) => {
      await service.excluirUniao(idParamSchema.parse(req.params).id);
      return reply.status(204).send();
    });

    app.get('/filiacoes', async () => service.listarFiliacoes());
    app.post('/filiacoes', async (req, reply) =>
      reply.status(201).send(await service.criarFiliacao(criarFiliacaoSchema.parse(req.body))),
    );
    app.delete('/filiacoes/:id', async (req, reply) => {
      await service.excluirFiliacao(idParamSchema.parse(req.params).id);
      return reply.status(204).send();
    });
  };
}
