import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

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
    let dir: string;
    let prefix: string;
    if (type === 'db') {
      dir = path.join(root, 'prisma', 'backups');
      prefix = 'reag.';
    } else if (type === 'json') {
      dir = path.join(root, 'src', 'data', 'backups');
      prefix = 'reagendamentos.';
    } else {
      return NextResponse.json({ ok: false, message: 'Tipo inválido' }, { status: 400 });
    }
    if (!safeName.startsWith(prefix)) {
      return NextResponse.json({ ok: false, message: 'Arquivo não permitido' }, { status: 400 });
    }
    const full = path.join(dir, safeName);
    const data = await fs.readFile(full);
    const contentType = type === 'db' ? 'application/octet-stream' : 'application/json; charset=utf-8';
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    return new Response(ab as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Falha ao baixar' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';