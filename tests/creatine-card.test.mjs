// Creatine card (owner request 2026-10-21 «Після виконуємо картку креатин», eight additional Claims approved «Погоджую»).
import assert from 'node:assert/strict';
import {assertApprovedLevel} from './approved-confidence-levels.mjs';
// 2026-10-22: the owner approved provisional confidence levels («Погоджую»); levels now follow tests/approved-confidence-levels.mjs.
import fs from 'node:fs';
import {creatineMoreBase as more, creatineMoreModule as moreModule} from '../src/evidence/supplements/creatine-more/module.mjs';
import {creatineMoreParts} from '../scripts/build-creatine-more.mjs';
import {mountEvidenceDrawer} from '../src/evidence/core/components.mjs';

const html = fs.readFileSync('dist/index.html', 'utf8');
const start = html.indexOf('<section id="creatine"');
const section = html.slice(start, html.indexOf('<dialog id="eua-evidence-dialog"', start));
const {evidenceBase: base} = await import('../dist/evidence/data.js');

// Rendered output matches the builder; build is idempotent through markers.
const parts = await creatineMoreParts();
for (const [key, content] of Object.entries({TOP: parts.top, CLAIMS: parts.claims, NOT: parts.not, SOURCES: parts.sources}))
  assert(section.includes(`<!-- CREATINE-MORE:${key}:START -->${content}<!-- CREATINE-MORE:${key}:END -->`), key + ' is stale; run the build');
assert.equal((html.match(/data-creatine-more-script/g) || []).length, 1);
assert.equal((html.match(/<style data-creatine-more-style>/g) || []).length, 1);

// Order on the page: effects → safety → existing Claims → new Claims → dosing → kidneys → not claimed → folded blocks.
const at = s => {const i = section.indexOf(s); assert(i >= 0, 'missing ' + s); return i;};
const order = ['Що змінюється', 'Перш ніж приймати', 'id="evidence-card"', 'data-creatine-more', 'id="creatine-dosing"', 'id="creatine-kidney"', 'Чого ми не стверджуємо', 'id="creatine-mechanism"', 'id="creatine-myths"', 'id="creatine-sources"', 'Шукати нові дослідження в PubMed', 'id="creatine-reviewed"'];
for (let i = 1; i < order.length; i++) assert(at(order[i - 1]) < at(order[i]), order[i - 1] + ' before ' + order[i]);
assert(section.includes('<details class="cr-fold" id="creatine-more-claims">'), 'additional Claims are folded');
for (const id of ['creatine-mechanism', 'creatine-myths', 'creatine-sources']) assert(section.includes(`<details class="eua-block cr-fold" id="${id}">`), id + ' is folded');
assert(!section.includes('class="topline"'), 'old library topline removed');
assert(!section.includes('eua-section-nav'), 'one control per action: no in-page section menu');

// Existing eight Claims keep their confidence levels (frozen claims.ts); all are shown with a badge and an evidence button.
for (const c of base.claims) {
  assert.notEqual(c.evidenceConfidence, null, c.id + ' keeps its level');
  const card = section.slice(section.indexOf(`data-claim-id="${c.id}"`));
  assert(card.indexOf('eua-confidence') < card.indexOf('</article>'), c.id + ' shows its level');
  assert(section.includes(`data-claim-open="${c.id}"`));
}

// New eight Claims: approved wording, confidence not assessed, every number traceable to a record.
assert.equal(moreModule.claimIds.length, 8);
for (const id of moreModule.claimIds) {
  const c = more.claims.find(x => x.id === id);
  assertApprovedLevel(c);
  assert.equal(c.publicationAcceptance.kind, 'user_wording_approval');
  assert.equal(c.publicationAcceptance.formalScientificReview, false);
  assert(parts.claims.includes(`data-claim-open="${id}"`));
  assert(!base.claims.some(x => x.id === id), 'IDs do not collide with the existing base');
}
assert(!parts.claims.includes('Рівень впевненості не оцінено') && parts.claims.includes('eua-confidence eua-very_low'));
const r = (b, id) => b.records.find(x => x.id === id).result;
assert.deepEqual([r(more, 'EVR-000149').estimate, r(more, 'EVR-000149').lowerCI, r(more, 'EVR-000149').upperCI], [-0.07, -0.32, 0.18]);
assert.deepEqual([r(more, 'EVR-000150').estimate, r(more, 'EVR-000150').lowerCI, r(more, 'EVR-000150').upperCI], [0.31, 0.18, 0.45]);
assert.deepEqual([r(more, 'EVR-000153').estimate, r(more, 'EVR-000153').lowerCI, r(more, 'EVR-000153').upperCI], [0.31, 0.18, 0.44]);

