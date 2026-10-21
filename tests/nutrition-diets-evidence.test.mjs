import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dietCards} from '../src/nutrition-diets/catalog.mjs';
import {evidence,recommendation,EVIDENCE_CHECKED} from '../src/nutrition-diets/evidence.mjs';

// Покази, протипокази й позиція редакції (рішення власника 2026-10-21).
// Раніше картки лише описували підходи й казали «розбір готується»; тепер вони переказують опубліковані огляди з DOI.
// Тому тут охороняємо чесність: кожна картка має джерела, ключові числа не «пливуть», немає обіцянок, власних рівнів впевненості не вигадано.
const html=fs.readFileSync('dist/nutrition.html','utf8');
const section=html.slice(html.indexOf('<!-- EUA_NUTRITION_DIETS_START -->'),html.indexOf('<!-- EUA_NUTRITION_DIETS_END -->'));
const text=JSON.stringify([evidence,recommendation]);

assert.deepEqual(Object.keys(evidence).sort(),dietCards.map(d=>d.id).sort(),'every diet card has an evidence block, nothing extra');
assert.equal((section.match(/class="nd-evidence"/g)||[]).length,dietCards.length,'every card renders it');
for(const [id,e] of Object.entries(evidence)){
  assert(e.findings.length>=1&&e.fits.length>=1&&e.cautions.length>=1,`${id}: findings, indications and cautions are present`);
  for(const [t,ref] of e.findings){assert(t.length>40,`${id}: finding is a sentence`);assert(/^https:\/\/doi\.org\/10\.\d{4,9}\//.test(ref.href),`${id}: finding has a DOI link`);}
  for(const ref of e.cautionRefs)assert(/^https:\/\/doi\.org\/10\./.test(ref.href),`${id}: caution source is a DOI`);
}
// Sources for sourced cautions: keto, vegan, vegetarian, intermittent fasting and Mediterranean must cite something.
for(const id of ['mediterranean','ketogenic','vegan','vegetarian','intermittent-fasting','high-protein'])assert(evidence[id].cautionRefs.length>=1,`${id}: cautions cite a source`);
// Diets with no sourced contraindication say so instead of inventing any.
for(const id of ['dash','low-carb'])assert(evidence[id].cautions[0].includes('не означає, що їх немає'),`${id}: honest «none found»`);
// Key numbers, as in the abstracts (PubMed, checked 2026-10-21). If one is changed, re-check the source.
for(const n of ['OR 0,52','OR 0,63','OR 0,77','HR 0,60','3,56','0,61 кг/м²','2,48 см','3,6 кг','4,7/2,9','356','100%','97%','1,96 кг','120 осіб','12 людей','10 054','12 461'])assert(text.includes(n),`key number ${n} is present`);
for(const k of ['піруваткарбоксилаза','панкреатит','вагітність','сульфонілсечовина','гіпоглікемія'])assert(evidence.ketogenic.cautions.join(' ').includes(k),`keto cautions mention ${k}`);
// No promises, no invented confidence.
assert(!/гарантує|вилікує|лікує|допоможе схуднути|найкраща дієта|найефективніша|точно знизить/i.test(text),'no promises');
assert(!/GRADE:|рівень впевненості:|високий рівень/i.test(text),'no Evidence UA confidence level is invented');
assert.equal(EVIDENCE_CHECKED,'21.10.2026');
assert(section.includes('Це не оцінка Evidence UA')&&section.includes('порадьтеся з лікарем'),'the card states that this is not an Evidence UA rating and not a prescription');
assert(!section.includes('Розбір ефективності готується'),'the old «coming soon» line is gone from the cards');
// Editorial position: visible above the cards, honest about limits, labelled as the editors' stance.
assert(section.indexOf('id="nd-recommend"')>0&&section.indexOf('id="nd-recommend"')<section.indexOf('class="nd-grid"'),'the recommendation sits above the cards');
assert(recommendation.note.includes('не лікарська порада')&&recommendation.note.includes('а не як найшвидший спосіб схуднути'),'stance is labelled and not about speed');
assert(recommendation.limits.includes('3,56')&&recommendation.limits.includes('не обіцяє')&&recommendation.limits.includes('низька або помірна'),'limits are stated');
assert.equal(recommendation.reasons.length,3);
assert(section.includes('href="#diet-mediterranean"'),'the position links to the Mediterranean card');
// Every outgoing link is safe; nothing third-party loads by itself.
for(const m of section.matchAll(/<a [^>]*href="https?:[^>]*>/g))assert(m[0].includes('rel="noopener noreferrer"'),`safe link: ${m[0].slice(0,90)}`);
const css=fs.readFileSync('dist/nutrition-diets.css','utf8');
assert(css.includes('.nd-fit')&&css.includes('.nd-recommend')&&/max-width:760px\)\{\.nd-evidence/.test(css),'styled, with a phone layout');
assert(html.includes('nutrition-diets.css?v=89'),'the stylesheet version was bumped');
console.log('Diet evidence: every card has sourced findings, indications and cautions; key numbers, honest limits and the editorial position passed.');
