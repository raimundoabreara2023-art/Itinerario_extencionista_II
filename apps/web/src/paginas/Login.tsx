import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../api/cliente';
import type { UsuarioDto } from '../features/auth/useUsuario';
import '../estilos/login.css';

export function Login() {
  const qc = useQueryClient();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  const entrar = useMutation({
    mutationFn: () =>
      api<UsuarioDto>('/auth/login', { method: 'POST', body: JSON.stringify({ login, senha }) }),
    onSuccess: (u) => qc.setQueryData<UsuarioDto | null>(['me'], u),
  });

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault();
    entrar.mutate();
  };

  return (
    <div className="login">
      <form className="login-cartao" onSubmit={aoEnviar}>
        <h1>Raízes &amp; Memórias</h1>
        <p>Entre para ver a árvore da família.</p>
        <label>
          Login
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoFocus
            required
            autoComplete="username"
            placeholder="nome.sobrenome"
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={entrar.isPending}>
          {entrar.isPending ? 'Entrando…' : 'Entrar'}
        </button>
        {entrar.error && <p className="erro">{entrar.error.message}</p>}
      </form>
    </div>
  );
}
