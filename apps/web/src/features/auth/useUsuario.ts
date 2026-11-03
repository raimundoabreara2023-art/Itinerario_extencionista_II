import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/cliente';

export type UsuarioDto = {
  id: number;
  login: string;
  papel: 'ADMIN' | 'MEMBRO';
  pessoaId: number;
  nome: string;
  trocarSenha: boolean;
};

/** Usuário logado, ou null quando não há sessão (401 / sem rede). */
export function useUsuario() {
  return useQuery<UsuarioDto | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api<UsuarioDto>('/auth/me');
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}
