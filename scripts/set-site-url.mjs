// Перехід на іншу адресу сайту (наприклад, власний домен): node scripts/set-site-url.mjs https://evidenceua.com/
// Замінює стару адресу в усіх сторінках і документації, оновлює site.json, карту сайту й robots.txt.
// Запускати лише тоді, коли новий домен уже відкриває сайт по HTTPS (canonical і картки поширення мають вести на робочу адресу).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readBase, checkBase, pageFiles} from './site-url.mjs';
import {buildSeo} from './build-seo.mjs';

export function setSiteUrl(root, next) {
  checkBase(next);
  const old = readBase(root);
  if (old === next) return {changed: 0, old, next};
  const targets = [...pageFiles(root).map(f => 'dist/' + f), 'README.md', 'docs/DEPLOYMENT.md'].filter(f => fs.existsSync(path.join(root, f)));
  let changed = 0;
  for (const file of targets) {
    const full = path.join(root, file), before = fs.readFileSync(full, 'utf8');
    const after = before.replaceAll(old, next);
    if (after !== before) { fs.writeFileSync(full, after); changed++; }
  }
  fs.writeFileSync(path.join(root, 'site.json'), JSON.stringify({base: next}, null, 2) + '\n');
  buildSeo(root);
  return {changed, old, next};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const next = process.argv[2];
  if (!next) { console.error('Вкажіть нову адресу, наприклад: node scripts/set-site-url.mjs https://evidenceua.com/'); process.exit(1); }
  const r = setSiteUrl(process.cwd(), next);
  console.log(`Адресу змінено: ${r.old} -> ${r.next}. Оновлено файлів: ${r.changed}.`);
}
