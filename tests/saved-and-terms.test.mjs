import assert from 'node:assert/strict';
import fs from 'node:fs';
import {savedFromStorage,toggleSaved,SAVED_KEY,SAVED_MAX} from '../src/platform/next-steps.mjs';
import {TERMS,TERM_SCOPES,findTerm} from '../src/platform/terms.mjs';

// «Мій список» і підказки до термінів (рішення власника 2026-10-20).
assert.equal(SAVED_KEY,'eua-saved-v1');
assert.deepEqual(savedFromStorage(null),[]);assert.deepEqual(savedFromStorage('{'),[]);assert.deepEqual(savedFromStorage('{"a":1}'),[]);
assert.deepEqual(savedFromStorage(JSON.stringify([{href:'sleep.html',title:' Сон '},{href:'javascript:alert(1)',title:'x'},{href:'//evil.example/a.html',title:'x'},{href:'a.html?x=1',title:'x'},{href:'ok.html',title:''}])),[{href:'sleep.html',title:'Сон'}],'only plain local pages with a title are accepted');
let list=[];const sleep={href:'sleep.html',title:'Сон'},nut={href:'nutrition.html',title:'Харчування'};
list=toggleSaved(list,sleep);list=toggleSaved(list,nut);assert.deepEqual(list.map(i=>i.href),['nutrition.html','sleep.html'],'newest first');
list=toggleSaved(list,sleep);assert.deepEqual(list.map(i=>i.href),['nutrition.html'],'toggling again removes');
let many=[];for(let i=0;i<SAVED_MAX+5;i++)many=toggleSaved(many,{href:`p${i}.html`,title:'t'+i});assert.equal(many.length,SAVED_MAX,'the list is capped');

// Terms: every definition is anchored in wording that already exists on the site, and every source is a known reference.
const norm=t=>t.replace(/[’‘ʼ]/g,"'").replace(/\s+/g,' ');
const site=norm(['dist/navigation-v17.js','dist/fat-burning.html','dist/fat-burning.js','dist/evidence-trainer.js','dist/index.html'].map(f=>fs.readFileSync(f,'utf8')).join(' '));
const anchors={rkd:'РКД — рандомізоване контрольоване дослідження',meta:'не перетворює будь-який висновок на істину',ci:'нуль означає відсутність різниці',smd:'не вимірюється в кілограмах',i2:'не «відсоток поганих досліджень»',grade:'не рейтинг «добавки загалом»',triglycerides:'а не речовина, яка просто «тане»',lipolysis:'не тотожний втраті жиру'};
assert.deepEqual(TERMS.map(t=>t.id).sort(),Object.keys(anchors).sort());
for(const t of TERMS){
  assert(site.includes(norm(anchors[t.id])),`${t.id}: the definition rests on existing site wording «${anchors[t.id]}»`);
  assert(/^https:\/\/(www\.cochrane\.org\/authors\/handbooks-and-manuals\/handbook\/current\/chapter-\d\d|www\.bmj\.com\/content\/349\/bmj\.g7257)$/.test(t.source.href),`${t.id}: source is one the site already uses`);
  assert(t.definition.length>40&&t.definition.length<400,`${t.id}: short enough for a hint`);
  // «не гарантує» (заперечення) дозволене, обіцянка «гарантує» — ні.
  assert(!/слід приймати|допоможе|лікує|(?<!не )гарантує/.test(t.definition),`${t.id}: no promise wording`);
}
// Matching is strict: whole words only, case where it matters.
const ci=TERMS.find(t=>t.id==='ci'),rkd=TERMS.find(t=>t.id==='rkd'),meta=TERMS.find(t=>t.id==='meta');
assert.equal(findTerm('95% довірчий інтервал (ДІ)',ci).text,'95% довірчий інтервал');
assert.equal(findTerm('У РКД перевір рандомізацію',rkd).text,'РКД');
assert.equal(findTerm('Метааналіз об’єднує результати',meta).text,'Метааналіз');
assert.equal(findTerm('дослідження показало',ci),null,'«ді» inside a word is not a term');
assert.equal(findTerm('ДІАГНОЗ',ci),null,'«ДІ» as a prefix is not a term');
assert.equal(findTerm('РКДА',rkd),null);
for(const f of Object.keys(TERM_SCOPES))assert(fs.existsSync('dist/'+f),`${f} exists`);
assert(!/https?:\/\//.test(fs.readFileSync('src/platform/terms.mjs','utf8').replace(/https:\/\/(www\.cochrane\.org|www\.bmj\.com)[^'"]*/g,'')),'no other external addresses');
console.log('Saved list and term hints: strict storage, capped list, definitions rest on site wording passed.');
