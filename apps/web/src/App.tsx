import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { api } from './api/cliente';
import { useUsuario, type UsuarioDto } from './features/auth/useUsuario';
import { Arvore } from './paginas/Arvore';
import { Familias } from './paginas/Familias';
import { Inicio } from './paginas/Inicio';
import { Login } from './paginas/Login';
import { Pessoas } from './paginas/Pessoas';
import { TrocarSenha } from './paginas/TrocarSenha';

export function App() {
  const qc = useQueryClient();
  const { data: usuario, isPending } = useUsuario();

  const sair = useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // descarta os dados da sessão anterior e volta para o login
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
      qc.setQueryData<UsuarioDto | null>(['me'], null);
    },
  });

  if (isPending) return <p className="conteudo">Carregando…</p>;
  if (!usuario) return <Login />;
  if (usuario.trocarSenha) return <TrocarSenha obrigatoria />;

  return (
    <>
      <header className="topo">
        <h1>Raízes &amp; Memórias</h1>
        <nav>
          <NavLink to="/">Início</NavLink>
          <NavLink to="/arvore">Árvore</NavLink>
          <NavLink to="/pessoas">Pessoas</NavLink>
          <NavLink to="/familias">Famílias</NavLink>
          <NavLink to="/senha">Minha senha</NavLink>
          <span className="usuario-topo">{usuario.nome.split(' ')[0]}</span>
          <button type="button" className="secundario" onClick={() => sair.mutate()}>
            Sair
          </button>
        </nav>
      </header>
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/arvore" element={<Arvore />} />
          <Route path="/pessoas" element={<Pessoas />} />
          <Route path="/familias" element={<Familias />} />
          <Route path="/senha" element={<TrocarSenha />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
