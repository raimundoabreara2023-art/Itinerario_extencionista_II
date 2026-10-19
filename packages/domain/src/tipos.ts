/**
 * Tipos do domínio. Este pacote NÃO conhece banco, HTTP nem tela:
 * só regras e cálculos puros, fáceis de testar.
 */

export type Sexo = 'M' | 'F';

/** Papel de um genitor em relação ao filho. Não depende do sexo da pessoa. */
export type PapelFiliacao = 'PAI' | 'MAE';

export interface Pessoa {
  id: number;
  nome: string;
  /** Formato AAAA-MM-DD */
  dataNascimento: string | null;
  sexo: Sexo | null;
  /** Caminho RELATIVO da foto (ex.: "fotos/benedito.png") */
  foto: string | null;
}

/** Casal. Sempre guardado com pessoaAId < pessoaBId, para não duplicar. */
export interface Uniao {
  id: number;
  pessoaAId: number;
  pessoaBId: number;
}

/** "genitorId é PAI/MAE de filhoId". Cada filho tem no máximo um PAI e uma MAE. */
export interface Filiacao {
  id: number;
  filhoId: number;
  genitorId: number;
  papel: PapelFiliacao;
}

/** Uma família montada por id: quem são os pais e quais são os filhos. */
export interface Familia {
  paiId: number | null;
  maeId: number | null;
  filhosIds: number[];
}
