import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

let isBackingUp = false;

function tsForFile(d = new Date()) {
  // 2025-09-22T14-33-12-123Z
  return d.toISOString().replace(/[:.]/g, '-');
}

async function ensureDir(dir: string) {
  await fsp.mkdir(dir, { recursive: true });
}

async function rotate(dir: string, prefix: string, keep = 10) {
  try {
    const entries = await fsp.readdir(dir);
    const files = entries
      .filter((f) => f.startsWith(prefix))
      .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    if (files.length > keep) {
      const toRemove = files.slice(keep);
      for (const r of toRemove) {
        try { await fsp.unlink(path.join(dir, r.f)); } catch {}
      }
    }
  } catch {}
}

function resolveSqlitePath(): string {
  const root = process.cwd();
  const url = process.env.DATABASE_URL || '';
  if (!url.startsWith('file:')) {
    // fallback para localização padrão do repositório
    return path.join(root, 'prisma', 'data', 'reag.db');
  }
  const p = url.slice('file:'.length);
  // relativo ao diretório do schema (prisma)
  if (p.startsWith('./') || p.startsWith('.\\')) {
    return path.join(root, 'prisma', p.replace(/^\.\//, '').replace(/^\.\\/, ''));
  }
  return p; // absoluto
}

export async function POST() {
  if (isBackingUp) {
    return NextResponse.json({ ok: false, message: 'Backup em andamento. Tente novamente em instantes.' }, { status: 429 });
  }
  isBackingUp = true;
  try {
    const root = process.cwd();
    const dbSrc = resolveSqlitePath();
    const dbBackupsDir = path.join(root, 'prisma', 'backups');
    const jsonBackupsDir = path.join(root, 'src', 'data', 'backups');
    await ensureDir(dbBackupsDir);
    await ensureDir(jsonBackupsDir);

    const stamp = tsForFile();
    const dbDst = path.join(dbBackupsDir, `reag.${stamp}.db`);
    // Cópia do arquivo SQLite
    await fsp.copyFile(dbSrc, dbDst);

    // Exporta todos os registros de reagendamentos para JSON
    const items = await prisma.reagendamento.findMany();
    const jsonDst = path.join(jsonBackupsDir, `reagendamentos.${stamp}.json`);
    await fsp.writeFile(jsonDst, JSON.stringify({ stamp, total: items.length, items }, null, 2), 'utf-8');

    // Rotaciona
    await rotate(dbBackupsDir, 'reag.');
    await rotate(jsonBackupsDir, 'reagendamentos.');

    return NextResponse.json({ ok: true, dbBackup: path.relative(root, dbDst), jsonBackup: path.relative(root, jsonDst), total: items.length, stamp });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Falha no backup' }, { status: 500 });
  } finally {
    isBackingUp = false;
  }
}

export const dynamic = 'force-dynamic';