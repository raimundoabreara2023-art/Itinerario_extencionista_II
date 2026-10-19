import { describe, expect, it } from 'vitest';
import { ehAncestral } from './ancestrais';

// 1 é pai de 2, 2 é pai de 3
const filiacoes = [
  { filhoId: 2, genitorId: 1 },
  { filhoId: 3, genitorId: 2 },
];

describe('ehAncestral', () => {
  it('reconhece pai e avô', () => {
    expect(ehAncestral(filiacoes, 2, 3)).toBe(true);
    expect(ehAncestral(filiacoes, 1, 3)).toBe(true);
  });
  it('não confunde descendente com ancestral', () => {
    expect(ehAncestral(filiacoes, 3, 1)).toBe(false);
  });
  it('pessoa não é ancestral de si mesma sem ciclo', () => {
    expect(ehAncestral(filiacoes, 3, 3)).toBe(false);
  });
});
