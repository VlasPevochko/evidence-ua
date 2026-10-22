// Caffeine card (owner chose «Кофеїн» 21.10.2026, eight Claims approved «Так»). Shared card checks live in omega-vitd-cards.test.mjs.
import assert from 'node:assert/strict';
import {assertApprovedLevel} from './approved-confidence-levels.mjs';
// 2026-10-22: the owner approved provisional confidence levels («Погоджую»); levels now follow tests/approved-confidence-levels.mjs.
import fs from 'node:fs';
import {cards, SupplementCard} from '../scripts/build-supplement-cards.mjs';
import {caffeineBase, caffeineModule} from '../src/evidence/supplements/caffeine/module.mjs';

const html = fs.readFileSync('dist/index.html', 'utf8');
const card = cards.find(c => c.key === 'caffeine');
assert(card && card.scale === 'linear');
const start = html.indexOf('id="supplement-caffeine"');
const section = html.slice(start, html.indexOf('</section>', html.indexOf('<!-- CARD:caffeine:END -->', start)));
assert(section.includes('<!-- CARD:caffeine:START -->' + SupplementCard(card) + '<!-- CARD:caffeine:END -->'), 'caffeine card is stale; run the build');

// Old preliminary content is gone: dossier panel, study block and its unsourced «95%» note.
assert(!html.includes('<!-- DOSSIER:DOS-CAFFEINE -->'));
for (const old of ['caffeine-evidence-block', 'caffeine-metric-a', 'id="caffeine-source"']) assert(!html.includes(old), old);
assert(section.includes('class="d-nav"'), 'switching between supplements stays');

// Science: eight approved Claims, not assessed; IDs do not collide with other bases.
assert.equal(caffeineModule.claimIds.length, 8);
assert.equal(caffeineModule.replacesDossier, 'DOS-CAFFEINE');
for (const id of caffeineModule.claimIds) {
  const c = caffeineBase.claims.find(x => x.id === id);
  assertApprovedLevel(c);
  assert.equal(c.publicationAcceptance.kind, 'user_wording_approval');
}
for (const other of cards.filter(c => c.key !== 'caffeine')) for (const c of other.base.claims) assert(!caffeineModule.claimIds.includes(c.id));

// Numbers come from records (PubMed abstracts) and render on the chart.
const r = id => caffeineBase.records.find(x => x.id === id).result;
const ci = id => [r(id).estimate, r(id).lowerCI, r(id).upperCI];
assert.deepEqual(ci('EVR-000165'), [-0.27, -0.44, -0.11]);
assert.deepEqual(ci('EVR-000166'), [-0.52, -0.77, -0.28]);
assert.deepEqual(ci('EVR-000168'), [0.20, 0.03, 0.36]);
assert.deepEqual(ci('EVR-000177'), [4.71, 2.97, 6.45]);
assert.deepEqual(ci('EVR-000178'), [9.02, 4.25, 13.79]);
const chart = section.slice(section.indexOf('class="bc-forest"'), section.indexOf('</ul>', section.indexOf('class="bc-forest"')));
assert.equal((chart.match(/<li class="bc-row/g) || []).length, 9);
assert.equal((chart.match(/ · швидше/g) || []).length, 2, 'shorter time is labelled as faster, not «менше»');
assert.equal((chart.match(/class="bc-row bc-up"/g) || []).length, 2, 'blood pressure rows are drawn as a rise');
// The jump interval touches 0 after rounding; the reported p = 0,047 decides (as for Sanders 2010).
assert.equal(r('EVR-000169').lowerCI, 0); assert.equal(r('EVR-000169').pValue, 0.047);
assert(!chart.includes('bc-null'), 'no row here crosses zero');
assert(section.includes('кожен рядок має власну шкалу'));
// The leg-strength subgroup (crosses zero) is kept in the evidence, not hidden.
assert(ci('EVR-000170')[1] < 0 && ci('EVR-000170')[2] > 0);

// Safety first; energy drinks are named as such; EFSA is a regulatory opinion with its provenance stated.
const safety = section.slice(section.indexOf('Перш ніж приймати'), section.indexOf('Твердження й докази'));
for (const s of ['сон', '200 мг', 'тиск', 'Підлітки']) assert(safety.includes(s), s);
assert(section.includes('(енергетики)'));
const efsa = caffeineBase.sources.find(s => s.id === 'SRC-000092');
assert.equal(efsa.publicationType, 'regulatory_opinion'); assert.equal(efsa.pmid, null); assert(efsa.methodsSummary.includes('EUFIC'));
assert(section.includes('Регуляторний висновок'));
// No external requests before a click.
assert(!/<(img|iframe|script)[^>]+src="https?:/.test(section));

console.log('Caffeine card: 8 approved Claims, 9 chart rows from records, honest labels, safety and provenance checks passed.');
