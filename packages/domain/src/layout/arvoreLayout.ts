import type { Familia } from '../tipos';

/**
 * Calcula a posição de cada pessoa numa árvore genealógica desenhada em
 * linhas (gerações). Não depende de tela nem de banco: recebe famílias
 * (pai, mãe, filhos) e devolve coordenadas.
 *
 * Ideia: cada casal vira uma "unidade". As unidades são distribuídas em
 * linhas (geração) e depois ajustadas várias vezes para que o casal fique
 * centralizado sobre os filhos e os filhos sob os pais.
 */

/** Largura reservada para cada pessoa (foto + nome). */
export const LARGURA_NO = 100;
/** Distância entre os dois cônjuges (centro a centro). */
export const DISTANCIA_CASAL = 210;
/** Altura de cada linha de geração. */
export const ALTURA_LINHA = 200;
export const MARGEM = 60;

/** Casal (ou pessoa sozinha) já posicionado, com os filhos que saem dele. */
export interface CasalPosicionado {
  esquerdaId: number;
  /** null se for uma pessoa sozinha */
  direitaId: number | null;
  filhosIds: number[];
  linha: number;
  /** posição do coração (ou da pessoa sozinha) */
  centroX: number;
}

export interface ResultadoLayout {
  x: Map<number, number>;
  linha: Map<number, number>;
  /** ids dos pais de cada pessoa que tem pais na árvore */
  pais: Map<number, number[]>;
  casais: CasalPosicionado[];
  totalLinhas: number;
  largura: number;
  /** problemas encontrados nos dados (ex.: pessoa em dois casais) */
  avisos: string[];
}

class Unidade {
  membros: number[] = [];
  filhos: number[] = [];
  linha = 0;
  cx = 0;
  emitida = false;
  /** true = o segundo membro fica à esquerda */
  trocada = false;

  get casal(): boolean {
    return this.membros.length === 2;
  }
  get esquerda(): number {
    return this.casal && this.trocada ? this.membros[1]! : this.membros[0]!;
  }
  get direita(): number | null {
    return this.casal ? (this.trocada ? this.membros[0]! : this.membros[1]!) : null;
  }
  get largura(): number {
    return this.casal ? DISTANCIA_CASAL + LARGURA_NO : LARGURA_NO;
  }
  xDe(pessoa: number): number {
    if (!this.casal) return this.cx;
    return pessoa === this.esquerda ? this.cx - DISTANCIA_CASAL / 2 : this.cx + DISTANCIA_CASAL / 2;
  }
}

