// 2026-10-22: search finds supplements by topic (new keywords in platform-materials) → cascade: materials v84, search v2, header v4, tools v85, shell v97.
// Cache expectations updated for the scoped shared-header geometry fix.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {structures,topics,sources,muscleKnowledge,moduleMeta,topicClaimIds,legacyMuscleRecords,muscleRecordHistory} from '../src/muscle-lab/module.mjs';
import {mount,initialPreferences,structureURL,renderTopics,structureContent,adjacentStructure,renderLegend} from '../dist/muscle-lab.js';
import {scaleArt} from '../dist/muscle-scale-art.js';
import {ClaimCard,EvidenceDrawer,SourceCard} from '../src/evidence/core/components.mjs';
const original=JSON.parse(fs.readFileSync('tests/fixtures/muscle-v57-wording.json','utf8'));
// Preserve the frozen v57 science; allow only the reviewed R1–R4 package.
const approvedStructureSources=[['SRC-000025','SRC-000027'],['SRC-000025','SRC-000028'],['SRC-000025','SRC-MUSCLE-001'],['SRC-000025','SRC-000026'],['SRC-000025','SRC-000026'],['SRC-000025','SRC-MUSCLE-001']];
const approvedContraction='Як актин і міозин створюють механічну напругу, використовуючи енергію ATP.';
assert.deepEqual(structures.map(({id,label,description,function:fn,sourceIds})=>({id,label,description,function:fn,sourceIds})),original.structures.map((s,i)=>({...s,sourceIds:approvedStructureSources[i]})));
assert.deepEqual(topics,original.topics.map(t=>t.id==='contraction'?{...t,description:approvedContraction,sourceIds:['SRC-MUSCLE-001','SRC-000026']}:t));
const retainedIds=new Set(original.sources.map(s=>s.id));
assert.deepEqual(sources.filter(s=>retainedIds.has(s.id)).map(({id,title,year,url,scope})=>({id,title,year,url,scope})),original.sources);
assert.equal(muscleKnowledge.claims.length,9);assert.equal(muscleKnowledge.records.length,19);
assert.equal(sources.length,7);assert.equal(legacyMuscleRecords.length,11);
assert.deepEqual(muscleRecordHistory.map(r=>r.id),['EVR-000050','EVR-000051','EVR-000053','EVR-000054']);
for(const r of muscleRecordHistory){assert.equal(r.sourceId,'SRC-MUSCLE-001');assert(!muscleKnowledge.records.some(current=>current.id===r.id));assert(r.supersededBy.every(id=>muscleKnowledge.records.some(current=>current.id===id&&current.claimId===r.claimId)));}
assert.equal(moduleMeta.version,'1.1');
assert.equal(moduleMeta.lastReviewed,null);
for(const s of structures){const c=muscleKnowledge.claims.find(c=>c.id===s.claimId);assert.equal(c.statement,s.description);assert.equal(c.evidenceSummary,s.function);}
for(const t of topics){const c=muscleKnowledge.claims.find(c=>c.id===topicClaimIds[t.id]);assert.equal(c.statement,t.description);assert.equal(c.evidenceSummary,t.university);}
for(const c of muscleKnowledge.claims){
 assert.equal(c.evidenceConfidence,null);assert.equal(c.confidenceFramework,'not_assessed');assert.equal(c.lastReviewed,null);assert.equal(c.scientificApproval,null);
 const records=muscleKnowledge.records.filter(r=>r.claimId===c.id);assert(records.length);
 for(const r of records){assert.equal(r.roleForClaim,'context_only');assert.equal(r.direction,'unclear');assert.equal(r.reviewStatus,'pending');assert.equal(r.result.estimate,undefined);}
 const card=ClaimCard(c.id,muscleKnowledge),drawer=EvidenceDrawer(c.id,muscleKnowledge);
 assert(card.includes('Рівень впевненості не оцінено'));assert(drawer.includes('Лише контекст'));assert(drawer.includes('Збережене навчальне пояснення'));assert(drawer.includes(c.evidenceSummary));assert(drawer.includes('не завершено'));assert(!drawer.includes('HIGH'));assert(!drawer.includes('Invalid Date'));assert(!drawer.includes('Ефект і конкретні результати'));
 for(const r of records){assert(drawer.includes(sources.find(s=>s.id===r.sourceId).url));assert(drawer.includes(r.extractionLocator));assert(drawer.includes(r.claimPartLabel));}
 assert.equal(c.claimType,Number(c.id.slice(-3))<=44?'physiology':'mechanism');
}
// R1 disclosures describe only what is reported; unknown information stays unknown.
const declared=sources.find(s=>s.id==='SRC-MUSCLE-003');
const sourceHTML=SourceCard(declared);
assert(sourceHTML.includes('Novartis Institutes for Biomedical Research'));
assert(sourceHTML.includes('Фінансування: ще не перевірено за повним текстом'));
assert(sourceHTML.includes('10.3109/10409238.2013.857291'));
assert(!SourceCard({...declared,conflicts:{status:'not_checked',summary:'UNVERIFIED'}}).includes('UNVERIFIED'));
assert(SourceCard({...declared,conflicts:{status:'reported',summary:'<img src=x onerror=alert(1)>'}}).includes('&lt;img'));
const modelNote='Частина механістичних висновків походить із дослідів на клітинах і тваринах; вони не визначають величину результату у конкретної людини.';
for(const id of ['CLM-000047','CLM-000048']){
 const c=muscleKnowledge.claims.find(c=>c.id===id);assert.equal(c.limitations[0],modelNote);
 assert(ClaimCard(id,muscleKnowledge).includes(modelNote));assert(EvidenceDrawer(id,muscleKnowledge).includes(modelNote));
}
for(const s of sources.filter(s=>s.publicationType==='textbook_chapter')){
 assert.equal(s.book,'Anatomy and Physiology 2e');assert(s.authors.length>1);assert.equal(s.year,2022);
 assert(s.url.startsWith('https://openstax.org/'));assert.equal(s.pubmedUrl,undefined);assert(!SourceCard(s).includes('PMID'));
}
for(const s of structures){
 const content=structureContent(s,'sources','university');assert(content.includes('Визначення структури'));assert(content.includes('Функція структури'));
 for(const part of ['definition','function'])assert(muscleKnowledge.records.some(r=>r.claimId===s.claimId&&r.claimPart===part));
}
assert(renderTopics('school').includes(approvedContraction));assert(renderTopics('advanced').includes(modelNote));
// Single reusable component works for a new data-only test Claim; production data untouched.
const testClaim={...muscleKnowledge.claims[0],id:'CLM-TEST-001',outcome:{name:'Тестова структура'}};
assert(ClaimCard(testClaim.id,{...muscleKnowledge,claims:[...muscleKnowledge.claims,testClaim]}).includes('Тестова структура'));
assert.deepEqual(initialPreferences('https://evidence.invalid/muscle-lab.html?level=bad&tab=bad'),{level:'university',tab:'description'});
assert.deepEqual(initialPreferences('https://evidence.invalid/muscle-lab.html?level=advanced&tab=function'),{level:'university',tab:'function'},'The reading-level switcher is retired: old level links open the full wording');
assert.throws(()=>structureURL('https://evidence.invalid/','bad'),/Unknown/);assert.throws(()=>adjacentStructure(structures[0].id,2),/Invalid/);
assert(!structureURL('https://evidence.invalid/muscle-lab.html?level=advanced&path=energy',structures[0].id).searchParams.has('level'),'Retired level parameter is dropped');
assert.equal(structureURL('https://evidence.invalid/muscle-lab.html?path=energy',structures[1].id,'function').searchParams.get('path'),'energy','Unrelated teaching-route parameters survive');

