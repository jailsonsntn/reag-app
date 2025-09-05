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
- Script Windows “StartServidor.cmd” para rodar tudo com duplo clique (instala, sincroniza, compila, inicia e abre o navegador).

## 🧱 Arquitetura & Stack

- Frontend: Next.js 15 (App Router) + React 19 + TypeScript.
- Estilo/UI: Tailwind CSS v4, Radix UI, Lucide React, TanStack Table.
- Backend: API Routes do Next.js.
- Banco: SQLite com Prisma 6.x.
- Validação: Zod.
- Datas & Planilha: date-fns e xlsx.

## 📁 Estrutura de Diretórios (resumo)

- `src/app` — Páginas (App Router) e APIs (`/api/reagendamentos`, `/api/reagendamentos/[id]`, `/api/seed`, `/api/maintenance/normalize-dates`).
- `src/components` — Tabela, Dashboard, Dialogs (Add/Edit/View), filtros e cartões de estatística.
- `src/utils` — Processamento auxiliar (datas/Excel).
- `scripts` — Ferramentas (processar Excel, saneamento legado, rotação de backups).
- `prisma` — `schema.prisma` e base SQLite (via `DATABASE_URL`).

## 🚀 Como rodar

### Opção A — Windows (duplo clique)

1) Abra `StartServidor.cmd`.
2) O script vai instalar dependências (se necessário), gerar Prisma, sincronizar o banco, processar o Excel se existir, compilar e iniciar o servidor.
3) O navegador abrirá automaticamente em `http://localhost:3000`.

Observações:
- O script aceita `ReagendamentoForm2025.xlsx` ou `ReagendamentoForm2025.xls` na raiz do projeto.
- O banco local fica em `data/reag.db` (configurado por `DATABASE_URL=file:./data/reag.db`).

### Opção B — Desenvolvimento

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

## ✅ Boas práticas implementadas

- Ordenação consistente (mais recentes primeiro) e navegação de primeira/última página.
- Validação e normalização de entradas (Zod e utilidades de data).
- Tratamento do serial de data do Excel e de formatos brasileiros.
- Alta legibilidade (contraste) com variantes para dark mode.

## 👤 Autor

Projeto desenvolvido por <strong>Jailson Santana</strong> para gerenciar o reagendamento de uma assistência técnica.

—

Se tiver dúvidas ou sugestões, abra uma Issue no repositório ou entre em contato com o autor.
