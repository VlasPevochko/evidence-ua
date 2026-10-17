import fs from 'node:fs';
import { loadContentCatalog } from '../src/content/catalog-loader.mjs';

const catalog = loadContentCatalog();
const buildOrder = new Map([
  ['platform', './build-platform.mjs'],
  ['nutrition', './build-nutrition.mjs'],
  ['cell-lab', './build-cell.mjs'],
  ['muscle-lab', './build-muscle.mjs'],
]);

fs.copyFileSync('src/evidence/core/entities.mjs','dist/evidence/entities.js');
console.log('Canonical entity registry copied to static application.');

for (const module of catalog) {
  const builder = buildOrder.get(module.slug);
  if (builder) {
    await import(builder + '?build=' + Date.now());
  }
}

console.log(`Registry-driven build completed for ${catalog.length} modules.`);
