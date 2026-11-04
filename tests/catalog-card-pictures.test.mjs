import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog} from '../dist/platform-catalog.js';
import {areaCard} from '../dist/directions.js';

// Картки Харчування, Добавок, Руху й Сну в каталозі напрямів (власник, 2026-11-03, «26 так»). Було: лише тьмяні піктограми (card-nutrition, card-evidence, home-movement, home-sleep;
// яскравість від 0,2 до 1,6 із 255), тоді як «М'язи» й «Клітини» мають справжні картини. У цих чотирьох сторінок немає однієї головної картини (в «Харчуванні» плитки дієт, у «Добавках»
// фото-плитки, у «Русі» схеми внизу, у «Сні» лише малий малюнок), тому картка показує картину напряму з вікна «Куди рушимо далі?» (card-art-*): її квадратний кадр 240 × 240, у двох палітрах
// (пара data-art, як і раніше). Тут перевіряємо розмітку, файли, версії, скрипт і примітки; колір, збіг із вирізкою картини й палітри міряє у справжньому браузері Browser QA (catalogThumbsFlow).
const read = file => fs.readFileSync(file, 'utf8');
const webp = file => { const b = fs.readFileSync(file); return b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP'; };
// Розміри WebP із заголовка: стиснутий VP8, без втрат VP8L або розширений VP8X (той самий розбір, що в tests/card-art.test.mjs).
const size = file => {
  const b = fs.readFileSync(file), kind = b.slice(12, 16).toString();
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8L') { const bits = b.readUInt32LE(21); return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]; }
  if (kind === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  throw new Error(`${file}: unknown WebP chunk ${kind}`);
};
const sources = {nutrition: 'card-art-nutrition-v1', supplements: 'card-art-supplements-v1', movement: 'card-art-movement-v2', sleep: 'card-art-sleep-v2'};
const oldIcons = {nutrition: 'card-nutrition', supplements: 'card-evidence', movement: 'home-movement', sleep: 'home-sleep'};

// 1) Розмітка: у плитці фото-плитка з парою «Зелений» + космос (два файли за іменем кадру), без старих піктограм; картка зберігає статус і посилання.
for (const [id, source] of Object.entries(sources)) {
  const area = catalog.areas.find(a => a.id === id);
  assert(area && area.available, `${id} is an available area`);
  const html = areaCard(area);
  const tile = html.match(/<div class="area-visual area-visual-photo" aria-hidden="true">(<img [^>]*>)(<img [^>]*>)<\/div>/);
  assert(tile, `${id}: the card has one decorative photo tile with two pictures`);
  assert(tile[1].includes(`src="./card-thumb-${id}-v1.webp"`) && tile[1].includes('data-art="green"') && tile[1].includes('alt=""') && tile[1].includes('loading="lazy"'), `${id}: the first picture is the green original`);
  assert(tile[2].includes(`src="./card-thumb-${id}-v1-cosmic.webp"`) && tile[2].includes('data-art="cosmic"') && tile[2].includes('alt=""') && tile[2].includes('loading="lazy"'), `${id}: the second picture is the cosmic copy`);
  assert(tile[1].includes('width="240" height="240"') && tile[2].includes('width="240" height="240"'), `${id}: both pictures declare their own size, so the page does not jump while they load`);
  assert(!html.includes(oldIcons[id]), `${id}: the dim icon ${oldIcons[id]} is gone from the card`);
  assert(html.includes(area.review) && html.includes(`href="${area.href}"`), `${id}: the card keeps its status line and its link`);
  // 2) Файли: легкі квадратні WebP в обох палітрах; картина напряму, з якої їх вирізано, лишається на місці (її показує вікно «Куди рушимо далі?»).
  for (const suffix of ['', '-cosmic']) {
    const file = `dist/card-thumb-${id}-v1${suffix}.webp`;
    assert(fs.existsSync(file) && webp(file), `${file} is a WebP file`);
    assert.deepEqual(size(file), [240, 240], `${file} is 240×240: 80 CSS pixels at three times density`);
    assert(fs.statSync(file).size < 40_000, `${file} stays light for a phone (<40 KB)`);
    assert(fs.existsSync(`dist/${source}${suffix}.webp`) && webp(`dist/${source}${suffix}.webp`), `dist/${source}${suffix}.webp, the picture of the direction, is kept`);
  }
}
const home = read('dist/index.html');
for (const [id, source] of Object.entries(sources)) assert(home.includes(`./${source}-cosmic.webp`), `${id}: the picture of the direction is still what the «Куди рушимо далі?» window shows`);

// 3) Решта карток не зачеплена: м'язи (власна картина, правило :has()) і клітина (одна картина, scripts/make-cell-card-art.py).
const muscle = areaCard(catalog.areas.find(a => a.id === 'muscle')), cell = areaCard(catalog.areas.find(a => a.id === 'cell'));
assert(muscle.includes('muscle-lab-art-v1.webp') && muscle.includes('muscle-lab-art-v1-cosmic.webp') && !muscle.includes('area-visual-photo'), 'the muscle card keeps its own picture and tile');
assert(cell.includes('cell-atlas-card-v1.webp') && !cell.includes('data-art'), 'the cell card keeps its single main picture');

// 4) Код: джерело (src) і зібраний файл (dist) мають однакові назви кадрів і палітрову пару.
for (const file of ['src/platform/directory.mjs', 'dist/directions.js']) {
  const code = read(file);
  for (const id of Object.keys(sources)) assert(code.includes(`${id}:'card-thumb-${id}-v1.webp'`), `${file}: the ${id} card uses its direction picture`);
  for (const old of Object.values(oldIcons)) assert(!new RegExp(`:'${old}\\.(svg|webp)'`).test(code), `${file}: ${old} is no longer a catalogue thumbnail`);
  assert(code.includes("artwork.replace(/\\.(svg|webp)$/,'-cosmic.$1')") && code.includes('data-art="green"') && code.includes('data-art="cosmic"'), `${file}: the palette pair is kept`);
}
// Старі піктограми лишаються в dist як історія (їх показує головна й шапки сторінок).
for (const old of Object.values(oldIcons)) assert(fs.existsSync(`dist/${old}.svg`) && fs.existsSync(`dist/${old}-cosmic.svg`), `${old}.svg and its cosmic copy are kept`);

// 5) Стилі й версії: фото-плитка вже має правило (картина клітини), стилі не змінювались; версія скрипта каталогу піднята, щоб браузер не показав кеш.
const css = read('dist/directions-pine.css');
assert(css.includes('.area-visual-photo img{object-fit:cover;padding:0}') && css.includes('body[data-site-page="directory"] .area-visual-photo img{padding:0;object-fit:cover}'), 'the photo tile fills the tile for every picture');
const page = read('dist/directions.html');
assert(Number((page.match(/directions\.js\?v=(\d+)/) || [])[1]) >= 115, 'the catalogue script carries a version after this change (cache busting)');

// 6) Скрипт і примітки: кадри чотирьох картин записано в одному місці; скрипт лише обрізає й стискає, не перефарбовує.
const tool = read('scripts/make-direction-thumbs.py'), cards = read('docs/CARD-ART-NOTES.md'), colors = read('docs/COLORS.md');
for (const [id, source] of Object.entries(sources)) assert(new RegExp(`\\('${id}', '${source}', \\(\\d+, \\d+, \\d+, \\d+\\)\\)`).test(tool), `scripts/make-direction-thumbs.py states the crop of ${source}`);
assert(tool.includes('SIZE = 240') && tool.includes("PALETTES = ('', '-cosmic')"), 'the script makes the green and the cosmic crop at 240 px');
assert(!/colorsys|numpy|hue|recolor\(/i.test(tool.replace(/не перефарбовується/g, '')), 'the script only crops and scales: it does not recolour the pictures');
assert(cards.includes('card-thumb-') && cards.includes('scripts/make-direction-thumbs.py') && cards.includes('Картки каталогу: Харчування, Добавки, Рух і Сон'), 'the card notes describe the four catalogue pictures and the script');
assert(colors.includes('card-thumb-') && colors.includes('catalogThumbsFlow'), 'the colours note lists the new catalogue thumbnails and the QA flow that measures them');
assert(read('dist/changes-data.js').includes('Картки напрямів у каталозі з картинками'), 'the change log has a record of this change');

console.log('Catalogue cards for nutrition, supplements, movement and sleep: direction pictures in two palettes, light 240×240 files, cosmic pair kept, old icons kept as history, cache versions bumped, provenance noted passed.');
