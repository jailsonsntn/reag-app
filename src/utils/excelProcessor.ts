import * as XLSX from 'xlsx';
import fs from 'fs';
import { Reagendamento, Tecnico, Produto, Peca, MotivoReagendamento } from '@/types/reagendamento';

// Script para processar todos os dados do arquivo Excel ReagendamentoForm2025.xlsx
export async function processExcelData(): Promise<{
  reagendamentos: Reagendamento[];
  tecnicos: Tecnico[];
  produtos: Produto[];
  pecas: Peca[];
  motivosReagendamento: MotivoReagendamento[];
}> {
  try {
    // Ler o arquivo Excel
    const workbook = XLSX.readFile('./ReagendamentoForm2025.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
  // Converter para JSON
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet) as Record<string, unknown>[];
    
    console.log(`Processando ${rawData.length} registros do Excel...`);
    
    // Mapear os dados para o formato do sistema
    const reagendamentos: Reagendamento[] = rawData.map((row, index) => {
      const r = row as Record<string, unknown>;
      const os = (r['OS'] as string | number | undefined)?.toString() || '';
      const sku = (r['SKU'] as string | number | undefined)?.toString() || '';
      const produto = (r['PRODUTO'] as string | undefined)?.toString() || '';
      const tecnico = (r['TÉCNICO'] as string | undefined)?.toString() || '';
      const data = formatDate((r['Data '] as string | undefined) || '');
      const teveReagendamento = ((r['Teve Reagendamento?'] as string | undefined)?.toString() === 'SIM');
      const motivo = ((r['Motivo?'] as string | undefined)?.toString() || '') as 'VCP' | 'NTN' | 'ENL' | '';
      const codigoPeca = (r['Peça? Código? '] as string | number | undefined)?.toString() || '';
      const tipoRaw = (r['Tipo (Estética ou Funcional)?'] as string | undefined) || 'FUNCIONAL';
      const tipoNormalizado = tipoRaw.toUpperCase().includes('ESTÉTICA') || tipoRaw.toUpperCase().includes('ESTETICA')
        ? 'ESTETICA' as const
        : 'FUNCIONAL' as const;
      const nomePeca = (r['Nome da Peça? '] as string | undefined)?.toString() || '';

      return {
        id: (index + 1).toString(),
        os,
        sku,
        produto,
        tecnico,
        data,
        teveReagendamento,
        motivo,
        codigoPeca,
        tipo: tipoNormalizado,
        nomePeca,
      } as Reagendamento;
    });
    
    // Extrair técnicos únicos
    const tecnicosUnicos = [...new Set(reagendamentos.map(r => r.tecnico).filter(Boolean))];
    const tecnicos: Tecnico[] = tecnicosUnicos.map((nome, index) => ({
      id: (index + 1).toString(),
      nome,
      especialidade: getEspecialidade(nome, reagendamentos),
      ativo: true,
    }));
    
    // Extrair produtos únicos
    const produtosUnicos = reagendamentos.reduce((acc, r) => {
      if (r.sku && r.produto) {
        acc.set(r.sku, {
          sku: r.sku,
          nome: r.produto,
          categoria: getCategoria(r.produto),
        });
      }
      return acc;
    }, new Map<string, Produto>());
    const produtos: Produto[] = Array.from(produtosUnicos.values());
    
    // Extrair peças únicas
    const pecasUnicas = reagendamentos.reduce((acc, r) => {
      if (r.codigoPeca && r.nomePeca) {
        const codigoKey = r.codigoPeca.toString();
        acc.set(codigoKey, {
          codigo: r.codigoPeca.toString(),
          nome: r.nomePeca,
          tipo: (r.tipo as 'FUNCIONAL' | 'ESTETICA'),
          disponivel: Math.random() > 0.2, // 80% disponíveis
        });
      }
      return acc;
    }, new Map<string, Peca>());
    const pecas: Peca[] = Array.from(pecasUnicas.values());
    
    // Motivos de reagendamento
    const motivosReagendamento: MotivoReagendamento[] = [
      { codigo: 'VCP', descricao: 'Vencimento de Prazo' },
      { codigo: 'NTN', descricao: 'Não Tem Peça' },
      { codigo: 'ENL', descricao: 'Em Negociação com Cliente' },
    ];
    
    console.log(`Processados:`);
    console.log(`- ${reagendamentos.length} reagendamentos`);
    console.log(`- ${tecnicos.length} técnicos`);
    console.log(`- ${produtos.length} produtos`);
    console.log(`- ${pecas.length} peças`);
    
    return {
      reagendamentos,
      tecnicos,
      produtos,
      pecas,
      motivosReagendamento,
    };
    
  } catch (error) {
    console.error('Erro ao processar arquivo Excel:', error);
    throw error;
  }
}

