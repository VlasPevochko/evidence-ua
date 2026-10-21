import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// These are the outputs of the two existing builders, including HTML fragments.
// Everything else in dist is authored source and must retain its exact bytes.
const generated = new Set([
  // Fat Burning Lab is an authored page; build-platform only injects shared appearance assets.
  'site-header.js', 'site-header.css', 'platform-search.js', 'index.html', 'fat-burning.html', 'cell-lab.html', 'directions.html', 'movement.html',
  'muscle-lab.html', 'nutrition-digestion.html', 'nutrition.html', 'protein-meta.html',
  'evidence/registry.js', 'evidence/entities.js', 'evidence/components.js',
  'evidence/public-text.js', 'evidence/module-composer.js', 'evidence/muscle-fiber-v1.webp',
  'evidence/data.js', 'evidence/ui.js', 'evidence/evidence.css',
  'platform-catalog.js', 'home-catalog.js', 'home-feedback.js', 'platform-materials.js',
  'platform-tools.js', 'platform-shell.js', 'platform-next-steps.js', 'platform-terms.js', 'appearance.js', 'platform-learning.js', 'directions.js',
  'nutrition-data.js', 'nutrition-player.js', 'cell-lab-data.js', 'cell-lab.js',
  'cell-illustration.js', 'cell-sources.js', 'cell-detail-view.js',
  'muscle-lab-data.js', 'muscle-lab.js', 'muscle-lab-scenes.js', 'muscle-learning-copy.js',
  'muscle-scale-art.js', 'muscle-sarcomere.js',
  'movement.js', 'movement-model.js', 'movement-learning.js', 'sleep.js',
  'sleep.html', 'platform-glossary.js', 'platform-glossary-data.js',
  'digestion-data.js', 'digestion-steps.js', 'digestion-viewer.js',
  'evidence/protein-data.js', 'evidence/protein-ui.js',
  'evidence/berberine-data.js', 'evidence/berberine-ui.js',
  'evidence/omega-data.js', 'evidence/vitd-data.js', 'evidence/supplement-cards-ui.js'
]);

function inventory(directory, relative = '') {
  const files = {};
  for (const name of fs.readdirSync(path.join(directory, relative)).sort()) {
    const key = relative ? `${relative}/${name}` : name;
    const file = path.join(directory, key);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw Error(`Publish artifact cannot contain a symlink: ${key}`);
    if (stat.isDirectory()) Object.assign(files, inventory(directory, key));
    else if (stat.isFile()) files[key] = {
      bytes: stat.size,
      sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex')
    };
    else throw Error(`Unsupported publish artifact entry: ${key}`);
  }
  return files;
}

export function buildSite(root, commit) {
  if (!/^[a-f0-9]{40,64}$/.test(commit)) throw Error('A verified Git commit SHA is required');
  const dist = path.join(root, 'dist');
  const before = inventory(dist);
  if (!before['index.html']) throw Error('The complete authored dist snapshot, including index.html, is required');
  for (const script of ['scripts/build-evidence.mjs', 'scripts/build-knowledge.mjs']) {
    execFileSync(process.execPath, [script], {cwd:root, stdio:'inherit'});
  }
  const after = inventory(dist);
  for (const [file, original] of Object.entries(before)) {
    if (!after[file]) throw Error(`Build removed a retained dist file: ${file}`);
    if (!generated.has(file) && after[file].sha256 !== original.sha256) {
      throw Error(`Build changed an authored dist file: ${file}`);
    }
  }
  for (const file of Object.keys(after)) {
    if (!before[file] && !generated.has(file)) throw Error(`Unexpected generated dist file: ${file}`);
  }
  const result = {
    schemaVersion:1,
    commit,
    publishDirectory:'dist',
    fileCount:Object.keys(after).length,
    retainedFileCount:Object.keys(before).length,
    changedGeneratedFiles:Object.keys(after).filter(file => after[file].sha256 !== before[file]?.sha256),
    files:after
  };
  fs.mkdirSync(path.join(root, '.site-publish'), {recursive:true});
  fs.writeFileSync(path.join(root, '.site-publish/manifest.json'), JSON.stringify(result, null, 2)+'\n');
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const commit = execFileSync('git', ['rev-parse','HEAD'], {cwd:root, encoding:'utf8'}).trim();
  const result = buildSite(root, commit);
  console.log(`Built complete dist: ${result.fileCount} files; retained all ${result.retainedFileCount} original files.`);
}
