import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';

let isRestoring = false;

function tsForFile(d = new Date()) {
  return d.toISOString().replace(/[:.]/g, '-');
}

async function ensureDir(dir: string) {
  await fsp.mkdir(dir, { recursive: true });
}

function resolveSqlitePath(): string {
  const root = process.cwd();
  const url = process.env.DATABASE_URL || '';
  if (!url.startsWith('file:')) {
    return path.join(root, 'prisma', 'data', 'reag.db');
  }
  const p = url.slice('file:'.length);
  if (p.startsWith('./') || p.startsWith('.\\')) {
    return path.join(root, 'prisma', p.replace(/^\.\//, '').replace(/^\.\\/, ''));
  }
  return p;
}

export async function POST(req: Request) {
  if (isRestoring) {
    return NextResponse.json({ ok: false, message: 'Restauração em andamento. Tente novamente em instantes.' }, { status: 429 });
  }
  isRestoring = true;
  try {
    const { type, file } = await req.json().catch(() => ({}));
    if (!type || !file) {
      return NextResponse.json({ ok: false, message: 'Parâmetros inválidos' }, { status: 400 });
    }
    const safeName = path.basename(String(file));
    const root = process.cwd();
  const dbPath = resolveSqlitePath();
    const dbBackupsDir = path.join(root, 'prisma', 'backups');
    const jsonBackupsDir = path.join(root, 'src', 'data', 'backups');

    await ensureDir(dbBackupsDir);

    // Backup de segurança do estado atual antes de restaurar
    const preStamp = tsForFile();
    const preBackupPath = path.join(dbBackupsDir, `reag.${preStamp}.db`);
    try {
      await fsp.copyFile(dbPath, preBackupPath);
    } catch {
      // ignore se não existir
    }

    if (type === 'db') {
      if (!safeName.startsWith('reag.')) {
        return NextResponse.json({ ok: false, message: 'Arquivo inválido' }, { status: 400 });
      }
      const source = path.join(dbBackupsDir, safeName);
      // Desconecta para liberar o arquivo no Windows
      try { await prisma.$disconnect(); } catch {}
      // Restaura sobre o arquivo principal
      await fsp.copyFile(source, dbPath);
      // Reconecta e verifica total
      try { await prisma.$connect(); } catch {}
      const total = await prisma.reagendamento.count();
      return NextResponse.json({ ok: true, restoredFrom: safeName, type: 'db', total });
    }

    if (type === 'json') {
      if (!safeName.startsWith('reagendamentos.')) {
        return NextResponse.json({ ok: false, message: 'Arquivo inválido' }, { status: 400 });
      }
      const source = path.join(jsonBackupsDir, safeName);
      const raw = await fsp.readFile(source, 'utf-8');
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed?.items) ? parsed.items : [];
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ ok: false, message: 'Backup JSON vazio ou inválido' }, { status: 400 });
      }
      // Limpa e re-insere
      await prisma.$transaction([
        prisma.reagendamento.deleteMany({}),
      ]);
      // Inserção em lotes para evitar payload muito grande
      const chunkSize = 500;
      let inserted = 0;
      for (let i = 0; i < items.length; i += chunkSize) {
        const slice = items.slice(i, i + chunkSize).map((r: any) => ({
          id: r.id,
          os: String(r.os ?? ''),
          sku: String(r.sku ?? ''),
          produto: String(r.produto ?? ''),
          tecnico: String(r.tecnico ?? ''),
          data: String(r.data ?? ''),
          teveReagendamento: !!r.teveReagendamento,
          motivo: String(r.motivo ?? ''),
          codigoPeca: r.codigoPeca != null ? String(r.codigoPeca) : null,
          tipo: String(r.tipo ?? 'FUNCIONAL'),
          nomePeca: r.nomePeca != null ? String(r.nomePeca) : null,
          createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
        }));
        const res = await prisma.reagendamento.createMany({ data: slice });
        inserted += res.count;
      }
      const total = await prisma.reagendamento.count();
      return NextResponse.json({ ok: true, restoredFrom: safeName, type: 'json', inserted, total });
    }

    return NextResponse.json({ ok: false, message: 'Tipo inválido' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Falha na restauração' }, { status: 500 });
  } finally {
    isRestoring = false;
  }
}

export const dynamic = 'force-dynamic';
