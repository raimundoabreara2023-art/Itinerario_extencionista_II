import { eq } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { pessoa, usuario } from '../../db/schema.js';

export function authRepository(db: Db) {
  return {
    async buscarPorLogin(login: string) {
      const [u] = await db.select().from(usuario).where(eq(usuario.login, login));
      return u;
    },
    async buscarSenhaHash(id: number) {
      const [u] = await db.select({ h: usuario.senhaHash }).from(usuario).where(eq(usuario.id, id));
      return u?.h;
    },
    async buscarPerfil(id: number) {
      const [u] = await db
        .select({
          id: usuario.id,
          login: usuario.login,
          papel: usuario.papel,
          pessoaId: usuario.pessoaId,
          trocarSenha: usuario.trocarSenha,
          nome: pessoa.nome,
        })
        .from(usuario)
        .innerJoin(pessoa, eq(pessoa.id, usuario.pessoaId))
        .where(eq(usuario.id, id));
      return u;
    },
    async definirSenha(id: number, senhaHash: string) {
      await db.update(usuario).set({ senhaHash, trocarSenha: false }).where(eq(usuario.id, id));
    },
  };
}
