import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const shared = [
  ['components.js', 'dist/evidence/module-composer.js'],
  ['site-header.js', 'dist/platform-shell.js'],
];
const files = directory => fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? files(file) : entry.name.endsWith('.js') ? [file] : [];
});
for (const [asset, canonicalParent] of shared) {
  const expression = new RegExp(asset.replaceAll('.', '\\.') + '\\?v=([0-9.]+)', 'g');
  const canonical = [...fs.readFileSync(canonicalParent, 'utf8').matchAll(expression)][0]?.[1];
  assert(canonical, `A canonical import for ${asset} must exist`);
  for (const file of files('dist')) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(expression)) {
      assert.equal(match[1], canonical, `${file} must not retain a cached older ${asset}`);
    }
  }
}
console.log('Shared UI cache: authored and generated consumers use the same current header and evidence formatter.');
