import assert from 'node:assert/strict';
import fs from 'node:fs';
import {supplements} from '../dist/supplements.js';
import {resolve,rows,REVIEW} from '../dist/compare-page.js';
import {findMaterials} from '../src/platform/materials.mjs';

// Порівняння добавок (рішення власника 2026-10-20): ті самі тексти, що в каталозі, поруч, без рейтингу.
const html=fs.readFileSync('dist/compare.html','utf8'),js=fs.readFileSync('dist/compare-page.js','utf8'),css=fs.readFileSync('dist/compare-page.css','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('data-pine')&&html.includes('data-motif="kagome"')&&fs.readFileSync('dist/page-pine.css','utf8').includes('.pb[data-motif="kagome"]'),'pine band with its own motif');
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='compare.html'))assert(!fs.readFileSync('dist/'+f,'utf8').includes('data-motif="kagome"'),`${f} must not reuse kagome`);
// Text is never invented here: every row comes from the catalogue data.
const [a,b]=resolve('?a=creatine&b=supplement-caffeine');
assert.equal(a.id,'creatine');assert.equal(b.id,'supplement-caffeine');
const r=rows(a);assert.deepEqual(r.map(x=>x[0]),['Напрям','Короткий висновок','Межі висновку','Стан перегляду']);
assert.equal(r[1][1],supplements[0].summary);assert.equal(r[2][1],supplements[0].limit);
assert.equal(rows(b)[3][1],REVIEW.other);assert.equal(r[3][1],REVIEW.creatine);
// Bad or equal parameters fall back safely; the page can be linked with ?a=&b=.
assert.notEqual(...resolve('?a=nope&b=nope').map(x=>x.id));
const same=resolve('?a=creatine&b=creatine');assert.notEqual(same[0].id,same[1].id);
assert.equal(resolve('').length,2);
// No ranking language and every dossier it links to exists on the home page.
// The explanatory note may name ranking words in order to deny them; the page itself and the script may not use them.
const words=html.replace(/<aside class="cp-note">[\s\S]*?<\/aside>/,'')+js;
assert(!/(краща|кращий|найкращ|сильніша|переможець)/i.test(words),'no ranking wording outside the explanatory note');
assert(html.includes('Це не рейтинг і не порада'),'the page says it is not a ranking');
const home=fs.readFileSync('dist/index.html','utf8');
for(const s of supplements)assert(home.includes(`id="${s.id}"`),`${s.id}: dossier exists on the home page`);
assert(findMaterials('порівняння добавок').some(m=>m.href==='./compare.html'),'the page is searchable');
assert(fs.readFileSync('dist/supplements.html','utf8').includes('./compare.html'),'the catalogue links to the comparison');
assert(!/https?:\/\//.test(js+css),'no third-party requests');
console.log('Compare page: catalogue text only, safe parameters, no ranking wording, own motif passed.');
