import assert from 'node:assert/strict';
import fs from 'node:fs';

// Рух і Сон замінено на плоскі версії v2 (власник, 2026-10-26), щоб усі шість були в одному стилі; v1 лишається в dist як історія.
// Нові картини шести карток (власник, 2026-10-26): по одній на напрям, власні файли, без сторонніх запитів, походження записано.
const areas={muscle:'card-art-muscle-v1.webp',cell:'card-art-cell-v1.webp',nutrition:'card-art-nutrition-v1.webp',supplements:'card-art-supplements-v1.webp',movement:'card-art-movement-v2.webp',sleep:'card-art-sleep-v2.webp'};
const css=fs.readFileSync('dist/home-coast.css','utf8'),home=fs.readFileSync('dist/index.html','utf8'),doc=fs.readFileSync('docs/CARD-ART-NOTES.md','utf8');
const webp=file=>{const b=fs.readFileSync(file);return b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP';};
for(const [area,file] of Object.entries(areas)){
  const path='dist/'+file;
  assert(fs.existsSync(path)&&webp(path),`${file} is a WebP file`);
  assert(fs.statSync(path).size<180_000,`${file} stays light enough for a phone (<180 KB)`);
  assert(css.includes(`[data-area="${area}"]>.home-picker-visual{background-image:url('./${file}')`),`${area} card uses ${file}`);
  assert(doc.includes(file),`${file} is described in the provenance note`);
}
assert.equal(new Set(Object.values(areas)).size,6,'six different pictures');
assert(home.includes('home-coast.css?v=89'),'the stylesheet version was bumped so browsers drop the old cache');
assert(doc.includes('умови використання')&&doc.includes('підтвердити власнику'),'the licence question is recorded, not hidden');
// Old art stays in place for the pages that still use it (history is not deleted).
for(const old of ['muscle-lab-art-v1.webp','cell-atlas-v2.webp','supplement-backgrounds-v10.webp'])assert(fs.existsSync('dist/'+old),`${old} is kept`);
const added=css.slice(css.indexOf('Нові картини для шести карток'));
assert(!/https?:\/\//.test(added),'the new rules load nothing from other sites');
console.log('Card art: six own files, mapped to six directions, light, provenance recorded passed.');
