import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const shared = [
  ['components.js', 'dist/evidence/module-composer.js'],
  ['site-header.js', 'dist/platform-shell.js'],
  // Follow-up fixes change shared children and their import parents; returning
  // visitors must receive the same resource URL through every entry point.
  ['platform-search.js', 'dist/site-header.js'],
  ['platform-materials.js', 'dist/platform-search.js'],
  ['platform-tools.js', 'dist/platform-shell.js'],
  ['platform-shell.js', 'dist/index.html'],
  ['home-feedback.js', 'dist/index.html'],
  ['directions.js', 'dist/directions.html'],
  ['appearance.js', 'dist/index.html'],
  ['compare-page.js', 'dist/compare.html'],
  ['compare-status.js', 'dist/compare-page.js'],
  ['nutrition-lab.js', 'dist/nutrition-inside.html'],
  ['muscle-lab.js', 'dist/muscle-lab.html'],
  ['muscle-guide.js', 'dist/muscle-lab.html'],
  ['cell-lab.js', 'dist/cell-lab.html'],
  ['digestion-viewer.js', 'dist/nutrition-digestion.html'],
  ['fat-burning.js', 'dist/fat-burning.html'],
];
const files = directory => fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? files(file) : /\.(?:js|html)$/.test(entry.name) ? [file] : [];
});
for (const [asset, canonicalParent] of shared) {
  const expression = new RegExp('(?<![a-zA-Z0-9_-])' + asset.replaceAll('.', '\\.') + '\\?v=([0-9.]+)', 'g');
  const canonical = [...fs.readFileSync(canonicalParent, 'utf8').matchAll(expression)][0]?.[1];
  assert(canonical, `A canonical import for ${asset} must exist`);
  for (const file of files('dist')) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(expression)) {
      assert.equal(match[1], canonical, `${file} must not retain a cached older ${asset}`);
    }
  }
}
console.log('Shared UI cache: authored and generated consumers use the same current header and evidence formatter.');
