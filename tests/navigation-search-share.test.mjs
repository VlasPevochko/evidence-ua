import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';
import {contextLink,findMaterials,materialContext} from '../src/platform/materials.mjs';
import {searchSite} from '../src/platform/search.mjs';
import {exercises,contentTypes,movementPatterns,bodyRegions,equipmentLabels} from '../dist/exercises-data.js';

const base='https://evidence.invalid/project/';
const share=route=>contextLink(base+route);

// Catch missing navigation destinations in both shared search entry points.
for(const [query,file] of [['атлас','atlas.html'],['вправи','exercises.html']]){
 test(`shared search finds the real ${file} page`,()=>{
  const direct=findMaterials(query).find(m=>m.href===`./${file}`);
  assert(direct,`No direct destination for ${query}`);
  assert(fs.existsSync(new URL(`../dist/${file}`,import.meta.url)));
  assert(searchSite({findMaterials},query).materials.some(m=>m.href===`./${file}`));
  assert.equal(materialContext(base+file).id,direct.id);
  assert.match(direct.review,/навігаці/i);
  assert.doesNotMatch(direct.areaTitle,/добавки/i);
 });
}

// Exercise slugs come from the real library, including accepted legacy links.
test('share preserves every known exercise and its legacy slug',()=>{
 assert.equal(share('exercises.html?e=tyaha-hanteli-v-nahili&utm_source=test&email=private%40example.com'),base+'exercises.html?e=tyaha-hanteli-v-nahili');
 for(const item of exercises)for(const slug of [item.slug,...(item.legacySlugs||[])]){
  assert.equal(new URL(share('exercises.html?e='+slug)).searchParams.get('e'),slug);
 }
 assert.equal(share('exercises?e=tyaha-hanteli-v-nahili'),base+'exercises?e=tyaha-hanteli-v-nahili');
});

test('share preserves the supported Atlas zones',()=>{
 assert.equal(share('atlas.html?zone=spine&token=secret'),base+'atlas.html?zone=spine');
 const html=fs.readFileSync(new URL('../dist/atlas.html',import.meta.url),'utf8');
 const zones=[...html.matchAll(/data-zone="([^"]+)"/g)].map(match=>match[1]);
 assert(zones.length>0);
 for(const zone of zones)assert.equal(new URL(share('atlas.html?zone='+zone)).searchParams.get('zone'),zone);
 assert.equal(share('atlas/?zone=spine'),base+'atlas/?zone=spine');
});

test('share preserves supported structured library filters but strips free text',()=>{
 assert.equal(share('exercises.html?region=shoulder&type=strength&pattern=horizontal_pull&equipment=dumbbell&view=type&sort=title&q=private+health+question&email=private%40example.com'),base+'exercises.html?region=shoulder&type=strength&pattern=horizontal_pull&equipment=dumbbell&view=type&sort=title');
 for(const [key,labels] of Object.entries({region:bodyRegions,type:contentTypes,pattern:movementPatterns,equipment:equipmentLabels})){
  for(const value of Object.keys(labels))assert.equal(new URL(share(`exercises.html?${key}=${value}`)).searchParams.get(key),value);
 }
});

test('share drops unknown, malformed, empty and cross-page values',()=>{
 for(const value of ['unknown','__proto__','constructor','','tyaha-hanteli-v-nahili%0A','https%3A%2F%2Fother.invalid']){
  assert.equal(share('exercises.html?e='+value),base+'exercises.html');
  assert.equal(share('atlas.html?zone='+value),base+'atlas.html');
 }
 for(const key of ['region','type','pattern','equipment','view','sort']){
  for(const value of ['unknown','__proto__','constructor','shoulder%0A','']){
   assert.equal(share(`exercises.html?${key}=${value}`),base+'exercises.html');
  }
 }
 assert.equal(share('atlas.html?zone=spine&e=tyaha-hanteli-v-nahili&region=shoulder&q=private#private'),base+'atlas.html?zone=spine');
 assert.equal(share('exercises.html?zone=spine&e=unknown&type=strength&utm_campaign=private#private'),base+'exercises.html?type=strength');
 assert.equal(share('sleep.html?zone=spine&e=tyaha-hanteli-v-nahili&region=shoulder&path=energy&lesson=0'),base+'sleep.html');
});

test('share keeps existing lab and validated learning context while stripping private fields',()=>{
 for(const [input,want] of [
  ['muscle-lab.html?structure=CELL-MUSCLE&level=advanced&tab=sources&email=private#explorer','muscle-lab.html?structure=CELL-MUSCLE&level=advanced&tab=sources#explorer'],
  ['cell-lab.html?organelle=ORG-RIBOSOME&level=school&tab=function&token=secret#cell-canvas','cell-lab.html?organelle=ORG-RIBOSOME&level=school&tab=function#cell-canvas'],
  ['nutrition-inside.html?nutrient=protein&step=2&depth=detailed&scale=cell&structure=pept1&q=private#nutrition-lab','nutrition-inside.html?nutrient=protein&step=2&depth=detailed&scale=cell&structure=pept1#nutrition-lab'],
  ['cell-lab.html?organelle=ORG-MITOCHONDRION&path=energy&lesson=0&utm_source=private#cell-canvas','cell-lab.html?organelle=ORG-MITOCHONDRION&path=energy&lesson=0#cell-canvas'],
  ['muscle-lab.html?structure=UNKNOWN&level=unknown&tab=unknown&path=energy&lesson=0#private','muscle-lab.html']
 ])assert.equal(share(input),base+want);
});
