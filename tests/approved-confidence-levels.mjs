// Independent copy of the confidence levels the owner approved on 22.10.2026 («Погоджую»). Not a test file itself.
// null = normative or position-statement Claims that intentionally stay «не оцінено».
import assert from 'node:assert/strict';
export const approvedLevels = {
  'CLM-000009': "moderate",
  'CLM-000010': "moderate",
  'CLM-000053': "low",
  'CLM-000054': "low",
  'CLM-000055': "low",
  'CLM-000056': "low",
  'CLM-000057': "low",
  'CLM-000058': "low",
  'CLM-000059': "low",
  'CLM-000060': "low",
  'CLM-000061': "very_low",
  'CLM-000011': "high",
  'CLM-000062': "high",
  'CLM-000063': "moderate",
  'CLM-000064': "low",
  'CLM-000012': "high",
  'CLM-000065': "moderate",
  'CLM-000066': "moderate",
  'CLM-000067': "high",
  'CLM-000068': "low",
  'CLM-000069': "moderate",
  'CLM-000070': "low",
  'CLM-000071': "moderate",
  'CLM-000072': "moderate",
  'CLM-000073': "low",
  'CLM-000074': "low",
  'CLM-000075': "very_low",
  'CLM-000076': "moderate",
  'CLM-000077': "moderate",
  'CLM-000078': "low",
  'CLM-000079': "moderate",
  'CLM-000080': "low",
  'CLM-000081': null,
  'CLM-000082': "low",
  'CLM-000083': "low",
  'CLM-000084': "moderate",
  'CLM-000085': "moderate",
  'CLM-000086': "very_low",
  'CLM-000087': "low",
  'CLM-000088': null,
  'CLM-000089': "low",
  'CLM-000090': "very_low",
  'CLM-000091': "low",
  'CLM-000092': "low",
  'CLM-000093': "moderate",
  'CLM-000094': "low",
  'CLM-000095': "moderate",
  'CLM-000096': "moderate",
  'CLM-000097': "low",
  'CLM-000098': "low",
  'CLM-000099': "low",
  'CLM-000100': "very_low",
  'CLM-000101': "low",
  'CLM-000102': "low",
  'CLM-000103': null,
  'CLM-000104': "low",
  // 2026-10-26: Muscle Lab outcome Claims, wording and levels approved by the owner («1 так / 2 так»).
  'CLM-000105': "moderate",
  'CLM-000106': "low",
  'CLM-000107': "moderate",
  'CLM-000108': "moderate",
  'CLM-000109': "low",
  'CLM-000110': "very_low",
  'CLM-000111': "moderate",
  'CLM-000112': "low",
  'CLM-000113': "very_low"
};
export function assertApprovedLevel(c) {
  assert(c.id in approvedLevels, 'Claim missing from the approved table: ' + c.id);
  const level = approvedLevels[c.id];
  assert.equal(c.evidenceConfidence, level, c.id);
  if (level === null) { assert.equal(c.confidenceFramework, 'not_assessed', c.id); return; }
  assert.equal(c.confidenceFramework, 'evidenceua_grade_informed_v1', c.id);
  assert.equal(c.provisional, true, c.id);
  assert.equal(c.confidenceAcceptance.kind, 'user_confidence_approval', c.id);
  assert.equal(c.confidenceAcceptance.formalScientificReview, false, c.id);
  assert(c.confidenceRationale.summary.length > 10, c.id);
}
