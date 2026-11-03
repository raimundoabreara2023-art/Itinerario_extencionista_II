import { describe, expect, it } from 'vitest';
import { conferirSenha, hashSenha } from './senha.js';

describe('senha', () => {
  it('confere a senha certa e rejeita a errada', async () => {
    const h = await hashSenha('segredo123');
    expect(await conferirSenha('segredo123', h)).toBe(true);
    expect(await conferirSenha('outra', h)).toBe(false);
  });
  it('mesmo texto gera hashes diferentes (salt)', async () => {
    expect(await hashSenha('abc')).not.toBe(await hashSenha('abc'));
  });
});
