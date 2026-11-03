import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog} from '../dist/platform-catalog.js';
import {areaCard} from '../dist/directions.js';

// Картка «Клітини та органели» в каталозі напрямів (власник, 2026-11-03: «пропала картинка клітини у напрямку про клітину … клітина там де органели всередині …
// яка на сторінці „Клітина людини“ сама головна»). Було: лише тьмяна піктограма card-organism.svg (після фіолетового перефарбування майже невидима: яскравість близько
// 1 із 255), тоді як картка «М'язів» показує справжню картину. Стало: головна картина сторінки «Клітина людини» (cell-atlas-v2.webp) у квадратному кадрі
// cell-atlas-card-v1.webp (scripts/make-cell-card-art.py). Тут перевіряємо розмітку, файл, стилі, версії, скрипт і примітки; колір картини й те, що це справді кадр
// головної картини, міряє у справжньому браузері Browser QA (catalogCellPictureFlow: пікселі, обидві палітри, три розміри екрана, контроль зі старою піктограмою).
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

// 1) Розмітка: одна картина для обох палітр, декоративна (назва картки поряд), без старої піктограми й без пари data-art.
const cell = catalog.areas.find(a => a.id === 'cell');
assert(cell && cell.available, 'the cell direction is an available area');
const html = areaCard(cell);
const tile = html.match(/<div class="area-visual area-visual-photo" aria-hidden="true">(<img [^>]*>)<\/div>/);
assert(tile, 'the cell card has one decorative photo tile');
assert(tile[1].includes('src="./cell-atlas-card-v1.webp"') && tile[1].includes('alt=""') && tile[1].includes('loading="lazy"'), 'the tile shows the card picture of the cell');
assert(tile[1].includes('width="240"') && tile[1].includes('height="240"'), 'the picture declares its own size, so the page does not jump while it loads');
assert(!html.includes('card-organism') && !html.includes('data-art'), 'the dim icon is gone and the picture is not duplicated for the palettes');
assert(html.includes(cell.review) && html.includes(`href="${cell.href}"`), 'the card keeps its status line and its link');

// 2) Решта карток лишає пару «Зелений» + космос (їхні картини міряє artPairsFlow). Пояснення зміни 2026-11-03 («26 так»): раніше жодна з них не мала класу area-visual-photo,
// бо в них стояли піктограми; тепер Харчування, Добавки, Рух і Сон мають квадратні кадри картин напрямів у плитці area-visual-photo (їх перевіряє tests/catalog-card-pictures.test.mjs),
// а картка м'язів (muscle-lab-art-v1.webp) лишається звичайною плиткою зі своїм правилом :has(). Тому тут пара збережена в усіх, а клас фото-плитки очікується лише в чотирьох.
for (const area of catalog.areas.filter(a => a.available && a.id !== 'cell')) {
  const other = areaCard(area);
  const photo = ['nutrition', 'supplements', 'movement', 'sleep'].includes(area.id);
  assert(other.includes('data-art="green"') && other.includes('data-art="cosmic"') && other.includes('area-visual-photo') === photo, `${area.id}: the card keeps its green/cosmic pair`);
}
assert(areaCard(catalog.areas.find(a => a.id === 'muscle')).includes('muscle-lab-art-v1.webp'), 'the muscle card keeps its own picture');

// 3) Код: джерело (src) і зібраний файл (dist) обидва мають цю картку, а склад розмітки збігається.
for (const file of ['src/platform/directory.mjs', 'dist/directions.js']) {
  const code = read(file);
  assert(code.includes("cell:'cell-atlas-card-v1.webp'") && !code.includes("cell:'card-organism.svg'"), `${file}: the cell card uses the picture of the page`);
  // 2026-11-03 («26 так»): клас фото-плитки тепер збирається з прапорця (' area-visual-photo'), бо його мають і чотири інші картки.
  assert(code.includes("' area-visual-photo'") && code.includes("artwork.replace(/\\.(svg|webp)$/,'-cosmic.$1')"), `${file}: one tile for the cell, the palette pair for the rest`);
}

