# Modelo de dados

- **pessoa**(id, nome, data_nascimento, sexo M/F opcional, foto, criado_em)
- **uniao**(id, pessoa_a_id, pessoa_b_id) — CHECK a<b, UNIQUE(a,b): um casal tem uma linha só
- **filiacao**(id, filho_id, genitor_id, papel PAI|MAE) — UNIQUE(filho,papel), CHECK filho<>genitor

Tudo com ON DELETE CASCADE. Irmão, avô, tio, primo etc. são calculados no código.

## Migração dos dados do Java
Script futuro lê `relacionamento` (PAI/MAE/CONJUGE) e gera `uniao` + `filiacao`; depois comparamos se a árvore sai idêntica.
