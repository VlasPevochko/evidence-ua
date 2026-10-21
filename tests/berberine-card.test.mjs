import assert from 'node:assert/strict';
import fs from 'node:fs';
import {berberineBase, berberineModule} from '../src/evidence/supplements/berberine/module.mjs';
import {BerberineCard} from '../scripts/build-berberine.mjs';

const html = fs.readFileSync('dist/index.html', 'utf8');
const start = html.indexOf('<section aria-label="Берберин: пояснення та дослідження" id="supplement-berberine">');
assert(start > html.indexOf('id="supplement-electrolytes"'), 'Berberine section follows the other dossiers');
const section = html.slice(start, html.indexOf('</section>', html.indexOf('<!-- BERBERINE:END -->', start)));

// Rendered output matches the module; build is idempotent through markers.
assert(section.includes('<!-- BERBERINE:START -->' + BerberineCard() + '<!-- BERBERINE:END -->'), 'Berberine card is stale; run the build');
assert.equal((html.match(/data-berberine-script/g) || []).length, 1);
assert.equal((html.match(/<style data-berberine-style>/g) || []).length, 1);
assert(html.includes('body:has(#supplement-berberine:target)>#supplement-berberine{display:block!important}'), 'Opens without JavaScript');
assert(html.includes('#supplement-electrolytes,#supplement-berberine)'), 'Shares the dossier page styles');

// Science: six approved Claims, no confidence level, numbers traceable to records.
assert.equal(berberineModule.claimIds.length, 6);
for (const id of berberineModule.claimIds) {
  const c = berberineBase.claims.find(x => x.id === id);
  assert.equal(c.evidenceConfidence, null);
  assert.equal(c.publicationAcceptance.formalScientificReview, false);
  assert(section.includes(`data-claim-open="${id}"`));
}
assert(!/class="eua-confidence/.test(section));
const r = id => berberineBase.records.find(x => x.id === id).result;
assert.deepEqual([r('EVR-000111').estimate, r('EVR-000111').lowerCI, r('EVR-000111').upperCI], [-0.52, -0.72, -0.33]);
assert.deepEqual([r('EVR-000115').estimate, r('EVR-000116').estimate, r('EVR-000119').estimate], [-0.367, -0.495, -0.88]);
// Null results are shown as null: HDL and systolic pressure intervals cross zero and are drawn muted.
for (const id of ['EVR-000117', 'EVR-000118']) assert(r(id).lowerCI < 0 && r(id).upperCI > 0);
assert.equal((section.match(/class="bc-row bc-null"/g) || []).length, 2);
assert.equal((section.match(/class="bc-row"/g) || []).length, 5);
// Safety comes before the Claims and names the three risks.
const safety = section.indexOf('Перш ніж приймати');
assert(safety > 0 && safety < section.indexOf('Твердження й докази'));
for (const text of ['Приймаєш ліки?', 'гіпоглікемії', 'Вагітність, годування груддю, немовлята', 'Замінює метформін', 'Це не рекомендація дози'])
  assert(section.includes(text), 'Missing: ' + text);
// The mechanistic safety Claim stays labelled as laboratory data.
assert.equal(berberineBase.claims.find(c => c.id === 'CLM-000061').evidenceLayer, 'mechanistic');
// Author attribution checked against PubMed (Liu, not Li).
assert.equal(berberineBase.sources.find(s => s.id === 'SRC-000058').shortCitation, 'Liu D et al. · 2025');

// Entry points: home chip, catalogue row with its own photo, search terms, catalog unit.
assert(html.includes('<a href="#supplement-berberine"><i class="se-thumb se-thumb-berberine"'));
assert(fs.readFileSync('dist/platform-catalog.js', 'utf8').includes("['berberine','Берберин']"));
assert(fs.readFileSync('dist/platform-materials.js', 'utf8').includes("'supplements-berberine':"));
assert(fs.readFileSync('dist/evidence/berberine-ui.js', 'utf8').includes("dialogSelector: '[data-berberine-dialog]'"));
assert(fs.readFileSync('dist/evidence/berberine-data.js', 'utf8').includes("from './registry.js'"));
console.log('Berberine card: 6 approved Claims, confidence not assessed, null results shown as null, safety first, entry points wired passed.');
