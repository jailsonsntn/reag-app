const fs = require('fs');
const path = require('path');

const backupsDir = path.resolve(__dirname, '../src/data/backups');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listBackups() {
  ensureDir(backupsDir);
  return fs.readdirSync(backupsDir)
    .filter(f => f.startsWith('completeData.legacy.'))
    .map(f => ({ name: f, time: fs.statSync(path.join(backupsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
}

function rotate(keep = 5) {
  const backups = listBackups();
  if (backups.length <= keep) {
    console.log(`No rotation needed. Total backups: ${backups.length}`);
    return;
  }
  const toRemove = backups.slice(keep);
  toRemove.forEach(b => {
    const p = path.join(backupsDir, b.name);
    try {
      fs.unlinkSync(p);
      console.log(`Removed old backup: ${b.name}`);
    } catch (err) {
      console.warn(`Failed to remove ${b.name}:`, err.message);
    }
  });
}

if (require.main === module) {
  const keepArg = process.argv[2];
  const keep = keepArg ? parseInt(keepArg, 10) : 5;
  rotate(keep);
}

module.exports = { rotate };
