import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NODES,edges,neighbours} from '../dist/map-page.js';
import {NEXT_STEPS} from '../src/platform/next-steps.mjs';
import {findMaterials} from '../src/platform/materials.mjs';

// Карта знань (рішення власника 2026-10-20): вузли — сторінки, лінії — ті самі сусіди, що в «Куди далі».
const html=fs.readFileSync('dist/map.html','utf8'),css=fs.readFileSync('dist/map-page.css','utf8'),js=fs.readFileSync('dist/map-page.js','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('data-pine')&&html.includes('data-motif="tatewaku"')&&fs.readFileSync('dist/page-pine.css','utf8').includes('.pb[data-motif="tatewaku"]'),'pine band with its own motif');
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='map.html'))assert(!fs.readFileSync('dist/'+f,'utf8').includes('data-motif="tatewaku"'),`${f} must not reuse tatewaku`);
// Every node is a real page and has the same neighbours as its «Куди далі» block.
for(const file of Object.keys(NODES)){assert(fs.existsSync('dist/'+file),`${file} exists`);assert(NEXT_STEPS[file],`${file} has a next-steps block`);}
for(const [a,b] of edges()){assert(NODES[a]&&NODES[b]&&a!==b,'edge between two known pages');}
for(const [file,items] of Object.entries(NEXT_STEPS)){
  for(const [href] of items){const other=href.replace('./','').split('#')[0];if(NODES[other])assert(neighbours(file).includes(other),`${file} → ${other} is drawn`);}
}
const keys=edges().map(e=>[...e].sort().join('|'));assert.equal(new Set(keys).size,keys.length,'no duplicate lines');
// Nodes stay inside the stage with room for the label.
for(const [file,n] of Object.entries(NODES))assert(n.x>=8&&n.x<=92&&n.y>=8&&n.y<=88,`${file} sits inside the map`);
// Honest wording and accessibility: a navigation map, not causes; a list replaces the graph on phones; motion is optional.
assert(html.includes('а не причини й наслідки в організмі'),'the page says the lines are not causal');
assert(css.includes('.km-list{display:block}')&&css.includes('prefers-reduced-motion')&&js.includes('prefers-reduced-motion'),'phone list and reduced motion');
assert(js.includes('animateMotion')&&js.includes('aria-hidden')||html.includes('aria-hidden="true"'),'decorative lines are hidden from assistive tech');
assert(findMaterials('карта знань').some(m=>m.href==='./map.html'),'the map is searchable');
assert(fs.readFileSync('dist/index.html','utf8').includes('<a href="./map.html">Карта знань →</a>'),'the home page links to the map');
// The SVG namespace URI is an identifier, not a request.
assert(!/https?:\/\//.test((css+js).replaceAll('http://www.w3.org/2000/svg','')),'no third-party requests');
console.log('Map page: nodes are real pages, lines equal the next-step blocks, phone list, honest wording passed.');
