import { useQuery } from '@tanstack/react-query';
import { api } from '../api/cliente';

export function Inicio() {
  const { data, error, isPending } = useQuery({
    queryKey: ['health-db'],
    queryFn: () => api<{ ok: boolean; db: string }>('/health/db'),
    retry: false,
  });
  return (
    <section>
      <h2>Bem-vindo</h2>
      <p>
        Banco de dados:{' '}
        {isPending ? 'verificando…' : error ? `❌ ${error.message}` : `✅ ${data.db}`}
      </p>
    </section>
  );
}
