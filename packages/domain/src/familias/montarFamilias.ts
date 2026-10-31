import type { Familia, Filiacao, Uniao } from '../tipos';

type UniaoMin = Pick<Uniao, 'pessoaAId' | 'pessoaBId'>;
type FiliacaoMin = Pick<Filiacao, 'filhoId' | 'genitorId' | 'papel'>;

/**
 * Transforma as ligações do banco (uniões + filiações, tudo por id) nas
 * "famílias" que o layout da árvore entende: pai, mãe e filhos.
 *
 * Regras:
 * - Todo casal cadastrado vira uma família, mesmo sem filhos.
 * - Os filhos entram no casal formado pelos seus dois genitores.
 * - Se um filho só tem UM genitor cadastrado e esse genitor tem exatamente
 *   UMA união, o parceiro é considerado o outro genitor (só para desenhar).
 * - Pessoas sem nenhuma ligação não entram (a tela as lista à parte).
 */
export function montarFamilias(unioes: UniaoMin[], filiacoes: FiliacaoMin[]): Familia[] {
  // parceiros de cada pessoa
  const parceiros = new Map<number, number[]>();
  const addParceiro = (a: number, b: number) => {
    const l = parceiros.get(a) ?? [];
    if (!l.includes(b)) l.push(b);
    parceiros.set(a, l);
  };
  for (const u of unioes) {
    addParceiro(u.pessoaAId, u.pessoaBId);
    addParceiro(u.pessoaBId, u.pessoaAId);
  }

  // pai e mãe de cada filho (na ordem em que os filhos aparecem)
  const genitores = new Map<number, { pai: number | null; mae: number | null }>();
  for (const f of filiacoes) {
    const g = genitores.get(f.filhoId) ?? { pai: null, mae: null };
    if (f.papel === 'PAI') g.pai = f.genitorId;
    else g.mae = f.genitorId;
    genitores.set(f.filhoId, g);
  }

  // completa o genitor que falta quando só há um parceiro possível
  for (const g of genitores.values()) {
    if (g.pai !== null && g.mae === null) {
      const ps = parceiros.get(g.pai);
      if (ps && ps.length === 1) g.mae = ps[0]!;
    } else if (g.mae !== null && g.pai === null) {
      const ps = parceiros.get(g.mae);
      if (ps && ps.length === 1) g.pai = ps[0]!;
    }
  }

  const familias = new Map<string, Familia>();
  const chaveCasal = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;

  // 1) casais cadastrados (na ordem de cadastro)
  for (const u of unioes) {
    familias.set(chaveCasal(u.pessoaAId, u.pessoaBId), {
      paiId: u.pessoaAId,
      maeId: u.pessoaBId,
      filhosIds: [],
    });
  }

  // 2) filhos
  for (const [filho, g] of genitores) {
    let chave: string;
    if (g.pai !== null && g.mae !== null) chave = chaveCasal(g.pai, g.mae);
    else chave = `solo-${g.pai ?? g.mae}`;

    let fam = familias.get(chave);
    if (!fam) {
      fam = { paiId: g.pai, maeId: g.mae, filhosIds: [] };
      familias.set(chave, fam);
    } else {
      // garante pai/mãe corretos (o casal pode ter vindo só da união)
      if (g.pai !== null) fam.paiId = g.pai;
      if (g.mae !== null) fam.maeId = g.mae;
    }
    if (!fam.filhosIds.includes(filho)) fam.filhosIds.push(filho);
  }

  return [...familias.values()];
}
