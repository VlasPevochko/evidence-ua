import assert from 'node:assert/strict';
import fs from 'node:fs';
import {storeShape} from '../dist/fat-burning.js';

// Апгрейд сторінки «Куди зникає жир?» (рішення власника 2026-11-14, «все так»): схема-рух, графік запасу, вердикти міфів, смуга розділів.
// Тест перевіряє оформлення й поведінку; наукові тексти захищає fat-burning-science.test.mjs.
const html=fs.readFileSync('dist/fat-burning.html','utf8'),css=fs.readFileSync('dist/fat-burning.css','utf8'),js=fs.readFileSync('dist/fat-burning.js','utf8');

// 1) Графік запасу: форма, а не прогноз.
const y=d=>d.split(/[ML]/).filter(Boolean).map(p=>+p.trim().split(' ')[1]);
const deficit=storeShape('deficit'),equal=storeShape('equal'),surplus=storeShape('surplus');
assert.equal(storeShape('x'),null,'unknown scenario is ignored');
assert(y(deficit.fat).at(-1)>y(deficit.fat)[0],'deficit: the fat store line goes down (SVG y grows)');
assert(y(surplus.fat).at(-1)<y(surplus.fat)[0],'surplus: the line goes up');
assert(new Set(y(equal.fat)).size===1,'equal: the store line is flat');
assert.equal(y(equal.weight).length,13,'daily weight has 13 points');
assert(new Set(y(equal.weight)).size>5,'equal: weight still wiggles while the store is flat (the point of the picture)');
assert.notEqual(equal.weight,equal.fat);

// 2) Смуга розділів замінює і плитки, і другу кнопку героя; кожна ціль існує.
assert(!html.includes('Обрати питання'),'no duplicate hero control');
const nav=html.match(/<nav class="fb-jumps"[\s\S]*?<\/nav>/)[0];
const targets=[...nav.matchAll(/href="#([a-z]+)"/g)].map(m=>m[1]);
assert.deepEqual(targets,['process','balance','practice','myths','sources']);
for(const id of targets)assert(html.includes(`id="${id}"`),`${id} exists`);
assert(/\.fb-jumps\{position:sticky;top:0/.test(css),'the bar sticks to the top');
assert(js.includes('aria-current')&&js.includes('IntersectionObserver'),'the bar marks the current section (not colour only)');
assert(!html.includes('fb-next'),'the duplicate "continue" block is gone; supplements link lives in myth 5');
assert(html.includes('href="./supplements.html"'));

// 3) Схема: чотири станції, рейка з пакетом, кнопки етапів ПІД станціями (один контроль замість двох рядів).
assert.equal((html.match(/data-visual="[0-3]"/g)||[]).length,4);
assert(html.includes('class="fb-rail-fill"')&&html.includes('class="fb-packet"'));
assert(!html.includes('fb-diagram-labels'),'labels merged into the stage buttons');
assert(js.includes('--fb-i')&&js.includes('--fb-p'),'the script drives the packet position');
assert(/\.is-active \.fb-up\{animation/.test(css)&&/\.is-active \.fb-chain\{animation/.test(css),'only the active station moves');
assert(!/<svg[^>]*>[\s\S]*?<text/.test(html.slice(html.indexOf('fb-flow-svg'),html.indexOf('</svg>',html.indexOf('fb-flow-svg')))),'no text inside the SVG (labels are HTML)');

// 4) Міфи: відповідь відкрита, вердикт знаком і словом, без акордеона й «＋».
const myths=html.slice(html.indexOf('<ol class="fb-myth-list">'),html.indexOf('</ol>',html.indexOf('<ol class="fb-myth-list">')));
assert.equal((myths.match(/<li class="fb-myth"/g)||[]).length,5);
assert(!/<details|＋|<summary/.test(myths),'nothing is hidden behind a disclosure');
assert.equal((myths.match(/<b aria-hidden="true">[✕≈?]<\/b><span>/g)||[]).length,5,'each verdict has a shape and a word (not colour only)');

// 5) Доступність і рух.
assert(!/font-size:(9|10|11)px/.test(css),'no text under 12px');
assert(/\.fb-step-footer>a[^{]*\{[^}]*min-height:44px/.test(css),'link rows are at least 44px');
const rm=css.slice(css.indexOf('@media(prefers-reduced-motion:reduce)'));
for(const sel of ['.fb-packet','.fb-rail-fill','.fb-gl','.fb-piece','.is-drawing','.fb-co2-chip'])assert(rm.includes(sel),`${sel} stops with reduced motion`);
assert(css.includes('@media print{.fb-jumps{display:none}'),'the sticky bar is not printed');
assert(!/https?:\/\//.test(css+js.replace(/https?:\/\/[^"']*/g,'')),'no third-party requests');
console.log('Fat burning upgrade: stage motion, store chart, verdict list, section bar passed.');
