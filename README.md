## Backup, Restauração e Exportação

Este projeto inclui mecanismos de backup/restauração do banco e exportação de dados para Excel, com integração no Dashboard e APIs dedicadas.

- Botão Backup (Dashboard → Configurações → "Fazer backup agora"): cria backup do banco (SQLite) e export JSON.
- Auto-backup: executado a cada 15 min enquanto a página está aberta.
- Backup ao fechar: é enviado um backup final (best-effort via sendBeacon).
- Exportar para Excel: botão no menu Configurações gera um `.xlsx` com os reagendamentos atuais.

Arquivos gerados:
- Banco: `prisma/backups/reag.<timestamp>.db`
- Export JSON: `src/data/backups/reagendamentos.<timestamp>.json`

Retenção: rotação automática mantendo os 10 mais recentes.

Restauração:
- UI: Configurações → Ver backups → "Restaurar" ao lado de cada arquivo.
  - Banco (.db): troca o arquivo em uso (resolve o caminho real pelo `DATABASE_URL`), restauração instantânea.
  - Export JSON: limpa a tabela e reimporta em lote (preserva id/createdAt quando presentes).
- API: `POST /api/backup/restore` com `{ "type": "db" | "json", "file": "<nome-do-arquivo>" }`.

Metadados para escolher o backup certo:
- JSON: `GET /api/backup/meta` retorna o total de itens por arquivo JSON.
- DB: `GET /api/backup/inspect?type=db&file=<nome>` retorna total e faixa de datas (min/max) para cada `.db` sem precisar restaurar.

<div align="center">

# Reag App — Gestão de Reagendamentos de Assistência Técnica

Desenvolvido por <strong>Jailson Santana</strong> para gerenciar o reagendamento de uma assistência técnica.

</div>

## 🎯 Escopo do Projeto

O Reag App centraliza, organiza e analisa reagendamentos de uma assistência técnica. Ele foi idealizado para substituir planilhas, oferecer um painel de controle com métricas e facilitar o dia a dia da operação (cadastro, consulta, análise e manutenção dos dados).

Principais objetivos:

- Importar e consolidar dados a partir de planilhas Excel.
- Cadastrar, editar, visualizar e excluir reagendamentos de forma segura e rápida.
- Consultar com filtros avançados (por OS, SKU, produto, técnico, motivo, data, tipo e peça).
- Acompanhar indicadores e distribuições na página de Análise (com tooltip interativo e detalhes por faixa).
- Manter histórico consistente (datas normalizadas, sem duplicidades) em banco local SQLite via Prisma.
- Operar com alta responsividade e paginação de 100 itens por página, sempre dos mais recentes para os mais antigos.

## ✨ Funcionalidades

- Dashboard com tabela paginada (100 itens/página), ordenação por data (mais recente primeiro) e ações rápidas.
- CRUD completo: adicionar, editar, visualizar (modal somente leitura) e excluir reagendamentos.
- Filtros avançados e botão “Limpar filtros” com ícone e tooltip.
- Página de Análise: gráfico interativo com tooltip e clique para abrir detalhes da faixa.
- Importação de Excel (.xlsx/.xls) com conversão automática de datas (dd/mm/yyyy, Date e serial do Excel) para ISO (YYYY-MM-DD).
- Normalização de datas existentes no banco e deduplicação por chave composta (OS, SKU, data, motivo).
- Indicadores de total global e validação de sincronização entre planilha e banco.
- Exportar para Excel (.xlsx) direto da UI (Configurações → Exportar para Excel) ou pela rota `GET /api/export/excel`.
- Backup e restauração completos com listagem e download na UI (inclui metadados: total/min/max).
- Start rápido no Windows com `StartRapido.cmd` (desenvolvimento, sem tarefas pesadas).
- Instalador para Windows (`Install.cmd`) que configura dependências, banco e cria atalhos na Área de Trabalho.

## 🧱 Arquitetura & Stack

- Frontend: Next.js 15 (App Router) + React 19 + TypeScript.
- Estilo/UI: Tailwind CSS v4, Radix UI, Lucide React, TanStack Table.
- Backend: API Routes do Next.js.
- Banco: Supabase PostgreSQL com Prisma 6.x.
- Validação: Zod.
- Datas & Planilha: date-fns e xlsx.

## 📁 Estrutura de Diretórios (resumo)

## GitHub e Deploy (Supabase + Vercel)

### 1) Variaveis de ambiente

Crie um arquivo `.env.example` (versionado) com este modelo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_<sua-chave-publica>

DATABASE_URL=postgresql://postgres.<project-ref>:<DB_PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<project-ref>:<DB_PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Notas:
- Caracteres especiais na senha (como `@`) devem ser codificados em URL (`@` -> `%40`).
- `DATABASE_URL` e `DIRECT_URL` usam pooler na porta `6543` para melhor compatibilidade em ambientes serverless.

### 2) Subir para GitHub

