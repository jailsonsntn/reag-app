import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { PrismaClient } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'db' | 'json'
    const file = searchParams.get('file');
    if (!type || !file) {
      return NextResponse.json({ ok: false, message: 'Parâmetros inválidos' }, { status: 400 });
    }
    const safeName = path.basename(file);
    const root = process.cwd();
    if (type === 'db') {
      const dir = path.join(root, 'prisma', 'backups');
      if (!safeName.startsWith('reag.')) {
        return NextResponse.json({ ok: false, message: 'Arquivo inválido' }, { status: 400 });
      }
      const full = path.join(dir, safeName);
      if (!fsSync.existsSync(full)) {
        return NextResponse.json({ ok: false, message: 'Arquivo não encontrado' }, { status: 404 });
      }
      const datasourceUrl = `file:${full}`;
      const client = new PrismaClient({ datasourceUrl });
      try {
        const total = await client.reagendamento.count();
        // data é string ISO; usar aggregate _min/_max
        const agg = await client.reagendamento.aggregate({
          _min: { data: true },
          _max: { data: true },
        });
        return NextResponse.json({ ok: true, type, file: safeName, total, min: agg._min.data, max: agg._max.data });
      } finally {
        await client.$disconnect();
      }
    }
    if (type === 'json') {
      const dir = path.join(root, 'src', 'data', 'backups');
      if (!safeName.startsWith('reagendamentos.')) {
        return NextResponse.json({ ok: false, message: 'Arquivo inválido' }, { status: 400 });
      }
      const full = path.join(dir, safeName);
      if (!fsSync.existsSync(full)) {
        return NextResponse.json({ ok: false, message: 'Arquivo não encontrado' }, { status: 404 });
      }
      const raw = await fs.readFile(full, 'utf-8');
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed?.items) ? parsed.items : [];
      const total = items.length;
      const datas = items.map((r: any) => String(r?.data || ''));
      const min = datas.length ? datas.reduce((a, b) => (a < b ? a : b)) : null;
      const max = datas.length ? datas.reduce((a, b) => (a > b ? a : b)) : null;
      return NextResponse.json({ ok: true, type, file: safeName, total, min, max });
    }
    return NextResponse.json({ ok: false, message: 'Tipo inválido' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Falha ao inspecionar' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
