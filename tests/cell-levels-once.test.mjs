import assert from 'node:assert/strict';
import fs from 'node:fs';

// Один перемикач рівня на сторінці «Клітина людини» на телефоні (власник: «28 +», 2026-11-03). Було: «Школа / Університет / Поглиблено» стояв двічі: у блоці кроків угорі
// і в поясненні (на телефоні після того, як картину піднято, вони опинилися поряд). Стало: до 800 px верхній перемикач сховано (display:none), лишається той, що в поясненні одразу
// над текстом, який він міняє. Розмітка не змінена, обидва перемикачі керуються одним станом (cell-lab.js оновлює всі [data-level]), на комп'ютері показано обидва.
// Тут перевіряємо правило, розмітку, скрипт, версії, журнал і примітку; видимість і роботу перемикача в браузері міряє Browser QA (cellPictureFirstFlow).
const read = file => fs.readFileSync(file, 'utf8');
const html = read('dist/cell-lab.html'), css = read('dist/cell-vcard.css'), script = read('dist/cell-lab.js');

// 1) Розмітка: обидва перемикачі на місці, по три кнопки, обидва керують тим самим текстом.
const top = html.match(/<div class="levels" role="group" aria-label="Рівень пояснення">(.*?)<\/div>/s);
const inPanel = html.match(/<div class="reading-level-options" role="group"[^>]*>(.*?)<\/div>/s);
assert(top && inPanel, 'both level switches are in the markup');
for (const [name, group] of [['the steps block', top[1]], ['the explanation', inPanel[1]]]) {
  assert.deepEqual([...group.matchAll(/data-level="(\w+)"/g)].map(m => m[1]), ['school', 'university', 'advanced'], `${name} has the three levels`);
  assert.equal([...group.matchAll(/aria-controls="organelle-copy"/g)].length, 3, `${name} controls the explanation text`);
}
assert(html.indexOf('class="levels"') < html.indexOf('class="reading-level-options"'), 'the document order is unchanged: steps and level first, explanation later');

// 2) Скрипт: усі кнопки [data-level] оновлюються разом, а клік по будь-якій змінює рівень, тож прихований дубль не відстає.
assert(script.includes("root.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)))"), 'every [data-level] button is updated together');
assert(script.includes("closest('[data-organelle],[data-level],[data-tab],[data-cell-action],[data-cell-detail-action]')") && script.includes('if(b.dataset.level)level=b.dataset.level'), 'a click on any level button sets the level');

// 3) Стилі: правило лише в блоці до 800 px (після мітки блоку «картина першою»), на ширших екранах нічого не ховається.
const marker = 'Головна картина першою на телефоні (2026-11-03, власник: «27 так»)';
const start = css.indexOf(marker);
assert(start > 0, 'the phone block is in the stylesheet');
const rule = 'body[data-platform-area="cell"] .intro .levels{display:none}';
assert.equal(css.split(rule).length - 1, 1, 'the rule that hides the upper switch is stated once');
assert(css.indexOf(rule) > css.indexOf('@media(max-width:800px){', start), 'the rule sits inside the phone media query');
assert(!css.slice(0, start).includes('.intro .levels{display:none}'), 'nothing hides the switch for wide screens');
assert(css.includes('«28 +»'), 'the comment records the owner decision');

// 4) Версії, журнал, примітка.
assert(Number((html.match(/cell-vcard\.css\?v=(\d+)/) || [])[1]) >= 84, 'cell-vcard.css carries a version after this change (cache busting)');
assert(Number((read('dist/changes.html').match(/changes-page\.js\?v=(\d+)/) || [])[1]) >= 27 && Number((read('dist/changes-page.js').match(/changes-data\.js\?v=(\d+)/) || [])[1]) >= 27, 'the journal page loads the new journal data');
assert(read('dist/changes-data.js').includes('Один перемикач рівня на телефоні'), 'the change log has a record of this change');
const note = read('docs/CELL_LAB_PHONE_LAYOUT.md');
assert(note.includes('Один перемикач рівня') && note.includes('28 +') && note.includes('.intro .levels'), 'the layout note describes the single level switch');

console.log('Cell page on phones: one level switch (the one in the explanation), both copies stay in the markup and in step, wide screens keep both, cache versions bumped, note written passed.');
