"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filiacao = exports.uniao = exports.pessoa = exports.papelFiliacao = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
exports.papelFiliacao = (0, pg_core_1.pgEnum)('papel_filiacao', ['PAI', 'MAE']);
exports.pessoa = (0, pg_core_1.pgTable)('pessoa', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    nome: (0, pg_core_1.varchar)({ length: 150 }).notNull(),
    dataNascimento: (0, pg_core_1.date)('data_nascimento'),
    sexo: (0, pg_core_1.varchar)({ length: 1 }),
    foto: (0, pg_core_1.varchar)({ length: 255 }),
    criadoEm: (0, pg_core_1.timestamp)('criado_em').notNull().defaultNow(),
});
exports.uniao = (0, pg_core_1.pgTable)('uniao', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    pessoaAId: (0, pg_core_1.integer)('pessoa_a_id').notNull().references(function () { return exports.pessoa.id; }, { onDelete: 'cascade' }),
    pessoaBId: (0, pg_core_1.integer)('pessoa_b_id').notNull().references(function () { return exports.pessoa.id; }, { onDelete: 'cascade' }),
}, function (t) { return [
    (0, pg_core_1.check)('uniao_ordem', (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " < ", ""], ["", " < ", ""])), t.pessoaAId, t.pessoaBId)),
    (0, pg_core_1.unique)('uniao_par').on(t.pessoaAId, t.pessoaBId),
]; });
exports.filiacao = (0, pg_core_1.pgTable)('filiacao', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    filhoId: (0, pg_core_1.integer)('filho_id').notNull().references(function () { return exports.pessoa.id; }, { onDelete: 'cascade' }),
    genitorId: (0, pg_core_1.integer)('genitor_id').notNull().references(function () { return exports.pessoa.id; }, { onDelete: 'cascade' }),
    papel: (0, exports.papelFiliacao)().notNull(),
}, function (t) { return [
    (0, pg_core_1.unique)('filiacao_filho_papel').on(t.filhoId, t.papel),
    (0, pg_core_1.check)('filiacao_distintos', (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " <> ", ""], ["", " <> ", ""])), t.filhoId, t.genitorId)),
]; });
var templateObject_1, templateObject_2;
