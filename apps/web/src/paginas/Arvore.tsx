import { useQuery } from '@tanstack/react-query';
import {
  ALTURA_LINHA,
  LARGURA_NO,
  calcularLayout,
  montarFamilias,
  nomesCurtos,
  type Familia,
} from '@raizes/domain';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '../api/cliente';

type PessoaDto = { id: number; nome: string; foto: string | null };
type UniaoDto = { id: number; pessoaAId: number; pessoaBId: number };
type FiliacaoDto = { id: number; filhoId: number; genitorId: number; papel: 'PAI' | 'MAE' };

// ---- medidas do desenho (as mesmas da versão JavaFX) ----------------------
const RAIO_ANEL = 35;
const RAIO_FOTO = 32;
const LARGURA_CARTAO = LARGURA_NO - 4;
const TOPO = 40;
const MARGEM_ROTULOS = 190;
const RAIO_CORACAO = 11;
const COR_RAMO = '#8a6a47';
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 1.6;

const TITULOS_5 = [
  'I Geração\n(bisavós)',
  'II Geração\n(avós)',
  'III Geração\n(pais)',
  'IV Geração\n(filhos)',
  'V Geração\n(netos)',
];
const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const semAcento = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const topoDaLinha = (linha: number) => TOPO + linha * ALTURA_LINHA;

