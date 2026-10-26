import assert from 'node:assert/strict';
import {SourceCard, EvidenceDrawer} from '../src/evidence/core/components.mjs';
import {collagenBase} from '../src/evidence/supplements/collagen/module.mjs';
import {citrullineBase} from '../src/evidence/supplements/citrulline/module.mjs';

// Missing bounds in the real records must stay missing in both scientific views.
for (const base of [collagenBase, citrullineBase]) {
  for (const record of base.records.filter(r => r.result?.estimate != null && r.result.lowerCI === null && r.result.upperCI === null)) {
    const source = base.sources.find(s => s.id === record.sourceId);
    for (const html of [SourceCard(source, [record]), EvidenceDrawer(record.claimId, base)]) {
      assert(!html.includes('95% ДІ 0–0'), `${record.id}: missing bounds must not become a zero interval`);
      assert(html.includes('ДІ: див. першоджерело'), `${record.id}: missing bounds need an explicit fallback`);
    }
  }
}

const record = collagenBase.records[0];
const source = collagenBase.sources.find(s => s.id === record.sourceId);
const render = (lowerCI, upperCI) => SourceCard(source, [{...record, result: {...record.result, lowerCI, upperCI}}]);
for (const [low, high] of [[undefined, undefined], [null, null], [null, 1], [0, undefined], ['0', '1'], [NaN, 1], [-Infinity, 1], [0, Infinity]]) {
  assert(render(low, high).includes('ДІ: див. першоджерело'), `Non-numeric or incomplete interval: ${low}, ${high}`);
}
for (const [low, high, expected] of [[0, 0.5, '0–0,5'], [-0.5, 0, '-0,5–0'], [0, 0, '0–0']]) {
  const html = render(low, high);
  assert(html.includes(`95% ДІ ${expected}`), 'Genuine numeric zero bounds must remain visible');
  assert(!html.includes('ДІ: див. першоджерело'));
}
console.log('Evidence intervals: real missing records, drawer/source agreement, finite bounds and genuine zeros passed.');
