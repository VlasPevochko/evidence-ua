import assert from 'node:assert/strict';
import fs from 'node:fs';

// Компактний верхній банер «Спалювання жиру» (рішення власника 2026-10-25, «зменши»): було 559 px на комп'ютері і 829 px на телефоні.
// Змінено лише оформлення; тексти, кнопки і застереження ті самі.
const html=fs.readFileSync('dist/fat-burning.html','utf8'),pine=fs.readFileSync('dist/fat-burning-pine.css','utf8');
const block=pine.slice(pine.indexOf('Рішення власника 2026-10-25'));
assert(html.includes('fat-burning-pine.css?v=3'),'the stylesheet version was bumped');
assert(block.includes('.fb-hero-art{min-height:300px}'),'the picture is lower on wide screens');
const phone=block.slice(block.indexOf('@media(max-width:760px)'));
assert(phone.includes('.fb-hero-art{min-height:120px')&&phone.includes('.fb-hero-actions{flex-wrap:nowrap'),'on the phone the picture is low and the two buttons share a row');
assert(!/font-size:(9|10|11)px/.test(block),'no text under 12px');
for(const t of ['Побачити процес','Обрати питання','Без персональних розрахунків, чудо-засобів і обіцянок швидкого результату'])assert(html.includes(t),`${t} is kept`);
console.log('Fat burning hero: compact banner, buttons in one row on the phone, texts and disclaimer kept passed.');
