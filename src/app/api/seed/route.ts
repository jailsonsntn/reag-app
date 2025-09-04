import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reagendamentos as excel } from '@/data/excelData';

export async function POST() {
  try {
    // Insert many with basic duplicate avoidance by (os, sku, data) combination in memory
    // Normaliza e deduplica por chave unica (os, sku, data, motivo)
    const normalized = excel.map((r) => ({
      os: String(r.os),
      sku: String(r.sku),
      produto: r.produto || '',
      tecnico: r.tecnico || '',
      data: r.data || '',
      teveReagendamento: !!r.teveReagendamento,
      motivo: r.motivo || '',
      codigoPeca: r.codigoPeca ? String(r.codigoPeca) : null,
      tipo: r.tipo && r.tipo.trim() !== '' ? r.tipo : 'FUNCIONAL',
      nomePeca: r.nomePeca && r.nomePeca.trim() !== '' ? r.nomePeca : null,
    }));

    const seen = new Set<string>();
    const toInsert = normalized.filter((r) => {
      const key = `${r.os}|${r.sku}|${r.data}|${r.motivo}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const created = await prisma.reagendamento.createMany({
      data: toInsert,
    });

    return NextResponse.json({ inserted: created.count });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Seed failed' }, { status: 500 });
  }
}
