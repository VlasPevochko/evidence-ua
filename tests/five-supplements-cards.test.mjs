// Magnesium, collagen, beta-alanine, citrulline, electrolytes (owner «Всі» and «Так», 22.10.2026).
// Shared card checks (approved wording, unassessed confidence, safety before Claims) live in omega-vitd-cards.test.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cards, SupplementCard} from '../scripts/build-supplement-cards.mjs';

const html = fs.readFileSync('dist/index.html', 'utf8');
const keys = ['magnesium', 'collagen', 'beta-alanine', 'citrulline', 'electrolytes'];
const counts = {magnesium: 5, collagen: 4, 'beta-alanine': 4, citrulline: 4, electrolytes: 4};
const allIds = new Set();
const section = k => {const s = html.indexOf(`id="supplement-${k}"`); return html.slice(s, html.indexOf('</section>', html.indexOf(`<!-- CARD:${k}:END -->`, s)));};
const chart = sec => sec.slice(sec.indexOf('class="bc-forest"'), sec.indexOf('</ul>', sec.indexOf('class="bc-forest"')));
const r = (card, id) => card.base.records.find(x => x.id === id).result;

for (const k of keys) {
  const card = cards.find(c => c.key === k), sec = section(k);
  assert(card, k);
  assert.equal(card.module.claimIds.length, counts[k], k);
  assert.equal(card.approvedOn, '22 жовтня 2026 року');
  assert(sec.includes(`<!-- CARD:${k}:START -->` + SupplementCard(card) + `<!-- CARD:${k}:END -->`), k + ' card is stale; run the build');
  assert(!html.includes(`<!-- DOSSIER:${card.module.replacesDossier} -->`), k + ' preliminary dossier is gone');
  assert(sec.includes('class="d-nav"') && sec.includes('href="#supplement-berberine"'), k + ' keeps the supplement switcher');
  for (const id of card.module.claimIds) {assert(!allIds.has(id), 'unique Claim ' + id); allIds.add(id);}
  assert(!/<(img|iframe|script)[^>]+src="https?:/.test(sec));
}
assert.equal(allIds.size, 21, 'all 21 approved Claims are published');

// Magnesium: cramps drawn as null; blood pressure and sleep latency labelled as improvements; UL provenance stated.
const mg = cards.find(c => c.key === 'magnesium'), mgChart = chart(section('magnesium'));
assert.deepEqual([r(mg, 'EVR-000186').estimate, r(mg, 'EVR-000186').lowerCI, r(mg, 'EVR-000186').upperCI], [-2.00, -3.58, -0.43]);
assert.equal((mgChart.match(/class="bc-row bc-null"/g) || []).length, 2, 'both cramp rows cross zero');
assert(mgChart.includes('· нижчий') && mgChart.includes('· швидше'));
assert(mg.base.sources.find(s => s.id === 'SRC-000098').keyLimitations[0].includes('конфлікт інтересів'));

// Collagen: rows without a reported interval are hollow points with the reported p-value, never an invented bar.
const colChart = chart(section('collagen'));
const noci = colChart.split('<li').filter(li => li.includes('bc-noci'));
assert.equal(noci.length, 3);
for (const li of noci) {assert(!li.includes('class="bc-ci"')); assert(li.includes('ДІ не наведено · p &lt; 0,01'));}
assert(section('collagen').includes('шкала в анотації не названа'));

// Beta-alanine: performance tests and body composition are null; paraesthesia odds kept off the linear chart.
const ba = cards.find(c => c.key === 'beta-alanine'), baChart = chart(section('beta-alanine'));
assert.equal((baChart.match(/class="bc-row bc-null"/g) || []).length, 3);
assert(!baChart.includes('8,9'));
assert.equal(r(ba, 'EVR-000204').intervalType, 'Байєсівський інтервал вірогідності');

// Citrulline: three null rows; the retracted blood-pressure meta-analysis is named, not used.
const ciSec = section('citrulline');
assert.equal((chart(ciSec).match(/class="bc-row bc-null"/g) || []).length, 3);
assert(ciSec.includes('відкликано'));
assert(cards.find(c => c.key === 'citrulline').base.claims.find(c => c.id === 'CLM-000100').evidenceSummary.includes('p = 0,25'));

// Electrolytes: 90% compatibility intervals are labelled as 90%, not as a 95% CI; overdrinking warning comes first.
const elSec = section('electrolytes'), elChart = chart(elSec);
assert.equal((elChart.match(/90% інтервал \+/g) || []).length, 2);
assert(!elChart.includes('95% ДІ'));
assert(elSec.includes('90% інтервал (так подано в джерелі)'));
assert(elSec.indexOf('Не перепивай') < elSec.indexOf('Твердження й докази'));

console.log('Five supplement cards: 21 approved Claims, honest null rows, no invented intervals, provenance notes passed.');
