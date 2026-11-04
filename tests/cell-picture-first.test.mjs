import assert from 'node:assert/strict';
import fs from 'node:fs';

// Головна картина першою на сторінці «Клітина людини» на телефоні (власник, 2026-11-03, «27 так»). Було: у першому екрані телефона лише кнопки кроків і перемикач рівня, картина
// починалася на 902 px від верху, а на екрані вміщується близько 660 px. Стало: до 800 px картина зі станом, кнопками «Назад / Далі» і швидким вибором структури йде одразу після назви
// сторінки (близько 410 px), далі все як було. Це лише порядок показу (CSS order), тому розмітка, порядок табуляції й стан сторінки не змінені, а від 801 px нічого не міняється.
// Тут перевіряємо розмітку, стилі, версії, журнал і примітки; положення картини в першому екрані, порядок блоків, роботу вибору структури й незмінність комп'ютерної версії
// міряє у справжньому браузері Browser QA (cellPictureFirstFlow).
const read = file => fs.readFileSync(file, 'utf8');
const html = read('dist/cell-lab.html'), css = read('dist/cell-vcard.css');

// 1) Розмітка не змінена: порядок у документі той самий, що був (кроки й рівень, примітка, потім список, картина з підписом, пояснення), тож табуляція й читання з екрана як раніше.
const at = marker => { const i = html.indexOf(marker); assert(i >= 0, `${marker} is in the page`); return i; };
const order = ['class="intro"', 'class="review-note"', 'id="explorer"', 'class="structure-list"', '<figure>', 'id="cell-canvas"', 'id="organelle-panel"', 'class="context"'].map(at);
assert.deepEqual(order, [...order].sort((a, b) => a - b), 'the document order of the blocks is unchanged');
assert(html.includes('<nav class="model-jumps" aria-label="Перейти від моделі"><a href="#organelle-panel">До пояснення ↓</a></nav>'), 'the jump «До пояснення ↓» is still in the markup (it is hidden on phones by CSS only)');

// 2) Стилі: правила порядку лежать лише всередині @media(max-width:800px), після всіх старих правил, і не чіпають комп'ютерну версію.
const marker = 'Головна картина першою на телефоні (2026-11-03, власник: «27 так»)';
const start = css.indexOf(marker);
assert(start > 0 && css.indexOf(marker, start + 1) === -1, 'the phone-first block is stated once, at the end of the stylesheet');
const before = css.slice(0, start), block = css.slice(start);
const open = block.indexOf('@media(max-width:800px){');
assert(open > 0, 'the rules sit in a media query up to 800 px');
const body = block.slice(open + '@media(max-width:800px){'.length);
assert(body.trimEnd().endsWith('}') && !body.slice(0, -1).includes('@media'), 'the block holds one media query and nothing after it');
for (const rule of [
  'main{display:flex;flex-direction:column;gap:16px}',
  'main>*{order:6}',
  '.explorer{display:contents}',
  '.explorer>figure{order:1;margin:0;display:flex;flex-direction:column}',
  '.explorer>figure>.model-jumps{display:none}',
  '.explorer>figure>.eua-learning-nav{order:1}',
  '.intro{order:2;margin:0}',
  '.review-note{order:3;margin:0}',
  '.explorer>.panel{order:4;margin:0}',
  '.explorer>.structure-list{order:5;margin:0}',
]) assert(body.includes(`body[data-platform-area="cell"] ${rule}`), `the phone rule is there: ${rule}`);
assert(!before.includes('.explorer{display:contents}') && !before.includes('order:6'), 'nothing of the phone reorder leaks into the rules for wide screens');
// Порядок від 1 до 5 і шостий для решти: картина, кроки, примітка, пояснення, список, далі решта сторінки в її порядку.
const orders = [...body.matchAll(/order:(\d+)/g)].map(m => Number(m[1]));
assert.deepEqual([...new Set(orders)].sort(), [1, 2, 3, 4, 5, 6], 'the blocks are ordered figure, steps, note, panel, list, then the rest');

// 3) Версії: стилі піднято, щоб браузер не показав кеш; сторінка журналу й запис про зміну на місці.
assert(Number((html.match(/cell-vcard\.css\?v=(\d+)/) || [])[1]) >= 83, 'cell-vcard.css carries a version after this change (cache busting)');
assert(read('dist/changes-data.js').includes('Картина клітини першою на телефоні'), 'the change log has a record of this change');
// 2026-11-03 («28 +»): версію даних журналу піднято далі (27), тому тут перевіряємо «не нижче 26», а не точне число.
assert(Number((read('dist/changes.html').match(/changes-page\.js\?v=(\d+)/) || [])[1]) >= 26 && Number((read('dist/changes-page.js').match(/changes-data\.js\?v=(\d+)/) || [])[1]) >= 26, 'the journal page loads the new journal data');

// 4) Примітка й межі: що змінено, чого не змінено, як це перевірено й як повернути.
const note = read('docs/CELL_LAB_PHONE_LAYOUT.md');
for (const part of ['902', 'cellPictureFirstFlow', 'display: contents', 'порядок табуляції', 'До пояснення ↓', 'Як повернути']) assert(note.toLowerCase().includes(part.toLowerCase()), `the note mentions ${part}`);

console.log('Cell page on phones: the main picture comes first (CSS order up to 800 px), markup and tab order unchanged, wide screens untouched, cache versions bumped, note written passed.');
