import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ReagendamentoUpdateSchema = z.object({
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = ReagendamentoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;
  try {
    const updated = await prisma.reagendamento.update({
      where: { id },
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
      },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  try {
    await prisma.reagendamento.delete({ where: { id } });
    return NextResponse.json({ success: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }
}
