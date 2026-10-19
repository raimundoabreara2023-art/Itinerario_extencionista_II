import { describe, expect, it } from 'vitest';
import { nomesCurtos } from './nomeCurto';

describe('nomesCurtos', () => {
  const nomes = [
    'Benedito Alves de Abreu',
    'Maria de Abreu Araujo',
    'Maria Celina de Abreu Araujo',
    'Maria do Socorro de Abreu Araujo',
    'Ze Luiz de Abreu',
    'Pedro Bezerra de Araujo',
    'Pedro Bezerra de Araujo Junior',
    'Antonio Natal de sousa Abreu',
    'Antonio de Sousa Abreu',
  ];
  const curtos = nomesCurtos(nomes.map((nome, i) => ({ id: i + 1, nome })));
  const de = (nome: string) => curtos.get(nomes.indexOf(nome) + 1);

  it('usa só o primeiro nome quando ele é único', () => {
    expect(de('Benedito Alves de Abreu')).toBe('Benedito');
  });

  it('acrescenta palavras só até diferenciar', () => {
    expect(de('Maria Celina de Abreu Araujo')).toBe('Maria Celina');
    expect(de('Maria do Socorro de Abreu Araujo')).toBe('Maria do Socorro');
    expect(de('Maria de Abreu Araujo')).toBe('Maria de Abreu');
    expect(de('Antonio Natal de sousa Abreu')).toBe('Antonio Natal');
    expect(de('Antonio de Sousa Abreu')).toBe('Antonio de Sousa');
  });

  it('nomes curtos ganham a segunda palavra', () => {
    expect(de('Ze Luiz de Abreu')).toBe('Ze Luiz');
  });

  it('usa o nome inteiro quando nada mais diferencia', () => {
    expect(de('Pedro Bezerra de Araujo')).toBe('Pedro Bezerra de Araujo');
    expect(de('Pedro Bezerra de Araujo Junior')).toBe('Pedro Bezerra de Araujo Junior');
  });
});
