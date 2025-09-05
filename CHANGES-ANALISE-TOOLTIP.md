# Patch de alterações aplicadas (Analise – Tooltip no gráfico)

Este arquivo descreve e acompanha um patch com todas as mudanças entre o commit base ee5c4c7 e o HEAD 6803cf5.

## Como aplicar em outro clone/janela

1) Copie o arquivo `patch-analise-tooltip.patch` para o outro workspace.
2) No diretório raiz do projeto, aplique:

   Windows PowerShell:
   git apply --index patch-analise-tooltip.patch

   Se houver conflitos, resolva-os e finalize com:
   git commit -m "Aplica patch de tooltip na análise"

3) Reinicie o servidor de desenvolvimento, se necessário.

## Escopo das mudanças

- Página de análise (`src/app/analise/section/AnaliseClient.tsx`)
  - Adicionado tooltip interativo ao passar o mouse sobre os pontos do gráfico
    (balão escuro arredondado com borda sutil, conector ao ponto e área de hover maior).
  - Destaque visual do ponto quando em hover.

- Novos componentes auxiliares
  - `src/components/ViewReagendamentoDialog.tsx` (visualização)
  - `src/components/EditReagendamentoDialog.tsx` (edição)

- APIs (se já não existiam na outra janela)
  - `src/app/api/reagendamentos/route.ts` (GET all/paginação, POST)
  - `src/app/api/reagendamentos/[id]/route.ts` (PUT/DELETE)
  - `src/app/api/seed/route.ts` (seed dos dados do Excel)

- Dados
  - Atualização de `src/data/excelData.ts` com dataset processado.

Observação: Caso a outra janela já tenha parte dessas rotas/arquivos, o `git apply` pode indicar conflito; prefira manter as versões mais recentes (as que vêm deste patch) para garantir o tooltip e fluxo de análise funcionando como descrito.
