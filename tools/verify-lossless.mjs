import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const checks = JSON.parse(readFileSync(new URL('../docs/source-checksums.json', import.meta.url), 'utf8'));
const files = {
  app: new URL('../legacy/parallel-app-v5.html', import.meta.url),
  studio: new URL('../legacy/parallel-studio.html', import.meta.url)
};

let ok = true;
for (const [key, url] of Object.entries(files)) {
  const data = readFileSync(url);
  const hash = createHash('sha256').update(data).digest('hex');
  const expected = checks[key].sha256;
  if (hash !== expected) {
    ok = false;
    console.error(`Mismatch: ${key}`);
    console.error(`Expected: ${expected}`);
    console.error(`Actual:   ${hash}`);
  } else {
    console.log(`OK: ${key} preserved (${hash})`);
  }
}

if (!ok) process.exit(1);
console.log('Lossless verification passed.');
