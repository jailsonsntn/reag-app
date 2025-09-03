const fs = require('fs');
const path = require('path');

const legacyPath = path.resolve(__dirname, '../src/data/completeData.legacy.txt');
const backupsDir = path.resolve(__dirname, '../src/data/backups');
const reportPath = path.resolve(__dirname, '../src/data/legacy-sanitize-report.json');

const args = process.argv.slice(2);
const isCI = args.includes('--ci') || args.includes('--dry-run') || process.env.CI === 'true';

function timestamp() {
  const d = new Date();
  return d.toISOString().replace(/[:.]/g, '-');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readFile(p) {
  if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

function writeFile(p, content) {
  fs.writeFileSync(p, content, 'utf8');
}

function sanitizeContent(content) {
  // Remove apenas linhas que contêm a chave literal "\"reagendamento\":"
  // Mantém o restante do arquivo intacto.
  const lines = content.split(/\r?\n/);
  const filtered = [];
  let removedCount = 0;
  for (const line of lines) {
    if (/"reagendamento"\s*:\s*/.test(line)) {
      removedCount++;
      continue;
    }
    filtered.push(line);
  }
  return { sanitized: filtered.join('\n'), removedCount };
}

function checkExports(content) {
  // Verifica presença básica de exports esperados
  const checks = {
    motivosReagendamento: /export\s+const\s+motivosReagendamento\s*:/m.test(content),
    tecnicos: /export\s+const\s+tecnicos\s*:/m.test(content),
    produtos: /export\s+const\s+produtos\s*:/m.test(content),
    pecas: /export\s+const\s+pecas\s*:/m.test(content),
    reagendamentos: /export\s+const\s+reagendamentos\s*:/m.test(content),
  };
  return checks;
}

(function main() {
  try {
    const content = readFile(legacyPath);

    let backupPath = null;
    if (!isCI) {
      ensureDir(backupsDir);
      backupPath = path.join(backupsDir, `completeData.legacy.${timestamp()}.txt`);
      writeFile(backupPath, content);
      console.log(`Backup criado: ${backupPath}`);
    } else {
      console.log('CI/dry-run mode: skip creating backup and avoid writing files.');
    }

    const { sanitized, removedCount } = sanitizeContent(content);
    const checksBefore = checkExports(content);
    const checksAfter = checkExports(sanitized);

    // Se as checagens básicas falharem após sanitização, não sobrescreve o arquivo
    const allOk = Object.values(checksAfter).every(Boolean);

    const result = {
      timestamp: new Date().toISOString(),
      legacyPath,
      backupPath,
      removedCount,
      checksBefore,
      checksAfter,
      wroteSanitized: false,
      ciMode: !!isCI,
    };

    if (!isCI) {
      if (allOk) {
        writeFile(legacyPath, sanitized);
        result.wroteSanitized = true;
        console.log(`Sanitização aplicada. Linhas removidas: ${removedCount}`);
      } else {
        console.warn('Sanitização NÃO aplicada — checagens falharam. Verifique o relatório.');
      }
    } else {
      // In CI/dry-run mode do not write files; fail the process if checks failed
      if (allOk) {
        console.log(`CI check passed. Lines that would be removed: ${removedCount}`);
      } else {
        console.error('CI check FAILED — sanitization would break expected exports.');
      }
    }

    writeFile(reportPath, JSON.stringify(result, null, 2));
    console.log(`Relatório gerado em: ${reportPath}`);

    if (isCI && !allOk) process.exitCode = 2;
  } catch (err) {
    console.error('Erro durante sanitização:', err);
    process.exitCode = 2;
  }
})();
