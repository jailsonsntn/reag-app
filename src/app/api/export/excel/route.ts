import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

// GET /api/export/excel -> retorna um .xlsx com os reagendamentos atuais
export async function GET() {
  // Buscar todos os itens (se o volume crescer muito, considerar stream/paginação)
  const items = await prisma.reagendamento.findMany({ orderBy: { data: 'desc' } });

  // Mapear para linhas da planilha com cabeçalhos amigáveis
  const rows = items.map((r) => ({
    OS: r.os,
    SKU: r.sku,
    Produto: r.produto || '',
    Tecnico: r.tecnico,
    Data: r.data, // ISO YYYY-MM-DD
    TeveReagendamento: r.teveReagendamento ? 'SIM' : 'NAO',
    Motivo: r.motivo,
    CodigoPeca: r.codigoPeca ?? '',
    Tipo: r.tipo ?? '',
    NomePeca: r.nomePeca ?? '',
    CreatedAt: r.createdAt?.toISOString?.() ?? '',
  }));

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  // Ajuste de largura simples
  const headers = Object.keys(rows[0] || { OS: '', SKU: '', Produto: '', Tecnico: '', Data: '', TeveReagendamento: '', Motivo: '', CodigoPeca: '', Tipo: '', NomePeca: '', CreatedAt: '', UpdatedAt: '' });
  (ws['!cols'] as any) = headers.map((h) => ({ wch: Math.max(12, h.length + 2) }));
  XLSX.utils.book_append_sheet(wb, ws, 'Reagendamentos');

  // Gerar buffer xlsx
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  // Converter Buffer para ArrayBuffer de forma segura considerando o offset
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  // Criar Blob para compatibilidade com Web Response
  const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const filename = `reagendamentos-${new Date().toISOString().replace(/[:]/g, '-')}.xlsx`;
  // Retornar como arquivo para download
  return new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
