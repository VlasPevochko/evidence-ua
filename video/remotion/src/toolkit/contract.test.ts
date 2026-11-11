import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEditPlan, type EditPlan} from './contract.ts';
const valid = (): EditPlan => ({id:'sample', durationSeconds:20, assets:[{id:'cat', kind:'lottie', file:'stickers/cat.json', provenance:'Original Evidence UA animation', usageRights:'Owned', approved:true}], inserts:[{id:'hook', fromSeconds:3, durationSeconds:2, assetId:'cat', layout:'split50', approved:true}]});
test('an approved local insert is accepted',()=>assert.deepEqual(validateEditPlan(valid()),[]));
test('missing assets and unapproved inserts prevent production',()=>{ const p=valid(); p.inserts[0].assetId='missing'; p.inserts[0].approved=false; assert.equal(validateEditPlan(p).length,2); });
test('out-of-range timing prevents production',()=>{ const p=valid(); p.inserts[0].durationSeconds=30; assert.match(validateEditPlan(p).join(),/outside timeline/); });
test('remote links and traversal are not production assets',()=>{ for(const file of ['https://example.com/cat.json','../cat.json','/tmp/cat.json']) { const p=valid(); p.assets[0].file=file; assert.match(validateEditPlan(p).join(),/local public-relative/); } });
test('usage rights, provenance and duplicate IDs must be resolved',()=>{ const p=valid(); p.assets[0].usageRights=''; p.assets.push({...p.assets[0]}); assert.ok(validateEditPlan(p).length>=3); });
