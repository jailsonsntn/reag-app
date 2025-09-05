import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function pad2(n: number) { return String(n).padStart(2, '0'); }
function isIsoDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

function fromExcelSerialToISO(v: number): string | null {
  if (!isFinite(v)) return null;
  // Excel epoch (taking into account 1900 leap bug by using 1899-12-30)
  const base = Date.UTC(1899, 11, 30);
  const ms = base + Math.round(v) * 86400000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function fromBrToISO(s: string): string | null {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const dd = pad2(parseInt(m[1], 10));
  const mm = pad2(parseInt(m[2], 10));
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

export async function POST() {
  try {
    const items = await prisma.reagendamento.findMany({ select: { id: true, os: true, sku: true, motivo: true, data: true } });
    const updates: Array<{ id: string; os: string; sku: string; motivo: string; data: string }> = [];
    for (const it of items) {
      const cur = it.data?.toString() ?? '';
      if (!cur || isIsoDate(cur)) continue;
      let iso: string | null = null;
      // numeric-like (Excel serial)
      if (/^\d{4,6}$/.test(cur)) {
        iso = fromExcelSerialToISO(parseInt(cur, 10));
      }
      // dd/mm/yyyy
      if (!iso && cur.includes('/')) {
        iso = fromBrToISO(cur);
      }
      if (iso) updates.push({ id: it.id, os: it.os, sku: it.sku, motivo: it.motivo, data: iso });
    }

    let normalized = 0;
    for (const u of updates) {
      try {
        // se já existir registro com a chave única de destino, removemos o atual (duplicado) em vez de atualizar
        const exists = await prisma.reagendamento.findFirst({
          where: { os: u.os, sku: u.sku, motivo: u.motivo, data: u.data },
          select: { id: true },
        });
        if (exists) {
          // Remover duplicado com data antiga
          await prisma.reagendamento.delete({ where: { id: u.id } });
        } else {
          await prisma.reagendamento.update({ where: { id: u.id }, data: { data: u.data } });
        }
        normalized++;
      } catch (e) {
        // ignora falhas pontuais para continuar lote
      }
    }

    return NextResponse.json({ normalized, total: items.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Falha ao normalizar datas' }, { status: 500 });
  }
}
