import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {nutritionClaims,nutritionSources,nutritionEvidenceRecords,nutritionModuleProposal,validateNutritionProposal,assertNutritionProposalPublishable} from '../src/evidence/nutrition/module-proposal.mjs';

assert.deepEqual(validateNutritionProposal(),{claims:8,sources:4,records:9,routes:3,publicationApproved:false});
assert.throws(assertNutritionProposalPublishable,/NOT approved/);
const clone=value=>structuredClone(value);
let records=clone(nutritionEvidenceRecords);records[0].sourceId='SRC-UNKNOWN';
assert.throws(()=>validateNutritionProposal({records}),/Unresolved evidence link/);
let claims=clone(nutritionClaims);claims[0].evidenceConfidence='HIGH';
assert.throws(()=>validateNutritionProposal({claims}),/Premature scientific approval/);
claims=clone(nutritionClaims);claims[0].lastReviewed='2026-10-11';
assert.throws(()=>validateNutritionProposal({claims}),/Premature scientific approval/);
const module=clone(nutritionModuleProposal);module.routes[0].steps[0].claimIds=['CLM-UNKNOWN'];
assert.throws(()=>validateNutritionProposal({module}),/Unresolved route claim/);
assert(nutritionEvidenceRecords.filter(r=>r.sourceId==='SRC-000023').every(r=>r.roleForClaim==='context_only'));
assert.equal(nutritionSources.find(s=>s.id==='SRC-000024').studyDesign,'cloning_and_heterologous_expression');
assert(nutritionClaims.every(c=>c.evidenceLayer==='mechanistic'&&c.evidenceConfidence===null));

// No public files or build entries may reference the review proposal.
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
for(const file of [...walk('dist'),...walk('scripts')].filter(f=>/\.(?:js|mjs|html|json)$/.test(f)))assert(!fs.readFileSync(file,'utf8').includes('module-proposal'),'Public/build reference to draft: '+file);
// A reusable guard against accidental reuse of a public/source ID.
const tracked=execFileSync('git',['ls-files','src/evidence'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of tracked.filter(f=>!f.startsWith('src/evidence/nutrition/'))){
  const text=fs.readFileSync(file,'utf8');
  for(const candidate of [...nutritionClaims,...nutritionSources,...nutritionEvidenceRecords])assert(!text.includes(candidate.id),'Scientific ID collision: '+candidate.id+' in '+file);
}
console.log('Nutrition proposal: 8 Claims, 4 sources, 9 linked records, 3 routes; rejected broken links/false confidence and verified public isolation.');
