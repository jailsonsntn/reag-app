const { spawnSync } = require('child_process');
const path = require('path');

const script = path.resolve(__dirname, 'sanitizeLegacy.js');

console.log('Running pre-commit sanitization...');
const res = spawnSync(process.execPath, [script], { stdio: 'inherit' });

if (res.error) {
  console.error('Failed to run sanitizeLegacy.js:', res.error);
  process.exit(2);
}

if (res.status !== 0) {
  console.error(`sanitizeLegacy.js exited with code ${res.status}. Aborting commit.`);
  process.exit(res.status);
}

console.log('Sanitization passed. Proceeding with commit.');
process.exit(0);
