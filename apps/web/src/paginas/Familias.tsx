import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '../api/cliente';
import { nomesCurtos } from '@raizes/domain';

type PessoaDto = {
  id: number;
  nome: string;
  dataNascimento: string | null;
  sexo: 'M' | 'F' | null;
};
type UniaoDto = { id: number; pessoaAId: number; pessoaBId: number };
type FiliacaoDto = { id: number; filhoId: number; genitorId: number; papel: 'PAI' | 'MAE' };

export function Familias() {
  const qc = useQueryClient();
  const pessoas = useQuery({ queryKey: ['pessoas'], queryFn: () => api<PessoaDto[]>('/pessoas') });
  const unioes = useQuery({ queryKey: ['unioes'], queryFn: () => api<UniaoDto[]>('/unioes') });
  const filiacoes = useQuery({
    queryKey: ['filiacoes'],
    queryFn: () => api<FiliacaoDto[]>('/filiacoes'),
  });

  const listaPessoas = pessoas.data ?? [];
  const listaUnioes = unioes.data ?? [];
  const listaFiliacoes = filiacoes.data ?? [];

  // Cálculo seguro de nomes curtos com fallback direto para o nome completo
  let mapaNomesCurtos = new Map<number, string>();
  try {
    if (typeof nomesCurtos === 'function' && listaPessoas.length > 0) {
      mapaNomesCurtos = nomesCurtos(listaPessoas);
    }
  } catch {
    // Caso ocorra algum erro na função de domínio, usa o nome normal
  }

  const nome = (id: number) =>
    mapaNomesCurtos.get(id) ?? listaPessoas.find((p) => p.id === id)?.nome ?? `#${id}`;

  const mapaPessoas = new Map(listaPessoas.map((p) => [p.id, p]));

  // Conjunto de IDs de pessoas que já estão em algum casal
  const pessoasEmCasal = useMemo(() => {
    const ids = new Set<number>();
    for (const u of listaUnioes) {
      ids.add(u.pessoaAId);
      ids.add(u.pessoaBId);
    }
    return ids;
  }, [listaUnioes]);

  // Mapeamento de quais genitores cada filho já possui
  const genitoresPorFilho = useMemo(() => {
    const mapa = new Map<number, { paiId?: number; maeId?: number }>();
    for (const f of listaFiliacoes) {
      const atual = mapa.get(f.filhoId) ?? {};
      if (f.papel === 'PAI') atual.paiId = f.genitorId;
      if (f.papel === 'MAE') atual.maeId = f.genitorId;
      mapa.set(f.filhoId, atual);
    }
    return mapa;
  }, [listaFiliacoes]);

  // Estados para Casais
  const [pessoaA, setPessoaA] = useState('');
  const [pessoaB, setPessoaB] = useState('');

  // Estados para Vínculo de Filhos
  const [origem, setOrigem] = useState('');
  const [papelSolo, setPapelSolo] = useState<'PAI' | 'MAE'>('MAE');
  const [filhosSelecionadosIds, setFilhosSelecionadosIds] = useState<number[]>([]);

  // Filtros para Candidatos a Casal (remove quem já está em união)
  const candidatasPessoaA = listaPessoas.filter(
    (p) => !pessoasEmCasal.has(p.id) && (p.sexo === 'M' || !p.sexo),
  );
  const candidatasPessoaB = listaPessoas.filter(
    (p) => !pessoasEmCasal.has(p.id) && (p.sexo === 'F' || !p.sexo),
  );

  // Filtros para Pai ou Mãe Solo (remove quem já está em união)
  const pessoasSoloDisponiveis = listaPessoas.filter((p) => !pessoasEmCasal.has(p.id));

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

  const criarFiliacaoLote = useMutation({
    mutationFn: async () => {
      if (filhosSelecionadosIds.length === 0) throw new Error('Selecione pelo menos um filho.');

      if (origem.startsWith('p:')) {
        const genitorId = Number(origem.slice(2));
        if (!mapaPessoas.has(genitorId)) throw new Error('Selecione o pai ou a mãe.');
        await api('/filiacoes', {
          method: 'POST',
          body: JSON.stringify({ filhosIds: filhosSelecionadosIds, genitorId, papel: papelSolo }),
        });
        return;
      }

      const uniaoObj = listaUnioes.find((u) => u.id === Number(origem.slice(2)));
      if (!uniaoObj) throw new Error('Selecione um casal ou um pai/mãe solo.');

      const pessoaAObj = mapaPessoas.get(uniaoObj.pessoaAId);
      const pessoaBObj = mapaPessoas.get(uniaoObj.pessoaBId);

      const paiId = pessoaAObj?.sexo === 'M' ? pessoaAObj.id : pessoaBObj?.sexo === 'M' ? pessoaBObj.id : pessoaAObj?.id;
      const maeId = pessoaAObj?.sexo === 'F' ? pessoaAObj.id : pessoaBObj?.sexo === 'F' ? pessoaBObj.id : pessoaBObj?.id;

      const promessas = [];
      if (paiId) {
        promessas.push(
          api('/filiacoes', {
            method: 'POST',
            body: JSON.stringify({ filhosIds: filhosSelecionadosIds, genitorId: paiId, papel: 'PAI' }),
          }),
        );
      }
      if (maeId) {
        promessas.push(
          api('/filiacoes', {
            method: 'POST',
            body: JSON.stringify({ filhosIds: filhosSelecionadosIds, genitorId: maeId, papel: 'MAE' }),
          }),
        );
      }
      await Promise.all(promessas);
    },
    onSuccess: () => {
      setOrigem('');
      setFilhosSelecionadosIds([]);
      void qc.invalidateQueries({ queryKey: ['filiacoes'] });
    },
  });

  const excluirFiliacao = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => api<void>(`/filiacoes/${id}`, { method: 'DELETE' })));
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['filiacoes'] }),
  });

  // Identificação do contexto atual (Casal ou Solo)
  const uniaoAtual = origem.startsWith('u:')
    ? listaUnioes.find((u) => u.id === Number(origem.slice(2)))
    : undefined;
  const soloAtual = origem.startsWith('p:') ? mapaPessoas.get(Number(origem.slice(2))) : undefined;

  const maeAtual = uniaoAtual
    ? [mapaPessoas.get(uniaoAtual.pessoaAId), mapaPessoas.get(uniaoAtual.pessoaBId)].find(
      (p) => p?.sexo === 'F',
    ) ?? mapaPessoas.get(uniaoAtual.pessoaBId)
    : soloAtual;

  const rotuloReferencia = uniaoAtual ? 'a mãe' : 'o pai/mãe';
  const anoNascimentoMae = maeAtual?.dataNascimento ? Number(maeAtual.dataNascimento.substring(0, 4)) : null;

  // Filtragem de Filhos Disponíveis:
  // - Evita que o próprio genitor seja selecionado como filho
  // - Se for Casal: oculta filhos que já tenham AMBOS os pais cadastrados
  // - Se for Pai/Mãe Solo: oculta filhos que já tenham aquele genitor específico cadastrado
  // - Respeita a regra de idade mínima (10 anos de diferença)
  const filhosDisponiveis = listaPessoas.filter((p) => {
    if (uniaoAtual && (p.id === uniaoAtual.pessoaAId || p.id === uniaoAtual.pessoaBId)) return false;
    if (soloAtual && p.id === soloAtual.id) return false;

    const g = genitoresPorFilho.get(p.id);

    if (uniaoAtual) {
      // Se for casal, não mostra se já tem pai E mãe definidos
      if (g?.paiId && g?.maeId) return false;
    } else if (soloAtual) {
      // Se for solo, não mostra se já tem este genitor específico cadastrado
      if (papelSolo === 'PAI' && g?.paiId === soloAtual.id) return false;
      if (papelSolo === 'MAE' && g?.maeId === soloAtual.id) return false;
    }

    if (!anoNascimentoMae) return true;
    if (!p.dataNascimento) return true;
    const anoNascimentoFilho = Number(p.dataNascimento.substring(0, 4));
    return anoNascimentoFilho >= anoNascimentoMae + 10;
  });

  // Agrupamento por Núcleo Familiar para Vínculos Existentes
  const gruposFamiliares = useMemo(() => {
    const mapa = new Map<string, { chave: string; paiId?: number; maeId?: number; filhos: Array<{ filhoId: number; filiacaoIds: number[] }> }>();
    const genitoresTemp = new Map<number, { paiId?: number; maeId?: number; paiFiliacaoId?: number; maeFiliacaoId?: number }>();

    for (const f of listaFiliacoes) {
      const atual = genitoresTemp.get(f.filhoId) ?? {};
      if (f.papel === 'PAI') {
        atual.paiId = f.genitorId;
        atual.paiFiliacaoId = f.id;
      } else {
        atual.maeId = f.genitorId;
        atual.maeFiliacaoId = f.id;
      }
      genitoresTemp.set(f.filhoId, atual);
    }

    for (const [filhoId, g] of genitoresTemp.entries()) {
      const chave = `${g.paiId ?? 'x'}-${g.maeId ?? 'x'}`;
      const filiacaoIds = [g.paiFiliacaoId, g.maeFiliacaoId].filter((id): id is number => id !== undefined);

      let grupo = mapa.get(chave);
      if (!grupo) {
        grupo = { chave, paiId: g.paiId, maeId: g.maeId, filhos: [] };
        mapa.set(chave, grupo);
      }
      grupo.filhos.push({ filhoId, filiacaoIds });
    }

    return Array.from(mapa.values());
  }, [listaFiliacoes]);

  return (
    <section>
      <h2>Casais</h2>
      <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>
        Pai ou mãe <strong>solo</strong> não precisa de casal: use o bloco “Pais e Filhos” mais abaixo.
      </p>
      <form className="form-pessoa" onSubmit={(e) => { e.preventDefault(); criarUniao.mutate(); }}>

        <select value={pessoaA} onChange={(e) => setPessoaA(e.target.value)} required>
          <option value="">Selecione o Pai</option>
          {candidatasPessoaA.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} {p.sexo ? `(${p.sexo})` : ''}
            </option>
          ))}
        </select>
        <span className="entre">💞</span>
        <select value={pessoaB} onChange={(e) => setPessoaB(e.target.value)} required>
          <option value="">Selecione a Mãe</option>
          {candidatasPessoaB.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} {p.sexo ? `(${p.sexo})` : ''}
            </option>
          ))}
        </select>
        <button type="submit" disabled={criarUniao.isPending}>
          Unir
        </button>
      </form>
      {criarUniao.error && <p className="erro">{criarUniao.error.message}</p>}
      {excluirUniao.error && <p className="erro">{excluirUniao.error.message}</p>}

      <table className="tabela" style={{ marginBottom: '32px' }}>
        <tbody>
          {listaUnioes.map((u) => (
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
          {listaUnioes.length === 0 && (
            <tr>
              <td>Nenhum casal cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Pais e Filhos em Lote</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); criarFiliacaoLote.mutate(); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#fffaf0',
          padding: '16px',
          borderRadius: '4px',
          border: '1px solid var(--marrom-claro)',
        }}
      >
        <label>
          <strong>1. Selecione o casal, ou o pai/mãe solo:</strong>
          <select
            value={origem}
            onChange={(e) => {
              const v = e.target.value;
              setOrigem(v);
              setFilhosSelecionadosIds([]);
              if (v.startsWith('p:')) {
                const sexo = mapaPessoas.get(Number(v.slice(2)))?.sexo;
                if (sexo === 'M') setPapelSolo('PAI');
                if (sexo === 'F') setPapelSolo('MAE');
              }
            }}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="">Selecione...</option>
            <optgroup label="Casais">
              {listaUnioes.map((u) => (
                <option key={`u${u.id}`} value={`u:${u.id}`}>
                  {nome(u.pessoaAId)} & {nome(u.pessoaBId)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pai ou mãe solo (sem casal)">
              {pessoasSoloDisponiveis.map((p) => (
                <option key={`p${p.id}`} value={`p:${p.id}`}>
                  {nome(p.id)} {p.sexo ? `(${p.sexo})` : ''}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        {soloAtual && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <strong>{nome(soloAtual.id)} é:</strong>
            <label style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="papel-solo"
                checked={papelSolo === 'PAI'}
                onChange={() => setPapelSolo('PAI')}
              />
              o PAI
            </label>
            <label style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="papel-solo"
                checked={papelSolo === 'MAE'}
                onChange={() => setPapelSolo('MAE')}
              />
              a MÃE
            </label>
          </div>
        )}

        {origem && (
          <div>
            <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
              <strong>2. Selecione os filhos</strong> (Regra: nascimento com pelo menos 10 anos a mais que {rotuloReferencia}: {maeAtual ? `${nome(maeAtual.id)} (${anoNascimentoMae ?? 'N/D'})` : 'N/D'}):
            </p>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--marrom-claro)', padding: '8px', background: '#fff' }}>
              {filhosDisponiveis.map((p) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filhosSelecionadosIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilhosSelecionadosIds([...filhosSelecionadosIds, p.id]);
                      } else {
                        setFilhosSelecionadosIds(filhosSelecionadosIds.filter((id) => id !== p.id));
                      }
                    }}
                  />
                  {p.nome} {p.dataNascimento ? `(Nasc: ${p.dataNascimento.split('-').reverse().join('/')})` : ''}
                </label>
              ))}
              {filhosDisponiveis.length === 0 && <p>Nenhuma pessoa atende aos critérios disponíveis.</p>}
            </div>
          </div>
        )}

        <button type="submit" disabled={criarFiliacaoLote.isPending || filhosSelecionadosIds.length === 0}>
          Vincular Filhos
        </button>
      </form>

      {criarFiliacaoLote.error && <p className="erro">{criarFiliacaoLote.error.message}</p>}
      {excluirFiliacao.error && <p className="erro">{excluirFiliacao.error.message}</p>}

      <h3 style={{ marginTop: '24px' }}>Vínculos Existentes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {gruposFamiliares.map((grupo) => {
          const todosFiliacaoIds = grupo.filhos.flatMap((f) => f.filiacaoIds);

          return (
            <div
              key={grupo.chave}
              style={{
                background: '#fffaf0',
                border: '1px solid var(--marrom-claro)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--pergaminho-escuro)',
                  paddingBottom: '8px',
                  marginBottom: '12px',
                }}
              >
                <strong style={{ fontSize: '1.1rem', color: 'var(--marrom)' }}>
                  {grupo.paiId && grupo.maeId
                    ? `${nome(grupo.paiId)} 💞 ${nome(grupo.maeId)}`
                    : grupo.paiId
                      ? `${nome(grupo.paiId)} (Pai solo)`
                      : `${nome(grupo.maeId!)} (Mãe solo)`}
                </strong>

                <button
                  type="button"
                  className="perigo"
                  style={{ fontSize: '0.85rem', padding: '4px 8px' }}
                  onClick={() =>
                    confirm('Remover todos os filhos deste núcleo familiar?') &&
                    excluirFiliacao.mutate(todosFiliacaoIds)
                  }
                >
                  Remover Núcleo
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--marrom-claro)' }}>Filhos:</span>
                {grupo.filhos.map((f) => (
                  <span
                    key={f.filhoId}
                    style={{
                      background: 'var(--pergaminho-escuro)',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ➔ {nome(f.filhoId)}
                    <button
                      type="button"
                      title="Remover apenas este filho"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8a2b2b',
                        cursor: 'pointer',
                        padding: '0 2px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        lineHeight: '1',
                      }}
                      onClick={() =>
                        confirm(`Remover vínculo de ${nome(f.filhoId)}?`) &&
                        excluirFiliacao.mutate(f.filiacaoIds)
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {gruposFamiliares.length === 0 && <p>Nenhum vínculo cadastrado.</p>}
      </div>
    </section>
  );
}