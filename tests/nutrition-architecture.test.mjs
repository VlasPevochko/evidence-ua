// 2026-10-26 Muscle Lab guide: catalog/materials gained muscle units and search words → versions cascade (catalog/materials/tools/shell/directions/home-feedback 98→99, site-header 5→6, search 3→4).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const sha=s=>createHash('sha256').update(s).digest('hex');
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/nutrition-architecture-preservation.json','utf8'));
const hub=()=>fs.readFileSync('dist/nutrition.html','utf8');

test('the home Nutrition entry opens the hub rather than bypassing it into physiology',()=>{
 const links=JSON.parse(execFileSync('python',['-c',`from pathlib import Path
from lxml import html
import json
root=html.fromstring(Path('dist/index.html').read_text(encoding='utf-8'))
print(json.dumps(root.xpath('//a[strong[normalize-space(.)="Розібрати харчування"]]/@href')))
`],{encoding:'utf8'}));
 assert.deepEqual(links,['./nutrition.html'],'general Nutrition choices must let the visitor choose a branch');
});

test('Nutrition retains the diets and offers the physiology branch without loading its models',()=>{
 const html=hub();
 assert(html.includes('href="./nutrition-inside.html"'),'the physiology branch must open from Nutrition');
 assert(html.includes('href="#nutrition-diets"'));
 for(const id of ['nutrition-fat-burning','nutrition-lab','nutrient-time','nutrition-evidence','nutrition-sources'])assert(!html.includes(`id="${id}"`),`${id} belongs on the physiology page`);
 assert(!/src="(?:\.\/)?nutrition-(?:lab|timeline)\.js/.test(html),'the entry must not boot missing model controls');
 const b=baseline.blocks.diets;assert.equal(sha(html.slice(html.indexOf(b.start),html.indexOf(b.end)+b.end.length)),b.sha256,'all diet research must be retained verbatim');
});

test('moved mechanisms, scientific SVGs and source disclosures retain their exact original blocks',()=>{
 assert(fs.existsSync('dist/nutrition-inside.html'),'the physiology page must exist');
 const html=fs.readFileSync('dist/nutrition-inside.html','utf8');
 for(const [name,b] of Object.entries(baseline.blocks).filter(([n])=>n!=='diets')){
  let end=html.indexOf(b.end,html.indexOf(b.start))+b.end.length;
  // Nested sections belong to the timeline, so bound complete top-level blocks by the next section.
  const next={lab:'<section class="nl-timeline"',timeline:'<section id="nutrition-evidence"',evidence:'<section id="nutrition-sources"',sources:'<footer class="nl-footer"'}[name];
  if(next)end=html.indexOf(next,html.indexOf(b.start));
  assert.equal(sha(html.slice(html.indexOf(b.start),end).trim()),b.sha256,name+' must be moved without rewriting');
 }
 // page-pine.css v16 -> v17 (компактні банери, рішення власника 2026-10-25): лише версія в query-рядку, зміст сторінок той самий. fat-burning-pine.css v2 -> v3 (компактний банер, 2026-10-25): так само лише версія.
 // Shared UI cache revisions only: the authored physiology controller is otherwise compared byte-for-byte.
 for(const [file,hash] of Object.entries(baseline.files))assert.equal(sha(file.endsWith('.html')?fs.readFileSync(file,'utf8').replaceAll('fat-burning.js?v=5','fat-burning.js?v=4').replaceAll('platform-shell.js?v=100','platform-shell.js?v=97').replaceAll('site-header.js?v=7','site-header.js?v=4').replaceAll('digestion-viewer.js?v=3','digestion-viewer.js?v=1').replaceAll('page-pine.css?v=17','page-pine.css?v=16').replaceAll('fat-burning-pine.css?v=3','fat-burning-pine.css?v=2').replaceAll('./nutrition-inside.html#nutrition-lab','./nutrition.html#nutrition-lab').replaceAll('./nutrition-inside.html?nutrient=','./nutrition.html?nutrient='):file==='dist/nutrition-lab.js'?fs.readFileSync(file,'utf8').replace("'./evidence/components.js?v=2.1'","'./evidence/components.js?v=55'"):fs.readFileSync(file)),hash,file+' changed outside the authorized move');
 assert(!html.includes('id="nutrition-diets"'));
});

test('old Nutrition URLs preserve valid model state and the deployment subdirectory',async()=>{
 const {nutritionDestination}=await import('../src/nutrition/navigation.mjs').catch(()=>({}));
 assert.equal(typeof nutritionDestination,'function','legacy model links need their routing function');
 const cases=[
  ['https://example.test/evidence-ua/nutrition.html#nutrition-lab','https://example.test/evidence-ua/nutrition-inside.html#nutrition-lab'],
  ['https://example.test/evidence-ua/nutrition.html?nutrient=protein&step=2&scale=cell#nutrition-lab','https://example.test/evidence-ua/nutrition-inside.html?nutrient=protein&step=2&scale=cell#nutrition-lab'],
  ['https://example.test/nutrition.html?scale=body#nutrition-lab','https://example.test/nutrition-inside.html?scale=body#nutrition-lab'],
  ['https://example.test/nutrition.html#nutrient-time','https://example.test/nutrition-inside.html#nutrient-time'],
  ['https://example.test/nutrition.html#nutrition-diets',null],
  ['https://example.test/nutrition.html?nutrient=protein#diet-vegan',null],
  ['https://example.test/nutrition.html?utm_source=test',null],
  ['https://example.test/nutrition.html?step=999',null],
  ['https://example.test/nutrition-inside.html#nutrition-lab',null]
 ];
 for(const [input,want] of cases)assert.equal(nutritionDestination(input),want,input);
});

test('share links and discovery resolve the new physiology page without dropping selected state',async()=>{
 const {contextLink,findMaterials}=await import('../src/platform/materials.mjs');
 assert.equal(contextLink('https://example.test/evidence-ua/nutrition-inside.html?nutrient=lipids&step=3&scale=cell&token=private#nutrition-lab'),'https://example.test/evidence-ua/nutrition-inside.html?nutrient=lipids&step=3&scale=cell#nutrition-lab');
 assert(findMaterials('дієти').some(m=>m.href==='./nutrition.html#nutrition-diets'));
 assert(findMaterials('усмоктування').some(m=>m.href.startsWith('./nutrition-inside.html')));
});

test('the utility disclosure dismisses on Escape/outside clicks and leaves active dialogs in control',async()=>{
 const {mountNutritionNavigation}=await import('../src/nutrition/navigation.mjs');
 const handlers=new Map(),windowHandlers=new Map();
 let dialogOpen=false,focusReturned=false,redirected=null;
 const inside={closest:()=>null};
 const menu={open:true,contains:node=>node===inside,querySelector:()=>({focus(){focusReturned=true;}})};
 const root={body:{dataset:{}},defaultView:{location:{href:'https://example.test/nutrition.html#nutrient-time',replace(value){redirected=value;}},addEventListener(name,fn){windowHandlers.set(name,fn);}},querySelector:()=>dialogOpen?{}:null,querySelectorAll:()=>menu.open?[menu]:[],addEventListener(name,fn){handlers.set(name,fn);}};
 mountNutritionNavigation(root);
 assert.equal(redirected,'https://example.test/nutrition-inside.html#nutrient-time');
 handlers.get('keydown')({key:'Escape',preventDefault(){}});assert(!menu.open);assert(focusReturned);
 menu.open=true;dialogOpen=true;handlers.get('keydown')({key:'Escape'});assert(menu.open,'Escape belongs to an active dialog');
 handlers.get('click')({target:{closest:()=>({})}});assert(menu.open,'clicking in a dialog must preserve its hidden opener');
 dialogOpen=false;handlers.get('click')({target:{closest:()=>null}});assert(!menu.open,'outside click dismisses the disclosure');
 menu.open=true;handlers.get('click')({target:inside});assert(menu.open,'an inside click keeps controls usable');
 root.body.dataset.euaFocus='true';handlers.get('keydown')({key:'Escape'});assert(menu.open,'study mode receives Escape first');
});
