import type { FastifyInstance } from 'fastify';
import type { Db } from '../../db/client.js';
import { atualizarPessoaSchema, criarPessoaSchema, idParamSchema } from './pessoas.schema.js';
import { pessoasRepository } from './pessoas.repository.js';
import { pessoasService } from './pessoas.service.js';

export function pessoasRoutes(db: Db) {
  const service = pessoasService(pessoasRepository(db));
  return async (app: FastifyInstance) => {
    app.get('/pessoas', async () => service.listar());
    app.get('/pessoas/:id', async (req) => {
      const { id } = idParamSchema.parse(req.params);
      return service.obter(id);
    });
    app.post('/pessoas', async (req, reply) => {
      const dados = criarPessoaSchema.parse(req.body);
      return reply.status(201).send(await service.criar(dados));
    });
    app.put('/pessoas/:id', async (req) => {
      const { id } = idParamSchema.parse(req.params);
      return service.atualizar(id, atualizarPessoaSchema.parse(req.body));
    });
    app.delete('/pessoas/:id', async (req, reply) => {
      const { id } = idParamSchema.parse(req.params);
      await service.excluir(id);
      return reply.status(204).send();
    });
  };
}