// In-memory DOM adapter: real controller, real handlers, controllable timers and animation frames.
function fixture(href='https://evidence.invalid/muscle-lab.html?v=58&path=energy&lesson=1#explorer',reduced=false){
 const nodes=new Map(),listeners=new Map(),groups=new Map(),windowHandlers=new Map(),timers=new Map(),frames=new Map();let nextTimer=0,nextFrame=0;
 const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',hidden:false,disabled:false,value:0,dataset:{},attributes:{},handlers:new Map(),style:{setProperty(k,v){this[k]=v;}},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.handlers.set(k,fn);},removeEventListener(){},querySelector:selector=>selector==='svg'?node(key+' > svg'):node(selector),contains(){return false;},focus(){this.focused=true;},showModal(){this.open=true;},close(){this.open=false;this.handlers.get('close')?.();},scrollIntoView(){this.scrolled=true;}});return nodes.get(key);};
 const make=(key,dataset)=>{const b=node(key);b.dataset=dataset;return b;};
 groups.set('[data-structure]',structures.map(s=>make(`structure-${s.id}`,{structure:s.id})));
 groups.set('[data-tab]',['description','function','sources'].map(tab=>make(tab,{tab})));
 groups.set('[data-step-topic="contraction"]',[0,1,2,3].map(i=>make(`step-contraction-${i}`,{stepTopic:'contraction',stepIndex:String(i)})));
 groups.set('[data-mirror-step]',[0,1,2,3].map(i=>make(`mirror-step-${i}`,{mirrorStep:String(i)})));
 groups.set('[data-mirror-show]',['growth','atrophy'].map(name=>make(`mirror-show-${name}`,{mirrorShow:name})));
 const motion={matches:reduced,addEventListener(k,f){this.onChange=f;},removeEventListener(){}};
 const location={href,hash:new URL(href).hash};
 const view={location,history:{replaceState(a,b,url){location.href=url;location.hash=new URL(url).hash;}},matchMedia:()=>motion,
  setInterval(fn){const id=++nextTimer;timers.set(id,fn);return id;},clearInterval(id){timers.delete(id);},
  requestAnimationFrame(fn){const id=++nextFrame;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},
  addEventListener(k,f){windowHandlers.set(k,f);},removeEventListener(){}};
 const root={defaultView:view,hidden:false,querySelector:node,querySelectorAll:s=>groups.get(s)||[],addEventListener(k,f){if(!listeners.has(k))listeners.set(k,[]);listeners.get(k).push(f);},removeEventListener(){}};
 const ui=mount(root);
 const frameAt=now=>{const pending=[...frames.entries()];frames.clear();for(const [,fn] of pending)fn(now);};
 frameAt(0); // runs the one-off deep-link scroll callback, if any
 const click=dataset=>{const b=make('click-'+JSON.stringify(dataset),dataset);for(const fn of listeners.get('click')||[])fn({target:{closest(selector){if(selector==='[data-learning-tab]'&&dataset.learningTab)return b;if(selector==='button'&&!dataset.claimOpen&&!dataset.close)return b;if(selector==='[data-claim-open]'&&dataset.claimOpen)return b;if(selector==='[data-evidence-close]'&&dataset.close)return b;return null;}}});return b;};
 const key=k=>{for(const fn of listeners.get('keydown')||[])fn({key:k,preventDefault(){},target:{closest:()=>make('key',{structure:ui.state().selected})}});};
 const tick=()=>[...timers.values()].forEach(fn=>fn());
 const slideInput=value=>node('#shortening').handlers.get('input')({target:{value:String(value)}});
 return {node,ui,click,key,tick,timers,frames,frameAt,slideInput,view,location,motion,root,windowHandlers,listeners};
}
const f=fixture();
// Structure selection: one control, URL keeps unrelated parameters, no level in the address.
for(const s of structures){
 f.click({structure:s.id});assert.equal(f.ui.state().selected,s.id);assert.equal(f.node('#structure-title').textContent,s.label);assert(f.node('#structure-copy').innerHTML.includes(s.description));
 const url=new URL(f.location.href);assert.equal(url.searchParams.get('structure'),s.id);assert.equal(url.searchParams.get('path'),'energy');assert.equal(url.hash,'#explorer');assert(!url.searchParams.has('level'));
 assert.equal(f.node('#scale-art').innerHTML,scaleArt(s.id));assert.equal(f.node('#scale-legend').innerHTML,renderLegend(s.id));
 assert(f.node('#art-selection').textContent.includes(s.label));
}
f.key('ArrowLeft');assert.equal(f.ui.state().selected,structures[4].id);assert(f.node(`#scales [data-structure="${structures[4].id}"]`).focused);
f.click({structure:'invalid'});assert.equal(f.ui.state().selected,structures[4].id);

