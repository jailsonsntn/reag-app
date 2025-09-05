import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ReagendamentoSchema = z.object({
  os: z.string().min(1),
  sku: z.string().min(1),
  produto: z.string().default(''),
  tecnico: z.string().min(1),
  data: z.string().min(1),
  teveReagendamento: z.boolean().default(false),
  motivo: z.string().min(1),
  codigoPeca: z.string().optional().nullable(),
  tipo: z.string().default('FUNCIONAL'),
  nomePeca: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const raw = await req.json();
  const parsed = ReagendamentoSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;
  const novo = await prisma.reagendamento.create({
    data: {
      os: b.os,
      sku: b.sku,
      produto: b.produto || '',
      tecnico: b.tecnico,
      data: b.data,
      teveReagendamento: !!b.teveReagendamento,
      motivo: b.motivo,
      codigoPeca: b.codigoPeca && b.codigoPeca.trim() !== '' ? b.codigoPeca : null,
      tipo: b.tipo && b.tipo.trim() !== '' ? b.tipo : 'FUNCIONAL',
      nomePeca: b.nomePeca && b.nomePeca.trim() !== '' ? b.nomePeca : null,
    }
  });
  return NextResponse.json(novo);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');
  const takeParam = searchParams.get('take');
  const pageParam = searchParams.get('page');
  const meta = searchParams.get('meta');
  const take = all === '1' ? undefined : Math.min(Math.max(parseInt(takeParam || '100', 10) || 100, 1), 5000);
  const page = Math.max(parseInt(pageParam || '0', 10) || 0, 0);

  const items = await prisma.reagendamento.findMany({
    // Ordena por data (ISO YYYY-MM-DD) desc para mais recentes primeiro
    orderBy: { data: 'desc' },
    take,
    skip: take ? page * take : 0,
  });
  if (meta === '1' && take !== undefined) {
    const total = await prisma.reagendamento.count();
    return NextResponse.json({ items, total, page, take });
  }
  return NextResponse.json(items);
}
