// Gera um arquivo SQL com INSERT de todos os registros de excelData.ts
// Uso: node scripts/generateSeedSql.js
// Saída: scripts/seed-supabase.sql

const fs = require('fs');
const path = require('path');

// Lê o excelData.ts como texto e extrai apenas o bloco do array reagendamentos
const filePath = path.join(__dirname, '../src/data/excelData.ts');
const src = fs.readFileSync(filePath, 'utf-8');

// Extrai somente o bloco JSON do array usando posição dos colchetes
const startMarker = 'export const reagendamentos: Reagendamento[] = ';
const startIdx = src.indexOf(startMarker) + startMarker.length;
// Encontra o colchete final do array
let depth = 0;
let endIdx = startIdx;
for (let i = startIdx; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
}
const arrayJson = src.slice(startIdx, endIdx);
const records = JSON.parse(arrayJson);

console.log(`Total de registros: ${records.length}`);

// Deduplica por chave única (os, sku, data, motivo) — igual ao seed da API
const seen = new Set();
const toInsert = records.filter((r) => {
  const key = `${r.os}|${r.sku}|${r.data}|${r.motivo}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
console.log(`Registros únicos: ${toInsert.length}`);

function esc(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function escBool(v) {
  return v ? 'TRUE' : 'FALSE';
}

const lines = [
  '-- Seed gerado automaticamente por scripts/generateSeedSql.js',
  `-- Total: ${toInsert.length} registros`,
  '',
  '-- Desabilita checks temporariamente (opcional)',
  '-- SET session_replication_role = replica;',
  '',
  'INSERT INTO "Reagendamento" (id, os, sku, produto, tecnico, data, "teveReagendamento", motivo, "codigoPeca", tipo, "nomePeca", "createdAt")',
  'VALUES',
];

const rows = toInsert.map((r, i) => {
  const id = `'${r.id || String(i + 1)}'`;
  const os = esc(r.os);
  const sku = esc(r.sku);
  const produto = esc(r.produto || '');
  const tecnico = esc(r.tecnico || '');
  const data = esc(r.data || '');
  const teveReag = escBool(r.teveReagendamento);
  const motivo = esc(r.motivo || '');
  const codigoPeca = r.codigoPeca && r.codigoPeca.trim() !== '' ? esc(r.codigoPeca) : 'NULL';
  const tipo = r.tipo && r.tipo.trim() !== '' ? esc(r.tipo) : "'FUNCIONAL'";
  const nomePeca = r.nomePeca && r.nomePeca.trim() !== '' ? esc(r.nomePeca) : 'NULL';
  const createdAt = 'NOW()';
  return `  (${id}, ${os}, ${sku}, ${produto}, ${tecnico}, ${data}, ${teveReag}, ${motivo}, ${codigoPeca}, ${tipo}, ${nomePeca}, ${createdAt})`;
});

lines.push(rows.join(',\n'));
lines.push('ON CONFLICT (os, sku, data, motivo) DO NOTHING;');
lines.push('');
lines.push('SELECT COUNT(*) AS total FROM "Reagendamento";');

const sql = lines.join('\n');
const outPath = path.join(__dirname, 'seed-supabase.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log(`Arquivo gerado: ${outPath}`);