// Contraction cycle: the scene is not redrawn, its step attribute changes.
const cycleSvg=f.node('[data-topic-scene="contraction"] > svg');
for(let i=0;i<4;i++){
 f.click({stepTopic:'contraction',stepIndex:String(i)});assert.equal(f.ui.state().steps.contraction,i);
 assert.equal(cycleSvg.attributes['data-step'],String(i));assert(f.node('[data-progress="contraction"]').textContent.startsWith(`Крок ${i+1} із 4`));
 for(let k=0;k<4;k++)assert.equal(f.node(`step-contraction-${k}`).attributes['aria-pressed'],String(k===i));
}
f.click({stepTopic:'contraction',stepIndex:'99'});assert.equal(f.ui.state().steps.contraction,3,'Out-of-range step is ignored');
f.click({reset:'contraction'});assert.equal(f.ui.state().steps.contraction,-1);assert.equal(cycleSvg.attributes['data-step'],'-1');
f.click({play:'contraction'});assert.equal(f.timers.size,1);assert.equal(f.ui.state().steps.contraction,0);f.tick();assert.equal(f.ui.state().steps.contraction,1);
f.click({play:'contraction'});assert.equal(f.timers.size,0,'Second press pauses');
f.click({play:'contraction'});f.tick();f.tick();f.tick();assert.equal(f.ui.state().steps.contraction,3);f.tick();assert.equal(f.timers.size,0,'Playback stops after the last step');

