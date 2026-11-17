// Головна, рішення власника «давай 1 пункт» (2026-11-15): замість «+» згорнуті рядки «Навчальні маршрути», «Оновлення» й «Бібліотека доказів»
// показують малюнок того, що в них лежить. Тест стежить, щоб малюнок не розійшовся з даними:
//   маршрути: ліній стільки, скільки маршрутів, вузлів на лінії стільки, скільки кроків;
//   бібліотека: стовпчиків стільки, скільки добавок у списку, рисок у стовпчику стільки, скільки розібраних тверджень;
//   оновлення: та сама мініатюра графіка (miniInterval), що й у першій картці блоку «Нове на сайті».
// Також: знак декоративний (aria-hidden, без тексту в SVG), рядок лишається одним керуванням, «+» більше не малюється, друга збірка нічого не змінює.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog} from '../src/platform/catalog.mjs';
import {routesSignSVG,shelfSignSVG,signHTML,placeSign,libraryRoutes,libraryClaimCounts,RAIL,SHELF} from '../src/platform/home-row-signs.mjs';
import {homeLearningHTML} from '../src/platform/learning-ui.mjs';
import {comparisonStatus} from '../dist/compare-status.js';
import {STUDIES} from '../dist/research-data.js';
import {miniInterval} from '../dist/research-chart.js';

const index=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/home-row-signs.css','utf8');
const count=(text,needle)=>text.split(needle).length-1;
const summaryOf=marker=>{const start=index.indexOf(marker);assert(start>=0,`${marker} is on the home`);const from=index.indexOf('<summary>',start);return index.slice(from,index.indexOf('</summary>',from)+10);};

// 1. Маршрути: знак збирається з каталогу.
const steps=catalog.paths.map(path=>path.steps.length);
const routes=routesSignSVG(steps);
assert.equal(count(routes,'<g class="hs-rail"'),catalog.paths.length,'one rail per learning route');
steps.forEach((n,i)=>{
  const rail=routes.split('<g class="hs-rail"')[i+1];
  assert.equal(count(rail,'<circle'),n,`route ${i+1}: one node per step`);
  assert.equal(count(rail,'hs-start'),1,`route ${i+1}: exactly one start node`);
  assert(rail.startsWith(` data-steps="${n}"`),`route ${i+1}: the step count is recorded on the rail`);
});
const routeSummary=summaryOf('<details id="home-learning-paths">');
assert(routeSummary.includes(signHTML('routes',routes)),'the routes row on the home carries the sign built from the catalog');
assert(homeLearningHTML().includes(signHTML('routes',routes)),'the generator and the page agree');
assert.equal(dimension(routes,'width'),RAIL.pad*2+(Math.max(...steps)-1)*RAIL.step,'the routes sign is as wide as the longest route');

