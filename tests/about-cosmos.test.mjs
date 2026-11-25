// «Космос усередині тебе» на сторінці «Про проєкт» (рішення власника 2026-11-25: «Там де про проєкт», «Перефарбувати в лаванду»).
// Перевіряє: копії анімації збігаються з оригіналом власника; космічна копія без золота, а бірюза, фіолет і зірки ті самі; програвач свій (без сторонніх запитів)
// і з ліцензією; без JavaScript і в друку видно заставку, а не порожнє місце; є кнопка паузи (анімація довша за 5 с), рух вимикається за «зменшити рух».
// Живу роботу (рух, пауза, палітра, світла тема, висота сторінки) міряє Browser QA: aboutCosmosFlow.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCosmos, colorsOf, GOLD_TO_LAVENDER} from '../src/about/cosmos-colors.mjs';

const read = file => fs.readFileSync(file, 'utf8');
const source = JSON.parse(read('src/about/cosmos-source.json'));
const cosmic = JSON.parse(read('dist/about-cosmos.json'));
const green = JSON.parse(read('dist/about-cosmos-green.json'));

// 1. Оригінал власника лежить без змін, а копії зібрані з нього поточним кодом (інакше: node scripts/make-about-cosmos.mjs).
assert.equal(source.nm, 'Evidence UA — Космос усередині тебе');
assert.deepEqual([source.w, source.h, source.fr, source.op], [1920, 1080, 30, 360], '12 seconds, 16:9');
assert.deepEqual(cosmic, buildCosmos(source, 'cosmic'), 'dist/about-cosmos.json is stale: run node scripts/make-about-cosmos.mjs');
assert.deepEqual(green, buildCosmos(source, 'green'), 'dist/about-cosmos-green.json is stale: run node scripts/make-about-cosmos.mjs');
assert.equal(source.assets.length, 0, 'no embedded raster images or fonts: the scene is drawn with shapes only');
assert(!JSON.stringify(source).includes('"ty":5') && !/"ty":\s*5\b/.test(read('src/about/cosmos-source.json')), 'no text layers: words belong in HTML, not in the picture');

// 2. Кольори: золото стає лавандою лише в космосі; решта кольорів незмінна.
const gold = [...GOLD_TO_LAVENDER.keys()], lavender = [...GOLD_TO_LAVENDER.values()];
const original = colorsOf(source);
assert.deepEqual(colorsOf(green), original, 'the green copy keeps the owner’s colours');
for (const colour of gold) assert(original.includes(colour), `${colour} is in the original`);
assert(!colorsOf(cosmic).some(colour => gold.includes(colour)), 'no gold is left in the cosmic copy');
assert.deepEqual(colorsOf(cosmic), original.filter(colour => !gold.includes(colour)).concat(lavender).sort(), 'only gold changes, into the site lavender');
// Будова та сама: ті самі шари, кадри й кількість фігур.
assert.deepEqual(cosmic.layers.map(layer => [layer.nm, layer.ip, layer.op]), source.layers.map(layer => [layer.nm, layer.ip, layer.op]));
assert.equal(JSON.stringify(cosmic).length < read('src/about/cosmos-source.json').length, true, 'the site copy is compact');

// 3. Сторінка: заставка в обох палітрах, модуль, підпис для читача з екрана, нічого в рядку тексту не загубилось.
const page = read('dist/about.html');
const figure = page.match(/<figure class="ab-cosmos" data-about-cosmos>[\s\S]*?<\/figure>/)?.[0];
assert(figure, 'the figure sits on the page');
assert(page.indexOf(figure) < page.indexOf('<main'), 'it lives in the title band, not between the sections');
assert.match(figure, /role="img" aria-label="Космос усередині тебе: [^"]+"/, 'the scene has a spoken description');
assert.match(figure, /<img data-art="green" src="\.\/about-cosmos-poster-green\.webp" width="1120" height="630" loading="lazy"[^>]* alt="">/);
assert.match(figure, /<img data-art="cosmic" src="\.\/about-cosmos-poster\.webp" width="1120" height="630"[^>]* alt="">/);
assert(!/loading="lazy"/.test(figure.match(/<img data-art="cosmic"[^>]*>/)[0]), 'the default (cosmic) still is not lazy: it is on the first screen');
for (const file of ['about-cosmos-poster.webp', 'about-cosmos-poster-green.webp']) {
  const bytes = fs.readFileSync('dist/' + file);
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', `${file} is a WebP`);
  assert(bytes.length < 40_000, `${file} stays light (${bytes.length} bytes)`);
}
assert.match(page, /<script type="module" src="\.\/about-cosmos\.js\?v=\d+"><\/script>/);
assert(!/<button/.test(figure), 'no button in the markup: without JavaScript there is nothing to pause');

// 4. Програвач: свій файл з ліцензією, жодних сторонніх адрес; рух лише коли дозволено; пауза й палітра.
const script = read('dist/about-cosmos.js');
const vendor = read('dist/vendor/lottie-light-5.12.2.min.js');
assert.match(script, /const PLAYER = '\.\/vendor\/lottie-light-5\.12\.2\.min\.js'/);
assert(vendor.startsWith('/*! lottie-web 5.12.2') && vendor.includes('MIT License'), 'the player keeps its licence notice');
assert.match(read('dist/vendor/lottie-web-LICENSE.txt'), /The MIT License/);
assert(!/https?:\/\//.test(script), 'the module calls no outside address');
for (const file of ['about-cosmos.json', 'about-cosmos-green.json']) assert(script.includes(`'./${file}?v=`), `${file} is loaded from the site itself`);
assert(!/\beval\(|new Function/.test(vendor), 'the light build has no expression engine');
assert.match(script, /prefers-reduced-motion: reduce/, 'reduced motion keeps the still');
assert.match(script, /if \(reduce\.matches\) return;/, 'with reduced motion the player is not even downloaded');
assert.match(script, /IntersectionObserver/, 'the player starts only when the scene is on screen');
assert.match(script, /addEventListener\('load', start/, 'nothing competes with the page itself while it loads');
assert.match(script, /visibilitychange/, 'a hidden tab does not animate');
assert.match(script, /'Зупинити анімацію'/);
assert.match(script, /'Продовжити анімацію'/);
assert.match(script, /aria-pressed/);
assert.match(script, /attributeFilter: \['data-palette'\]/, 'the «Оформлення» switch swaps the colours without a reload');
assert.match(script, /export const START_FRAME = 165;/);
assert.match(read('scripts/make-about-cosmos.mjs'), /export const POSTER_FRAME = 165;/, 'the motion starts from the frame the still shows');

// 5. Стилі: кнопка 44 px, світла тема повертає сцені природні кольори, у друку сцени немає (вона декоративна, текст сторінки повний).
const css = read('dist/about-page.css');
assert.match(css, /\.ab-cosmos-toggle\{[^}]*width:44px;height:44px/);
assert.match(css, /html\[data-theme="light"\] \.ab-cosmos-stage\{filter:invert\(1\) hue-rotate\(180deg\)\}/);
assert.match(css, /html\[data-theme="light"\] \.ab-cosmos-stage img\{filter:none\}/, 'the still is not inverted twice');
assert.match(css, /@media print\{\.ab-cosmos\{display:none!important\}\}/);
assert.match(css, /\.ab-cosmos\[data-playing\] \.ab-cosmos-stage img\{visibility:hidden\}/, 'the still steps aside only once the motion is drawn');
assert.match(page, /about-page\.css\?v=2/, 'the style version was raised');
console.log('about cosmos: ok');
