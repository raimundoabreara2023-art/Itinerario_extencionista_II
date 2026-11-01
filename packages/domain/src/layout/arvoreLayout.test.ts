import { describe, expect, it } from 'vitest';
import type { Familia } from '../tipos';
import { ALTURA_LINHA, DISTANCIA_CASAL, LARGURA_NO, calcularLayout } from './arvoreLayout';

const fam = (paiId: number | null, maeId: number | null, ...filhosIds: number[]): Familia => ({
  paiId,
  maeId,
  filhosIds,
});

/** Família de teste: 4 gerações, casamentos cruzados e um genitor sozinho. */
const FAMILIAS: Familia[] = [
  fam(1, 2, 3, 12),
  fam(4, 5, 6, 7, 8, 9),
  fam(3, 6, 10, 11),
  fam(8, 13, 14, 15),
  fam(10, 16, 17),
  fam(18, null, 19),
];

/**
 * Valores "golden": gerados pelo ArvoreLayout.java original (aprovado na
 * versão JavaFX) para a mesma família. Se o TS divergir, o port está errado.
 */
const ESPERADO: Record<number, [x: number, linha: number]> = {
  1: [128.86363636363632, 0],
  2: [338.8636363636363, 0],
  4: [643.8636363636363, 0],
  5: [853.8636363636363, 0],
  3: [287.15909090909076, 1],
  6: [497.15909090909076, 1],
  8: [697.1590909090908, 1],
  13: [907.1590909090908, 1],
  10: [320.0, 2],
  16: [110.0, 2],
  18: [1103.8636363636363, 0],
  12: [187.15909090909076, 1],
  7: [597.1590909090908, 1],
  9: [1007.1590909090908, 1],
  11: [420.0, 2],
  14: [748.8636363636363, 2],
  15: [848.8636363636363, 2],
  17: [211.70454545454552, 3],
  19: [1107.1590909090908, 1],
};

describe('calcularLayout', () => {
  const r = calcularLayout(FAMILIAS);

  it('reproduz exatamente o resultado do Java', () => {
    expect(r.totalLinhas).toBe(4);
    expect(r.largura).toBeCloseTo(1217.1590909090908, 6);
    for (const [id, [x, linha]] of Object.entries(ESPERADO)) {
      expect(r.x.get(Number(id)), `x de ${id}`).toBeCloseTo(x, 6);
      expect(r.linha.get(Number(id)), `linha de ${id}`).toBe(linha);
    }
    expect(r.x.size).toBe(Object.keys(ESPERADO).length);
  });

  it('todos os filhos de um casal ficam na mesma linha, logo abaixo dos pais', () => {
    for (const c of r.casais) {
      for (const f of c.filhosIds) expect(r.linha.get(f)).toBe(c.linha + 1);
    }
  });

  it('cônjuges ficam à distância do casal e na mesma linha', () => {
    for (const c of r.casais) {
      if (c.direitaId === null) continue;
      expect(r.linha.get(c.esquerdaId)).toBe(r.linha.get(c.direitaId));
      expect(r.x.get(c.direitaId)! - r.x.get(c.esquerdaId)!).toBeCloseTo(DISTANCIA_CASAL, 6);
      expect(c.centroX).toBeCloseTo((r.x.get(c.esquerdaId)! + r.x.get(c.direitaId)!) / 2, 6);
    }
  });

  it('ninguém se sobrepõe na mesma linha', () => {
    const porLinha = new Map<number, number[]>();
    for (const [id, linha] of r.linha) {
      porLinha.set(linha, [...(porLinha.get(linha) ?? []), r.x.get(id)!]);
    }
    for (const xs of porLinha.values()) {
      xs.sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i++) expect(xs[i]! - xs[i - 1]!).toBeGreaterThanOrEqual(LARGURA_NO - 1e-6);
    }
  });

  it('registra os pais de cada filho', () => {
    expect(r.pais.get(17)).toEqual([10, 16]);
    expect(r.pais.get(19)).toEqual([18]);
    expect(r.pais.has(1)).toBe(false);
  });

  it('usa a constante de altura de linha', () => {
    expect(ALTURA_LINHA).toBe(200);
  });

  it('avisa e ignora quando uma pessoa aparece em dois casais', () => {
    const conflito = calcularLayout([fam(1, 2, 3), fam(1, 4, 5)]);
    expect(conflito.avisos).toHaveLength(1);
  });

  it('casal sem filhos é desenhado', () => {
    const solo = calcularLayout([fam(1, 2)]);
    expect(solo.casais).toHaveLength(1);
    expect(solo.totalLinhas).toBe(1);
  });
});
