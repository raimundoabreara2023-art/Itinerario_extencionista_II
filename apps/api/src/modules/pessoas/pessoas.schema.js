"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.atualizarPessoaSchema = exports.criarPessoaSchema = void 0;
var zod_1 = require("zod");
exports.criarPessoaSchema = zod_1.z.object({
    nome: zod_1.z.string().trim().min(1, 'Nome é obrigatório').max(150),
    dataNascimento: zod_1.z.string().date().nullish(),
    sexo: zod_1.z.enum(['M', 'F']).nullish(),
});
// Atualização = substituição completa dos campos (mesmo formato do cadastro).
exports.atualizarPessoaSchema = exports.criarPessoaSchema;
exports.idParamSchema = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() });
