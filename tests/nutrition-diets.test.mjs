import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const diets=await import('../scripts/build-nutrition-diets.mjs').catch(()=>({}));
const prefix='<!doctype html><main><section id="nutrition-lab"><script>const kept="α & β";</script><p>Авторський текст.</p></section>\n';
const suffix='\n<section id="nutrition-sources">Джерела й незавершена перевірка.</section></main>';
const start='<!-- EUA_NUTRITION_DIETS_START -->',end='<!-- EUA_NUTRITION_DIETS_END -->';

test('regenerating diet cards preserves the surrounding scientific page and is idempotent',()=>{
 assert.equal(typeof diets.buildNutritionDiets,'function','Diet catalogue builder is missing');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'eua-diets-'));
 try{
  fs.mkdirSync(path.join(root,'dist'));const file=path.join(root,'dist/nutrition.html');
  fs.writeFileSync(file,prefix+start+'Old catalogue'+end+suffix);
  diets.buildNutritionDiets(root);const once=fs.readFileSync(file,'utf8');
  assert.equal(once.slice(0,once.indexOf(start)),prefix);
  assert.equal(once.slice(once.indexOf(end)+end.length),suffix);
  assert(!once.includes('Old catalogue'));
  // Each navigable card has one matching disclosure target, not a dead CTA.
  const ids=[...once.matchAll(/<details[^>]*\bid="(diet-[^"]+)"/g)].map(m=>m[1]);
  assert(ids.length>1);assert.equal(new Set(ids).size,ids.length);
  for(const id of ids)assert(once.includes('href="#'+id+'"'));
  diets.buildNutritionDiets(root);assert.equal(fs.readFileSync(file,'utf8'),once);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('missing or ambiguous catalogue markers fail without altering the existing page',()=>{
 assert.equal(typeof diets.buildNutritionDiets,'function','Diet catalogue builder is missing');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'eua-diets-'));
 try{
  fs.mkdirSync(path.join(root,'dist'));const file=path.join(root,'dist/nutrition.html');
  for(const source of [prefix+suffix,prefix+start+'one'+end+start+'two'+end+suffix]){
   fs.writeFileSync(file,source);assert.throws(()=>diets.buildNutritionDiets(root),/marker/i);
   assert.equal(fs.readFileSync(file,'utf8'),source);
  }
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