// Funções auxiliares
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Assumindo formato DD/MM/YYYY
  return dateStr;
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function getEspecialidade(tecnico: string, reagendamentos: Reagendamento[]): string {
  const produtosTecnico = reagendamentos
    .filter(r => r.tecnico === tecnico)
    .map(r => r.produto);
  
  const produtoMaisComum = produtosTecnico
    .reduce((acc, produto) => {
      acc[produto] = (acc[produto] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const principalProduto = Object.keys(produtoMaisComum)
    .sort((a, b) => produtoMaisComum[b] - produtoMaisComum[a])[0];
  
  return getCategoria(principalProduto || '');
}

function getCategoria(produto: string): string {
  const produtoUpper = produto.toUpperCase();
  
  if (produtoUpper.includes('REFRIGERADOR') || produtoUpper.includes('FREEZER')) {
    return 'Refrigeração';
  }
  if (produtoUpper.includes('LAVADORA') || produtoUpper.includes('LAVA E SECA')) {
    return 'Lavadoras';
  }
  if (produtoUpper.includes('LAVA-LOUÇAS')) {
    return 'Lava-louças';
  }
  if (produtoUpper.includes('SECADORA')) {
    return 'Eletrodomésticos';
  }
  if (produtoUpper.includes('FORNO')) {
    return 'Fornos';
  }
  if (produtoUpper.includes('FOGÃO')) {
    return 'Fogões';
  }
  if (produtoUpper.includes('COOKTOP')) {
    return 'Cooktops';
  }
  if (produtoUpper.includes('MICROONDAS')) {
    return 'Microondas';
  }
  if (produtoUpper.includes('AR') || produtoUpper.includes('COND')) {
    return 'Ar Condicionado';
  }
  if (produtoUpper.includes('ADEGA') || produtoUpper.includes('CERVEJEIRA')) {
    return 'Adegas';
  }
  if (produtoUpper.includes('PURIFICADOR')) {
    return 'Purificadores';
  }
  if (produtoUpper.includes('COIFA')) {
    return 'Coifas';
  }
  if (produtoUpper.includes('BBLEND')) {
    return 'Eletroportáteis';
  }
  
  return 'Outros';
}

// Função para gerar arquivo com todos os dados processados
export function generateCompleteDataFile() {
  processExcelData()
    .then((data) => {
      const fileContent = `import { Reagendamento, Tecnico, Produto, Peca, MotivoReagendamento } from '@/types/reagendamento';

// Dados completos processados do arquivo ReagendamentoForm2025.xlsx
// Total de ${data.reagendamentos.length} registros processados

export const motivosReagendamento: MotivoReagendamento[] = ${JSON.stringify(data.motivosReagendamento, null, 2)};

export const tecnicos: Tecnico[] = ${JSON.stringify(data.tecnicos, null, 2)};

export const produtos: Produto[] = ${JSON.stringify(data.produtos, null, 2)};

export const pecas: Peca[] = ${JSON.stringify(data.pecas, null, 2)};

export const reagendamentos: Reagendamento[] = ${JSON.stringify(data.reagendamentos, null, 2)};
`;
      
  // Salvar em arquivo
  fs.writeFileSync('./src/data/completeData.ts', fileContent);
      console.log('✅ Arquivo completeData.ts gerado com sucesso!');
    })
    .catch((error) => {
      console.error('❌ Erro ao gerar arquivo:', error);
    });
}
