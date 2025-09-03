console.log('Processando dados do Excel...');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, '../ReagendamentoForm2025.xlsx');
  console.log('Lendo arquivo:', filePath);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`Processando ${rawData.length} registros...`);
  
  // Função para converter data do Excel
  function excelDateToJSDate(serial) {
    if (typeof serial === 'number') {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toISOString().split('T')[0];
    }
    return serial;
  }
  
  // Processar dados
  const reagendamentos = rawData.map((row, index) => ({
    id: (index + 1).toString(),
  os: row.OS?.toString() || '',
  sku: row.SKU?.toString() || '',
  produto: row.PRODUTO?.toString() || '',
  tecnico: row['TÉCNICO']?.toString() || '',
    data: excelDateToJSDate(row['Data ']) || '',
    teveReagendamento: (row['Teve Reagendamento?'] || '').toUpperCase() === 'SIM',
    motivo: row['Motivo?'] || '',
  codigoPeca: row['Peça? Código? ']?.toString() || '',
    tipo: row['Tipo (Estética ou Funcional)?'] || '',
  nomePeca: row['Nome da Peça? '] || ''
  }));
  
  // Estatísticas
  const tecnicos = [...new Set(reagendamentos.map(r => r.tecnico).filter(t => t))];
  const produtos = [...new Set(reagendamentos.map(r => r.produto).filter(p => p))];
  const pecas = [...new Set(reagendamentos.map(r => r.nomePeca).filter(p => p))];
  const motivos = [...new Set(reagendamentos.map(r => r.motivo).filter(m => m))];
  const totalReagendamentos = reagendamentos.filter(r => r.teveReagendamento).length;
  
  console.log('Estatísticas:');
  console.log(`- ${reagendamentos.length} registros`);
  console.log(`- ${totalReagendamentos} reagendamentos`);
  console.log(`- ${tecnicos.length} técnicos`);
  console.log(`- ${produtos.length} produtos`);
  console.log(`- ${pecas.length} peças`);
  console.log(`- ${motivos.length} motivos`);
  
  // Gerar arquivo TypeScript
  const tsContent = `// Dados processados do Excel - ${new Date().toISOString()}
export interface Reagendamento {
  id: string;
  os: string;
  sku: string;
  produto: string;
  tecnico: string;
  data: string;
  teveReagendamento: boolean;
  motivo: string;
  codigoPeca: string;
  tipo: string;
  nomePeca: string;
}

export const reagendamentos: Reagendamento[] = ${JSON.stringify(reagendamentos, null, 2)};

export const estatisticas = {
  total: ${reagendamentos.length},
  reagendamentos: ${totalReagendamentos},
  tecnicos: ${tecnicos.length},
  produtos: ${produtos.length},
  pecas: ${pecas.length}
};

export const tecnicos = ${JSON.stringify(tecnicos, null, 2)};
export const produtos = ${JSON.stringify(produtos, null, 2)};
export const pecas = ${JSON.stringify(pecas, null, 2)};
export const motivos = ${JSON.stringify(motivos, null, 2)};
`;

  const outputPath = path.join(__dirname, '../src/data/excelData.ts');
  fs.writeFileSync(outputPath, tsContent);
  
  console.log('✅ Arquivo criado com sucesso:', outputPath);
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
