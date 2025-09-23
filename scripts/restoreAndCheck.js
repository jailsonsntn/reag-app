/*
  Restaura um backup .db específico e valida contagem/meta via API local.
  Uso: node scripts/restoreAndCheck.js
*/

const BACKUP_FILE = process.env.BACKUP_FILE || 'reag.2025-09-22T19-39-14-579Z.db';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  try {
    // Restaurar o backup .db
    const restoreRes = await fetch(`${BASE}/api/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'db', file: BACKUP_FILE })
    });
    const restoreJson = await restoreRes.json().catch(() => ({}));
    if (!restoreRes.ok) {
      console.error('Falha ao restaurar:', restoreRes.status, restoreJson);
      process.exit(1);
    }
    console.log('Restore OK:', restoreJson);

    // Consultar meta (total) rapidamente
    const metaRes = await fetch(`${BASE}/api/reagendamentos?take=1&page=0&meta=1`);
    const metaJson = await metaRes.json();
    console.log('Meta:', metaJson?.meta || metaJson);

    // Opcional: consultar um registro mais recente para verificar a data maxima presente
    const allRes = await fetch(`${BASE}/api/reagendamentos?take=100&page=0&meta=1&orderBy=dateDesc`);
    const allJson = await allRes.json().catch(() => ({}));
    // Exibe as 3 primeiras datas (se houver)
    if (Array.isArray(allJson?.items)) {
      const dates = allJson.items.map(i => i.data || i.date || i.dataReagendamento).filter(Boolean).slice(0, 3);
      console.log('Datas (top 3):', dates);
    }
  } catch (err) {
    console.error('Erro no script:', err);
    process.exit(1);
  }
}

main();
