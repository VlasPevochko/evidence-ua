import assert from 'node:assert/strict';
import fs from 'node:fs';
import {supplements,groups,filterSupplements,renderRow} from '../dist/supplements.js';

const html=fs.readFileSync('dist/supplements.html','utf8'),css=fs.readFileSync('dist/supplements.css','utf8'),home=fs.readFileSync('dist/index.html','utf8');

// The catalogue repeats the home library texts word for word; science is not rewritten here.
const tiles=[...home.matchAll(/<a class="supplement-tile preview-tile" href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
assert.equal(tiles.length,10);
assert.equal(supplements.length,10);
const text=(body,pattern)=>body.match(pattern)[1].replace(/<[^>]+>/g,'').trim();
tiles.forEach(([,id,body],index)=>{
  const item=supplements[index];
  assert.equal(item.id,id,`Same order as the home library: ${id}`);
  assert.equal(item.tag,text(body,/<em>([\s\S]*?)<\/em>/));
  assert.equal(item.summary,text(body,/class="preview-summary">([\s\S]*?)<\/p>/));
  assert.equal(item.limit,text(body,/class="preview-limit">[\s\S]*?<\/span>([\s\S]*?)<\/p>/));
  assert(home.includes(`id="${id}"`),`The dossier ${id} exists on the home page`);
  assert.equal(item.x,(index%5)*25);assert.equal(item.y,Math.floor(index/5)*100);
});
assert.equal(new Set(supplements.map(s=>s.id)).size,10);

// Filtering and search.
assert.deepEqual(Object.keys(groups),['all','sport','health']);
assert.equal(filterSupplements(supplements).length,10);
assert.equal(filterSupplements(supplements,{group:'sport'}).length+filterSupplements(supplements,{group:'health'}).length,10);
assert.deepEqual(filterSupplements(supplements,{group:'health'}).map(s=>s.name),['Омега-3','Вітамін D','Магній']);
assert.deepEqual(filterSupplements(supplements,{query:'  КРЕА '}).map(s=>s.id),['creatine']);
assert.equal(filterSupplements(supplements,{query:'немає такої'}).length,0);

// Row markup: a link to the existing dossier, limits folded, no <header> (the shell injects navigation after every one).
const row=renderRow(supplements[0]);
assert(row.includes('href="./index.html#creatine"')&&row.includes('<details class="sp-limit">')&&!row.includes('<details class="sp-limit" open'));
assert(!/<header\b/.test(row)&&!/<h1\b/.test(row)&&/<h2>Креатин<\/h2>/.test(row));
assert(renderRow({...supplements[0],name:'<b>x</b>'}).includes('&lt;b&gt;'),'Names are escaped');

// Page structure.
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert.equal((html.match(/<header\b/g)||[]).length,1);
assert(html.includes('data-platform-area="supplements"')&&html.includes('supplements.css?v=')&&html.includes('supplements.js?v='));
assert(html.includes('aria-current="page">Добавки</a>'));
for(const id of ['sp-q','sp-list','sp-count','sp-empty'])assert(html.includes(`id="${id}"`),`Missing #${id}`);
assert.equal((html.match(/data-sp-filter=/g)||[]).length,3);
assert(!/https?:\/\/(?!vlaspevochko\.github\.io)/.test(html.replace(/<a [^>]*>/g,'')),'No third-party requests');
assert(!/https?:\/\//.test((css+fs.readFileSync('dist/supplements.js','utf8')).replaceAll('http://www.w3.org/2000/svg','')),'No third-party requests in CSS/JS');
for(const key of ['prefers-reduced-motion','min-height:44px','max-width:900px','position:sticky','source-serif-4-cyrillic-wght-normal.woff2'])assert(css.includes(key),`CSS missing ${key}`);
for(const file of ['source-serif-4-cyrillic-wght-normal.woff2','source-serif-4-latin-wght-normal.woff2'])assert(fs.existsSync('dist/fonts/'+file));

// The other pages point to the new page.
for(const file of ['dist/atlas.html','dist/exercises.html'])assert(fs.readFileSync(file,'utf8').includes('<a href="./supplements.html">Добавки</a>'),`${file} links to the catalogue`);
assert(fs.readFileSync('dist/platform-catalog.js','utf8').includes("href:'./supplements.html'"));
console.log('Supplements page: ten entries with unchanged home texts, links to existing dossiers, filter and search, folded limits, one header and no third-party requests passed. Browser verification is in Browser QA.');
