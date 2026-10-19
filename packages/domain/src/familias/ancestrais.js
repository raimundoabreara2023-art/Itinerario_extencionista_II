"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ehAncestral = ehAncestral;
/**
 * Verdadeiro se `ancestralId` é ancestral (pai, avô, bisavô...) de `pessoaId`.
 * Usado para impedir ciclos: ninguém pode ser pai de um de seus próprios ancestrais.
 */
function ehAncestral(filiacoes, ancestralId, pessoaId) {
    var _a, _b;
    var genitoresDe = new Map();
    for (var _i = 0, filiacoes_1 = filiacoes; _i < filiacoes_1.length; _i++) {
        var f = filiacoes_1[_i];
        var lista = (_a = genitoresDe.get(f.filhoId)) !== null && _a !== void 0 ? _a : [];
        lista.push(f.genitorId);
        genitoresDe.set(f.filhoId, lista);
    }
    var visitados = new Set();
    var pilha = [pessoaId];
    while (pilha.length > 0) {
        var atual = pilha.pop();
        for (var _c = 0, _d = (_b = genitoresDe.get(atual)) !== null && _b !== void 0 ? _b : []; _c < _d.length; _c++) {
            var g = _d[_c];
            if (g === ancestralId)
                return true;
            if (!visitados.has(g)) {
                visitados.add(g);
                pilha.push(g);
            }
        }
    }
    return false;
}
