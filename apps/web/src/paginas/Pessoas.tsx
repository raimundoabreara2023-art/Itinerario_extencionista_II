import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/cliente';

type PessoaDto = {
  id: number;
  nome: string;
  dataNascimento: string | null;
  sexo: 'M' | 'F' | null;
  foto: string | null;
};

async function enviarArquivo(id: number, arquivo: File) {
  const dados = new FormData();
  dados.append('foto', arquivo);
  const resp = await fetch(`/api/pessoas/${id}/foto`, { method: 'POST', body: dados });
  if (!resp.ok) {
    const corpo = (await resp.json().catch(() => null)) as { erro?: string } | null;
    throw new Error(corpo?.erro ?? `Erro ${resp.status}`);
  }
}

type Form = { nome: string; dataNascimento: string; sexo: '' | 'M' | 'F' };
const vazio: Form = { nome: '', dataNascimento: '', sexo: '' };

export function Pessoas() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(vazio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [fotoEscolhida, setFotoEscolhida] = useState<File | null>(null);
  const [chaveInputFoto, setChaveInputFoto] = useState(0);
  const previa = useMemo(
    () => (fotoEscolhida ? URL.createObjectURL(fotoEscolhida) : null),
    [fotoEscolhida],
  );

  const lista = useQuery({ queryKey: ['pessoas'], queryFn: () => api<PessoaDto[]>('/pessoas') });

  const limpar = () => {
    setForm(vazio);
    setEditandoId(null);
    setFotoEscolhida(null);
    setChaveInputFoto((k) => k + 1);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      const corpo = JSON.stringify({
        nome: form.nome,
        dataNascimento: form.dataNascimento || null,
        sexo: form.sexo || null,
      });
      const salva =
        editandoId === null
          ? await api<PessoaDto>('/pessoas', { method: 'POST', body: corpo })
          : await api<PessoaDto>(`/pessoas/${editandoId}`, { method: 'PUT', body: corpo });
      if (fotoEscolhida) await enviarArquivo(salva.id, fotoEscolhida);
      return salva;
    },
    onSuccess: () => {
      limpar();
      void qc.invalidateQueries({ queryKey: ['pessoas'] });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: number) => api<void>(`/pessoas/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['pessoas'] }),
  });

  const enviarFoto = useMutation({
    mutationFn: ({ id, arquivo }: { id: number; arquivo: File }) => enviarArquivo(id, arquivo),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['pessoas'] }),
  });

  const removerFoto = useMutation({
    mutationFn: (id: number) => api<PessoaDto>(`/pessoas/${id}/foto`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['pessoas'] }),
  });

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate();
  };

  const editar = (p: PessoaDto) => {
    setEditandoId(p.id);
    setForm({ nome: p.nome, dataNascimento: p.dataNascimento ?? '', sexo: p.sexo ?? '' });
  };

  return (
    <section>
      <h2>Pessoas</h2>

      <form className="form-pessoa" onSubmit={aoEnviar}>
        <input
          placeholder="Nome completo"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
          maxLength={150}
        />
        <input
          type="date"
          value={form.dataNascimento}
          onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
        />
        <select
          value={form.sexo}
          onChange={(e) => setForm({ ...form, sexo: e.target.value as Form['sexo'] })}
        >
          <option value="">Sexo (opcional)</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
        <label className="botao secundario">
          {fotoEscolhida ? 'Trocar foto' : 'Escolher foto'}
          <input
            key={chaveInputFoto}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => setFotoEscolhida(e.target.files?.[0] ?? null)}
          />
        </label>
        {previa && <img className="foto-mini" src={previa} alt="Prévia da foto" />}
        <button type="submit" disabled={salvar.isPending}>
          {editandoId === null ? 'Adicionar' : 'Salvar alterações'}
        </button>
        {editandoId !== null && (
          <button type="button" className="secundario" onClick={limpar}>
            Cancelar
          </button>
        )}
      </form>
      {salvar.error && <p className="erro">{salvar.error.message}</p>}
      {excluir.error && <p className="erro">{excluir.error.message}</p>}
      {enviarFoto.error && <p className="erro">{enviarFoto.error.message}</p>}
      {removerFoto.error && <p className="erro">{removerFoto.error.message}</p>}

      {lista.isPending && <p>Carregando…</p>}
      {lista.error && <p className="erro">Erro: {lista.error.message}</p>}
      {lista.data && (
        <table className="tabela">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Nascimento</th>
              <th>Sexo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lista.data.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.foto ? (
                    <img className="foto-mini" src={`/api/uploads/${p.foto}`} alt={p.nome} />
                  ) : (
                    <span className="foto-mini vazia">{p.nome.charAt(0)}</span>
                  )}
                </td>
                <td>{p.nome}</td>
                <td>{p.dataNascimento ? p.dataNascimento.split('-').reverse().join('/') : '—'}</td>
                <td>{p.sexo ?? '—'}</td>
                <td>
                  <div className="acoes">
                  <label className="botao secundario">
                    {p.foto ? 'Trocar foto' : 'Enviar foto'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => {
                        const arquivo = e.target.files?.[0];
                        e.target.value = '';
                        if (arquivo) enviarFoto.mutate({ id: p.id, arquivo });
                      }}
                    />
                  </label>
                  {p.foto && (
                    <button type="button" className="secundario" onClick={() => removerFoto.mutate(p.id)}>
                      Tirar foto
                    </button>
                  )}
                  <button type="button" className="secundario" onClick={() => editar(p)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="perigo"
                    onClick={() => {
                      if (confirm(`Excluir ${p.nome}? Uniões e filiações dele(a) também serão removidas.`))
                        excluir.mutate(p.id);
                    }}
                  >
                    Excluir
                  </button>
                  </div>
                </td>
              </tr>
            ))}
            {lista.data.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhuma pessoa cadastrada ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