// 4) Файл: легкий квадратний WebP; головна картина сторінки (з якої його вирізано) лишається на місці й саме її показує сторінка «Клітина людини».
assert(fs.existsSync('dist/cell-atlas-card-v1.webp') && webp('dist/cell-atlas-card-v1.webp'), 'the card picture is a WebP file');
assert.deepEqual(size('dist/cell-atlas-card-v1.webp'), [240, 240], 'the card picture is 240×240: 80 CSS pixels at three times density');
assert(fs.statSync('dist/cell-atlas-card-v1.webp').size < 40_000, 'the card picture stays light for a phone (<40 KB)');
assert(fs.existsSync('dist/cell-atlas-v2.webp') && webp('dist/cell-atlas-v2.webp'), 'the main picture of the page is kept');
assert.deepEqual(size('dist/cell-atlas-v2.webp'), [1448, 1086], 'the main picture keeps the size the crop is cut from');
for (const file of ['dist/cell-illustration.js', 'src/cell-lab/illustration.mjs']) assert(read(file).includes("const image='./cell-atlas-v2.webp'"), `${file}: the page «Клітина людини» shows cell-atlas-v2.webp, the source of the card picture`);

// 5) Стилі: картина заповнює плитку без полів і без :has() (старі телефони його не знають); версія стилів і скрипта піднята, щоб браузер не показав кеш.
const css = read('dist/directions-pine.css');
assert(css.includes('.area-visual-photo img{object-fit:cover;padding:0}'), 'the photo tile fills the tile in the base rules');
assert(css.includes('body[data-site-page="directory"] .area-visual-photo img{padding:0;object-fit:cover}'), 'the photo tile fills the tile in the catalogue layout (it beats the 8 px padding of the icons)');
assert(!/area-visual-photo[^{]*:has\(/.test(css) && !/:has\([^)]*area-visual-photo/.test(css), 'the photo tile does not depend on :has()');
const page = read('dist/directions.html');
const version = pattern => Number((page.match(pattern) || [])[1]);
assert(version(/directions-pine\.css\?v=(\d+)/) >= 5, 'the catalogue styles carry a version after this change (cache busting)');
assert(version(/directions\.js\?v=(\d+)/) >= 114, 'the catalogue script carries a version after this change (cache busting)');

// 6) Походження й межі: скрипт, що робить кадр, і дві примітки (картини карток; ілюстрація клітини) описують його; нічого не вигадано й не перефарбовано.
const tool = read('scripts/make-cell-card-art.py'), cards = read('docs/CARD-ART-NOTES.md'), atlas = read('docs/CELL-ATLAS-V2-ART-NOTES.md');
assert(tool.includes("SOURCE = 'cell-atlas-v2.webp'") && tool.includes("OUTPUT = 'cell-atlas-card-v1.webp'") && /CROP = \(\d+, \d+, \d+, \d+\)/.test(tool) && tool.includes('SIZE = 240'), 'the script states the source, the output, the crop and the size');
assert(!/recolor|hue|colorsys|numpy/i.test(tool.replace(/не перефарбовується/g, '')), 'the script only crops and scales: it does not recolour the picture');
for (const [name, note] of [['CARD-ART-NOTES.md', cards], ['CELL-ATLAS-V2-ART-NOTES.md', atlas]]) {
  assert(note.includes('cell-atlas-card-v1.webp') && note.includes('scripts/make-cell-card-art.py'), `${name} describes the card picture and the script that makes it`);
}
assert(cards.includes('Картка клітини в каталозі') && cards.includes('не перефарбовується'), 'the card notes explain what the catalogue card shows and that the picture is not recoloured');

console.log('Catalogue cell card: the main picture of the cell page replaces the dim icon, one file for both palettes, light, styled without :has(), cache versions bumped, provenance noted passed.');
