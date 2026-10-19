import { asc, eq } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { pessoa } from '../../db/schema.js';
import type { CriarPessoa } from './pessoas.schema.js';

const valores = (d: CriarPessoa) => ({
  nome: d.nome,
  dataNascimento: d.dataNascimento ?? null,
  sexo: d.sexo ?? null,
});

export function pessoasRepository(db: Db) {
  return {
    listar: () => db.select().from(pessoa).orderBy(asc(pessoa.nome)),
    async buscar(id: number) {
      const [p] = await db.select().from(pessoa).where(eq(pessoa.id, id));
      return p;
    },
    async criar(dados: CriarPessoa) {
      const [p] = await db.insert(pessoa).values(valores(dados)).returning();
      return p!;
    },
    async atualizar(id: number, dados: CriarPessoa) {
      const [p] = await db.update(pessoa).set(valores(dados)).where(eq(pessoa.id, id)).returning();
      return p;
    },
    async definirFoto(id: number, caminho: string | null) {
      const [p] = await db.update(pessoa).set({ foto: caminho }).where(eq(pessoa.id, id)).returning();
      return p;
    },
    async excluir(id: number) {
      const r = await db.delete(pessoa).where(eq(pessoa.id, id)).returning({ id: pessoa.id });
      return r.length > 0;
    },
  };
}
export type PessoasRepository = ReturnType<typeof pessoasRepository>;
