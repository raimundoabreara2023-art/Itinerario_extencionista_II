const CONECTORES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** As primeiras n palavras "de verdade" (de/da/do não contam, mas ficam no texto). */
function comPalavras(completo: string, n: number): string {
  const partes = completo.trim().split(/\s+/);
  const usadas: string[] = [];
  let contadas = 0;

  for (const parte of partes) {
    const conector = CONECTORES.has(parte.toLowerCase());
    if (!conector && contadas === n) break;
    usadas.push(parte);
    if (!conector) contadas++;
  }
  while (usadas.length > 0 && CONECTORES.has(usadas[usadas.length - 1]!.toLowerCase())) {
    usadas.pop();
  }

  const texto = usadas.join(' ');
  // nomes muito curtos (ex.: "Zé") ganham a segunda palavra
  if (n === 1 && partes.length > 1 && texto.length <= 2) return comPalavras(completo, 2);
  return texto;
}

/**
 * Cada pessoa mostra o menor nome que a diferencia das outras
 * (Maria, Maria Celina, Maria do Socorro...). Portado do ArvoreController em Java.
 */
export function nomesCurtos(pessoas: { id: number; nome: string }[]): Map<number, string> {
  const resultado = new Map<number, string>();
  const validas = pessoas.filter((p) => p.nome.trim() !== '');

  for (let palavras = 1; palavras <= 12; palavras++) {
    const candidatos = new Map<number, string>();
    const contagem = new Map<string, number>();

    for (const p of validas) {
      const nome = comPalavras(p.nome, palavras);
      candidatos.set(p.id, nome);
      const chave = normalizar(nome);
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
    for (const p of validas) {
      if (resultado.has(p.id)) continue;
      const nome = candidatos.get(p.id)!;
      if (contagem.get(normalizar(nome)) === 1 || palavras === 12) resultado.set(p.id, nome);
    }
  }
  return resultado;
}
