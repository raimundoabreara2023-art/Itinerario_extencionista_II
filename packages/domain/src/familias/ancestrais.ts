import type { Filiacao } from '../tipos';

/**
 * Verdadeiro se `ancestralId` é ancestral (pai, avô, bisavô...) de `pessoaId`.
 * Usado para impedir ciclos: ninguém pode ser pai de um de seus próprios ancestrais.
 */
export function ehAncestral(
  filiacoes: Pick<Filiacao, 'filhoId' | 'genitorId'>[],
  ancestralId: number,
  pessoaId: number,
): boolean {
  const genitoresDe = new Map<number, number[]>();
  for (const f of filiacoes) {
    const lista = genitoresDe.get(f.filhoId) ?? [];
    lista.push(f.genitorId);
    genitoresDe.set(f.filhoId, lista);
  }
  const visitados = new Set<number>();
  const pilha = [pessoaId];
  while (pilha.length > 0) {
    const atual = pilha.pop()!;
    for (const g of genitoresDe.get(atual) ?? []) {
      if (g === ancestralId) return true;
      if (!visitados.has(g)) {
        visitados.add(g);
        pilha.push(g);
      }
    }
  }
  return false;
}
