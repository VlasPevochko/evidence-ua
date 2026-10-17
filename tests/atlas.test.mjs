import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog} from '../src/platform/catalog.mjs';

const requiredFiles=['dist/atlas.html','dist/atlas.css','dist/atlas.js','dist/knee-pain-map.css','dist/knee-pain-map.js','dist/shoulder-pain-map.css','dist/shoulder-pain-map.js','dist/atlas-coordinate-map.css'];
for(const file of requiredFiles)assert(fs.existsSync(file),`Missing Atlas asset: ${file}`);

const html=fs.readFileSync('dist/atlas.html','utf8');
const css=fs.readFileSync('dist/atlas.css','utf8');
const js=fs.readFileSync('dist/atlas.js','utf8');
const kneeCSS=fs.readFileSync('dist/knee-pain-map.css','utf8');
const kneeJS=fs.readFileSync('dist/knee-pain-map.js','utf8');
const shoulderCSS=fs.readFileSync('dist/shoulder-pain-map.css','utf8');
const shoulderJS=fs.readFileSync('dist/shoulder-pain-map.js','utf8');
const coordinateCSS=fs.readFileSync('dist/atlas-coordinate-map.css','utf8');
const shellSource=fs.readFileSync('src/platform/shell.mjs','utf8');
const shellBuilt=fs.readFileSync('dist/platform-shell.js','utf8');

const zones=[...html.matchAll(/data-zone="([^"]+)"/g)].map(match=>match[1]);
assert.deepEqual(zones,['brain','shoulder','spine','muscles','gut','knee']);
assert.match(html,/data-zone="shoulder"[^>]*aria-pressed="true"/);

const tabs=[...html.matchAll(/data-atlas-tab="([^"]+)"/g)].map(match=>match[1]);
assert.deepEqual(tabs,['overview','anatomy','symptoms','training','rehab','research']);
assert(html.includes('id="atlas-breadcrumb"'),'Atlas breadcrumb is required');

for(const title of ['Ротаторна манжета','Субакроміальний біль','Нестабільність плеча','Біцепс','AC-суглоб']){
  assert(js.includes(title),`Missing shoulder topic: ${title}`);
}
for(const title of ['Пателофеморальний біль','Меніски','ACL','Сухожилок надколінка','Остеоартроз коліна']){
  assert(js.includes(title),`Missing knee topic: ${title}`);
}
for(const title of ['Сон і циркадні ритми','Неспецифічний біль у попереку','Гіпертрофія','Мікробіом']){
  assert(js.includes(title),`Missing preview topic: ${title}`);
}
for(const state of ['Повний модуль','Бета','Готується'])assert(js.includes(state),`Missing Atlas module state: ${state}`);
assert(!js.includes('button.hidden=!shoulder'),'Tabs should remain visible for every Atlas zone');
assert(js.includes('atlas-breadcrumb'),'Breadcrumb updates must be wired in JavaScript');
assert.match(css,/atlas-breadcrumb/);
assert.match(css,/atlas-content\.is-changing/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/:focus-visible/);

// Shared body canvas: hotspot coordinates scale with the exact 520x480 source SVG.
assert(html.includes('class="atlas-body-canvas"'),'Global body and Atlas zone points must share a coordinate canvas');
assert(html.includes('./atlas-coordinate-map.css'),'Responsive coordinate layer must load after Atlas styles');
assert.match(coordinateCSS,/\.atlas-body-canvas\{[^}]*aspect-ratio:520\s*\/\s*480/,'Atlas body canvas must preserve the source SVG 520/480 ratio');
assert.match(coordinateCSS,/\.atlas-body-canvas>\.atlas-figure\{[^}]*inset:0/,'Body SVG must fill its coordinate canvas');
for(const coordinate of [
  '.atlas-zone--brain{--x:36.5%;--y:15.5%}',
  '.atlas-zone--shoulder{--x:49.5%;--y:36.5%}',
  '.atlas-zone--spine{--x:36.5%;--y:46%}',
  '.atlas-zone--gut{--x:36.5%;--y:54.5%}',
  '.atlas-zone--muscles{--x:29%;--y:74%}',
  '.atlas-zone--knee{--x:43.5%;--y:78%}'
])assert(coordinateCSS.includes(coordinate),`Missing corrected body coordinate: ${coordinate}`);

