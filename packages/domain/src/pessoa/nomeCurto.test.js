"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var nomeCurto_1 = require("./nomeCurto");
(0, vitest_1.describe)('nomesCurtos', function () {
    var nomes = [
        'Benedito Alves de Abreu',
        'Maria de Abreu Araujo',
        'Maria Celina de Abreu Araujo',
        'Maria do Socorro de Abreu Araujo',
        'Ze Luiz de Abreu',
        'Pedro Bezerra de Araujo',
        'Pedro Bezerra de Araujo Junior',
        'Antonio Natal de sousa Abreu',
        'Antonio de Sousa Abreu',
    ];
    var curtos = (0, nomeCurto_1.nomesCurtos)(nomes.map(function (nome, i) { return ({ id: i + 1, nome: nome }); }));
    var de = function (nome) { return curtos.get(nomes.indexOf(nome) + 1); };
    (0, vitest_1.it)('usa só o primeiro nome quando ele é único', function () {
        (0, vitest_1.expect)(de('Benedito Alves de Abreu')).toBe('Benedito');
    });
    (0, vitest_1.it)('acrescenta palavras só até diferenciar', function () {
        (0, vitest_1.expect)(de('Maria Celina de Abreu Araujo')).toBe('Maria Celina');
        (0, vitest_1.expect)(de('Maria do Socorro de Abreu Araujo')).toBe('Maria do Socorro');
        (0, vitest_1.expect)(de('Maria de Abreu Araujo')).toBe('Maria de Abreu');
        (0, vitest_1.expect)(de('Antonio Natal de sousa Abreu')).toBe('Antonio Natal');
        (0, vitest_1.expect)(de('Antonio de Sousa Abreu')).toBe('Antonio de Sousa');
    });
    (0, vitest_1.it)('nomes curtos ganham a segunda palavra', function () {
        (0, vitest_1.expect)(de('Ze Luiz de Abreu')).toBe('Ze Luiz');
    });
    (0, vitest_1.it)('usa o nome inteiro quando nada mais diferencia', function () {
        (0, vitest_1.expect)(de('Pedro Bezerra de Araujo')).toBe('Pedro Bezerra de Araujo');
        (0, vitest_1.expect)(de('Pedro Bezerra de Araujo Junior')).toBe('Pedro Bezerra de Araujo Junior');
    });
});
