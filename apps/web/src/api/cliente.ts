export async function api<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`/api${caminho}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  if (!resp.ok) {
    const corpo = (await resp.json().catch(() => null)) as { erro?: string } | null;
    throw new Error(corpo?.erro ?? `Erro ${resp.status}`);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}