```bash
git add .
git commit -m "chore: configurar Supabase e preparar deploy no Vercel"
git push origin master
```

### 3) Deploy no Vercel

1. Importe o repositorio no Vercel.
2. Em `Settings > Environment Variables`, configure:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `DATABASE_URL`
	- `DIRECT_URL`
3. Execute o primeiro deploy.

### 4) Banco de dados

- Se a tabela ainda nao existir, execute o SQL de schema no Supabase SQL Editor.
- Para importar dados em lote, utilize o arquivo `scripts/seed-supabase.sql` no SQL Editor.

- `src/app` — Páginas (App Router) e APIs (CRUD, backup/restore/meta/inspect, export):
	- `/api/reagendamentos`, `/api/reagendamentos/[id]`
	- `/api/seed`, `/api/maintenance/normalize-dates`
	- `/api/backup` (POST), `/api/backup/list` (GET), `/api/backup/download` (GET)
	- `/api/backup/restore` (POST), `/api/backup/meta` (GET), `/api/backup/inspect` (GET)
	- `/api/export/excel` (GET)
- `src/components` — Tabela, Dashboard, Dialogs (Add/Edit/View), filtros e cartões de estatística.
- `src/utils` — Processamento auxiliar (datas/Excel).
- `scripts` — Ferramentas (processar Excel, saneamento legado, rotação de backups).
- `prisma` — `schema.prisma` e conexão PostgreSQL/Supabase (via `DATABASE_URL`).

## 🏷️ Release v0.2.0

## 🚀 Como rodar

### Opção A — Windows (Instalador + atalhos)

1) Execute `Install.cmd` (cria atalhos na Área de Trabalho e prepara o ambiente).
2) Use os atalhos:
	 - "Reag App - Start Rapido" (desenvolvimento rápido).
	 - "Reag App - Start (Producao)" (faz build e inicia em produção).

### Opção B — Start rápido (Windows)

- Dê duplo clique em `StartRapido.cmd`.
- Ele libera a porta 3000, sobe `npm run dev -p 3000` e abre o navegador quando o servidor responder.

### Opção C — Start com flags (Windows)

- `StartServidor.cmd` sem flags: inicia em dev, janela permanece aberta.
- Flags disponíveis:
	- `--db`: roda `prisma generate` + `prisma db push`.
	- `--excel`: processa a planilha (se existir).
	- `--build`: limpa e roda `npm run build`, iniciando em produção.

### Opção D — Desenvolvimento manual

1) Configure a variável `DATABASE_URL` apontando para `file:./data/reag.db`.
2) Execute Prisma (`generate` e `db push`).
3) Execute `npm run dev` e acesse `http://localhost:3000`.

## 🔄 Importação do Excel

- Coloque `ReagendamentoForm2025.xlsx` ou `ReagendamentoForm2025.xls` na raiz.
- Rode `npm run process-excel` (o `StartServidor.cmd` também executa isso automaticamente quando o arquivo existe).
- O script gera `src/data/excelData.ts` com os registros e listas auxiliares (técnicos, produtos, peças, motivos).

## 🧩 API (resumo)

- `GET /api/reagendamentos?take=100&page=0&meta=1` — paginação (100 por página, ordenado por data desc) e metadados.
- `POST /api/reagendamentos` — cria novo registro (validação com Zod).
- `PUT /api/reagendamentos/[id]` — edita um registro existente.
- `DELETE /api/reagendamentos/[id]` — remove por id.
- `POST /api/seed` — importa em lote os dados processados do Excel (com deduplicação em memória).
- `POST /api/maintenance/normalize-dates` — normaliza datas e resolve duplicidades.
- `POST /api/backup` — cria backup (DB + JSON) com rotação.
- `GET /api/backup/list` — lista arquivos de backup disponíveis.
- `GET /api/backup/download?type=db|json&file=...` — baixa o arquivo.
- `POST /api/backup/restore` — restaura (DB/JSON) com backup prévio.
- `GET /api/backup/meta` — totais por JSON.
- `GET /api/backup/inspect?type=db&file=...` — total, min e max de um `.db` sem restaurar.
- `GET /api/export/excel` — exporta um `.xlsx` com os reagendamentos.

## ✅ Boas práticas implementadas

- Ordenação consistente (mais recentes primeiro) e navegação de primeira/última página.
- Validação e normalização de entradas (Zod e utilidades de data).
- Tratamento do serial de data do Excel e de formatos brasileiros.
- Tema claro unificado (dark mode removido) e alta legibilidade.
- Backup respeitando o caminho real do DB via `DATABASE_URL` (relativo ou absoluto).
- Restauração segura com backup prévio automático.

## 👤 Autor

Projeto desenvolvido por <strong>Jailson Santana</strong> para gerenciar o reagendamento de uma assistência técnica.

—

Se tiver dúvidas ou sugestões, abra uma Issue no repositório ou entre em contato com o autor.
