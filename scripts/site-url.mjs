// Єдине місце, де записана адреса сайту. Змінюється лише командою `node scripts/set-site-url.mjs <нова адреса>`.
import fs from 'node:fs';
import path from 'node:path';

export function readBase(root = process.cwd()) {
  const {base} = JSON.parse(fs.readFileSync(path.join(root, 'site.json'), 'utf8'));
  return checkBase(base);
}
export function checkBase(base) {
  let url;
  try { url = new URL(base); } catch { throw Error(`Site address is not a URL: ${base}`); }
  if (url.protocol !== 'https:') throw Error('Site address must start with https://');
  if (url.username || url.password || url.search || url.hash) throw Error('Site address must be a plain https address');
  if (!base.endsWith('/')) throw Error('Site address must end with /');
  return base;
}
export const pageFiles = (root = process.cwd()) => fs.readdirSync(path.join(root, 'dist')).filter(f => f.endsWith('.html')).sort();
