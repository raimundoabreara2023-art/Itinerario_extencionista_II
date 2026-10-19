import { ehAncestral } from '@raizes/domain';
import { ErroNegocio, naoEncontrado } from '../../shared/erros.js';
import type { PessoasRepository } from '../pessoas/pessoas.repository.js';
import type { FamiliasRepository } from './familias.repository.js';
import type { CriarFiliacao, CriarUniao } from './familias.schema.js';

export function familiasService(repo: FamiliasRepository, pessoas: PessoasRepository) {
  const exigirPessoa = async (id: number) => {
    if (!(await pessoas.buscar(id))) throw naoEncontrado(`Pessoa ${id}`);
  };

  return {
    listarUnioes: () => repo.listarUnioes(),
    listarFiliacoes: () => repo.listarFiliacoes(),

    async criarUniao({ pessoaAId, pessoaBId }: CriarUniao) {
      if (pessoaAId === pessoaBId) throw new ErroNegocio('Uma pessoa não pode se unir a ela mesma');
      await exigirPessoa(pessoaAId);
      await exigirPessoa(pessoaBId);
      // sempre grava com a < b, para o casal existir uma vez só
      const a = Math.min(pessoaAId, pessoaBId);
      const b = Math.max(pessoaAId, pessoaBId);
      if (await repo.buscarUniao(a, b)) throw new ErroNegocio('Esse casal já está cadastrado', 409);
      return repo.criarUniao(a, b);
    },
    async excluirUniao(id: number) {
      if (!(await repo.excluirUniao(id))) throw naoEncontrado('União');
    },

    async criarFiliacao({ filhoId, genitorId, papel }: CriarFiliacao) {
      if (filhoId === genitorId) throw new ErroNegocio('Ninguém pode ser pai/mãe de si mesmo');
      await exigirPessoa(filhoId);
      await exigirPessoa(genitorId);
      if (await repo.buscarFiliacaoDoFilho(filhoId, papel)) {
        throw new ErroNegocio(`Essa pessoa já tem ${papel === 'PAI' ? 'um pai' : 'uma mãe'} cadastrado(a)`, 409);
      }
      const todas = await repo.listarFiliacoes();
      // o "filho" não pode ser ancestral do genitor (evita ciclos na árvore)
      if (ehAncestral(todas, filhoId, genitorId)) {
        throw new ErroNegocio('Isso criaria um ciclo: o filho já é ancestral dessa pessoa');
      }
      return repo.criarFiliacao(filhoId, genitorId, papel);
    },
    async excluirFiliacao(id: number) {
      if (!(await repo.excluirFiliacao(id))) throw naoEncontrado('Filiação');
    },
  };
}
