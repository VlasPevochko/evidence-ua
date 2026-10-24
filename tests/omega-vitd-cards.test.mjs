import assert from 'node:assert/strict';
import {assertApprovedLevel} from './approved-confidence-levels.mjs';
// 2026-10-22: the owner approved provisional confidence levels («Погоджую»); levels now follow tests/approved-confidence-levels.mjs.
import fs from 'node:fs';
import {cards, SupplementCard} from '../scripts/build-supplement-cards.mjs';

const html = fs.readFileSync('dist/index.html', 'utf8');
for (const card of cards) {
  const sid = card.module.route;
  const start = html.indexOf(`id="${sid}"`);
  const section = html.slice(start, html.indexOf('</section>', html.indexOf(`<!-- CARD:${card.key}:END -->`, start)));
  // Rendered output matches the module; the preliminary dossier panel is gone from this section only.
  assert(section.includes(`<!-- CARD:${card.key}:START -->` + SupplementCard(card) + `<!-- CARD:${card.key}:END -->`), sid + ' card is stale; run the build');
  assert(!html.includes(`<!-- DOSSIER:${card.module.replacesDossier} -->`));
  // Science: approved wording, approved provisional confidence, every Claim opens the drawer.
  for (const id of card.module.claimIds) {
    const c = card.base.claims.find(x => x.id === id);
    assertApprovedLevel(c);
    assert.equal(c.publicationAcceptance.formalScientificReview, false);
    assert(section.includes(`data-claim-open="${id}"`));
  }
  assert.equal((section.match(/class="eua-confidence /g) || []).length, card.module.claimIds.filter(id => card.base.claims.find(x => x.id === id).evidenceConfidence).length, 'levels shown exactly for assessed Claims');
  // Safety block title comes from the card config (electrolytes: «Перш ніж пити», 2026-10-22); it must precede the Claims.
  assert(section.includes(card.safetyTitle) && section.indexOf(card.safetyTitle) < section.indexOf('Твердження й докази'));
  assert(section.includes('Чого ми не стверджуємо'));
}
assert.equal((html.match(/data-supplement-cards-script/g) || []).length, 1);
assert.equal((html.match(/<style data-supplement-cards-style>/g) || []).length, 1);

// Omega-3: null cardiovascular results drawn as null; atrial fibrillation drawn as an increase.
const omega = cards.find(c => c.key === 'omega');
const r = (card, id) => card.base.records.find(x => x.id === id).result;
assert.deepEqual([r(omega, 'EVR-000018').estimate, r(omega, 'EVR-000018').lowerCI, r(omega, 'EVR-000018').upperCI], [0.96, 0.92, 1.01]);
assert.deepEqual([r(omega, 'EVR-000130').estimate, r(omega, 'EVR-000131').estimate], [1.25, 1.49]);
const omegaHtml = SupplementCard(omega);
assert.equal((omegaHtml.match(/class="bc-row bc-null"/g) || []).length, 2);
assert.equal((omegaHtml.match(/class="bc-row bc-up"/g) || []).length, 2);
assert(!omegaHtml.includes('REDUCE-IT'), 'No unsourced trial details');

// Vitamin D: the newest fracture review is primary; the rounded Sanders interval uses its reported p-value.
const vitd = cards.find(c => c.key === 'vitd');
assert.deepEqual([r(vitd, 'EVR-000136').estimate, r(vitd, 'EVR-000136').lowerCI, r(vitd, 'EVR-000136').upperCI], [1, 0.95, 1.06]);
assert.equal(vitd.base.records.find(x => x.id === 'EVR-000136').roleForClaim, 'primary_support');
assert.equal(r(vitd, 'EVR-000142').pValue, 0.047);
const vitdHtml = SupplementCard(vitd);
assert(vitdHtml.includes('Переломи, 500 000 МО раз на рік</b><span>1,26 · частіше'));
assert(vitdHtml.includes('Переломи, лише вітамін D</b><span>1,00 · різниці не виявлено'));
assert(fs.readFileSync('dist/evidence/supplement-cards-ui.js', 'utf8').includes('[data-supplement-dialog="'));
for (const k of ['omega', 'vitd']) assert(fs.readFileSync(`dist/evidence/${k}-data.js`, 'utf8').includes("from './registry.js'"));
console.log('Omega-3 and vitamin D cards: approved Claims, approved provisional confidence, null and harmful results drawn honestly passed.');
