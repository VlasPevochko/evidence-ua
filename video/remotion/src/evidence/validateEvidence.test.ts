import assert from 'node:assert/strict';
import test from 'node:test';
import {validateEvidenceData} from './validateEvidence.ts';
import {creatineJourneyData} from '../compositions/creatine-journey/data.ts';

test('valid claim/source map passes', () => {
  assert.doesNotThrow(() => validateEvidenceData(creatineJourneyData));
});

test('unknown source ID throws and names the claim', () => {
  assert.throws(
    () =>
      validateEvidenceData({
        claims: {
          'bad-claim': {
            id: 'bad-claim',
            display: '≈95%',
            meaning: 'test',
            sourceIds: ['missing-source'],
          },
        },
        sources: {},
      }),
    /bad-claim.*missing-source/,
  );
});

test('numeric display with no sources is rejected', () => {
  assert.throws(
    () =>
      validateEvidenceData({
        claims: {
          'unsourced-number': {
            id: 'unsourced-number',
            display: '3–5 г / день',
            meaning: 'test',
            sourceIds: [],
          },
        },
        sources: {},
      }),
    /unsourced-number.*source/i,
  );
});

test('structural non-numeric copy may be unsourced', () => {
  assert.doesNotThrow(() =>
    validateEvidenceData({
      claims: {
        brand: {
          id: 'brand',
          display: 'Докази замість міфів',
          meaning: 'brand copy',
          sourceIds: [],
        },
      },
      sources: {},
    }),
  );
});
