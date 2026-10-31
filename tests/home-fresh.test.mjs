import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES} from '../dist/research-data.js';

// Головна, рішення власника 2026-10-31: блок «Нове на сайті» (пункт 2) і виправлення дрібного тексту (пункт 3). Космічний вигляд лишається.
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/home-fresh.css','utf8');
const block=html.slice(html.indexOf('<section class="home-fresh"'),html.indexOf('</section>',html.indexOf('<section class="home-fresh"')));
assert(block.includes('id="home-fresh-title"')&&block.includes('Свіжі розбори й схеми'),'the block has its heading');
for(const href of ['./research.html','./mechanisms.html','./changes.html'])assert(block.includes(`<a class="home-fresh-card" href="${href}"`),`a card links to ${href}`);
for(const f of ['research.html','mechanisms.html','changes.html'])assert(fs.existsSync('dist/'+f),`${f} exists`);
// Число розборів і посилання на останні розбори не розходяться з даними.
assert(block.includes(`${STUDIES.length} розборів`),`the card counts ${STUDIES.length} write-ups`);
for(const id of block.match(/research\.html#[a-z0-9-]+/g).map(x=>x.split('#')[1]))assert(STUDIES.some(s=>s.id===id),`the latest-link ${id} points at a real write-up`);
assert((block.match(/home-fresh-card"/g)||[]).length===3,'three cards, one control per destination');
// Розміщення: у #categories, перед бібліотекою доказів; одна згадка стилю в головній.
assert(html.indexOf('<section class="home-fresh"')<html.indexOf('<section class="home-library-section"')&&html.indexOf('<section class="home-fresh"')>html.indexOf('id="start-here"'),'the block sits between the directions and the library');
assert(html.includes('./home-fresh.css?v=1'),'the stylesheet is linked with a version');
// Стилі: усе не менше 12 px, зона дотику термінів 44 px, рух вимикається, без сторонніх запитів.
assert(!/font-size:(9|10|11)px/.test(css),'no text under 12px in the new stylesheet');
assert(/\.start-eyebrow[^{]*\{font-size:12px!important\}/.test(css),'the 10–11 px eyebrows are raised to 12px');
assert(css.includes('.eua-term::after')&&css.includes('height:44px'),'glossary terms get a 44px touch area without changing the text');
assert(css.includes('prefers-reduced-motion')&&!/https?:\/\//.test(css),'motion can be turned off and nothing is requested from other sites');
assert(!/<h1\b/.test(block),'the block adds no extra h1');
console.log('Home fresh block: three destinations, counts in sync, placement, 12px text, touch areas passed.');
