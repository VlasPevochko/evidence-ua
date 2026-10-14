import assert from 'node:assert/strict';
import test from 'node:test';
import {CREATINE_COMPOSITION} from './composition.ts';

test('CreatineJourney composition contract is 1080x1920, 30 fps, 59 seconds', () => {
  assert.deepEqual(CREATINE_COMPOSITION, {
    id: 'CreatineJourney',
    width: 1080,
    height: 1920,
    fps: 30,
    durationSeconds: 59,
    durationInFrames: 1770,
    language: 'uk',
  });
});
