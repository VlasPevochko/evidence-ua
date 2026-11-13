import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog, learningHref, learningLocation} from '../src/platform/catalog.mjs';
import {exercises} from '../dist/exercises-data.js';
import {contextLink} from '../src/platform/materials.mjs';

const route = catalog.paths.find(path => path.id === 'shoulder');
assert(route, 'The shoulder has a continuous learning route');
assert.equal(route.steps.length, 6);
const destinations = route.steps.map(catalog.resolveStep);
const base = 'https://evidence.invalid/evidence-ua/';
const urls = destinations.map((_, index) => new URL(learningHref('shoulder', index), base));
assert.equal(urls[0].searchParams.get('zone'), 'shoulder');
assert.equal(urls[0].searchParams.get('tab'), 'anatomy');
assert.equal(urls[0].hash, '#atlas-detail');
assert.equal(urls[1].hash, '#lesson-shoulder');
assert.equal(urls[4].hash, '#evidence-guide-title');
assert.equal(urls[5].hash, '#sources');
assert.equal(urls[5].pathname, '/evidence-ua/movement.html');

assert.deepEqual(urls.slice(2,4).map(url => exercises.find(item => item.slug === url.searchParams.get('e'))?.id),
  ['practice_scapular_activation_control', 'practice_rotator_cuff_complex']);
for (const url of urls) {
  assert(learningLocation(url.href), `Recognizes ${url.href}`);
  const html = fs.readFileSync('dist/' + url.pathname.split('/').pop(), 'utf8');
  // The evidence guide is mounted by navigation-v17.js; the browser flow checks its real target.
  if (url.hash && url.hash !== '#evidence-guide-title') assert(html.includes(`id="${url.hash.slice(1)}"`), `Existing anchor ${url.hash}`);
  assert(learningLocation(contextLink(url.href)), 'Sharing preserves the exact route destination');
}
for (const [index, key, wrong] of [[0,'zone','knee'], [0,'tab','training'], [2,'e','rotatorna-manzheta-kompleks']]) {
  const url = new URL(urls[index]);
  url.searchParams.set(key, wrong);
  assert.equal(learningLocation(url.href), null, 'Different content cannot claim route progress');
  url.searchParams.delete(key);
  assert.equal(learningLocation(url.href), null, 'Missing required content parameters are rejected');
}
// Existing entity-specific routes must also reject a different selected organelle.
assert.equal(learningLocation('https://evidence.invalid/cell-lab.html?path=energy&lesson=0&organelle=ORG-RIBOSOME#cell-canvas'), null);
for (const file of ['atlas','exercises']) {
  const html = fs.readFileSync(`dist/${file}.html`, 'utf8');
  assert(html.includes(learningHref('shoulder',0).replaceAll('&','&amp;')), `${file} has a real route entry`);
}
for (const id of ['practice_scapular_activation_control','practice_rotator_cuff_complex']) {
  const item = exercises.find(item => item.id === id);
  assert.equal(item.editorial.reviewStatus, 'video_checked');
  assert.equal(item.editorial.claimReviewStatus, 'not_assessed');
  assert.deepEqual(item.relatedClaimIds, []);
  assert.deepEqual(item.relatedSourceIds, []);
}
console.log('Shoulder route: real targets, exact content matching, reusable exercises and unchanged review states passed.');
