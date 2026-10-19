# Comece aqui

## 1. O que baixar e instalar (uma vez só)

| Item | Para quê | Onde |
|---|---|---|
| **Node.js 22 LTS** | roda TypeScript, API e Vite | nodejs.org |
| **pnpm** | gerenciador de pacotes do monorepo | depois do Node: `corepack enable` (ou `npm i -g pnpm`) |
| **Git** | versionamento | git-scm.com |
| **PostgreSQL** | você já tem; crie o banco `raizes_v2` | pgAdmin/DBeaver para criar |
| VS Code + extensões **ESLint**, **Prettier**, (opcional) **Error Lens** | editor | |
| Docker Desktop (opcional) | alternativa ao Postgres local, via `docker-compose.yml` | |

Dica: coloque o projeto em pasta **sem acento, sem "&" e fora do OneDrive**, ex.: `C:\dev\raizes-memorias`.

## 2. Primeira execução

```powershell
cd C:\dev\raizes-memorias
pnpm install
copy apps\api\.env.example apps\api\.env     # edite usuário/senha do Postgres
pnpm db:generate                              # gera a migração a partir do schema
pnpm db:migrate                               # cria as tabelas em raizes_v2
pnpm typecheck
pnpm test
pnpm dev                                      # API :3333 + Web :5173
```

Abra http://localhost:5173 — a tela Início mostra se o banco conectou.

## 3. Se algo falhar
As versões das dependências foram escritas sem poder rodar `pnpm install` aqui. Se algum pacote reclamar de versão, me mande a mensagem de erro que eu ajusto.

## 4. Segurança
Nunca coloque senha no código nem no git. Use só o `.env` (já ignorado). Como a senha antiga está no `ConexaoBanco.java`, considere trocá-la.