export function Arvore() {
  const pessoas = useQuery({ queryKey: ['pessoas'], queryFn: () => api<PessoaDto[]>('/pessoas') });
  const unioes = useQuery({ queryKey: ['unioes'], queryFn: () => api<UniaoDto[]>('/unioes') });
  const filiacoes = useQuery({
    queryKey: ['filiacoes'],
    queryFn: () => api<FiliacaoDto[]>('/filiacoes'),
  });

  const [busca, setBusca] = useState('');
  const [focoEscolhido, setFocoEscolhido] = useState<number | null | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const [geracoesVisiveis, setGeracoesVisiveis] = useState(0);
  const [estadoAnimacao, setEstadoAnimacao] = useState<'parada' | 'executando' | 'pausada' | 'concluida'>('parada');
  const [intervaloAnimacao, setIntervaloAnimacao] = useState(1100);
  const areaRef = useRef<HTMLDivElement>(null);
  const ajusteInicialFeito = useRef(false);

  const dados = useMemo(() => {
    if (!pessoas.data || !unioes.data || !filiacoes.data) return null;
    const familias: Familia[] = montarFamilias(unioes.data, filiacoes.data);
    const layout = calcularLayout(familias);
    const porId = new Map(pessoas.data.map((p) => [p.id, p]));
    const noLayout = pessoas.data.filter((p) => layout.x.has(p.id));
    const curtos = nomesCurtos(noLayout);
    const semLigacao = pessoas.data.filter((p) => !layout.x.has(p.id));
    return { layout, porId, curtos, semLigacao };
  }, [pessoas.data, unioes.data, filiacoes.data]);

  const totalGeracoes = dados?.layout.totalLinhas ?? 0;

  useEffect(() => {
    setGeracoesVisiveis(0);
    setEstadoAnimacao('parada');
  }, [totalGeracoes]);

  useEffect(() => {
    if (estadoAnimacao !== 'executando') return;
    const temporizador = window.setInterval(() => {
      setGeracoesVisiveis((visiveis) => Math.min(visiveis + 1, totalGeracoes));
    }, intervaloAnimacao);
    return () => window.clearInterval(temporizador);
  }, [estadoAnimacao, intervaloAnimacao, totalGeracoes]);

  useEffect(() => {
    if (estadoAnimacao === 'executando' && totalGeracoes > 0 && geracoesVisiveis >= totalGeracoes) {
      setEstadoAnimacao('concluida');
    }
  }, [estadoAnimacao, geracoesVisiveis, totalGeracoes]);

  // pessoa em foco: por padrão, a primeira da última geração
  const focoPadrao = useMemo(() => {
    if (!dados) return null;
    let melhor: number | null = null;
    let maior = -1;
    for (const [id, linha] of dados.layout.linha) {
      if (linha > maior) {
        maior = linha;
        melhor = id;
      }
    }
    return melhor;
  }, [dados]);
  const foco = focoEscolhido === undefined ? focoPadrao : focoEscolhido;

  const linhaDireta = useMemo(() => {
    const direta = new Set<number>();
    if (!dados || foco === null) return direta;
    const pilha = [foco];
    while (pilha.length > 0) {
      const atual = pilha.pop()!;
      if (direta.has(atual)) continue;
      direta.add(atual);
      pilha.push(...(dados.layout.pais.get(atual) ?? []));
    }
    return direta;
  }, [dados, foco]);

  const largura = dados ? dados.layout.largura + MARGEM_ROTULOS : 0;
  const altura = dados ? TOPO + dados.layout.totalLinhas * ALTURA_LINHA + 90 : 0;

  const zoomParaLargura = () => {
    const w = areaRef.current?.clientWidth ?? 0;
    if (w <= 0 || largura <= 0) return 1;
    return Math.min(1, (w - 30) / largura);
  };
  const zoomParaTudo = () => {
    const h = areaRef.current?.clientHeight ?? 0;
    if (h <= 0 || altura <= 0) return zoomParaLargura();
    return Math.min(zoomParaLargura(), (h - 30) / altura);
  };
  const limitar = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

  // ajuste inicial: a árvore cabe na largura da janela
  useLayoutEffect(() => {
    if (dados && !ajusteInicialFeito.current && largura > 0) {
      ajusteInicialFeito.current = true;
      setZoom(limitar(zoomParaLargura()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, largura]);

  // Ctrl + roda do mouse = zoom
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const aoRolar = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => limitar(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    };
    el.addEventListener('wheel', aoRolar, { passive: false });
    return () => el.removeEventListener('wheel', aoRolar);
  }, [dados]);

  if (pessoas.isPending || unioes.isPending || filiacoes.isPending) return <p>Carregando…</p>;
  const erro = pessoas.error ?? unioes.error ?? filiacoes.error;
  if (erro) return <p className="erro">Erro: {erro.message}</p>;
  if (!dados) return null;

  const { layout, porId, curtos, semLigacao } = dados;
  const filtro = semAcento(busca.trim());
  const combina = (id: number) =>
    filtro === '' || semAcento(porId.get(id)?.nome ?? '').includes(filtro);

  const iniciarAnimacao = () => {
    if (geracoesVisiveis >= totalGeracoes) setGeracoesVisiveis(0);
    setGeracoesVisiveis((visiveis) => (visiveis === 0 ? 1 : visiveis));
    setEstadoAnimacao(totalGeracoes <= 1 ? 'concluida' : 'executando');
  };

  const reiniciarAnimacao = () => {
    setGeracoesVisiveis(0);
    setEstadoAnimacao('parada');
  };

  const barra = (
    <div className="arvore-barra">
      <div className="arvore-barra-grupo arvore-controles">
        {estadoAnimacao === 'parada' || estadoAnimacao === 'concluida' ? (
          <button type="button" onClick={iniciarAnimacao}>
            {estadoAnimacao === 'concluida' ? '▶ Reproduzir novamente' : '▶ Iniciar árvore'}
          </button>
        ) : estadoAnimacao === 'executando' ? (
          <button type="button" onClick={() => setEstadoAnimacao('pausada')}>Ⅱ Pausar</button>
        ) : (
          <button type="button" onClick={() => setEstadoAnimacao('executando')}>▶ Continuar</button>
        )}
        <button type="button" className="secundario" onClick={reiniciarAnimacao}
          disabled={geracoesVisiveis === 0}>
          ↺ Reiniciar
        </button>
        <label className="arvore-velocidade">
          Velocidade
          <select value={intervaloAnimacao}
            onChange={(e) => setIntervaloAnimacao(Number(e.target.value))}>
            <option value={1800}>Lenta</option>
            <option value={1100}>Normal</option>
            <option value={650}>Rápida</option>
          </select>
        </label>
        <span className="arvore-progresso" aria-live="polite">
          {geracoesVisiveis} de {totalGeracoes} gerações
          {estadoAnimacao === 'pausada' ? ' · pausada' : ''}
          {estadoAnimacao === 'concluida' ? ' · concluída' : ''}
        </span>
      </div>
      <div className="arvore-barra-grupo">
        <button type="button" className="secundario" onClick={() => setZoom((z) => limitar(z / 1.15))}>
          −
        </button>
        <button type="button" className="secundario" onClick={() => setZoom(limitar(zoomParaTudo()))}>
          Ajustar
        </button>
        <button type="button" className="secundario" onClick={() => setZoom((z) => limitar(z * 1.15))}>
          +
        </button>
        <span className="arvore-zoom">{Math.round(zoom * 100)}%</span>
      </div>
      <label className="arvore-foco">
        Linha direta de
        <select
          value={foco ?? ''}
          onChange={(e) => setFocoEscolhido(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="">(ninguém)</option>
          {[...layout.x.keys()].map((id) => (
            <option key={id} value={id}>
              {porId.get(id)?.nome ?? `#${id}`}
            </option>
          ))}
        </select>
      </label>
      <input
        className="arvore-busca"
        placeholder="⌕  Buscar na árvore..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
    </div>
  );

  if (layout.x.size === 0) {
    return (
      <section>
        <h2>Árvore</h2>
        <p>
          Ainda não há ligações para desenhar. Cadastre casais e vínculos de pais e filhos na tela{' '}
          <strong>Famílias</strong>.
        </p>
      </section>
    );
  }

  const nomeFoco = foco !== null ? (porId.get(foco)?.nome.split(' ')[0] ?? '') : '';

  return (
    <section>
      <h2>Árvore</h2>
      {barra}
      {layout.avisos.length > 0 && (
        <p className="erro">
          Atenção: {layout.avisos.length} ligação(ões) foram ignoradas no desenho porque uma pessoa
          aparece em mais de um casal.
        </p>
      )}

      <div className="arvore-area" ref={areaRef}>
        <svg
          width={largura * zoom}
          height={altura * zoom}
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label={`Árvore genealógica: ${geracoesVisiveis} de ${totalGeracoes} gerações exibidas`}
        >
          <defs>
            <radialGradient id="fundo-radial" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#fbf5e6" />
              <stop offset="70%" stopColor="#f3e8d0" />
              <stop offset="100%" stopColor="#ead9b8" />
            </radialGradient>
            <linearGradient id="rotulo-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#eadcc0" />
              <stop offset="100%" stopColor="#f3e8d0" />
            </linearGradient>
            <filter id="sombra" x="-30%" y="-30%" width="160%" height="170%">
              <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#503214" floodOpacity="0.28" />
            </filter>
            {[...layout.x.keys()].map((id) => {
              const cx = layout.x.get(id)! + MARGEM_ROTULOS;
              const cy = topoDaLinha(layout.linha.get(id)!) + RAIO_ANEL;
              return (
                <clipPath id={`foto-${id}`} key={id}>
                  <circle cx={cx} cy={cy} r={RAIO_FOTO} />
                </clipPath>
              );
            })}
          </defs>

          {/* fundo */}
          <rect width={largura} height={altura} fill="url(#fundo-radial)" />
          <image
            href="/fundo_arvore.png"
            width={largura}
            height={altura}
            preserveAspectRatio="none"
          />

          {/* ramos e casais */}
          {layout.casais.map((c, i) => {
            const cx = c.centroX + MARGEM_ROTULOS;
            const topo = topoDaLinha(c.linha);
            const yFoto = topo + RAIO_ANEL;
            let origemY: number;
            const partes: ReactNode[] = [];

            if (c.direitaId !== null && c.linha < geracoesVisiveis) {
              const xe = layout.x.get(c.esquerdaId)! + MARGEM_ROTULOS;
              const xd = layout.x.get(c.direitaId)! + MARGEM_ROTULOS;
              partes.push(
                <line
                  key="liga"
                  x1={Math.min(xe, xd)}
                  y1={yFoto}
                  x2={Math.max(xe, xd)}
                  y2={yFoto}
                  stroke={COR_RAMO}
                  strokeWidth={2.2}
                />,
              );
              origemY = yFoto + RAIO_CORACAO;
            } else {
              origemY = topo + 2 * RAIO_ANEL + 30; // abaixo do nome
            }

            c.filhosIds.forEach((filho) => {
              if ((layout.linha.get(filho) ?? Infinity) >= geracoesVisiveis) return;
              const fx = layout.x.get(filho)! + MARGEM_ROTULOS;
              const fy = topoDaLinha(layout.linha.get(filho)!) - 1;
              const m = (fy - origemY) * 0.55;
              partes.push(
                <path
                  key={`ramo-${filho}`}
                  d={`M ${cx} ${origemY} C ${cx} ${origemY + m}, ${fx} ${fy - m}, ${fx} ${fy}`}
                  fill="none"
                  stroke={COR_RAMO}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />,
              );
            });
            return <g key={i}>{partes}</g>;
          })}

          {/* corações */}
          {layout.casais
            .filter((c) => c.direitaId !== null && c.linha < geracoesVisiveis)
            .map((c, i) => {
              const cx = c.centroX + MARGEM_ROTULOS;
              const cy = topoDaLinha(c.linha) + RAIO_ANEL;
              return (
                <g key={`cor-${i}`}>
                  <circle cx={cx} cy={cy} r={RAIO_CORACAO} fill="#fbf5e8" stroke="#c9a46a" strokeWidth={1.5} />
                  <text
                    x={cx}
                    y={cy + 4.5}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#b3263e"
                    style={{ userSelect: 'none' }}
                  >
                    ♥
                  </text>
                </g>
              );
            })}

          {/* pessoas */}
          {[...layout.x.entries()].map(([id, x]) => {
            const p = porId.get(id);
            if (!p) return null;
            const cx = x + MARGEM_ROTULOS;
            const linhaPessoa = layout.linha.get(id)!;
            if (linhaPessoa >= geracoesVisiveis) return null;
            const topo = topoDaLinha(linhaPessoa);
            const cy = topo + RAIO_ANEL;
            const destaque = linhaDireta.has(id);
            const nome = curtos.get(id) ?? p.nome;
            return (
              <g key={id} opacity={combina(id) ? 1 : 0.22}>
                <title>{p.nome}</title>
                <circle
                  cx={cx}
                  cy={cy}
                  r={RAIO_ANEL}
                  fill={destaque ? '#b8892f' : '#fbf5e8'}
                  stroke={COR_RAMO}
                  strokeWidth={1.5}
                  filter="url(#sombra)"
                />
                {p.foto ? (
                  <image
                    href={`/api/uploads/${p.foto}`}
                    x={cx - RAIO_FOTO}
                    y={cy - RAIO_FOTO}
                    width={2 * RAIO_FOTO}
                    height={2 * RAIO_FOTO}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#foto-${id})`}
                  />
                ) : (
                  <g clipPath={`url(#foto-${id})`}>
                    <circle cx={cx} cy={cy} r={RAIO_FOTO} fill="#cbd5e1" />
                    <circle cx={cx} cy={cy - 7} r={11} fill="#1e2a3a" />
                    <ellipse cx={cx} cy={cy + RAIO_FOTO - 2} rx={21} ry={20} fill="#1e2a3a" />
                  </g>
                )}
                <foreignObject
                  x={cx - LARGURA_CARTAO / 2}
                  y={topo + 2 * RAIO_ANEL + 5}
                  width={LARGURA_CARTAO}
                  height={64}
                >
                  <div className="arvore-nome-caixa">
                    <span className={destaque ? 'arvore-nome destaque' : 'arvore-nome'}>{nome}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* rótulos das gerações */}
          {Array.from({ length: layout.totalLinhas }, (_, i) => {
            if (i >= geracoesVisiveis) return null;
            const titulo =
              layout.totalLinhas === 5 ? TITULOS_5[i]! : `${ROMANOS[i + 1] ?? i + 1} Geração`;
            const linhas = titulo.split('\n');
            const y0 = topoDaLinha(i) + 8;
            const h = 18 * linhas.length + 16;
            const r = Math.min(28, h / 2);
            return (
              <g key={`ger-${i}`} pointerEvents="none">
                <path
                  d={`M 0 ${y0} H ${140 - r} A ${r} ${r} 0 0 1 140 ${y0 + r} V ${y0 + h - r} A ${r} ${r} 0 0 1 ${140 - r} ${y0 + h} H 0 Z`}
                  fill="url(#rotulo-grad)"
                />
                {linhas.map((t, k) => (
                  <text
                    key={k}
                    x={75}
                    y={y0 + 16 + 4 + k * 18}
                    textAnchor="middle"
                    fontSize={14}
                    fill="#5a4128"
                    fontFamily="Georgia, serif"
                  >
                    {t}
                  </text>
                ))}
              </g>
            );
          })}

          {/* legenda */}
          <g transform={`translate(24 ${altura - 64})`} pointerEvents="none">
            <rect width={470} height={40} rx={20} fill="#fbf5e8" fillOpacity={0.92} stroke="#d8bd8c" />
            <circle cx={26} cy={20} r={9} fill="#fbf5e8" stroke="#b8892f" strokeWidth={3} />
            <text x={42} y={25} fontSize={12} fill="#5a4128" fontFamily="Georgia, serif">
              {nomeFoco ? `Linha direta de ${nomeFoco}` : 'Linha direta'}
            </text>
            <text x={190} y={26} fontSize={13} fill="#b3263e">
              ♥
            </text>
            <text x={208} y={25} fontSize={12} fill="#5a4128" fontFamily="Georgia, serif">
              Casal · os ramos descem para os filhos
            </text>
          </g>
        </svg>
      </div>

      {semLigacao.length > 0 && (
        <p className="arvore-sem-ligacao">
          <strong>Sem ligações (não aparecem na árvore):</strong>{' '}
          {semLigacao.map((p) => p.nome).join(' · ')}
        </p>
      )}
    </section>
  );
}
