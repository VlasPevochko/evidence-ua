import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {digestionBase} from '../src/evidence/nutrition/digestion/module.mjs';

// Catches missing educational content, broken references and accidentally regraded/reworded reused physiology.
const dataPath=path.resolve('src/evidence/atlas/foundations.mjs');
assert.ok(fs.existsSync(dataPath),'Brain and GI foundations must have a canonical reference module');
const {atlasFoundationBase,foundationModules,foundationTabs}=await import(pathToFileURL(dataPath));
const {renderFoundation,renderFoundationTemplates}=await import('../src/atlas/foundations.mjs');

assert.deepEqual(Object.keys(foundationModules).sort(),['brain','gut']);
assert.deepEqual(foundationTabs,['overview','anatomy','research']);
assert.equal(atlasFoundationBase.claims.length,4,'Only the four existing digestion Claims are reused; no unreviewed outcome Claim is added');
for(const id of ['CLM-000049','CLM-000050','CLM-000051','CLM-000052']){
 const original=digestionBase.claims.find(x=>x.id===id),reused=atlasFoundationBase.claims.find(x=>x.id===id);
 assert.equal(reused,original,'Reused physiology must retain its original object, wording and provenance');
 assert.equal(reused.evidenceConfidence,null);
 assert.deepEqual(atlasFoundationBase.records.filter(x=>x.claimId===id),digestionBase.records.filter(x=>x.claimId===id));
}
const sources=new Map(atlasFoundationBase.sources.map(x=>[x.id,x]));
for(const id of ['SRC-000121','SRC-000122','SRC-000123']){
 const source=sources.get(id);
 assert.ok(source,'A checked educational reference must be registered');
 assert.equal(source.publicationType,'educational_reference');
 assert.equal(source.year,null,'Undated reference pages must not acquire a made-up publication year');
 assert.equal(source.readingScope,'full_page');
 assert.equal(source.lastChecked,'2026-11-14');
 const url=new URL(source.url);
 assert.ok(['www.ninds.nih.gov','www.niddk.nih.gov'].includes(url.hostname));
 assert.equal(url.protocol,'https:');
}
for(const [zone,module] of Object.entries(foundationModules)){
 assert.equal(module.status,'beta');
 assert.equal(module.scientificReview,'pending');
 assert.ok(module.lessons.length>=4);
 assert.ok(module.parts.length>=4);
 for(const item of [...module.lessons,...module.parts,...(module.helpers||[])]){
  assert.ok(item.title&&item.body,'A visible topic must contain a real explanation');
  assert.ok(item.sourceIds.length>0,'Every factual item must expose its source');
  for(const id of item.sourceIds)assert.ok(sources.has(id),'Source references must resolve');
 }
 const anatomy=renderFoundation(zone,'anatomy');
 for(const part of module.parts){
  assert.ok(anatomy.includes('data-foundation-choice="'+part.id+'"'),'Every anatomy part must be reachable with an HTML control');
  assert.ok(anatomy.includes('data-foundation-part="'+part.id+'"'),'Every control must have a readable explanation');
  assert.ok(anatomy.includes(part.title));
 }
 assert.doesNotMatch(anatomy,/\shidden(?:[\s=>])/,'Facts must be visible before optional enhancement');
 assert.doesNotMatch(anatomy,/<svg[\s\S]*?<text[\s>]/,'Diagram labels must remain HTML');
 for(const tab of foundationTabs){
  const html=renderFoundation(zone,tab);
  assert.ok(html.length>300,'A visible tab must have content, not a placeholder');
  assert.doesNotMatch(html,/<script|\son(?:click|error|load)=/i);
  assert.doesNotMatch(html,/https?:[^"']+\.(?:png|webp|svg)/i,'No remote diagram assets');
 }
 const research=renderFoundation(zone,'research');
 assert.match(research,/Навчальн/);
 assert.match(research,/не завершено/);
 assert.doesNotMatch(research,/висока впевненість|науковий перегляд завершено/i);
}
assert.deepEqual(foundationModules.gut.parts.map(x=>x.id),['mouth','esophagus','stomach','small-intestine','large-intestine','rectum']);
assert.deepEqual(foundationModules.gut.helpers.map(x=>x.id),['liver','gallbladder','pancreas'],'Helper organs stay outside the path food travels');
const gut=renderFoundation('gut','overview');
assert.match(gut,/CLM-000052/);
assert.match(gut,/алергі/);
for(const claim of atlasFoundationBase.claims)assert.ok(renderFoundation('gut','research').includes(claim.statement),'Full borrowed statements must remain available with their references');
assert.equal(renderFoundation('unknown','overview'),'');
assert.equal(renderFoundation('brain','rehab'),'');
const templates=renderFoundationTemplates();
for(const zone of ['brain','gut'])for(const tab of foundationTabs)assert.ok(templates.includes('id="atlas-foundation-'+zone+'-'+tab+'"'));
assert.match(templates,/<noscript[\s>]/);
assert.ok(templates.includes('Мозок')&&templates.includes('ШКТ'));
// 2026-11-14: new terms must lead to actual educational modules, with honest public status.
const {findMaterials}=await import('../src/platform/materials.mjs');
for(const [term,id] of [['мозочок','brain'],['синапс','brain'],['гіпоталамус','brain'],['лактоза','gut'],['тонка кишка','gut'],['всмоктування','gut']]){
 const result=findMaterials(term).find(m=>m.id==='atlas-zone-'+id);
 assert.ok(result,'discoverable term: '+term);
 assert.match(result.review,/Науковий перегляд не завершено/);
}
const about=fs.readFileSync('dist/about.html','utf8');
assert.ok(about.includes('«Бета» (мозок, хребет, м’язи, ШКТ, коліно)'));
assert.ok(!about.includes('мозок, ШКТ: власного змісту ще немає'));
console.log('Atlas foundations: real content, registered references, unchanged physiology, complete readable anatomy and noscript templates passed.');
