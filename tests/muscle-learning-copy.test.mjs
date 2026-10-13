import assert from 'node:assert/strict';
import test from 'node:test';
import {structures} from '../src/muscle-lab/module.mjs';

// A missing level selector is reported as a failed contract, rather than an import error.
const api=await import('../src/muscle-lab/learning-copy.mjs').catch(error=>{
 if(error.code==='ERR_MODULE_NOT_FOUND')return {};
 throw error;
});

test('structure explanations change with the chosen learning level for all six scales',()=>{
 assert.equal(typeof api.structureLearningCopy,'function','Level-specific explanations are not implemented');
 const copy=api.structureLearningCopy;
 assert.equal(structures.length,6);
 for(const structure of structures){
  for(const tab of ['description','function']){
   const university=copy(structure,tab,'university');
   const school=copy(structure,tab,'school');
   const advanced=copy(structure,tab,'advanced');
   assert.equal(university,structure[tab],`${structure.id}: keep the existing university explanation`);
   assert(school.length>0&&school.length<university.length,`${structure.id}: school explanation must be shorter`);
   assert(advanced.length>university.length,`${structure.id}: advanced explanation must add context`);
   assert.notEqual(school,advanced);
   assert(!/[<>]/.test(school+advanced),'Copy is plain text for the controller to escape');
  }
  assert.notEqual(copy(structure,'description','school'),copy(structure,'function','school'));
  assert.notEqual(copy(structure,'description','advanced'),copy(structure,'function','advanced'));
 }
});

test('unknown learning levels use the existing university text without mutating structure data',()=>{
 assert.equal(typeof api.structureLearningCopy,'function');
 const before=structuredClone(structures);
 for(const structure of structures){
  for(const tab of ['description','function']){
   for(const invalidLevel of [undefined,null,'','unknown','sources',{},42]){
    assert.equal(api.structureLearningCopy(structure,tab,invalidLevel),structure[tab]);
   }
  }
 }
 assert.deepEqual(structures,before);
});

test('unrecognized structures and non-copy tabs return no prose',()=>{
 assert.equal(typeof api.structureLearningCopy,'function');
 for(const level of ['school','university','advanced']){
  for(const structure of [undefined,null,'STRUCT-FASCICLE',{}, {id:'UNKNOWN',description:'unexpected',function:'unexpected'}, {id:'__proto__',description:'unexpected',function:'unexpected'}, {id:structures[0].id}]){
   assert.equal(api.structureLearningCopy(structure,'description',level),'');
  }
  for(const tab of [undefined,null,'sources','unknown','__proto__',42]){
   assert.equal(api.structureLearningCopy(structures[0],tab,level),'');
  }
 }
});
