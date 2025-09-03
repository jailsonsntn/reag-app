# 📊 Processamento de Dados Excel

Este documento explica como processar todos os dados do arquivo `ReagendamentoForm2025.xlsx`.

## 🔄 Processamento Automático

O sistema pode processar automaticamente **todos os dados** do arquivo Excel e gerar um dataset completo.

### Como Executar:

```bash
# Processar arquivo Excel e gerar dados completos
npm run process-excel
```

### 📋 O que o Script Faz:

1. **Lê o arquivo Excel** `ReagendamentoForm2025.xlsx`
2. **Processa todos os registros** (850+ entradas)
3. **Extrai automaticamente**:
   - ✅ Todos os reagendamentos
   - 👨‍🔧 Técnicos únicos com especialidades
   - 📦 Produtos únicos com categorias
   - 🔧 Peças únicas com disponibilidade
4. **Gera arquivo** `src/data/completeData.ts`
5. **Mostra estatísticas** do processamento

## 📈 Estatísticas dos Dados Processados

**Última execução:**
- 📊 **850 reagendamentos** processados
- 👨‍🔧 **12 técnicos** identificados  
- 📦 **352 produtos** catalogados
- 🔧 **350 peças** mapeadas

### 🔄 Distribuição por Motivo:
- **VCP** (Vencimento de Prazo): 634 registros
- **NTN** (Não Tem Peça): 149 registros  
- **ENL** (Em Negociação): 67 registros

### 👨‍🔧 Top 5 Técnicos Mais Ativos:
1. **DANIEL**: 144 atendimentos
2. **ADILSON**: 105 atendimentos
3. **BRUNO**: 105 atendimentos
4. **ANDERSON**: 101 atendimentos
5. **FABIO**: 97 atendimentos

## 🏗️ Estrutura dos Dados Gerados

### Técnicos
- **Nome**: Nome do técnico
- **Especialidade**: Calculada automaticamente baseada nos produtos mais trabalhados
- **Status**: Ativo/Inativo

### Produtos  
- **SKU**: Código único do produto
- **Nome**: Descrição do produto
- **Categoria**: Auto-categorizada (Refrigeração, Lavadoras, Fornos, etc.)

### Peças
- **Código**: Código único da peça
- **Nome**: Nome/descrição da peça
- **Tipo**: FUNCIONAL ou ESTÉTICA
- **Disponibilidade**: Simulada (80% disponíveis)

### Reagendamentos
- **Todos os campos** da planilha original
- **Datas convertidas** para formato brasileiro
- **Tipos normalizados** (FUNCIONAL/ESTÉTICA)
- **IDs únicos** gerados automaticamente

## 🔧 Personalização

Para modificar o processamento, edite:
- `scripts/processExcel.js` - Lógica principal
- `src/utils/excelProcessor.ts` - Funções TypeScript

## 📝 Logs Detalhados

O script gera logs completos durante a execução:
- ✅ Número de registros processados
- 📊 Estatísticas por categoria
- 🔄 Distribuição de dados
- ❌ Erros e avisos

## 🚀 Integração Automática

Após o processamento, o dashboard usa automaticamente os novos dados:
- **Dashboard atualizado** com dados reais
- **Filtros funcionais** com todos os técnicos/produtos
- **Estatísticas precisas** baseadas nos dados reais
- **Performance otimizada** para 850+ registros
