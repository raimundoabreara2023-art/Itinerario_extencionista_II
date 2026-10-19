"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nomesCurtos = nomesCurtos;
var CONECTORES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
function normalizar(texto) {
    return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
/** As primeiras n palavras "de verdade" (de/da/do não contam, mas ficam no texto). */
function comPalavras(completo, n) {
    var partes = completo.trim().split(/\s+/);
    var usadas = [];
    var contadas = 0;
    for (var _i = 0, partes_1 = partes; _i < partes_1.length; _i++) {
        var parte = partes_1[_i];
        var conector = CONECTORES.has(parte.toLowerCase());
        if (!conector && contadas === n)
            break;
        usadas.push(parte);
        if (!conector)
            contadas++;
    }
    while (usadas.length > 0 && CONECTORES.has(usadas[usadas.length - 1].toLowerCase())) {
        usadas.pop();
    }
    var texto = usadas.join(' ');
    // nomes muito curtos (ex.: "Zé") ganham a segunda palavra
    if (n === 1 && partes.length > 1 && texto.length <= 2)
        return comPalavras(completo, 2);
    return texto;
}
/**
 * Cada pessoa mostra o menor nome que a diferencia das outras
 * (Maria, Maria Celina, Maria do Socorro...). Portado do ArvoreController em Java.
 */
function nomesCurtos(pessoas) {
    var _a;
    var resultado = new Map();
    var validas = pessoas.filter(function (p) { return p.nome.trim() !== ''; });
    for (var palavras = 1; palavras <= 12; palavras++) {
        var candidatos = new Map();
        var contagem = new Map();
        for (var _i = 0, validas_1 = validas; _i < validas_1.length; _i++) {
            var p = validas_1[_i];
            var nome = comPalavras(p.nome, palavras);
            candidatos.set(p.id, nome);
            var chave = normalizar(nome);
            contagem.set(chave, ((_a = contagem.get(chave)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        for (var _b = 0, validas_2 = validas; _b < validas_2.length; _b++) {
            var p = validas_2[_b];
            if (resultado.has(p.id))
                continue;
            var nome = candidatos.get(p.id);
            if (contagem.get(normalizar(nome)) === 1 || palavras === 12)
                resultado.set(p.id, nome);
        }
    }
    return resultado;
}