// Growth and atrophy share one stepper (mirror) and one play button.
for(let i=0;i<4;i++){
 f.click({mirrorStep:String(i)});assert.equal(f.ui.state().steps.growth,i);assert.equal(f.ui.state().steps.atrophy,i);
 assert.equal(f.node('[data-topic-scene="growth"] > svg').attributes['data-step'],String(i));assert.equal(f.node('[data-topic-scene="atrophy"] > svg').attributes['data-step'],String(i));
 for(let k=0;k<4;k++)assert.equal(f.node(`mirror-step-${k}`).attributes['aria-pressed'],String(k===i));
}
f.click({mirrorStep:'9'});assert.equal(f.ui.state().steps.growth,3);
f.click({mirrorPlay:''});assert.equal(f.timers.size,1);assert.deepEqual(f.ui.state().playing,['mirror']);assert.equal(f.ui.state().steps.growth,0);
f.tick();assert.equal(f.ui.state().steps.atrophy,1,'Both panels advance together');
f.click({mirrorPlay:''});assert.equal(f.timers.size,0);
f.click({mirrorShow:'atrophy'});assert.equal(f.ui.state().mirrorView,'atrophy');assert.equal(f.node('#adaptation').attributes['data-mirror-view'],'atrophy');assert.equal(f.node('mirror-show-atrophy').attributes['aria-pressed'],'true');
f.click({mirrorShow:'bogus'});assert.equal(f.ui.state().mirrorView,'atrophy');

