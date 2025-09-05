// Script: Gera src/data/excelData.ts a partir do arquivo ReagendamentoForm2025.xlsx
// Execução: npm run process-excel

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function pad2(n) { return String(n).padStart(2, '0'); }
function formatDateBrToIso(v) {
	if (v == null || v === '') return '';
	// Já ISO
	if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
	// DD/MM/YYYY
	if (typeof v === 'string' && /\//.test(v)) {
		const [d, m, y] = v.split(/[\/]/);
		if (d && m && y) return `${y}-${pad2(m)}-${pad2(d)}`;
	}
	// Date object
	if (v instanceof Date && !isNaN(v)) {
		return `${v.getFullYear()}-${pad2(v.getMonth()+1)}-${pad2(v.getDate())}`;
	}
	// Excel serial (number)
	if (typeof v === 'number') {
		const o = XLSX.SSF.parse_date_code(v);
		if (o && o.y && o.m && o.d) {
			return `${o.y}-${pad2(o.m)}-${pad2(o.d)}`;
		}
	}
	// Fallback
	const s = String(v);
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
	return s;
}

function normalizeTipo(v) {
	const s = String(v || '').toUpperCase();
	if (s.includes('ESTÉT') || s.includes('ESTET')) return 'ESTETICA';
	return 'FUNCIONAL';
}

function main() {
	const root = process.cwd();
	let excelPath = path.join(root, 'ReagendamentoForm2025.xlsx');
	if (!fs.existsSync(excelPath)) {
		// tenta .xls
		const alt = path.join(root, 'ReagendamentoForm2025.xls');
		if (fs.existsSync(alt)) {
			excelPath = alt;
		} else {
			console.error(`❌ Arquivo não encontrado (.xlsx/.xls): ${path.join(root, 'ReagendamentoForm2025.xlsx')}`);
			process.exit(1);
		}
	}

	console.log(`📖 Lendo: ${excelPath}`);
		const wb = XLSX.readFile(excelPath);
	const ws = wb.Sheets[wb.SheetNames[0]];
	const rows = XLSX.utils.sheet_to_json(ws);
	console.log(`➡️  ${rows.length} linhas lidas`);

	const reag = rows.map((raw, idx) => {
		const r = raw;
		const os = (r['OS'] ?? '').toString();
		const sku = (r['SKU'] ?? '').toString();
		const produto = (r['PRODUTO'] ?? '').toString();
		const tecnico = (r['TÉCNICO'] ?? '').toString();
		const rawDate = r['Data '] ?? r['Data'] ?? '';
		const data = formatDateBrToIso(rawDate);
		const teveReagendamento = String(r['Teve Reagendamento?'] ?? '').toUpperCase().includes('SIM');
		const motivo = (r['Motivo?'] ?? '').toString() || '';
		const codigoPeca = (r['Peça? Código? '] ?? r['Peça Código'] ?? '').toString();
		const tipo = normalizeTipo(r['Tipo (Estética ou Funcional)?'] ?? 'FUNCIONAL');
		const nomePeca = (r['Nome da Peça? '] ?? r['Nome da Peça'] ?? '').toString();

		return {
			id: (idx + 1).toString(),
			os,
			sku,
			produto,
			tecnico,
			data,
			teveReagendamento,
			motivo,
			codigoPeca,
			tipo,
			nomePeca,
		};
	});

	// Listas auxiliares (strings) usadas no app
	const setTecnicos = new Set(reag.map(r => r.tecnico).filter(Boolean));
	const setProdutos = new Set(reag.map(r => r.produto).filter(Boolean));
	const setPecas = new Set(reag.map(r => r.nomePeca).filter(Boolean));
	const setMotivos = new Set(reag.map(r => r.motivo).filter(Boolean));

	const tecnicos = Array.from(setTecnicos).sort();
	const produtos = Array.from(setProdutos).sort();
	const pecas = Array.from(setPecas).sort();
	const motivos = Array.from(setMotivos).sort();

	const outPath = path.join(root, 'src', 'data', 'excelData.ts');
	const header = `// Dados processados do Excel - ${new Date().toISOString()}`;
	const content = `${header}
export interface Reagendamento { id: string; os: string; sku: string; produto: string; tecnico: string; data: string; teveReagendamento: boolean; motivo: string; codigoPeca: string; tipo: string; nomePeca: string; }

export const reagendamentos: Reagendamento[] = ${JSON.stringify(reag, null, 2)};

export const tecnicos = ${JSON.stringify(tecnicos, null, 2)};
export const produtos = ${JSON.stringify(produtos, null, 2)};
export const pecas = ${JSON.stringify(pecas, null, 2)};
export const motivos = ${JSON.stringify(motivos, null, 2)};
`;

	fs.writeFileSync(outPath, content, 'utf8');
	console.log(`✅ Gerado: ${outPath}`);
	console.log(`📊 Total de reagendamentos: ${reag.length}`);
}

main();

