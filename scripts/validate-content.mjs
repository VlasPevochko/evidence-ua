import fs from 'node:fs';
import path from 'node:path';
import { validateModuleShape } from '../src/content/schema.mjs';
import { loadContentCatalog } from '../src/content/catalog-loader.mjs';

const root = process.cwd();
const required = [
  'src/evidence/core/registry.mjs',
  'src/evidence/core/entities.mjs',
  'src/evidence/core/components.mjs',
  'src/evidence/core/public-text.mjs',
  'src/evidence/creatine',
  'src/evidence/nutrition',
  'src/cell-lab',
  'src/muscle-lab',
  'src/platform',
];

const problems = [];

for (const entry of required) {
  const full = path.join(root, entry);
  if (!fs.existsSync(full)) {
    problems.push(`Missing required path: ${entry}`);
  }
}

const catalog = loadContentCatalog();

if (!Array.isArray(catalog) || catalog.length === 0) {
  problems.push('Content catalog is empty.');
} else {
  const seenSlugs = new Set();
  const seenRoutes = new Set();

  for (const module of catalog) {
    const errors = validateModuleShape(module);
    if (errors.length) {
      problems.push(`Invalid module ${module.slug || '<unknown>'}: ${errors.join('; ')}`);
    }

    if (seenSlugs.has(module.slug)) {
      problems.push(`Duplicate module slug: ${module.slug}`);
    }
    seenSlugs.add(module.slug);

    if (seenRoutes.has(module.route)) {
      problems.push(`Duplicate module route: ${module.route}`);
    }
    seenRoutes.add(module.route);

    if (typeof module.source === 'string' && module.source.trim() !== '') {
      const sourcePath = path.resolve(root, module.source);
      if (!sourcePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(sourcePath)) {
        problems.push(`Missing or invalid source path for module ${module.slug}: ${module.source}`);
      }
    }
  }
}

const distIndex = path.join(root, 'dist/index.html');
if (!fs.existsSync(distIndex)) {
  problems.push('Missing generated output: dist/index.html. Run npm run build first.');
}

const html = fs.existsSync(distIndex) ? fs.readFileSync(distIndex, 'utf8') : '';
if (html && !/<html\b/i.test(html)) {
  problems.push('Generated homepage does not look like HTML.');
}

if (problems.length) {
  console.error('Content validation failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Content validation passed. ${catalog.length} modules validated and required source/output structure is present.`);
