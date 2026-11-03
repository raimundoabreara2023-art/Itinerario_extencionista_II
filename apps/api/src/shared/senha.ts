import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (s: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(senha, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const [saltHex, hashHex] = guardado.split(':');
  if (!saltHex || !hashHex) return false;
  const esperado = Buffer.from(hashHex, 'hex');
  const hash = await scrypt(senha, Buffer.from(saltHex, 'hex'), esperado.length);
  return timingSafeEqual(hash, esperado);
}
