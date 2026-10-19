import { sql } from 'drizzle-orm';
import {
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

export const papelFiliacao = pgEnum('papel_filiacao', ['PAI', 'MAE']);

export const pessoa = pgTable('pessoa', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nome: varchar({ length: 150 }).notNull(),
  dataNascimento: date('data_nascimento'),
  sexo: varchar({ length: 1 }),
  foto: varchar({ length: 255 }),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const uniao = pgTable(
  'uniao',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    pessoaAId: integer('pessoa_a_id').notNull().references(() => pessoa.id, { onDelete: 'cascade' }),
    pessoaBId: integer('pessoa_b_id').notNull().references(() => pessoa.id, { onDelete: 'cascade' }),
  },
  (t) => [
    check('uniao_ordem', sql`${t.pessoaAId} < ${t.pessoaBId}`),
    unique('uniao_par').on(t.pessoaAId, t.pessoaBId),
  ],
);

export const filiacao = pgTable(
  'filiacao',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    filhoId: integer('filho_id').notNull().references(() => pessoa.id, { onDelete: 'cascade' }),
    genitorId: integer('genitor_id').notNull().references(() => pessoa.id, { onDelete: 'cascade' }),
    papel: papelFiliacao().notNull(),
  },
  (t) => [
    unique('filiacao_filho_papel').on(t.filhoId, t.papel),
    check('filiacao_distintos', sql`${t.filhoId} <> ${t.genitorId}`),
  ],
);
