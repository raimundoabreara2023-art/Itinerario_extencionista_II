import { and, eq } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { filiacao, uniao } from '../../db/schema.js';

export function familiasRepository(db: Db) {
  return {
    listarUnioes: () => db.select().from(uniao),
    async buscarUniao(a: number, b: number) {
      const [u] = await db
        .select()
        .from(uniao)
        .where(and(eq(uniao.pessoaAId, a), eq(uniao.pessoaBId, b)));
      return u;
    },
    async criarUniao(a: number, b: number) {
      const [u] = await db.insert(uniao).values({ pessoaAId: a, pessoaBId: b }).returning();
      return u!;
    },
    async excluirUniao(id: number) {
      const r = await db.delete(uniao).where(eq(uniao.id, id)).returning({ id: uniao.id });
      return r.length > 0;
    },

    listarFiliacoes: () => db.select().from(filiacao),
    async buscarFiliacaoDoFilho(filhoId: number, papel: 'PAI' | 'MAE') {
      const [f] = await db
        .select()
        .from(filiacao)
        .where(and(eq(filiacao.filhoId, filhoId), eq(filiacao.papel, papel)));
      return f;
    },
    async criarFiliacao(filhoId: number, genitorId: number, papel: 'PAI' | 'MAE') {
      const [f] = await db.insert(filiacao).values({ filhoId, genitorId, papel }).returning();
      return f!;
    },
    async excluirFiliacao(id: number) {
      const r = await db.delete(filiacao).where(eq(filiacao.id, id)).returning({ id: filiacao.id });
      return r.length > 0;
    },
  };
}
export type FamiliasRepository = ReturnType<typeof familiasRepository>;
