import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../api/cliente';
import '../estilos/login.css';

export function TrocarSenha({ obrigatoria = false }: { obrigatoria?: boolean }) {
  const qc = useQueryClient();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirma, setConfirma] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);

  const trocar = useMutation({
    mutationFn: () =>
      api<void>('/auth/trocar-senha', {
        method: 'POST',
        body: JSON.stringify({ senhaAtual: atual, novaSenha: nova }),
      }),
    onSuccess: () => {
      setAtual('');
      setNova('');
      setConfirma('');
      setAviso('Senha alterada com sucesso.');
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault();
    setAviso(null);
    if (nova !== confirma) {
      setAviso('A confirmação não confere com a nova senha.');
      return;
    }
    trocar.mutate();
  };

  const formulario = (
    <form className={obrigatoria ? 'login-cartao' : 'login-cartao solto'} onSubmit={aoEnviar}>
      <h2>{obrigatoria ? 'Defina sua senha' : 'Trocar senha'}</h2>
      {obrigatoria && <p>Este é seu primeiro acesso: escolha uma senha nova para continuar.</p>}
      <label>
        {obrigatoria ? 'Senha provisória' : 'Senha atual'}
        <input
          type="password"
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      <label>
        Nova senha (mín. 8 caracteres)
        <input
          type="password"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label>
        Confirmar nova senha
        <input
          type="password"
          value={confirma}
          onChange={(e) => setConfirma(e.target.value)}
          required
          autoComplete="new-password"
        />
      </label>
      <button type="submit" disabled={trocar.isPending}>
        Salvar senha
      </button>
      {aviso && <p>{aviso}</p>}
      {trocar.error && <p className="erro">{trocar.error.message}</p>}
    </form>
  );

  return obrigatoria ? <div className="login">{formulario}</div> : formulario;
}