// Sarcomere sliding: one gentle pass (relaxed, contracted, relaxed), stoppable, slider independent.
f.click({sarcomerePlay:''});assert.equal(f.frames.size,1);assert.deepEqual(f.ui.state().playing,['sarcomere']);
f.frameAt(1000);f.frameAt(2600);assert(f.ui.state().slide>0.3&&f.ui.state().slide<0.7,'Halfway through the first pass');
f.frameAt(4200);assert.equal(f.ui.state().slide,1);assert(f.node('[data-sarcomere-stage]').innerHTML.includes('data-sarcomere-t="1"'));
assert.equal(f.node('[data-readout-state="distance"]').textContent,'зменшується');assert.equal(f.node('[data-readout-state="overlap"]').textContent,'збільшується');assert.equal(f.node('[data-readout-state="length"]').textContent,'не змінюється');
f.frameAt(1000+3200+500+1600);assert(f.ui.state().slide>0.3&&f.ui.state().slide<0.7,'Halfway back');
f.frameAt(1000+7100+10);assert.equal(f.ui.state().slide,0);assert.equal(f.frames.size,0,'The pass ends and stops by itself');assert.deepEqual(f.ui.state().playing,[]);
assert.equal(f.node('[data-readout-state="distance"]').textContent,'у спокої');
f.click({sarcomerePlay:''});f.frameAt(5000);f.click({sarcomerePlay:''});assert.equal(f.frames.size,0,'Second press pauses');
f.slideInput(60);assert.equal(f.ui.state().slide,.6);assert(f.node('[data-sarcomere-stage]').innerHTML.includes('data-sarcomere-t="0.6"'));assert.equal(f.node('#shortening').value,60);
f.click({sarcomerePlay:''});f.slideInput(20);assert.equal(f.frames.size,0,'Moving the slider takes over from the animation');
f.slideInput(0);

// Evidence drawer and tabs.
f.click({tab:'sources'});assert(f.node('#structure-copy').innerHTML.includes('data-claim-open'));assert.equal(new URL(f.location.href).searchParams.get('tab'),'sources');
for(const c of muscleKnowledge.claims){const opener=f.click({claimOpen:c.id});assert(f.node('#eua-evidence-dialog').open);assert(f.node('[data-evidence-content]').innerHTML.includes(c.statement));f.click({close:true});assert(!f.node('#eua-evidence-dialog').open);assert(opener.focused);}

// Everything stops when the page is hidden, left, or the user prefers reduced motion.
f.click({play:'contraction'});f.click({sarcomerePlay:''});f.windowHandlers.get('pagehide')();assert.equal(f.timers.size,0);assert.equal(f.frames.size,0);
f.click({mirrorPlay:''});f.root.hidden=true;for(const fn of f.listeners.get('visibilitychange'))fn();assert.equal(f.timers.size,0);f.root.hidden=false;
f.click({play:'contraction'});f.motion.matches=true;f.motion.onChange();assert.equal(f.timers.size,0);
const reduced=fixture(undefined,true);
reduced.click({play:'contraction'});assert.equal(reduced.timers.size,0);assert.equal(reduced.ui.state().steps.contraction,0);assert(reduced.node('[data-progress="contraction"]').textContent.includes('вручну'));
reduced.click({mirrorPlay:''});assert.equal(reduced.timers.size,0);assert(reduced.node('[data-progress="growth"]').textContent.includes('вручну'));
reduced.click({sarcomerePlay:''});assert.equal(reduced.frames.size,0,'No timed animation under reduced motion');assert.equal(reduced.ui.state().slide,1);assert(reduced.node('#slide-note').textContent.includes('Зменшений рух'));

