import assert from 'node:assert/strict';
import { updateSearch, updateCandidates } from '../src/evidence/supplements/update-search-draft.mjs';
assert.equal(updateSearch.systematicSearchCompleted, false);
assert.equal(updateSearch.publicationApproved, false);
assert.equal(new Set(updateCandidates.map(c => c.topic)).size, 9);
assert.equal(new Set(updateCandidates.map(c => c.id)).size, updateCandidates.length);
assert.equal(new Set(updateCandidates.map(c => c.pmid)).size, updateCandidates.length);
for (const c of updateCandidates) {
  assert.equal(c.evidenceConfidence, null);
  assert.equal(c.publicationApproved, false);
  assert.equal(c.reviewStatus, 'pending');
  assert.match(c.url, /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/);
  assert.ok(c.question && c.caution && c.access);
}
console.log('Update discovery draft: 9 topics; no approved scientific updates.');
