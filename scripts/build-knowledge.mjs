import fs from 'node:fs';
fs.copyFileSync('src/evidence/core/entities.mjs','dist/evidence/entities.js');
console.log('Canonical entity registry copied to static application.');
await import('./build-platform.mjs');
await import('./build-nutrition.mjs');
await import('./build-cell.mjs');
await import('./build-muscle.mjs');
