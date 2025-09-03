console.log('Script iniciado');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
  console.log('Tentando ler arquivo Excel...');
  const filePath = path.join(__dirname, '../ReagendamentoForm2025.xlsx');
  console.log('Caminho do arquivo:', filePath);
  
  const workbook = XLSX.readFile(filePath);
  console.log('Arquivo carregado com sucesso');
  
  const sheetName = workbook.SheetNames[0];
  console.log('Nome da planilha:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('Total de registros:', rawData.length);
  console.log('Primeiro registro:', rawData[0]);
  
  // Apenas criar um dataset básico para teste
  const dados = `export const totalRegistros = ${rawData.length};`;
  
  fs.writeFileSync('./src/data/testData.ts', dados);
  console.log('Arquivo de teste criado!');
  
} catch (error) {
  console.error('Erro:', error);
}
