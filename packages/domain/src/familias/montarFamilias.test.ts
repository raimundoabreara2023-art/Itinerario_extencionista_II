import { describe, expect, it } from 'vitest';
import { montarFamilias } from './montarFamilias';

describe('montarFamilias', () => {
  it('casal sem filhos aparece como família vazia', () => {
    expect(montarFamilias([{ pessoaAId: 1, pessoaBId: 2 }], [])).toEqual([
      { paiId: 1, maeId: 2, filhosIds: [] },
    ]);
  });

  it('junta os filhos ao casal e acerta pai/mãe pelo papel', () => {
    const f = montarFamilias(
      [{ pessoaAId: 1, pessoaBId: 2 }], // 1 é a mãe, 2 é o pai
      [
        { filhoId: 3, genitorId: 2, papel: 'PAI' },
        { filhoId: 3, genitorId: 1, papel: 'MAE' },
      ],
    );
    expect(f).toEqual([{ paiId: 2, maeId: 1, filhosIds: [3] }]);
  });

  it('filho com um só genitor assume o único parceiro como outro genitor', () => {
    const f = montarFamilias(
      [{ pessoaAId: 1, pessoaBId: 2 }],
      [{ filhoId: 3, genitorId: 1, papel: 'PAI' }],
    );
    expect(f).toEqual([{ paiId: 1, maeId: 2, filhosIds: [3] }]);
  });

  it('genitor sem união continua sozinho', () => {
    const f = montarFamilias([], [{ filhoId: 3, genitorId: 1, papel: 'MAE' }]);
    expect(f).toEqual([{ paiId: null, maeId: 1, filhosIds: [3] }]);
  });

  it('não adivinha o parceiro quando há duas uniões', () => {
    const f = montarFamilias(
      [
        { pessoaAId: 1, pessoaBId: 2 },
        { pessoaAId: 1, pessoaBId: 4 },
      ],
      [{ filhoId: 3, genitorId: 1, papel: 'PAI' }],
    );
    expect(f).toContainEqual({ paiId: 1, maeId: null, filhosIds: [3] });
  });
});
