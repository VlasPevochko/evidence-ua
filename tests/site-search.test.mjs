// 2026-10-26 Muscle Lab guide: catalog/materials gained muscle units and search words → versions cascade (catalog/materials/tools/shell/directions/home-feedback 98→99, site-header 5→6, search 3→4).
// 2026-10-22: search finds supplements by topic (new keywords in platform-materials) → cascade: materials v84, search v2, header v4, tools v85, shell v97.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchSite,SUGGESTIONS} from '../src/platform/search.mjs';
import {headerHTML} from '../src/platform/site-header.mjs';
import {materials,findMaterials} from '../src/platform/materials.mjs';
import {TERMS} from '../src/platform/terms.mjs';

// Пошук по сайту (рішення власника 2026-10-21): кнопка в шапці, вікно з результатами, нічого не надсилається.
const data={materials,findMaterials,terms:TERMS};
const titles=r=>r.materials.map(m=>m.title);
assert.deepEqual(searchSite(data,'   '),{materials:[],terms:[]},'an empty query finds nothing');
const protein=searchSite(data,'білок');
assert(protein.materials.length>=2&&protein.materials.length<=8,'materials for protein, capped');
assert(searchSite(data,'інтервал').terms.some(t=>t.id==='ci'),'the confidence interval term is found');
assert(searchSite(data,'словник').materials.some(m=>m.href==='./glossary.html'),'the dictionary page is found');
assert(searchSite(data,'що нового').materials.some(m=>m.href==='./changes.html'),'the log is found');
assert.equal(searchSite(data,'цццццц').materials.length+searchSite(data,'цццццц').terms.length,0,'nonsense finds nothing');
// Ranking: a title that starts with the query comes before one that only mentions it.
const fake={materials:[{title:'Про сон і кофеїн',areaTitle:'A'},{title:'Кофеїн',areaTitle:'B'}],terms:[]};
assert.equal(titles(searchSite(fake,'кофеїн'))[0],'Кофеїн','title-first ranking');
assert.equal(searchSite(fake,'КОФЕЇН').materials.length,2,'case-insensitive');
for(const s of SUGGESTIONS)assert(searchSite(data,s).materials.length+searchSite(data,s).terms.length>0,`suggestion «${s}» finds something`);
// Header: one button, a label for assistive tech, the shortcut declared, no network.
const html=headerHTML();
assert.equal((html.match(/eua-header-search/g)||[]).length,1);
assert(html.includes('aria-label="Пошук по сайту"')&&html.includes('aria-keyshortcuts="/"'));
const src=fs.readFileSync('src/platform/search.mjs','utf8');
assert(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|https?:\/\//.test(src),'search stores and sends nothing');
assert(src.includes("e.key!=='/'")&&src.includes('isContentEditable'),'the / shortcut ignores typing fields');
assert(fs.readFileSync('src/platform/site-header.css','utf8').includes('.eua-search::backdrop'),'the dialog is styled');
assert.equal(fs.readFileSync('dist/platform-search.js','utf8'),src,'the built copy equals the source');
assert(fs.readFileSync('dist/site-header.js','utf8').includes("import('./platform-search.js?v=4')"),'the header loads search lazily');
console.log('Site search: ranking, terms, suggestions, accessible button and no-network source passed.');

// 2026-10-22: supplement cards are found by the topics of their approved Claims, not only by name.
{
  const {findMaterials} = await import('../dist/platform-materials.js');
  const first = q => findMaterials(q).map(m => m.title);
  for (const [q, title] of [['судоми', 'Магній'], ['колаген суглоби', 'Колаген'], ['зневоднення', 'Електроліти'], ['риб’ячий жир', 'Омега-3'], ['переломи', 'Вітамін D'], ['креатинін', 'Креатин'], ['поколювання', 'Бета-аланін'], ['кава', 'Кофеїн']])
    assert(first(q).includes(title), `${q} → ${title}`);
}
