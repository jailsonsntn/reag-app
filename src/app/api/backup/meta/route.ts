import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const root = process.cwd();
    const jsonBackupsDir = path.join(root, 'src', 'data', 'backups');
    const entries = fs.existsSync(jsonBackupsDir) ? fs.readdirSync(jsonBackupsDir) : [];
    const list = entries
      .filter((f) => f.startsWith('reagendamentos.') && f.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a));

    const meta: Record<string, { total?: number; stamp?: string }> = {};
    for (const f of list) {
      try {
        const full = path.join(jsonBackupsDir, f);
        const data = fs.readFileSync(full, 'utf-8');
        const parsed = JSON.parse(data);
        meta[f] = { total: parsed?.total, stamp: parsed?.stamp };
      } catch {
        meta[f] = {};
      }
    }
    return NextResponse.json({ meta });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Falha ao ler metadados' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
