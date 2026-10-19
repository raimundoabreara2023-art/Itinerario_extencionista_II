"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.criarFiliacaoSchema = exports.criarUniaoSchema = void 0;
var zod_1 = require("zod");
var id = zod_1.z.number().int().positive();
exports.criarUniaoSchema = zod_1.z.object({ pessoaAId: id, pessoaBId: id });
exports.criarFiliacaoSchema = zod_1.z.object({
    filhoId: id,
    genitorId: id,
    papel: zod_1.z.enum(['PAI', 'MAE']),
});
exports.idParamSchema = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() });
