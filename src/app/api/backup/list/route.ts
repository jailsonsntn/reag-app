import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const root = process.cwd();
  const dbBackupsDir = path.join(root, 'prisma', 'backups');
  const jsonBackupsDir = path.join(root, 'src', 'data', 'backups');
  const list = (dir: string, prefix: string) => {
    try {
      return fs.readdirSync(dir)
        .filter(f => f.startsWith(prefix))
        .sort((a, b) => b.localeCompare(a));
    } catch {
      return [] as string[];
    }
  };
  return NextResponse.json({
    db: list(dbBackupsDir, 'reag.'),
    json: list(jsonBackupsDir, 'reagendamentos.'),
  });
}

export const dynamic = 'force-dynamic';