import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES,TOPICS,CHECKED} from '../dist/research-data.js';
import {filterStudies,countLabel} from '../dist/research-page.js';

// «Дослідження простими словами» (рішення власника 2026-10-27, пункт 4: коротко й ясно, щоб можна було не читати все).
assert(STUDIES.length>=16,'three batches of write-ups');
assert.equal(new Set(STUDIES.map(s=>s.id)).size,STUDIES.length,'ids are unique');
for(const s of STUDIES){
  for(const k of ['question','answer','who','found','limits'])assert(typeof s[k]==='string'&&s[k].length>10,`${s.id}: ${k} is filled`);
  assert(typeof s.type==='string'&&s.type.length>=5,`${s.id}: the study type is named`);
  assert(TOPICS[s.topic],`${s.id}: known topic`);
  assert(s.answer.length<=110,`${s.id}: the answer fits one short line (${s.answer.length} chars)`);
  // Одна стаття 2015 року (PMID 26080646) не має DOI в PubMed: тоді джерелом служить сторінка PubMed.
  assert((s.source.doi?/^10\.\d{4,9}\//.test(s.source.doi):/^\d{6,9}$/.test(s.source.pmid))&&s.source.label.length>5,`${s.id}: a named source with a DOI or a PubMed id`);
  assert(!/(гарантує|лікує|доведено,? що ви)/i.test(s.answer+s.found),`${s.id}: no promises or cures`);
  assert(s.limits.length>30,`${s.id}: says what the study does not prove`);
}
assert.match(CHECKED,/^\d{2}\.\d{2}\.2026$/);
// Observational studies are not described as causal.
const steps=STUDIES.find(s=>s.id==='steps');assert(steps.limits.includes('зв’язок')&&steps.limits.includes('не експеримент'),'steps: association, not cause');
// Filtering and the counter.
assert.equal(filterStudies('all').length,STUDIES.length);
assert(filterStudies('move').every(s=>s.topic==='move')&&filterStudies('move').length>=2);
assert(filterStudies('supp').length>=3&&TOPICS.supp==='Добавки','supplements topic holds creatine and protein write-ups');
assert.equal(countLabel(16,16),'Розборів: 16');assert.equal(countLabel(2,16),'Показано 2 із 16');
// Page wiring: pine band with its own motif, one h1, no <header> inside sections, no third-party requests, registered in the catalog.
const html=fs.readFileSync('dist/research.html','utf8');
assert(/<body[^>]* data-pine[ >]/.test(html)&&html.includes('data-motif="hanabishi"'),'pine band with its own motif');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'one h1');assert.equal((html.match(/<header\b/g)||[]).length,1,'only the page header uses <header>');
assert(html.includes('research-page.js?v=6')&&html.includes('research-page.css?v=5')&&html.includes('page-pine.css?v=21'),'assets with versions'); // 2026-10-31: версія піднята, бо стилі/оболонка переведені на токени кольору (палітра «космос / зелений»); зміст сторінки той самий
assert(html.includes('не оцінка Evidence UA і не медична порада'),'the disclaimer is visible');
for(const f of fs.readdirSync('dist').filter(n=>n.startsWith('research')&&n.endsWith('.js')))assert(!/https?:\/\/(?!doi\.org\/|pubmed\.ncbi\.nlm\.nih\.gov\/)/.test(fs.readFileSync('dist/'+f,'utf8').replace(/\/\/ .*$/gm,'')),`${f}: only doi.org and PubMed links (opened by the reader's click)`);
const mats=fs.readFileSync('src/platform/materials.mjs','utf8');assert(mats.includes("'./research.html'")&&mats.includes("'guide-research'"),'the page is in the catalog and the search words');
assert(fs.existsSync('dist/og/research.jpg'),'the share card exists');
// The new motif is defined once.
assert(fs.readFileSync('dist/page-pine.css','utf8').includes('.pb[data-motif="hanabishi"]'),'the hanabishi motif exists');
console.log('Research page: short answers, sourced, limits stated, filter, catalog and share card passed.');
// Другий пакет (2026-10-27, «популярні запити»): креатин, протеїн, кава, сон і вага.
for(const id of ['creatine-rt','creatine-women','protein-supp','coffee','short-sleep-weight'])assert(STUDIES.some(s=>s.id===id),`${id} is in the second batch`);
const coffee=STUDIES.find(s=>s.id==='coffee');assert(coffee.limits.includes('зв’язок')&&coffee.found.includes('вагітність'),'coffee: association only, pregnancy caveat stated');
const sleepW=STUDIES.find(s=>s.id==='short-sleep-weight');assert(sleepW.source.pmid==='26080646'&&sleepW.limits.includes('зв’язок'),'sleep and weight: PubMed link, association only');
assert(fs.readFileSync('dist/research-data.js','utf8').includes('supp:')&&fs.readFileSync('dist/research-page.js','utf8').includes('research-data.js?v=4'),'data version was bumped with the new write-ups');
// Третій пакет (2026-10-27, «на ваш вибір»): підсолоджувачі, інтервальні кардіо, магній і сон, падіння у літньому віці.
for(const id of ['sweeteners','hiit-vs-mict','magnesium-sleep','falls-older'])assert(STUDIES.some(s=>s.id===id),`${id} is in the third batch`);
const sw=STUDIES.find(s=>s.id==='sweeteners');assert(sw.limits.includes('не доводять причину')&&sw.found.includes('спостереженнях')&&sw.found.includes('рандомізованих'),'sweeteners: observational and trial findings kept apart');
const mg=STUDIES.find(s=>s.id==='magnesium-sleep');assert(mg.answer.includes('Поки неясно')&&mg.limits.includes('низька або дуже низька'),'magnesium: honest about weak evidence');
const hiit=STUDIES.find(s=>s.id==='hiit-vs-mict');assert(hiit.limits.includes('короткі'),'HIIT: short-term limit stated');
// Без JavaScript кожен розбір має короткий запис з тим самим id, що й посилання «#id» (і щоб перевірка якорів бачила ці адреси).
for(const x of STUDIES)assert(html.includes(`<li id="${x.id}"><strong>${x.question}</strong> ${x.answer}</li>`),`${x.id}: the no-JavaScript list is in sync with the data`);
