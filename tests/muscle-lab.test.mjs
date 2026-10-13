import assert from 'node:assert/strict';
import fs from 'node:fs';
import {structures,topics,sources,visual,moduleMeta} from '../dist/muscle-lab-data.js';
import {renderTopics,structureContent,renderHotspots,adjacentStructure,mount} from '../dist/muscle-lab.js';
import {sceneFrame} from '../dist/muscle-lab-scenes.js';
const html=fs.readFileSync('dist/muscle-lab.html','utf8'),css=fs.readFileSync('dist/muscle-lab.css','utf8');
assert.equal(structures.length,6);assert.equal(topics.length,3);assert.equal(new Set(structures.map(s=>s.id)).size,6);
for(const item of [...structures,...topics])for(const id of item.sourceIds)assert(sources.some(s=>s.id===id));
for(const level of ['school','university','advanced']){const rendered=renderTopics(level);for(const t of topics){assert(rendered.includes(t[level]));assert(rendered.includes(`data-play="${t.id}"`));assert(rendered.includes(`data-reset="${t.id}"`));}}
assert(structureContent(structures[5],'function','advanced').includes('від’єднує'));assert(structureContent(structures[0],'sources','school').includes('openstax.org'));
assert(html.includes('id="shortening"'));assert(html.includes('Довжина філаментів незмінна'));assert(html.includes('id="left-filament"'));assert(html.includes('id="right-filament"'));
assert(css.includes('prefers-reduced-motion'));assert(css.includes('min-height:44px'));assert(css.includes('max-width:700px'));
assert(fs.existsSync('dist/muscle-lab-art-v1.webp'));assert(moduleMeta.status.includes('не завершено'));assert(visual.simplified);assert.deepEqual(visual.claimIds,structures.map(s=>s.claimId));
assert(fs.readFileSync('dist/navigation-v17.js','utf8').includes("'./muscle-lab.html'"));
for(const id of ['contraction','growth','atrophy']){const initial=sceneFrame(id);assert(initial.includes('role="img"'));for(let i=0;i<4;i++){const frame=sceneFrame(id,i);assert(frame.includes('scene-node active'));assert.notEqual(frame,initial);}const topic=renderTopics('school');assert(topic.includes(`data-next="${id}"`));assert(topic.includes(`data-previous="${id}"`));}
assert.throws(()=>sceneFrame('unknown'),/Unknown scene/);assert.throws(()=>sceneFrame('growth',9),/Invalid storyboard/);
const markers=renderHotspots();assert.equal((markers.match(/class="art-hotspot"/g)||[]).length,4);
for(const s of structures.slice(0,4)){assert(markers.includes(`data-structure="${s.id}"`));assert(markers.includes(`Обрати: ${s.label}`));}
assert(!markers.includes('STRUCT-SARCOMERE'));assert(html.includes('id="art-hotspots"'));assert(html.includes('id="art-overview"'));assert(html.includes('id="art-selection" aria-live="polite"'));
for(const s of structures.slice(4))assert(html.includes(`data-structure="${s.id}"`));
assert(css.includes('#art-hotspots[hidden]'));assert(css.includes('width:44px;height:44px'));assert(css.includes('.art-key{grid-template-columns:repeat(2'));
console.log('Muscle Lab: data links, six scales, three explanation levels, sources, controls, static mobile/accessibility and honest review status passed. Browser verification not performed.');

