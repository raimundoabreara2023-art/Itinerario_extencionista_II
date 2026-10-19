# Arquitetura

```
raizes-memorias/
├─ packages/domain   TypeScript puro: tipos, nomes curtos, (depois) layout da árvore e parentesco
├─ apps/api          Fastify + Drizzle + PostgreSQL
│   └─ modules/<x>   routes → service → repository
└─ apps/web          React + Vite + TanStack Query
```

Regras:
- `domain` não importa nada de api/web nem de bibliotecas de runtime; testável sozinho.
- API em camadas: **routes** (HTTP + zod) → **service** (regras) → **repository** (SQL via Drizzle).
- Tudo por **id**, nunca por nome. Parentesco é **derivado**, não gravado.
- `createApp({ db })` permite testar a API com banco de teste.
- Web fala com a API só via `src/api/cliente.ts`; dados do servidor via TanStack Query.
- Fotos: caminho relativo em `pessoa.foto`, arquivos em `apps/api/uploads`.