export function calcularLayout(familias: Familia[]): ResultadoLayout {
  const avisos: string[] = [];
  const unidadeDe = new Map<number, Unidade>();
  const unidades: Unidade[] = [];

  // 1) casais (uma unidade por casal) ------------------------------------
  for (const f of familias) {
    const pais: number[] = [];
    if (f.paiId !== null) pais.push(f.paiId);
    if (f.maeId !== null && f.maeId !== f.paiId) pais.push(f.maeId);
    if (pais.length === 0) continue;

    let existente: Unidade | null = null;
    let conflito = false;
    for (const p of pais) {
      const u = unidadeDe.get(p);
      if (u) {
        if (existente === null) existente = u;
        else if (existente !== u) conflito = true;
      }
    }

    if (existente) {
      const mesmoCasal =
        !conflito &&
        pais.every((p) => existente!.membros.includes(p)) &&
        existente.membros.every((m) => pais.includes(m));
      if (mesmoCasal) {
        for (const c of f.filhosIds) if (!existente.filhos.includes(c)) existente.filhos.push(c);
      } else {
        avisos.push(`Família ignorada: uma das pessoas já aparece em outro casal (${pais.join(' e ')})`);
      }
      continue;
    }

    const u = new Unidade();
    u.membros.push(...pais);
    for (const c of f.filhosIds) if (!u.filhos.includes(c)) u.filhos.push(c);
    unidades.push(u);
    for (const p of pais) unidadeDe.set(p, u);
  }

  // 2) pessoas soltas (só aparecem como filhos) --------------------------
  const todas = new Set<number>();
  for (const f of familias) {
    if (f.paiId !== null) todas.add(f.paiId);
    if (f.maeId !== null) todas.add(f.maeId);
    for (const c of f.filhosIds) todas.add(c);
  }
  for (const p of todas) {
    if (!unidadeDe.has(p)) {
      const u = new Unidade();
      u.membros.push(p);
      unidades.push(u);
      unidadeDe.set(p, u);
    }
  }

  // 3) de quais pais cada pessoa é filha ---------------------------------
  const paisDe = new Map<number, Unidade>();
  for (const u of unidades) {
    for (const c of u.filhos) {
      if (unidadeDe.get(c) === u || paisDe.has(c)) continue;
      paisDe.set(c, u);
    }
  }
  for (const u of unidades) u.filhos = u.filhos.filter((c) => paisDe.get(c) === u);

  // 4) linhas (gerações) -------------------------------------------------
  const limite = unidades.length * 4 + 10;
  let mudou: boolean;
  let voltas = 0;
  do {
    mudou = false;
    for (const u of unidades) {
      if (u.filhos.length === 0) continue;
      // todos os filhos de um casal ficam na mesma linha, logo abaixo dos pais
      let alvo = u.linha + 1;
      for (const c of u.filhos) alvo = Math.max(alvo, unidadeDe.get(c)!.linha);
      for (const c of u.filhos) {
        const cu = unidadeDe.get(c)!;
        if (cu.linha !== alvo) {
          cu.linha = alvo;
          mudou = true;
        }
      }
    }
  } while (mudou && voltas++ < limite);

  // quem não tem pais desce até ficar logo acima dos filhos
  voltas = 0;
  do {
    mudou = false;
    for (const u of unidades) {
      if (!ehRaiz(u, paisDe) || u.filhos.length === 0) continue;
      let min = Number.MAX_SAFE_INTEGER;
      for (const c of u.filhos) min = Math.min(min, unidadeDe.get(c)!.linha);
      if (min - 1 > u.linha) {
        u.linha = min - 1;
        mudou = true;
      }
    }
  } while (mudou && voltas++ < limite);

  let totalLinhas = 0;
  for (const u of unidades) totalLinhas = Math.max(totalLinhas, u.linha + 1);

  // 5) ordem dentro de cada linha (busca em profundidade) ----------------
  const linhas: Unidade[][] = Array.from({ length: totalLinhas }, () => []);

  const raizes = unidades.filter((u) => ehRaiz(u, paisDe));
  raizes.sort((a, b) => a.linha - b.linha); // estável: mantém a ordem de cadastro

  for (const r of raizes) visitar(r, linhas, unidadeDe, paisDe);
  for (const u of unidades) visitar(u, linhas, unidadeDe, paisDe);

  // posição inicial: lado a lado
  for (const linha of linhas) {
    let x = 0;
    let anterior: Unidade | null = null;
    for (const u of linha) {
      if (anterior) x += (anterior.largura + u.largura) / 2;
      u.cx = x;
      anterior = u;
    }
  }

  // 6) ajuste: centraliza casais sobre filhos e filhos sob pais ----------
  const indice = new Map<Unidade, number>();
  unidades.forEach((u, i) => indice.set(u, i));

  for (let volta = 0; volta < 120; volta++) {
    for (const u of unidades) orientar(u, paisDe);

    const desejado = unidades.map((u) => centroDesejado(u, unidadeDe, paisDe));

    for (const linha of linhas) {
      if (linha.length === 0) continue;
      const alvo = linha.map((u) => desejado[indice.get(u)!]!);
      const posicoes = distribuir(linha, alvo);
      linha.forEach((u, i) => {
        u.cx += 0.5 * (posicoes[i]! - u.cx);
      });
    }
  }
  // última passada sem suavização: garante o espaçamento mínimo
  for (const linha of linhas) {
    if (linha.length === 0) continue;
    const p = distribuir(
      linha,
      linha.map((u) => u.cx),
    );
    linha.forEach((u, i) => {
      u.cx = p[i]!;
    });
  }

  // 7) normaliza (margem esquerda) e monta o resultado -------------------
  let minEsq = Number.MAX_VALUE;
  let maxDir = -Number.MAX_VALUE;
  for (const u of unidades) {
    minEsq = Math.min(minEsq, u.cx - u.largura / 2);
    maxDir = Math.max(maxDir, u.cx + u.largura / 2);
  }
  const deslocamento = MARGEM - minEsq;

  const r: ResultadoLayout = {
    x: new Map(),
    linha: new Map(),
    pais: new Map(),
    casais: [],
    totalLinhas,
    largura: maxDir - minEsq + 2 * MARGEM,
    avisos,
  };

  for (const u of unidades) {
    u.cx += deslocamento;
    for (const m of u.membros) {
      r.x.set(m, u.xDe(m));
      r.linha.set(m, u.linha);
    }
    if (u.casal || u.filhos.length > 0) {
      r.casais.push({
        esquerdaId: u.esquerda,
        direitaId: u.direita,
        filhosIds: [...u.filhos],
        linha: u.linha,
        centroX: u.cx,
      });
    }
  }
  for (const [filho, u] of paisDe) r.pais.set(filho, [...u.membros]);
  return r;
}

