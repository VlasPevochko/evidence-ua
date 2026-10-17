import assert from 'node:assert/strict';
import test from 'node:test';
import {evidenceTheme} from './theme.ts';

test('Evidence UA video theme mirrors current site tokens', () => {
  assert.deepEqual(evidenceTheme, {
    background: '#0d0f12',
    surface: '#14171c',
    accent: '#e7bd46',
    text: '#f4f2ed',
    muted: '#aeb2ba',
    fontFamily: 'Inter, Arial, sans-serif',
  });
});
