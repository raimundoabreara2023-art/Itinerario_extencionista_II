import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync } from 'node:fs';
import { asc } from 'drizzle-orm';
import { env } from '../config/env.js';
import { criarDb } from '../db/client.js';
import { pessoa, usuario } from '../db/schema.js';
import { hashSenha } from '../shared/senha.js';

const ARQUIVO = 'senhas-provisorias.csv';
const CONECTORES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
// sem caracteres ambíguos (0/o, 1/l/i)
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';

/** "Pedro Bezerra de Araújo" -> "pedro.araujo" (e pedro.araujo2, 3... se repetir). */
function gerarLogin(nome: string, usados: Set<string>): string {
  const partes = nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((p) => p && !CONECTORES.has(p));
  const base =
    partes.length > 1 ? `${partes[0]}.${partes[partes.length - 1]}` : (partes[0] ?? 'membro');
  let login = base;
  for (let n = 2; usados.has(login); n++) login = `${base}${n}`;
  usados.add(login);
  return login;
}

const senhaAleatoria = () =>
  Array.from(randomBytes(10), (b) => ALFABETO[b % ALFABETO.length]).join('');

const { db, pool } = criarDb(env.DATABASE_URL);

try {
  const pessoas = await db.select().from(pessoa).orderBy(asc(pessoa.id));
  const argAdmin = process.argv.find((a) => a.startsWith('--admin='))?.split('=')[1];
  const adminId = Number(argAdmin);

  if (!argAdmin || !pessoas.some((p) => p.id === adminId)) {
    console.log('Informe o id da pessoa que será ADMIN: --admin=<id>\n');
    for (const p of pessoas) console.log(`${String(p.id).padStart(4)}  ${p.nome}`);
    console.log(
      '\nExemplo: pnpm --filter @raizes/api db:seed-usuarios -- --admin=<id>',
    );
    process.exitCode = 1;
  } else {
    const existentes = await db.select().from(usuario);
    const comUsuario = new Set(existentes.map((u) => u.pessoaId));
    const logins = new Set(existentes.map((u) => u.login));

    const novos: { pessoaId: number; nome: string; login: string; senha: string }[] = [];
    for (const p of pessoas) {
      if (comUsuario.has(p.id)) continue;
      novos.push({ pessoaId: p.id, nome: p.nome, login: gerarLogin(p.nome, logins), senha: senhaAleatoria() });
    }

    if (novos.length === 0) {
      console.log('Todas as pessoas já têm usuário. Nada a fazer.');
    } else {
      const linhas = await Promise.all(
        novos.map(async (n) => ({ ...n, hash: await hashSenha(n.senha) })),
      );
      // tudo ou nada: se algo falhar, nenhum usuário é criado
      await db.transaction(async (tx) => {
        await tx.insert(usuario).values(
          linhas.map((n) => ({
            pessoaId: n.pessoaId,
            login: n.login,
            senhaHash: n.hash,
            papel: n.pessoaId === adminId ? ('ADMIN' as const) : ('MEMBRO' as const),
          })),
        );
      });

      const novoArquivo = !existsSync(ARQUIVO);
      const csv =
        (novoArquivo ? '﻿id;nome;login;senha\n' : '') +
        novos.map((n) => `${n.pessoaId};${n.nome};${n.login};${n.senha}`).join('\n') +
        '\n';
      appendFileSync(ARQUIVO, csv, 'utf8');
      console.log(`${novos.length} usuário(s) criado(s). Senhas provisórias em ${ARQUIVO}`);
    }
  }
} finally {
  await pool.end();
}