// 2. Бібліотека: стовпчик на добавку зі списку, риска на твердження.
const ids=libraryRoutes(index),claims=libraryClaimCounts(index,comparisonStatus);
assert.equal(ids.length,count(index.match(/<ul class="se-list"[\s\S]*?<\/ul>/)[0],'<li>'),'every supplement in the library list is counted');
assert.deepEqual(claims,ids.map(id=>comparisonStatus[id].total),'claim counts come from compare-status.js in list order');
const shelf=shelfSignSVG(claims);
assert.equal(count(shelf,'<g class="hs-spine"'),ids.length,'one spine per supplement');
claims.forEach((n,i)=>assert.equal(count(shelf.split('<g class="hs-spine"')[i+1].split('</g>')[0],'<rect'),n,`${ids[i]}: one mark per claim`));
assert.equal(count(shelf,'<rect'),claims.reduce((a,b)=>a+b,0),'the shelf holds exactly as many marks as there are claims');
assert.equal(dimension(shelf,'height'),Math.max(...claims)*(SHELF.mark+SHELF.space)+SHELF.base,'the shelf is as tall as the largest review');
const librarySummary=summaryOf('<details class="home-library-fold">');
assert(librarySummary.includes('<!-- EUA_HOME_SIGN_LIBRARY_START -->'+signHTML('library',shelf)+'<!-- EUA_HOME_SIGN_LIBRARY_END -->'),'the library row carries the shelf built from the data');
// Це підрахунок, а не оцінка: у знаку немає кольорів рівня впевненості й жодного поділу стовпчиків на «кращі» й «гірші».
assert.equal(new Set([...shelf.matchAll(/class="([^"]+)"/g)].map(m=>m[1])).size,4,'the shelf uses only its four neutral classes (svg, spine, mark, floor)');

// 3. Оновлення: мініатюра того самого розбору, що й перша картка блоку.
const latest=(index.match(/<ul class="home-fresh-latest"[\s\S]*?<\/ul>/)||[''])[0];
const featured=[...latest.matchAll(/research\.html#([a-z0-9-]+)/g)].map(m=>m[1]).find(id=>STUDIES.some(s=>s.id===id&&s.chart));
assert(featured,'the home names a write-up with a chart');
const mini=miniInterval(STUDIES.find(s=>s.id===featured).chart);
const freshSummary=summaryOf('<details class="home-fresh-fold">');
assert(freshSummary.includes('<!-- EUA_HOME_SIGN_FRESH_START -->'+signHTML('fresh',mini)+'<!-- EUA_HOME_SIGN_FRESH_END -->'),'the updates row carries the mini chart of the featured write-up');
assert(index.slice(index.indexOf('<!-- EUA_HOME_FRESH_START -->'),index.indexOf('<!-- EUA_HOME_FRESH_END -->')).includes(mini),'the same mini chart stands in the first card inside the row');

// 4. Знаки декоративні, без тексту; рядок лишається одним керуванням; назви й підказки рядків не змінені.
for(const [name,summary] of [['routes',routeSummary],['library',librarySummary],['fresh',freshSummary]]){
  assert.equal(count(summary,'class="home-row-sign'),1,`${name}: one sign per row`);
  assert(summary.includes(`<span class="home-row-sign home-row-sign--${name}" aria-hidden="true">`),`${name}: the sign is hidden from assistive technology`);
  assert(!/<text|<title|<a |<button|tabindex/.test(summary),`${name}: no text, links or extra controls inside the summary`);
}
assert.equal(count(index,'class="home-row-sign'),3,'three signs on the home, no more');
assert(routeSummary.includes('<strong>Навчальні маршрути</strong>')&&librarySummary.includes('<strong class="home-library-title">Бібліотека доказів</strong><small class="home-library-note">Добавки, першоджерела й читання досліджень</small>')&&freshSummary.includes('<span class="home-fresh-fold-title">Оновлення</span><span class="home-fresh-fold-hint">Розбори, схеми й зміни на сайті</span>'),'row titles and hints are unchanged');
function dimension(svg,name){return Number(new RegExp(` ${name}="([0-9.]+)"`).exec(svg)[1]);}
const parsed=JSON.parse(execFileSync('python',['-c','from lxml import html\nimport json,sys\nroot=html.fromstring(sys.stdin.read())\nprint(json.dumps([[d.get("id") or d.get("class"),d.get("open") is not None,[c.tag for c in d.xpath("./summary/*")]] for d in root.xpath(\'//details[@id="home-learning-paths" or @class="home-library-fold" or @class="home-fresh-fold"]\')]))'],{input:index,encoding:'utf8'}));
assert.equal(parsed.length,3);
for(const [name,open,children] of parsed){assert.equal(open,false,`${name} starts closed`);assert(children.every(tag=>tag==='span'),`${name}: the summary holds only spans (text and the sign)`);}

// 5. Невірні дані зупиняють збірку, а не малюють порожній знак.
assert.throws(()=>routesSignSVG([]),/step count/);
assert.throws(()=>routesSignSVG([3,0]),/step count/);
assert.throws(()=>shelfSignSVG([4,1.5]),/claim count/);
assert.throws(()=>libraryClaimCounts(index,{}),/No claim count/);
assert.throws(()=>placeSign('<p></p>','FRESH','x'),/markers are missing/);
assert.equal(placeSign(placeSign(index,'FRESH',signHTML('fresh',mini)),'LIBRARY',signHTML('library',shelf)),index,'placing the signs again changes nothing');

// 6. Стилі: «+» і «−» більше не малюються в цих рядках, стан показує кутик; знак не менший за 30 px заввишки; без зовнішніх запитів.
assert(index.includes('<link rel="stylesheet" href="./home-row-signs.css?v=1">'),'the stylesheet is linked with a version');
assert(index.indexOf('home-row-signs.css')>index.indexOf('home-fresh.css')&&index.indexOf('home-row-signs.css')>index.indexOf('home-lens.css')&&index.indexOf('home-row-signs.css')>index.indexOf('home-spectrum.css'),'the stylesheet loads after the sheets whose «+» it replaces');
assert(!/content:"[+−]"/.test(css),'no plus or minus glyph in the new sheet');
const after=/:is\(([^)]*)\)>summary::after\{\s*content:"";/.exec(css);
assert(after,'the closed state draws an empty pseudo-element (a corner), not a glyph');
for(const row of ['.home-examples','.home-path-outline','#home-learning-paths','#home-about','#home-overview','#home-feedback','.home-library-fold','.home-fresh-fold'])assert(after[1].split(',').includes(row),`${row} gets the corner`);
assert(/\[open\]>summary::after\{[^}]*rotate\(-135deg\)/.test(css),'the open state turns the corner');
for(const height of [...css.matchAll(/\.home-row-sign[^{]*svg[^{]*\{[^}]*height:(\d+)px/g)].map(m=>Number(m[1])))assert(height>=30,`a sign is at least 30 px tall (${height})`);
assert(/@media\(prefers-reduced-motion:reduce\)\{[^@]*transition:none/.test(css),'motion is off when the visitor asks for reduced motion');
assert(!/url\(|@import|https?:/.test(css),'no external requests and no images in the sheet');
// Модуль знаків іде на сайт як копія джерела (його імпортує platform-learning.js).
assert.equal(fs.readFileSync('dist/home-row-signs.js','utf8'),fs.readFileSync('src/platform/home-row-signs.mjs','utf8'),'dist/home-row-signs.js is a copy of the source');
assert(fs.readFileSync('dist/platform-learning.js','utf8').includes("from './home-row-signs.js?v=2'"),'the shipped learning module imports the shipped sign module');
console.log('Home row signs: routes, library and updates signs match their data.');