// Deep links and history.
const deep=fixture('https://evidence.invalid/muscle-lab.html?structure=CELL-MUSCLE&level=advanced&tab=function#contraction');
assert.equal(deep.ui.state().selected,'CELL-MUSCLE');assert.equal(deep.ui.state().tab,'function');assert(deep.node('#contraction').scrolled);
const toGrowth=fixture('https://evidence.invalid/muscle-lab.html#atrophy');assert.equal(toGrowth.ui.state().mirrorView,'atrophy');assert(toGrowth.node('#atrophy').scrolled);
deep.location.href='https://evidence.invalid/muscle-lab.html?structure=STRUCT-SARCOMERE&level=school&tab=sources#explorer';deep.windowHandlers.get('popstate')();assert.equal(deep.ui.state().selected,'STRUCT-SARCOMERE');assert.equal(deep.ui.state().tab,'sources');
f.ui.destroy();reduced.ui.destroy();deep.ui.destroy();toGrowth.ui.destroy();assert.equal(f.timers.size,0);
const route=fixture('https://evidence.invalid/muscle-lab.html?structure=CELL-MUSCLE&tab=description');
route.click({learningTab:'function'});assert.equal(route.ui.state().tab,'function');assert.equal(route.ui.state().selected,'CELL-MUSCLE');
route.click({learningTab:'invalid'});assert.equal(route.ui.state().tab,'function');
assert.equal(route.node('#structure-copy').innerHTML,structureContent(structures.find(s=>s.id==='CELL-MUSCLE'),'function','university'));
route.location.href='https://evidence.invalid/muscle-lab.html?structure=STRUCT-SARCOMERE&tab=sources#structure-explanation';
route.windowHandlers.get('popstate')();
assert.equal(route.ui.state().selected,'STRUCT-SARCOMERE');
assert.equal(route.ui.state().tab,'sources');
route.ui.destroy();
const sourceBaseline=structureContent(structures[0],'sources','university');
for(const level of ['school','advanced'])assert.equal(structureContent(structures[0],'sources',level),sourceBaseline);
const html=fs.readFileSync('dist/muscle-lab.html','utf8'),css=fs.readFileSync('dist/muscle-lab.css','utf8');
for(const id of ['muscle-evidence','claim-list','eua-evidence-dialog'])assert(html.includes(`id="${id}"`));
assert(html.includes('href="./directions.html"'));assert(html.includes('href="./index.html#home-feedback"'));assert(css.includes('height:100dvh'));assert(css.includes('.muscle-claims,.related-grid{grid-template-columns:minmax(0,1fr)}'));
for(const t of topics){const article=renderTopics('university').slice(renderTopics('university').indexOf(`id="${t.id}"`));assert(article.includes(`data-claim-open="${topicClaimIds[t.id]}"`));assert(article.includes(`data-topic-scene="${t.id}"`));}
const pageHashes=JSON.parse(fs.readFileSync('tests/fixtures/v57-retained-page-hashes.json','utf8'));
// Only Cell and Nutrition may change presentation in v70. This independent
// v69 fixture retains every paragraph/source link and every inline SVG byte,
// allowing only CRLF-to-LF checkout conversion on Windows.
execFileSync('python',['-c',`from pathlib import Path
from lxml import html
import json,re,hashlib,collections
baseline=json.loads(Path('tests/fixtures/v69-study-presentation-baseline.json').read_text(encoding='utf-8'))
assert set(baseline['pages'])=={'cell-lab.html','nutrition.html'}
for name,expected in baseline['pages'].items():
    raw=Path('dist',name).read_bytes()
    root=html.fromstring(raw)
    actual={
        'paragraphs':collections.Counter(' '.join(''.join(p.itertext()).split()) for p in root.xpath('//p')),
        'externalHrefs':collections.Counter(root.xpath('//a[starts-with(@href,"https://") or starts-with(@href,"http://")]/@href')),
        'inlineSvgHashes':collections.Counter(hashlib.sha256(svg.replace(b'\\r\\n',b'\\n')).hexdigest() for svg in re.findall(rb'<svg\\b[\\s\\S]*?</svg\\s*>',raw,re.I))
    }
    for category in ['paragraphs','externalHrefs']:
        missing=collections.Counter(expected[category])-actual[category]
        assert not missing, f'{name}: retained {category} changed or removed: {dict(missing)}'
    assert actual['inlineSvgHashes']==collections.Counter(expected['inlineSvgHashes']), f'{name}: inline scientific SVG bytes changed'
`]);
// Share metadata (icons, canonical, Open Graph) is the only head addition allowed on retained pages; it is covered by share-meta.test.mjs.
const shareMetaBlock=/<link rel="icon" href="\.\/favicon\.svg"[\s\S]*?<meta name="twitter:card" content="summary_large_image">\n/;
for(const [file,hash] of Object.entries(pageHashes)){
 // Directory navigation is intentionally extended in v59 and tested separately.
 if(file==='directions.html'||file==='index.html')continue; // Home presentation updated; article integrity is checked in home-entry and first-visit-flow.
 if(file==='movement.html')continue; // Replaced by the approved introductory movement module; geometry and navigation are tested separately. Historical fixture is retained unchanged.
 if(file==='nutrition-digestion.html')continue; // Replaced 2026-10-18 by the owner-approved 3D «Шлях їжі» module; content and evidence links are tested in food-path.test.mjs. Historical fixture is retained unchanged.
 if(file==='muscle-lab.html')continue; // Replaced by the owner-approved redesign (one scale control, own drawings, animated contraction, mirrored growth/atrophy). Frozen science (structures, topics, sources) is still checked above; see muscle-lab.test.mjs for the page.
 if(file==='protein-meta.html')continue; // Pine redesign (title band, recoloured inline CSS, version of the shared stylesheet): the article text is pinned in page-pine.test.mjs instead of by a whole-file hash.
 if(file==='cell-lab.html'||file==='nutrition.html')continue; // Exact retained semantics checked against the independent v69 fixture above.
 let html=fs.readFileSync('dist/'+file,'utf8') .replaceAll('platform-shell.js?v=97','platform-shell.js?v=54').replaceAll('platform-shell.js?v=96','platform-shell.js?v=54').replaceAll('platform-shell.js?v=95','platform-shell.js?v=54').replaceAll('platform-shell.js?v=94','platform-shell.js?v=54').replaceAll('platform-shell.js?v=93','platform-shell.js?v=54').replaceAll('platform-shell.js?v=92','platform-shell.js?v=54').replaceAll('platform-shell.js?v=91','platform-shell.js?v=54').replaceAll('platform-shell.js?v=90','platform-shell.js?v=54').replaceAll('platform-shell.js?v=89','platform-shell.js?v=54').replaceAll('platform-shell.js?v=88','platform-shell.js?v=54').replaceAll('platform-shell.js?v=87','platform-shell.js?v=54').replaceAll('platform-shell.js?v=86','platform-shell.js?v=54').replaceAll('platform-shell.js?v=85','platform-shell.js?v=54').replaceAll('platform-shell.js?v=83','platform-shell.js?v=54').replaceAll('platform-shell.js?v=82','platform-shell.js?v=54').replaceAll('platform-shell.js?v=63','platform-shell.js?v=54').replaceAll('platform-shell.js?v=60','platform-shell.js?v=54').replaceAll('nutrition-lab.js?v=59','nutrition-lab.js?v=55').replaceAll('cell-lab.js?v=59','cell-lab.js?v=56').replaceAll('home-feedback.js?v=60','home-feedback.js?v=57').replaceAll('supplement-backgrounds-v10.webp','supplement-backgrounds-v10.png'); // PNG->WebP asset format change only; pixels/layout reference unchanged
 if(file==='index.html'){
  // Only these explicit v60 additions may differ. All other bytes retain the frozen hash.
  assert.equal((html.match(/<!-- EUA_HOME_LEARNING_START -->/g)||[]).length,1);
  html=html.replace(/\n<!-- EUA_HOME_LEARNING_START -->[\s\S]*?<!-- EUA_HOME_LEARNING_END -->/,'')
   .replace('<label for="feedback-material">Про який матеріал відгук?<select id="feedback-material"><option value="">Головна сторінка</option></select></label>\n','')
   .replace('\n<button type="button" id="feedback-clear">Очистити відповіді</button>','')
   .replaceAll('home-entry.css?v=60','home-entry.css?v=57');
 }
 html=html.replace(shareMetaBlock,'');
 assert.equal(createHash('sha256').update(html).digest('hex'),hash,'Unrelated page content changed: '+file);
}
console.log('Muscle flow: frozen science, source disclosures, drawers, players, deep links and keyboard passed. Cell/Nutrition retain all v69 paragraphs, external links and exact inline SVG bytes; unrelated pages retain frozen hashes. Browser layout remains unverified.');
