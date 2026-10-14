import assert from 'node:assert/strict';
import test from 'node:test';
import {ATP_REACTION_LABELS, QUALITATIVE_SATURATION_MILESTONES} from './model.ts';

test('ATP reaction labels are explicit and stable', () => {
  assert.deepEqual(ATP_REACTION_LABELS, {phosphocreatine: 'PCr', substrate: 'ADP', product: 'ATP'});
});

test('saturation timeline is qualitative and has no percentage values', () => {
  assert.deepEqual(QUALITATIVE_SATURATION_MILESTONES, ['День 1', '7', '14', '21', '28']);
  assert.equal(QUALITATIVE_SATURATION_MILESTONES.some((item) => item.includes('%')), false);
});
