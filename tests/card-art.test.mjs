import assert from 'node:assert/strict';
import fs from 'node:fs';

// Рух і Сон замінено на плоскі версії v2 (власник, 2026-10-26), щоб усі шість були в одному стилі; v1 лишається в dist як історія.
// Нові картини шести карток (власник, 2026-10-26): по одній на напрям, власні файли, без сторонніх запитів, походження записано.
// 2026-10-31 (власник): картини в меню напрямів головної лежать на космічному фіолетовому, а не на бірюзовому тлі. Показуються файли -cosmic:
// оригінали власника, у яких перефарбовано лише темно-бірюзовий колір (scripts/recolor-card-art.py). Оригінали лишаються в dist як історія.
// Що саме бачить відвідувач, задає <img> у згенерованому dist/index.html (src/platform/home-directions.mjs). Старі правила .home-picker-visual
// у home-coast.css давно не діють (їх створює лише застарілий home-directions.js, що виходить рано), тому цей тест, на відміну від попередньої версії,
// більше не звіряє картку з тими правилами: інакше він би перевіряв файли, яких ніхто не бачить. Колір малюнків у справжньому браузері перевіряє Browser QA.
const originals={muscle:'card-art-muscle-v1.webp',cell:'card-art-cell-v1.webp',nutrition:'card-art-nutrition-v1.webp',supplements:'card-art-supplements-v1.webp',movement:'card-art-movement-v2.webp',sleep:'card-art-sleep-v2.webp'};
const areas=Object.fromEntries(Object.entries(originals).map(([area,file])=>[area,file.replace('.webp','-cosmic.webp')]));
const css=fs.readFileSync('dist/home-coast.css','utf8'),home=fs.readFileSync('dist/index.html','utf8'),doc=fs.readFileSync('docs/CARD-ART-NOTES.md','utf8'),tool=fs.readFileSync('scripts/recolor-card-art.py','utf8');
const webp=file=>{const b=fs.readFileSync(file);return b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP';};
// Розміри WebP із заголовка: стиснутий VP8, без втрат VP8L або розширений VP8X.
const size=file=>{
  const b=fs.readFileSync(file),kind=b.slice(12,16).toString();
  if(kind==='VP8 ')return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(kind==='VP8L'){const bits=b.readUInt32LE(21);return [(bits&0x3fff)+1,((bits>>14)&0x3fff)+1];}
  if(kind==='VP8X')return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1];
  throw new Error(`${file}: unknown WebP chunk ${kind}`);
};
for(const [area,file] of Object.entries(areas)){
  const path='dist/'+file,source='dist/'+originals[area];
  assert(fs.existsSync(path)&&webp(path),`${file} is a WebP file`);
  assert(fs.statSync(path).size<180_000,`${file} stays light enough for a phone (<180 KB)`);
  assert.deepEqual(size(path),size(source),`${file} keeps the size of ${originals[area]}: same drawing, same crop`);
  assert(fs.existsSync(source)&&webp(source),`${originals[area]} (the owner's original) is kept as history`);
  assert(doc.includes(file)&&doc.includes(originals[area]),`${file} and its original are described in the provenance note`);
  assert(tool.includes(`'${originals[area]}'`)&&tool.includes(`'${file}'`),`scripts/recolor-card-art.py produces ${file} from ${originals[area]}`);
}
assert.equal(new Set(Object.values(areas)).size,6,'six different pictures');
// The home chooser shows exactly the violet versions, one per direction, in the order of the six topics.
const shown={};
for(const match of home.matchAll(/<a class="topic-card" data-area="([a-z]+)"[^>]*><img class="home-picker-image" src="\.\/(card-art-[^"]+)"/g))shown[match[1]]=match[2];
assert.deepEqual(shown,areas,'every direction card shows its -cosmic picture, not the teal original');
assert(home.includes('home-coast.css?v=89'),'the stylesheet version was bumped so browsers drop the old cache');
assert(doc.includes('умови використання')&&doc.includes('підтвердити власнику'),'the licence question is recorded, not hidden');
assert(doc.includes('scripts/recolor-card-art.py')&&doc.includes('лише темно-бірюзовий'),'the recolouring method is recorded: only dark teal changes, the drawing does not');
// Old art stays in place for the pages that still use it (history is not deleted).
for(const old of ['muscle-lab-art-v1.webp','cell-atlas-v2.webp','supplement-backgrounds-v10.webp'])assert(fs.existsSync('dist/'+old),`${old} is kept`);
const added=css.slice(css.indexOf('Нові картини для шести карток'));
assert(!/https?:\/\//.test(added),'the new rules load nothing from other sites');
console.log('Card art: six own files, recoloured to the cosmic violet, mapped to six directions, light, provenance recorded passed.');
