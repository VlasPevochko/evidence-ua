import assert from 'node:assert/strict';
import test from 'node:test';
import {captionChunkIndex, splitCaptionIntoChunks} from './caption-model.ts';

test('silent caption chunks keep the complete text and stay readable', () => {
  const text = 'Одна порція не насичує м’язи миттєво. Запаси креатину зростають поступово протягом кількох тижнів.';
  const chunks = splitCaptionIntoChunks(text, 6);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks.every((chunk) => chunk.split(/\s+/u).length <= 6));
  assert.equal(chunks.join(' '), text);
});

test('caption chunk index advances and clamps on the final chunk', () => {
  assert.equal(captionChunkIndex(0, 30, 4), 0);
  assert.equal(captionChunkIndex(46, 30, 4), 1);
  assert.equal(captionChunkIndex(999, 30, 4), 3);
});
