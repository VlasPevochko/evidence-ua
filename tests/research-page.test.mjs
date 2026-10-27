import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES,TOPICS,CHECKED} from '../dist/research-data.js';
import {filterStudies,countLabel} from '../dist/research-page.js';

// «Дослідження простими словами» (рішення власника 2026-10-27, пункт 4: коротко й ясно, щоб можна було не читати все).
assert(STUDIES.length>=7,'the first batch has several write-ups');
assert.equal(new Set(STUDIES.map(s=>s.id)).size,STUDIES.length,'ids are unique');
for(const s of STUDIES){
  for(const k of ['question','answer','who','found','limits'])assert(typeof s[k]==='string'&&s[k].length>10,`${s.id}: ${k} is filled`);
  assert(typeof s.type==='string'&&s.type.length>=5,`${s.id}: the study type is named`);
  assert(TOPICS[s.topic],`${s.id}: known topic`);
  assert(s.answer.length<=110,`${s.id}: the answer fits one short line (${s.answer.length} chars)`);
  assert(/^10\.\d{4,9}\//.test(s.source.doi)&&s.source.label.length>5,`${s.id}: a named source with a DOI`);
  assert(!/(гарантує|лікує|доведено,? що ви)/i.test(s.answer+s.found),`${s.id}: no promises or cures`);
  assert(s.limits.length>30,`${s.id}: says what the study does not prove`);
}
assert.match(CHECKED,/^\d{2}\.\d{2}\.2026$/);
// Observational studies are not described as causal.
const steps=STUDIES.find(s=>s.id==='steps');assert(steps.limits.includes('зв’язок')&&steps.limits.includes('не експеримент'),'steps: association, not cause');
// Filtering and the counter.
assert.equal(filterStudies('all').length,STUDIES.length);
assert(filterStudies('move').every(s=>s.topic==='move')&&filterStudies('move').length>=2);
assert.equal(countLabel(7,7),'Розборів: 7');assert.equal(countLabel(2,7),'Показано 2 із 7');
// Page wiring: pine band with its own motif, one h1, no <header> inside sections, no third-party requests, registered in the catalog.
const html=fs.readFileSync('dist/research.html','utf8');
assert(/<body[^>]* data-pine[ >]/.test(html)&&html.includes('data-motif="hanabishi"'),'pine band with its own motif');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'one h1');assert.equal((html.match(/<header\b/g)||[]).length,1,'only the page header uses <header>');
assert(html.includes('research-page.js?v=1')&&html.includes('research-page.css?v=1')&&html.includes('page-pine.css?v=18'),'assets with versions');
assert(html.includes('не оцінка Evidence UA і не медична порада'),'the disclaimer is visible');
for(const f of fs.readdirSync('dist').filter(n=>n.startsWith('research')&&n.endsWith('.js')))assert(!/https?:\/\/(?!doi\.org\/)/.test(fs.readFileSync('dist/'+f,'utf8').replace(/\/\/ .*$/gm,'')),`${f}: only doi.org links`);
const mats=fs.readFileSync('src/platform/materials.mjs','utf8');assert(mats.includes("'./research.html'")&&mats.includes("'guide-research'"),'the page is in the catalog and the search words');
assert(fs.existsSync('dist/og/research.jpg'),'the share card exists');
// The new motif is defined once.
assert(fs.readFileSync('dist/page-pine.css','utf8').includes('.pb[data-motif="hanabishi"]'),'the hanabishi motif exists');
console.log('Research page: short answers, sourced, limits stated, filter, catalog and share card passed.');
