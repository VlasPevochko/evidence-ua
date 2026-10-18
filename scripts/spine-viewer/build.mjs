// Rebuild dist/spine-viewer.js:  npm ci --prefix scripts/spine-viewer --ignore-scripts && node scripts/spine-viewer/build.mjs
// The bundle contains src/spine/* plus only the used parts of three.js (MIT). Output is committed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const threeVersion = JSON.parse(fs.readFileSync(path.join(here, 'node_modules/three/package.json'), 'utf8')).version;

await build({
  entryPoints: [path.join(root, 'src/spine/viewer.mjs')],
  outfile: path.join(root, 'dist/spine-viewer.js'),
  bundle: true,
  nodePaths: [path.join(here, 'node_modules')],
  minify: true,
  format: 'esm',
  target: 'es2020',
  legalComments: 'eof',
  banner: {js: `/*! Evidence UA schematic spine viewer. Bundles parts of three.js r${threeVersion.split('.')[1]} (MIT). See spine-viewer.LICENSE.txt. Source: src/spine, scripts/spine-viewer. */`}
});
fs.copyFileSync(path.join(here, 'node_modules/three/LICENSE'), path.join(root, 'dist/spine-viewer.LICENSE.txt'));
const bytes = fs.statSync(path.join(root, 'dist/spine-viewer.js')).size;
console.log(`dist/spine-viewer.js built with three@${threeVersion}: ${(bytes / 1024).toFixed(0)} KB`);
