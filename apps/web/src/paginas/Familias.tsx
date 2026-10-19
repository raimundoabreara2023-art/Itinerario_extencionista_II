import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../api/cliente';

type PessoaDto = { id: number; nome: string };
type UniaoDto = { id: number; pessoaAId: number; pessoaBId: number };
type FiliacaoDto = { id: number; filhoId: number; genitorId: number; papel: 'PAI' | 'MAE' };

function SelectPessoa(props: {
  valor: string;
  onChange: (v: string) => void;
  pessoas: PessoaDto[];
  rotulo: string;
}) {
  return (
    <select value={props.valor} onChange={(e) => props.onChange(e.target.value)} required>
      <option value="">{props.rotulo}</option>
      {props.pessoas.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nome}
        </option>
      ))}
    </select>
  );
}

export function Familias() {
  const qc = useQueryClient();
  const pessoas = useQuery({ queryKey: ['pessoas'], queryFn: () => api<PessoaDto[]>('/pessoas') });
  const unioes = useQuery({ queryKey: ['unioes'], queryFn: () => api<UniaoDto[]>('/unioes') });
  const filiacoes = useQuery({
    queryKey: ['filiacoes'],
    queryFn: () => api<FiliacaoDto[]>('/filiacoes'),
  });

  const nomes = new Map((pessoas.data ?? []).map((p) => [p.id, p.nome]));
  const nome = (id: number) => nomes.get(id) ?? `#${id}`;

  const [pessoaA, setPessoaA] = useState('');
  const [pessoaB, setPessoaB] = useState('');
  const [filho, setFilho] = useState('');
  const [genitor, setGenitor] = useState('');
  const [papel, setPapel] = useState<'PAI' | 'MAE'>('PAI');

  const criarUniao = useMutation({
    mutationFn: () =>
      api<UniaoDto>('/unioes', {
        method: 'POST',
        body: JSON.stringify({ pessoaAId: Number(pessoaA), pessoaBId: Number(pessoaB) }),
      }),
    onSuccess: () => {
      setPessoaA('');
      setPessoaB('');
      void qc.invalidateQueries({ queryKey: ['unioes'] });
    },
  });
  const excluirUniao = useMutation({
    mutationFn: (id: number) => api<void>(`/unioes/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['unioes'] }),
  });

  const criarFiliacao = useMutation({
    mutationFn: () =>
      api<FiliacaoDto>('/filiacoes', {
        method: 'POST',
        body: JSON.stringify({ filhoId: Number(filho), genitorId: Number(genitor), papel }),
      }),
    onSuccess: () => {
      setFilho('');
      setGenitor('');
      void qc.invalidateQueries({ queryKey: ['filiacoes'] });
    },
  });
  const excluirFiliacao = useMutation({
    mutationFn: (id: number) => api<void>(`/filiacoes/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['filiacoes'] }),
  });

  const lista = pessoas.data ?? [];
  const aoEnviar = (acao: () => void) => (e: FormEvent) => {
    e.preventDefault();
    acao();
  };

  return (
    <section>
      <h2>Casais</h2>
      <form className="form-pessoa" onSubmit={aoEnviar(() => criarUniao.mutate())}>
        <SelectPessoa valor={pessoaA} onChange={setPessoaA} pessoas={lista} rotulo="Pessoa 1" />
        <span className="entre">💞</span>
        <SelectPessoa valor={pessoaB} onChange={setPessoaB} pessoas={lista} rotulo="Pessoa 2" />
        <button type="submit" disabled={criarUniao.isPending}>
          Unir
        </button>
      </form>
      {criarUniao.error && <p className="erro">{criarUniao.error.message}</p>}
      {excluirUniao.error && <p className="erro">{excluirUniao.error.message}</p>}
      <table className="tabela">
        <tbody>
          {(unioes.data ?? []).map((u) => (
            <tr key={u.id}>
              <td>
                {nome(u.pessoaAId)} 💞 {nome(u.pessoaBId)}
              </td>
              <td className="acoes">
                <button
                  type="button"
                  className="perigo"
                  onClick={() => confirm('Remover este casal?') && excluirUniao.mutate(u.id)}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
          {unioes.data?.length === 0 && (
            <tr>
              <td>Nenhum casal cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>Pais e filhos</h2>
      <form className="form-pessoa" onSubmit={aoEnviar(() => criarFiliacao.mutate())}>
        <SelectPessoa valor={genitor} onChange={setGenitor} pessoas={lista} rotulo="Pai/Mãe" />
        <select value={papel} onChange={(e) => setPapel(e.target.value as 'PAI' | 'MAE')}>
          <option value="PAI">é o PAI de</option>
          <option value="MAE">é a MÃE de</option>
        </select>
        <SelectPessoa valor={filho} onChange={setFilho} pessoas={lista} rotulo="Filho(a)" />
        <button type="submit" disabled={criarFiliacao.isPending}>
          Vincular
        </button>
      </form>
      {criarFiliacao.error && <p className="erro">{criarFiliacao.error.message}</p>}
      {excluirFiliacao.error && <p className="erro">{excluirFiliacao.error.message}</p>}
      <table className="tabela">
        <tbody>
          {(filiacoes.data ?? []).map((f) => (
            <tr key={f.id}>
              <td>
                {nome(f.genitorId)} — {f.papel === 'PAI' ? 'pai' : 'mãe'} de — {nome(f.filhoId)}
              </td>
              <td className="acoes">
                <button
                  type="button"
                  className="perigo"
                  onClick={() => confirm('Remover este vínculo?') && excluirFiliacao.mutate(f.id)}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
          {filiacoes.data?.length === 0 && (
            <tr>
              <td>Nenhum vínculo cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