// Chart honesty: intervals crossing zero are muted «різниці не виявлено»; rows without a reported CI draw no bar.
const chart = parts.top.slice(0, parts.top.indexOf('</ul>'));
assert.equal((chart.match(/<li class="bc-row/g) || []).length, 7);
assert.equal((chart.match(/class="bc-row bc-null"/g) || []).length, 2, 'endurance and measured kidney filtration');
assert.equal((chart.match(/cr-noci/g) || []).length, 2, 'upper/lower body strength have no CI in the source record');
assert.equal((chart.match(/ДІ не наведено/g) || []).length, 2);
for (const li of chart.split('<li').filter(x => x.includes('cr-noci'))) assert(!li.includes('bc-ci"'), 'no invented interval');
assert(!/<svg[^>]*>[^<]*<text/.test(parts.top), 'labels are HTML, not SVG text');

// Safety block names kidneys/lab test, teenagers, pregnancy.
for (const s of ['креатинін', 'хвороба нирок', 'Підліток', 'вагітність']) assert(parts.top.toLowerCase().includes(s.toLowerCase()), s);
// Regulatory source is labelled as such; no external request before a click (only links).
assert(parts.sources.includes('Регуляторний висновок'));
assert(!/<(img|iframe|script)[^>]+src="https?:/.test(section));

// The nested block has its own drawer: the outer drawer ignores Claims it does not know and does not react to the inner close button.
function fakeDialog() {
  const content = {innerHTML: ''}, close = {focus() {}};
  return {open: false, opened: 0, closed: 0, content, contains: n => n === close || n === content, closeBtn: close,
    querySelector: s => s === '[data-evidence-content]' ? content : close,
    showModal() {this.open = true; this.opened++;}, close() {this.open = false; this.closed++;}, addEventListener() {}, getBoundingClientRect: () => ({})};
}
function fakeRoot(dialog) {
  let handler; return {querySelector: () => dialog, addEventListener: (t, h) => {handler = h;}, click: target => handler({target})};
}
const target = (opener, closer) => ({closest: s => s === '[data-claim-open]' ? opener : s === '[data-evidence-close]' ? closer : null});
const outerDialog = fakeDialog(), innerDialog = fakeDialog();
for (const d of [outerDialog, innerDialog]) d.closeBtn.closest = s => s === 'dialog' ? d : null;
const outer = fakeRoot(outerDialog), inner = fakeRoot(innerDialog);
mountEvidenceDrawer(outer, base); mountEvidenceDrawer(inner, more, {dialogSelector: '[data-creatine-more-dialog]'});
const newOpener = {dataset: {claimOpen: 'CLM-000068'}, focus() {}};
inner.click(target(newOpener, null)); outer.click(target(newOpener, null));
assert.equal(innerDialog.opened, 1); assert.equal(outerDialog.opened, 0, 'outer drawer ignores a foreign Claim');
assert(innerDialog.content.innerHTML.includes('CLM-000068') || innerDialog.content.innerHTML.length > 100);
const innerClose = target(null, innerDialog.closeBtn);
inner.click(innerClose); outer.click(innerClose);
assert.equal(innerDialog.closed, 1); assert.equal(outerDialog.closed, 0, 'outer drawer ignores the inner close button');
const oldOpener = {dataset: {claimOpen: 'CLM-000001'}, focus() {}};
outer.click(target(oldOpener, null)); inner.click(target(oldOpener, null));
assert.equal(outerDialog.opened, 1); assert.equal(innerDialog.opened, 1);

console.log('Creatine card: order, folded blocks, 8+8 Claims, honest chart, safety and nested drawer checks passed.');