// Exercise real event handlers with an in-memory DOM adapter (no visual layout claim).
const nodes=new Map(),listeners=new Map();
function node(selector){if(!nodes.has(selector))nodes.set(selector,{textContent:'',innerHTML:'',value:0,hidden:false,disabled:false,dataset:{},attributes:{},style:{setProperty(){}},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this[k]=fn;},contains(){return false;},focus(){}});return nodes.get(selector);}
const root={querySelector:node,querySelectorAll(selector){const match=selector.match(/^\[data-step-topic="([^"]+)"\]$/);return match?topics.find(t=>t.id===match[1]).steps.map((_,i)=>node(`step-${match[1]}-${i}`)):[];},addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,[]);listeners.get(k).push(fn);},activeElement:null};
mount(root);
function click(dataset){const button={dataset,setAttribute(){},textContent:''};for(const fn of listeners.get('click'))fn({target:{closest(selector){return selector==='button'?button:null;}}});}
assert.equal(node('#structure-title').textContent,structures[0].label);
assert.equal(node('[data-move-structure="-1"]').disabled,true);
for(let i=1;i<structures.length;i++){
 click({moveStructure:'1'});
 assert.equal(node('#structure-title').textContent,structures[i].label);
 assert.equal(node('#structure-copy').innerHTML,structureContent(structures[i],'description','university'));
 assert.equal(node('#scale-progress').textContent,`Масштаб ${i+1} із ${structures.length}`);
 assert.equal(node('#scale-name').textContent,structures[i].label);
}
assert.equal(node('[data-move-structure="1"]').disabled,true);
assert.equal(node('#art-view').hidden,true);
assert.equal(node('#sarcomere-view').hidden,false);
click({structure:structures[0].id});
assert.equal(node('#art-view').hidden,false);assert.equal(node('#sarcomere-view').hidden,true);
click({structure:structures[4].id});click({tab:'sources'});
assert(node('#structure-copy').innerHTML.includes('10-2-skeletal-muscle'));
node('#shortening').value=35;
for(let i=0;i<4;i++)click({next:'contraction'});
assert.equal(node('[data-next="contraction"]').disabled,true);
assert(node('[data-progress="contraction"]').textContent.startsWith('Крок 4 із 4'));
// A topic must update its own visible scene, never a remote model above it.
assert.equal(node('#shortening').value,35);
click({reset:'contraction'});assert.equal(node('[data-previous="contraction"]').disabled,true);
assert.equal(node('[data-topic-scene="contraction"]').innerHTML,sceneFrame('contraction'));
click({play:'contraction'});assert(node('[data-progress="contraction"]').textContent.startsWith('Крок 1'));
click({play:'contraction'}); // Pause and clear interval.
for(const id of ['contraction','growth','atrophy']){
 const rendered=renderTopics('university'),article=rendered.slice(rendered.indexOf(`id="${id}"`));
 assert(article.indexOf('class="scene-controls"')<article.indexOf('<ol>'));
}
assert.equal(adjacentStructure(structures[0].id,-1).id,structures[0].id);
assert.equal(adjacentStructure(structures[5].id,1).id,structures[5].id);
assert.throws(()=>adjacentStructure('unknown',1),/Unknown structure/);
console.log('Viewer navigation, selected model, source links, step boundaries, reset, play/pause and independent models passed in memory.');

click({stepTopic:'contraction',stepIndex:'2'});
assert(node('[data-progress="contraction"]').textContent.startsWith('Крок 3 із 4'));
assert(node('[data-topic-scene="contraction"]').innerHTML.includes('ATP: від’єднання головок'));
for(let i=0;i<4;i++)assert.equal(node(`step-contraction-${i}`).attributes['aria-pressed'],String(i===2));
click({stepTopic:'contraction',stepIndex:'99'});
assert(node('[data-progress="contraction"]').textContent.startsWith('Крок 3 із 4'));
click({previous:'contraction'});
assert(node('[data-progress="contraction"]').textContent.startsWith('Крок 2 із 4'));
click({reset:'contraction'});
for(let i=0;i<4;i++)assert.equal(node(`step-contraction-${i}`).attributes['aria-pressed'],'false');
assert(html.includes('href="#contraction"'));
assert(renderTopics('school').includes('id="scene-contraction"'));
assert.equal((renderTopics('university').match(/data-step-index=/g)||[]).length,12);
assert(renderTopics('advanced').includes('href="#explorer"'));
console.log('Manual step selection, invalid-index guard, selected state and reset passed.');
