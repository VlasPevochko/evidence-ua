import assert from 'node:assert/strict';
import test from 'node:test';
import {SourceCard, EvidenceDrawer} from '../src/evidence/core/components.mjs';
import {betaAlanineBase} from '../src/evidence/supplements/beta-alanine/module.mjs';
import {electrolytesBase} from '../src/evidence/supplements/electrolytes/module.mjs';
import {proteinBase} from '../src/evidence/supplements/protein/module.mjs';

// Exercise source renderers directly: no build or shared generated output is needed.
const proteinRecord = proteinBase.records.find(r => r.id === 'EVR-000104');
const singleRecordBase = record => ({...proteinBase, records: [record]});
function views(record, base = singleRecordBase(record)) {
  const source = base.sources.find(s => s.id === record.sourceId);
  return [SourceCard(source, [record]), EvidenceDrawer(record.claimId, base)];
}
function methodology(record) {
  const html = EvidenceDrawer(record.claimId, singleRecordBase(record));
  const match = html.match(/<details([^>]*)><summary>Рівень 3 · Записи доказів та методологія<\/summary>([\s\S]*?)<\/details>/);
  assert(match, 'Outcome methodology must remain available in details');
  assert(!/\bopen\b/.test(match[1]), 'Methodology must stay folded initially');
  return {html, details: match[2], outside: html.replace(match[0], '')};
}

test('EVR-000204 preserves its Bayesian interval in source cards and outcome drawers', () => {
  const record = betaAlanineBase.records.find(r => r.id === 'EVR-000204');
  for (const html of views(record, betaAlanineBase)) {
    assert(html.includes('95% Байєсівський інтервал вірогідності 2,2–32,6'));
    assert(!html.includes('95% ДІ 2,2–32,6'));
    assert(html.includes('<b>8,9 '));
  }
});

test('a stored interval label that includes its level does not duplicate the percentage', () => {
  const record = electrolytesBase.records.find(r => r.id === 'EVR-000213');
  for (const html of views(record, electrolytesBase)) {
    assert(html.includes('90% інтервал сумісності 0,1–2'));
    assert(!html.includes('90% 90%'));
    assert(!html.includes('90% ДІ'));
  }
});

test('ordinary confidence intervals preserve genuine zero limits and stored confidence levels', () => {
  for (const [lowerCI, upperCI, confidenceLevel, expected] of [
    [0, 0.5, undefined, '95% ДІ 0–0,5'],
    [-0.5, 0, 90, '90% ДІ -0,5–0'],
    [0, 0, 95, '95% ДІ 0–0'],
  ]) {
    const record = {...proteinRecord, result: {...proteinRecord.result, lowerCI, upperCI, confidenceLevel}};
    for (const html of views(record)) assert(html.includes(expected));
  }
});

test('unknown interval labels are preserved and HTML escaped', () => {
  const record = {...proteinRecord, result: {...proteinRecord.result, intervalType: '<custom> & "label"'}};
  for (const html of views(record)) {
    assert(html.includes('95% &lt;custom&gt; &amp; &quot;label&quot; 1,03–2,2'));
    assert(!html.includes('<custom>'));
  }
});

test('missing or partial limits never become a numeric interval or lose their stored type', () => {
  for (const [lowerCI, upperCI] of [[null, null], [undefined, undefined], [null, 1], [0, undefined], ['0', '1'], [NaN, 1], [-Infinity, 1], [0, Infinity]]) {
    for (const intervalType of [undefined, 'Байєсівський інтервал вірогідності']) {
      const record = {...proteinRecord, result: {...proteinRecord.result, intervalType, lowerCI, upperCI}};
      for (const html of views(record)) {
        assert(html.includes(`${intervalType || 'ДІ'}: див. першоджерело`));
        assert(!html.includes('ДІ 0–0'));
        assert(!html.includes('NaN') && !html.includes('Infinity'));
      }
    }
  }
});

test('EVR-000104 shows its existing population and extraction locator only in folded methodology', () => {
  const {details, outside} = methodology(proteinRecord);
  for (const text of ['42 групи досліджень, 723 учасники; p = 0,079', 'PMC5867436, Break point analysis / Figure 5']) {
    assert(details.includes(text));
    assert(!outside.includes(text));
  }
});

test('outcome methodology supports string context and structured extraction locations', () => {
  const record = {...proteinRecord, populationContext: 'Учасники контрольної підгрупи', extractionLocator: undefined,
    extractionLocation: {section: 'Results', table: 'Table 2', figure: 'Figure 3', page: '14', quote: 'Reported subgroup', checkedAt: '2026-10-18'}};
  const {details, outside} = methodology(record);
  for (const text of ['Учасники контрольної підгрупи', 'Results', 'Table 2', 'Figure 3', '14', 'Reported subgroup', '2026-10-18']) {
    assert(details.includes(text), `Missing stored metadata: ${text}`);
    assert(!outside.includes(text), `Metadata escaped folded section: ${text}`);
  }
});

test('outcome metadata escapes context, locator and every structured location value', () => {
  const record = {...proteinRecord, populationContext: {description: '<context> & "group"'}, extractionLocator: '<locator> & "source"',
    extractionLocation: {section: '<section>', table: '<table>', figure: '<figure>', page: '<page>', quote: '<quote>', checkedAt: '<checkedAt>'}};
  const {details} = methodology(record);
  assert(details.includes('&lt;context&gt; &amp; &quot;group&quot;'));
  assert(details.includes('&lt;locator&gt; &amp; &quot;source&quot;'));
  for (const key of ['section', 'table', 'figure', 'page', 'quote', 'checkedAt']) {
    assert(details.includes(`&lt;${key}&gt;`));
    assert(!details.includes(`<${key}>`));
  }
});

test('unavailable outcome metadata is omitted without invented values', () => {
  for (const populationContext of [undefined, null, '', {}, {description: ''}]) {
    const {details} = methodology({...proteinRecord, populationContext, extractionLocator: '', extractionLocation: {section: null, quote: ''}});
    assert(!details.includes('Контекст запису:'));
    assert(!details.includes('Де в джерелі:'));
    assert(!details.includes('undefined') && !details.includes('[object Object]'));
    assert(!details.includes('не внесено') && !details.includes('не завершено</p><p>Де'));
  }
});
