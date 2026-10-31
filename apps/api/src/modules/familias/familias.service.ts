import { ehAncestral } from '@raizes/domain';
import { ErroNegocio, naoEncontrado } from '../../shared/erros.js';
import type { PessoasRepository } from '../pessoas/pessoas.repository.js';
import type { FamiliasRepository } from './familias.repository.js';
import type { CriarFiliacaoLote, CriarUniao } from './familias.schema.js';

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
      const a = Math.min(pessoaAId, pessoaBId);
      const b = Math.max(pessoaAId, pessoaBId);
      if (await repo.buscarUniao(a, b)) throw new ErroNegocio('Esse casal já está cadastrado', 409);
      return repo.criarUniao(a, b);
    },

    async excluirUniao(id: number) {
      if (!(await repo.excluirUniao(id))) throw naoEncontrado('União');
    },

    async criarFiliacaoLote({ filhosIds, genitorId, papel }: CriarFiliacaoLote) {
      await exigirPessoa(genitorId);
      const todas = await repo.listarFiliacoes();
      const resultados = [];

      for (const filhoId of filhosIds) {
        if (filhoId === genitorId) {
          throw new ErroNegocio('Ninguém pode ser pai/mãe de si mesmo');
        }
        await exigirPessoa(filhoId);

        if (await repo.buscarFiliacaoDoFilho(filhoId, papel)) {
          const nomePapel = papel === 'PAI' ? 'um pai' : 'uma mãe';
          throw new ErroNegocio(`Uma das pessoas selecionadas já tem ${nomePapel} cadastrado(a)`, 409);
        }

        if (ehAncestral(todas, filhoId, genitorId)) {
          throw new ErroNegocio('Isso criaria um ciclo: o filho já é ancestral dessa pessoa');
        }

        const nova = await repo.criarFiliacao(filhoId, genitorId, papel);
        resultados.push(nova);
        todas.push({ id: nova.id, filhoId, genitorId, papel });
      }

      return resultados;
    },

    async excluirFiliacao(id: number) {
      if (!(await repo.excluirFiliacao(id))) throw naoEncontrado('Filiação');
    },
  };
}