// Knee Pain Map v1: exact pain location guides anatomy, not diagnosis.
assert(html.includes('id="knee-pain-map"'),'Knee pain map mount is required in the figure panel');
assert(html.includes('./knee-pain-map.css'),'Knee pain map stylesheet must be loaded');
assert(html.includes('./knee-pain-map.js'),'Knee pain map controller must be loaded');
for(const view of ['front','medial','lateral','posterior'])assert(kneeJS.includes(`id:'${view}'`),`Missing knee view: ${view}`);
for(const label of ['Спереду','Зсередини','Ззовні','Ззаду'])assert(kneeJS.includes(label),`Missing knee view label: ${label}`);
for(const hotspot of ['anterior-patella','inferior-patella','superior-patella','medial-joint-line','pes-anserinus','lateral-joint-line','fibular-head','posterior-knee']){
  assert(kneeJS.includes(`id:'${hotspot}'`),`Missing knee pain hotspot: ${hotspot}`);
}
for(const anatomy of ['pes anserinus','sartorius','gracilis','semitendinosus','gastrocnemius','biceps femoris']){
  assert(kneeJS.toLowerCase().includes(anatomy.toLowerCase()),`Missing pain-map anatomy: ${anatomy}`);
}
assert(kneeJS.includes('Точка болю ≠ джерело болю'),'Pain map must state the core interpretation rule');
assert(kneeJS.includes('не встановлює діагноз'),'Pain map must explicitly avoid auto-diagnosis');
assert.match(coordinateCSS,/\.knee-stage\{[^}]*aspect-ratio:320\s*\/\s*420/,'Knee stage must preserve the SVG 320/420 coordinate system');
assert.match(coordinateCSS,/\.knee-stage>\.knee-diagram\{[^}]*inset:0/,'Knee SVG must fill the same coordinate canvas as its hotspots');
const calibratedKneePoints=[
  ['superior-patella','50%','38%'],
  ['anterior-patella','50%','47.5%'],
  ['inferior-patella','50%','57.5%'],
  ['medial-joint-line','59.5%','54.5%'],
  ['pes-anserinus','39%','79%'],
  ['lateral-joint-line','64%','54.5%'],
  ['fibular-head','69%','62.5%'],
  ['posterior-knee','50%','52.5%']
];
for(const [id,x,y] of calibratedKneePoints){
  assert(coordinateCSS.includes(`.knee-hotspot[data-knee-hotspot="${id}"]{--x:${x}!important;--y:${y}!important}`),`Missing calibrated knee hotspot ${id}`);
}
assert.match(kneeCSS,/:focus-visible/);
assert.match(kneeCSS,/prefers-reduced-motion/);

// Shoulder Pain Map v1: local pain patterns plus neck-referred pain without auto-diagnosis.
assert(html.includes('id="shoulder-pain-map"'),'Shoulder pain map mount is required in the figure panel');
assert(html.includes('./shoulder-pain-map.css'),'Shoulder pain map stylesheet must be loaded');
assert(html.includes('./shoulder-pain-map.js'),'Shoulder pain map controller must be loaded');
for(const view of ['front','lateral','posterior'])assert(shoulderJS.includes(`id:'${view}'`),`Missing shoulder view: ${view}`);
for(const label of ['Спереду','Збоку','Ззаду'])assert(shoulderJS.includes(label),`Missing shoulder view label: ${label}`);
for(const hotspot of ['ac-joint','bicipital-groove','anterior-gh','lateral-deltoid','posterior-cuff','scapular-region','cervical-referred']){
  assert(shoulderJS.includes(`id:'${hotspot}'`),`Missing shoulder pain hotspot: ${hotspot}`);
}
for(const anatomy of ['AC-суглоб','довга голівка біцепса','rotator cuff','subacromial','шийного відділу']){
  assert(shoulderJS.toLowerCase().includes(anatomy.toLowerCase()),`Missing shoulder-map anatomy or differential: ${anatomy}`);
}
assert(shoulderJS.includes('Точка болю ≠ джерело болю'),'Shoulder map must preserve the core interpretation rule');
assert(shoulderJS.includes('не встановлює діагноз'),'Shoulder map must explicitly avoid auto-diagnosis');
assert(shoulderJS.includes('реферований біль'),'Shoulder map must distinguish referred pain');
assert.match(shoulderCSS,/shoulder-pain-map/);
assert.match(shoulderCSS,/:focus-visible/);
assert.match(shoulderCSS,/prefers-reduced-motion/);

for(const shell of [shellSource,shellBuilt]){
  assert(shell.includes('./atlas.html'),'Shared shell must link to Atlas');
  assert(shell.includes('Атлас'),'Shared shell must name Atlas');
  assert(shell.includes('Досліджуйте людське тіло'),'Home teaser headline missing');
  assert(shell.includes('Від анатомії — до доказів.'),'Home teaser proposition missing');
  assert(shell.includes('Відкрити Атлас'),'Home teaser CTA missing');
}

assert.equal(catalog.areas.filter(area=>area.available).length,6,'Atlas must not become a seventh catalog direction');
console.log('Evidence Atlas v0.4 contract verified: calibrated knee map plus shoulder pain map with referred-pain framing.');