// ---------------------------------------------------------------------------
// AUXILIARES
// ---------------------------------------------------------------------------

function ehRaiz(u: Unidade, paisDe: Map<number, Unidade>): boolean {
  return !u.membros.some((m) => paisDe.has(m));
}

function visitar(
  u: Unidade,
  linhas: Unidade[][],
  unidadeDe: Map<number, Unidade>,
  paisDe: Map<number, Unidade>,
): void {
  if (u.emitida) return;
  u.emitida = true;
  linhas[u.linha]!.push(u);

  // filhos já colocados primeiro, depois os comuns, e por último os que
  // ainda têm outra família (cônjuge) a ser desenhada mais à direita
  const prioridade = (c: number): number => {
    const cu = unidadeDe.get(c)!;
    if (cu.emitida) return 0;
    for (const m of cu.membros) {
      const outro = paisDe.get(m);
      if (outro && outro !== u && !outro.emitida) return 2;
    }
    return 1;
  };
  const chaves = new Map(u.filhos.map((c) => [c, prioridade(c)]));
  const filhos = [...u.filhos].sort((a, b) => chaves.get(a)! - chaves.get(b)!);
  for (const c of filhos) visitar(unidadeDe.get(c)!, linhas, unidadeDe, paisDe);
}

/** Escolhe qual cônjuge fica à esquerda: o que tem os pais mais à esquerda. */
function orientar(u: Unidade, paisDe: Map<number, Unidade>): void {
  if (!u.casal) return;
  const pa = paisDe.get(u.membros[0]!);
  const pb = paisDe.get(u.membros[1]!);
  let trocar: boolean | null = null;
  if (pa && pb) {
    if (Math.abs(pa.cx - pb.cx) > 20) trocar = pb.cx < pa.cx;
  } else if (pa) {
    if (Math.abs(pa.cx - u.cx) > 20) trocar = pa.cx > u.cx;
  } else if (pb) {
    if (Math.abs(pb.cx - u.cx) > 20) trocar = pb.cx < u.cx;
  }
  if (trocar !== null) u.trocada = trocar;
}

function centroDesejado(
  u: Unidade,
  unidadeDe: Map<number, Unidade>,
  paisDe: Map<number, Unidade>,
): number {
  let soma = 0;
  let n = 0;

  for (const m of u.membros) {
    const pu = paisDe.get(m);
    if (pu) {
      soma += pu.cx - (u.xDe(m) - u.cx);
      n++;
    }
  }
  if (u.filhos.length > 0) {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    for (const c of u.filhos) {
      const xc = unidadeDe.get(c)!.xDe(c);
      min = Math.min(min, xc);
      max = Math.max(max, xc);
    }
    soma += (min + max) / 2;
    n++;
  }
  return n === 0 ? u.cx : soma / n;
}

/**
 * Mantém a ordem da linha, respeita a distância mínima entre unidades
 * vizinhas e chega o mais perto possível das posições desejadas
 * (regressão isotônica / "pool adjacent violators").
 */
function distribuir(linha: Unidade[], alvo: number[]): number[] {
  const n = linha.length;
  const deslocamento = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) {
    deslocamento[i] = deslocamento[i - 1]! + (linha[i - 1]!.largura + linha[i]!.largura) / 2;
  }

  const soma = new Array<number>(n).fill(0);
  const qtd = new Array<number>(n).fill(0);
  let blocos = 0;
  for (let i = 0; i < n; i++) {
    soma[blocos] = alvo[i]! - deslocamento[i]!;
    qtd[blocos] = 1;
    blocos++;
    while (blocos > 1 && soma[blocos - 2]! / qtd[blocos - 2]! > soma[blocos - 1]! / qtd[blocos - 1]!) {
      soma[blocos - 2]! += soma[blocos - 1]!;
      qtd[blocos - 2]! += qtd[blocos - 1]!;
      blocos--;
    }
  }

  const resultado = new Array<number>(n).fill(0);
  let i = 0;
  for (let b = 0; b < blocos; b++) {
    const media = soma[b]! / qtd[b]!;
    for (let k = 0; k < qtd[b]!; k++, i++) resultado[i] = media + deslocamento[i]!;
  }
  return resultado;
}
