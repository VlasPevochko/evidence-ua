import assert from 'node:assert/strict';
import fs from 'node:fs';
import {proteinBase, proteinModule} from '../src/evidence/supplements/protein/module.mjs';
import {ProteinCard} from '../scripts/build-protein.mjs';

const html = fs.readFileSync('dist/index.html', 'utf8');
const start = html.indexOf('id="supplement-protein"');
const section = html.slice(start, html.indexOf('</section>', html.indexOf('<!-- PROTEIN:END -->', start)));

// Rendered output matches the module; no stale dossier panel or old controller.
assert(section.includes('<!-- PROTEIN:START -->' + ProteinCard() + '<!-- PROTEIN:END -->'), 'Protein card is stale; run the build');
assert(!html.includes('<!-- DOSSIER:DOS-PROTEIN -->'));
assert(!html.includes("querySelectorAll('button.protein-choice')"));
assert.equal((html.match(/data-protein-script/g) || []).length, 1);
assert.equal((html.match(/<style data-protein-style>/g) || []).length, 1);

// Science: five approved Claims, no confidence level shown, no invented certainty.
assert.equal(proteinModule.claimIds.length, 5);
for (const id of proteinModule.claimIds) {
  const c = proteinBase.claims.find(x => x.id === id);
  assert.equal(c.evidenceConfidence, null);
  assert.equal(c.publicationAcceptance.formalScientificReview, false);
  assert(section.includes(`data-claim-id="${id}"`));
  assert(section.includes(`data-claim-open="${id}"`));
}
assert(!/class="eua-confidence/.test(section), 'No confidence badge before assessment');
assert(section.includes('Рівень впевненості не оцінено'));

// Key numbers trace to Evidence Records extracted from Morton 2018 / Tagawa 2022.
const r = id => proteinBase.records.find(x => x.id === id).result;
assert.deepEqual([r('EVR-000016').estimate, r('EVR-000016').lowerCI, r('EVR-000016').upperCI], [2.49, 0.64, 4.33]);
assert.deepEqual([r('EVR-000017').estimate, r('EVR-000017').lowerCI, r('EVR-000017').upperCI], [0.30, 0.09, 0.52]);
assert.deepEqual([r('EVR-000104').estimate, r('EVR-000104').lowerCI, r('EVR-000104').upperCI], [1.62, 1.03, 2.20]);
assert(r('EVR-000106').lowerCI < 0 && r('EVR-000106').upperCI > 0, 'No-training effect interval crosses zero');
for (const text of ['+2,49 кг', '+0,3 кг', '1,03–2,2', 'ефекту не виявлено', 'Чого ми не стверджуємо', 'Час прийому', 'Найкращий вид білка'])
  assert(section.includes(text), 'Missing: ' + text);
// Nunes leg-strength SMD 0.40 has an inconsistent printed CI and must not be used.
assert(!proteinBase.records.some(x => x.result.estimate === 0.40));

// Navigation and retained links.
for (const link of ['href="protein-meta.html"', 'href="#creatine"', 'href="#top"', 'pubmed.ncbi.nlm.nih.gov/28698222/'])
  assert(section.includes(link), 'Missing link: ' + link);
assert.equal(fs.readFileSync('dist/evidence/protein-ui.js', 'utf8').includes("dialogSelector: '[data-protein-dialog]'"), true);
assert(fs.readFileSync('dist/evidence/protein-data.js', 'utf8').includes("from './registry.js'"));

console.log('Protein card: 5 approved Claims, confidence not assessed, traceable numbers, retained navigation, idempotent markers passed.');
