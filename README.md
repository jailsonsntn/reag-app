# Sistema de Reagendamentos - Assistência Técnica

Web application para gerenciar reagendamentos de uma assistência técnica com dashboard de monitoramento em tempo real.

## 📋 Funcionalidades

- **Dashboard Principal**: Visualização em tempo real dos reagendamentos similares a planilha Excel
- **Gestão de OS**: Controle completo das Ordens de Serviço
- **Cadastro de Produtos**: Gestão de SKUs e produtos
- **Controle de Técnicos**: Atribuição e acompanhamento de técnicos
- **Sistema de Reagendamento**: Controle de datas e motivos
- **Classificação de Peças**: Funcional ou Estética
- **Filtros Avançados**: Busca por múltiplos critérios
- **Relatórios**: Estatísticas e métricas em tempo real

## 🚀 Tecnologias

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **Lucide React**: Ícones modernos
- **Radix UI**: Componentes acessíveis
- **TanStack Table**: Tabelas avançadas
- **Date-fns**: Manipulação de datas

## 📦 Instalação

Execute o servidor de desenvolvimento:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🏷️ Release v0.2.0

Melhorias principais desta versão:

- Layout moderno no Dashboard e na página de Análise (header com blur, sombras suaves, cantos arredondados)
- Filtros alinhados em grid responsiva e botão de limpar com ícone (tooltip no hover)
- Modal de criação e modais da análise com fundo translúcido e bordas sutis
- Tema global refinado (gradientes suaves e melhor contraste)
- Build estável sem Turbopack (tolerante a unidades de rede)
- Seed deduplicado em memória (sem `skipDuplicates`)

Como atualizar localmente:

1. Atualize dependências se necessário: `npm install`
2. Gere e sincronize o Prisma: `npx prisma generate && npx prisma db push`
3. Build e start: `npm run build && npm start`

Screenshots e notas adicionais podem ser adicionados na próxima release.

## Execução com duplo clique (Windows)

Para rodar como um “executável” dentro de uma pasta de servidor Windows:

1. Copie a pasta inteira `reag-app` para o servidor (ex.: `C:\Apps\reag-app`).
2. Dê duplo clique em `StartServidor.cmd`.
	 - O script vai:
		 - Configurar `DATABASE_URL=file:./data/reag.db` (banco local dentro da pasta).
		 - Criar a pasta `data/` se não existir.
		 - Instalar dependências (na primeira execução).
		 - Gerar o Prisma Client e sincronizar o banco (`db push`).
		 - Fazer o build e iniciar o servidor (`npm run start`).
	 - O navegador abrirá em `http://localhost:3000`.

Para parar, feche a janela do terminal “Reag App”. Para mudar porta, use a variável `PORT` antes do start.
