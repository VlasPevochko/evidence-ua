import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildNutritionFatBurning} from '../scripts/build-nutrition-fat-burning.mjs';
import {fatBurningEntryHTML} from '../src/nutrition-fat-burning/entry.mjs';

const start='<!-- EUA_NUTRITION_FAT_BURNING_START -->',end='<!-- EUA_NUTRITION_FAT_BURNING_END -->';

test('featured Fat Burning Lab is prominent in Nutrition and directly navigable',()=>{
 const html=fs.readFileSync('dist/nutrition-inside.html','utf8');
 const markup=fatBurningEntryHTML();
 assert(html.includes(start+markup+end),'published HTML must match the canonical generated entry');
 // Owner-approved architecture: mechanisms move together, diets remain on the Nutrition entry.
 assert(html.indexOf('id="nutrition-fat-burning"')<html.indexOf('id="nutrition-lab"'),'fat entry must precede the lab');
 assert(!html.includes('id="nutrition-diets"'));
 assert(html.includes('href="#nutrition-fat-burning" class="nf-nav"'),'direct nutrition anchor is present');
 assert.equal((markup.match(/href="\.\/fat-burning\.html"/g)||[]).length,1,'featured card has one real CTA');
 assert(html.includes('href="./nutrition-fat-burning.css?v=3"'),'cache-busted styling'); // 2026-10-31: версія піднята, бо стилі/оболонка переведені на токени кольору (палітра «космос / зелений»); зміст сторінки той самий
 assert(fs.existsSync('dist/fat-burning.html'));
 const css=fs.readFileSync('dist/nutrition-fat-burning.css','utf8');
 assert(css.includes('@media(max-width:760px)'),'mobile layout is required');
 assert(css.includes('prefers-reduced-motion'),'motion accessibility is required');
});

test('entry generator is idempotent and never alters neighboring science content',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'eua-feature-entry-'));
 try{
  fs.mkdirSync(path.join(root,'dist'));
  const file=path.join(root,'dist/nutrition-inside.html');
  const before='<div>Авторське пояснення</div>'+start+'placeholder'+end+'<section>Джерела й Claims</section>';
  fs.writeFileSync(file,before);
  buildNutritionFatBurning(root);
  const built=fs.readFileSync(file,'utf8');
  assert(built.startsWith('<div>Авторське пояснення</div>'));
  assert(built.endsWith('<section>Джерела й Claims</section>'));
  assert(built.includes(start+fatBurningEntryHTML()+end));
  buildNutritionFatBurning(root);
  assert.equal(fs.readFileSync(file,'utf8'),built);
  for(const invalid of ['no slot',start+'one'+end+start+'two'+end]){
   fs.writeFileSync(file,invalid);
   assert.throws(()=>buildNutritionFatBurning(root),/marker/i);
   assert.equal(fs.readFileSync(file,'utf8'),invalid);
  }
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
