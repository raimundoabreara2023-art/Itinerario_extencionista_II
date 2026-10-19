import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyInstance } from 'fastify';
import type { Db } from '../../db/client.js';
import { ErroNegocio, naoEncontrado } from '../../shared/erros.js';
import { pessoasRepository } from '../pessoas/pessoas.repository.js';
import { idParamSchema } from '../pessoas/pessoas.schema.js';

const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function fotosRoutes(db: Db, uploadDir: string) {
  const pessoas = pessoasRepository(db);
  const dirFotos = path.join(uploadDir, 'fotos');

  const apagarArquivo = (relativo: string | null) =>
    relativo ? unlink(path.join(uploadDir, relativo)).catch(() => undefined) : Promise.resolve();

  return async (app: FastifyInstance) => {
    app.post('/pessoas/:id/foto', async (req) => {
      const { id } = idParamSchema.parse(req.params);
      const pessoa = await pessoas.buscar(id);
      if (!pessoa) throw naoEncontrado('Pessoa');

      const arquivo = await req.file();
      if (!arquivo) throw new ErroNegocio('Envie uma imagem');
      const ext = EXTENSOES[arquivo.mimetype];
      if (!ext) {
        arquivo.file.resume();
        throw new ErroNegocio('Formato inválido: use JPG, PNG ou WebP');
      }

      await mkdir(dirFotos, { recursive: true });
      const nome = `${id}-${Date.now()}${ext}`;
      const destino = path.join(dirFotos, nome);
      await pipeline(arquivo.file, createWriteStream(destino));
      if (arquivo.file.truncated) {
        await unlink(destino).catch(() => undefined);
        throw new ErroNegocio('Imagem maior que 5 MB');
      }

      await apagarArquivo(pessoa.foto);
      return pessoas.definirFoto(id, `fotos/${nome}`);
    });

    app.delete('/pessoas/:id/foto', async (req) => {
      const { id } = idParamSchema.parse(req.params);
      const pessoa = await pessoas.buscar(id);
      if (!pessoa) throw naoEncontrado('Pessoa');
      await apagarArquivo(pessoa.foto);
      return pessoas.definirFoto(id, null);
    });
  };
}
