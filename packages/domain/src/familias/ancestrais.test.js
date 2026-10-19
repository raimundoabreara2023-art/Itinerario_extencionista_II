"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var ancestrais_1 = require("./ancestrais");
// 1 é pai de 2, 2 é pai de 3
var filiacoes = [
    { filhoId: 2, genitorId: 1 },
    { filhoId: 3, genitorId: 2 },
];
(0, vitest_1.describe)('ehAncestral', function () {
    (0, vitest_1.it)('reconhece pai e avô', function () {
        (0, vitest_1.expect)((0, ancestrais_1.ehAncestral)(filiacoes, 2, 3)).toBe(true);
        (0, vitest_1.expect)((0, ancestrais_1.ehAncestral)(filiacoes, 1, 3)).toBe(true);
    });
    (0, vitest_1.it)('não confunde descendente com ancestral', function () {
        (0, vitest_1.expect)((0, ancestrais_1.ehAncestral)(filiacoes, 3, 1)).toBe(false);
    });
    (0, vitest_1.it)('pessoa não é ancestral de si mesma sem ciclo', function () {
        (0, vitest_1.expect)((0, ancestrais_1.ehAncestral)(filiacoes, 3, 3)).toBe(false);
    });
});
