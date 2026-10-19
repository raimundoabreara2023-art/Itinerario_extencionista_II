import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

export function criarDb(databaseUrl: string) {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  return { db: drizzle(pool, { schema }), pool };
}

export type Db = ReturnType<typeof criarDb>['db'];
