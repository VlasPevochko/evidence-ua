// Карта сайту й robots.txt для пошуковиків. Адреса береться з site.json; жодних дат чи випадкових значень, щоб збірка була повторюваною.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readBase, pageFiles} from './site-url.mjs';

export function buildSeo(root = process.cwd()) {
  const base = readBase(root);
  const urls = pageFiles(root).map(file => file === 'index.html' ? base : base + file);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n';
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`;
  fs.writeFileSync(path.join(root, 'dist/sitemap.xml'), xml);
  fs.writeFileSync(path.join(root, 'dist/robots.txt'), robots);
  return urls.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`SEO files written for ${buildSeo()} pages.`);
