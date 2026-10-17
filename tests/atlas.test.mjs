import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog} from '../src/platform/catalog.mjs';

const requiredFiles=['dist/atlas.html','dist/atlas.css','dist/atlas.js'];
for(const file of requiredFiles)assert(fs.existsSync(file),`Missing Atlas asset: ${file}`);

const html=fs.readFileSync('dist/atlas.html','utf8');
const css=fs.readFileSync('dist/atlas.css','utf8');
const js=fs.readFileSync('dist/atlas.js','utf8');
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

for(const shell of [shellSource,shellBuilt]){
  assert(shell.includes('./atlas.html'),'Shared shell must link to Atlas');
  assert(shell.includes('Атлас'),'Shared shell must name Atlas');
  assert(shell.includes('Досліджуйте людське тіло'),'Home teaser headline missing');
  assert(shell.includes('Від анатомії — до доказів.'),'Home teaser proposition missing');
  assert(shell.includes('Відкрити Атлас'),'Home teaser CTA missing');
}

assert.equal(catalog.areas.filter(area=>area.available).length,6,'Atlas must not become a seventh catalog direction');
console.log('Evidence Atlas expansion contract verified: shoulder + knee modules, preview maps, breadcrumb, persistent tabs and catalog count unchanged.');
