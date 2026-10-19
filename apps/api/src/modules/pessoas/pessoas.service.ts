import { naoEncontrado } from '../../shared/erros.js';
import type { PessoasRepository } from './pessoas.repository.js';
import type { CriarPessoa } from './pessoas.schema.js';

export function pessoasService(repo: PessoasRepository) {
  return {
    listar: () => repo.listar(),
    async obter(id: number) {
      const p = await repo.buscar(id);
      if (!p) throw naoEncontrado('Pessoa');
      return p;
    },
    criar: (dados: CriarPessoa) => repo.criar(dados),
    async atualizar(id: number, dados: CriarPessoa) {
      const p = await repo.atualizar(id, dados);
      if (!p) throw naoEncontrado('Pessoa');
      return p;
    },
    async excluir(id: number) {
      if (!(await repo.excluir(id))) throw naoEncontrado('Pessoa');
    },
  };
}
