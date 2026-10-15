import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {materials,findMaterials,contextLink,materialContext} from '../src/platform/materials.mjs';
import {materialCard,toolsHTML,mountQuickTools} from '../src/platform/quick-tools.mjs';
import {feedbackReport} from '../src/platform/home-feedback.mjs';
import {catalog} from '../src/platform/catalog.mjs';
assert.equal(new Set(materials.map(m=>m.id)).size,materials.length);
assert.equal(materials.length,44);
assert.equal(findMaterials('ПРОТЕЇН')[0].href,'./index.html#supplement-protein');
assert.equal(findMaterials('саркомер')[0].href,'./muscle-lab.html?structure=STRUCT-SARCOMERE#explorer');
assert.equal(findMaterials('ядро')[0].href,'./cell-lab.html?organelle=ORG-NUCLEUS#cell-canvas');
assert(findMaterials("м'яз").some(m=>m.areaId==='muscle'));
assert.equal(findMaterials('невідома сторінка').length,0);
assert(!findMaterials('').some(m=>['evi','metabolism','teacher','comparison'].includes(m.areaId)));
for(const m of materials){assert(m.review);assert(materialCard(m).includes(m.title));const url=new URL(m.href,'https://evidence.invalid/');assert(fs.existsSync('dist'+url.pathname));}
const dirty='https://evidence.invalid/nutrition.html?v=55&utm_source=ad&token=secret&nutrient=protein&step=2&depth=detailed&scale=cell&structure=bad#nutrition-lab';
const clean=contextLink(dirty);assert(!clean.includes('secret'));assert(!clean.includes('utm_'));assert(!clean.includes('v='));assert(clean.includes('nutrient=protein'));assert(clean.includes('step=2'));assert(!clean.includes('structure='));
assert(!contextLink('https://evidence.invalid/cell-lab.html?organelle=ORG-UNKNOWN&tab=bad').includes('?'));
assert(contextLink('https://evidence.invalid/cell-lab.html?organelle=ORG-RIBOSOME&level=school&tab=sources#cell-canvas').includes('tab=sources'));
assert(contextLink('https://evidence.invalid/muscle-lab.html?structure=CELL-MUSCLE&level=advanced&tab=function&path=energy&lesson=1#explorer').includes('path=energy'));
assert(!contextLink('https://evidence.invalid/?path=unknown&lesson=9#top').includes('?'));
assert.equal(materialContext('https://evidence.invalid/index.html#supplement-protein').id,'supplements-protein');
assert.equal(materialContext('https://evidence.invalid/#top'),null);
assert.equal(materialContext('https://evidence.invalid/#home-feedback'),null);
assert.equal(materialContext('https://evidence.invalid/#evidence-card').id,'supplements-creatine');
assert(!contextLink('https://evidence.invalid/?token=secret#private').includes('private'));
assert.equal(materialContext('https://evidence.invalid/muscle-lab.html?structure=CELL-MUSCLE#explorer').id,'muscle-fiber');
assert(feedbackReport({stuck:'Не зручно'},'https://evidence.invalid/?feedbackFor=supplements-protein&token=secret#private').includes('Матеріал: Протеїн'));
assert(!feedbackReport({stuck:'Так'},'https://evidence.invalid/?feedbackFor=secret&token=secret').includes('secret'));
assert(!toolsHTML('home').includes('data-eua-tool="focus"'));assert(toolsHTML('cell').includes('data-eua-tool="focus"'));
// Home already has a native feedback disclosure; content pages still need its link.
assert(!toolsHTML('home').includes('#home-feedback'));
for(const area of ['cell','nutrition','muscle','supplements'])assert(toolsHTML(area).includes('./index.html#home-feedback'));
for(const action of ['search','share'])assert(toolsHTML('home').includes(`data-eua-tool="${action}"`));
assert(!materialCard({...materials[0],title:'<script>'}).includes('<script>'));

// Minimal DOM adapter for real quick-search, focus-mode and clipboard handlers.
function fixture(clipboard){
 const nodes=new Map(),events=new Map();
 function node(id){if(nodes.has(id))return nodes.get(id);const n={id,dataset:{},attributes:{},children:[],value:'',textContent:'',innerHTML:'',events:new Map(),disabled:false,open:false,setAttribute(k,v){this.attributes[k]=v;},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},addEventListener(k,f){this.events.set(k,f);},removeEventListener(){},focus(){this.focused=true;},select(){this.selected=true;},scrollIntoView(){this.scrolled=true;},showModal(){this.open=true;},close(){this.open=false;this.events.get('close')?.();},remove(){}};nodes.set(id,n);return n;}
 const toggle=node('focus-button');toggle.dataset.euaTool='focus';const status=node('status');
 const location={href:dirty,origin:'https://evidence.invalid'},root={body:{dataset:{platformArea:'nutrition'},append(dialog){nodes.set(dialog.id,dialog);}},defaultView:{location,navigator:{clipboard}},createElement:tag=>node('created-'+tag+'-'+nodes.size),getElementById:id=>id==='eua-search-dialog'?nodes.get(id):node(id),querySelector:s=>s==='dialog[open]'?(nodes.get('eua-search-dialog')?.open?nodes.get('eua-search-dialog'):null):null,querySelectorAll:()=>[toggle],addEventListener(k,f){events.set(k,f);},removeEventListener(){}};
 const ui=mountQuickTools(root);assert(ui);
 const button=action=>{const b=node('button-'+action);b.dataset.euaTool=action;b.closest=()=>({querySelector:()=>status});return b;};
 const click=async action=>{const b=action==='focus'?toggle:button(action);await events.get('click')({target:{closest(selector){return selector==='[data-eua-tool]'?b:null;}}});return b;};
 return {ui,root,node,click,key:key=>events.get('keydown')({key}),status};
}
let copied=null;const f=fixture({writeText:async value=>{copied=value;}});
const opener=await f.click('search');assert(f.node('eua-search-dialog').open);assert(f.node('eua-material-query').focused);
f.node('eua-material-query').value='Протеїн';f.node('eua-material-query').events.get('input')();assert(f.node('eua-material-results').innerHTML.includes('#supplement-protein'));assert(!f.node('eua-material-results').innerHTML.includes('href="./index.html#creatine"'));
f.node('eua-material-query').value='xxxyyy';f.ui.render();assert(f.node('eua-material-count').textContent.includes('Нічого'));
f.node('eua-search-dialog').close();assert(opener.focused);
await f.click('focus');assert.equal(f.root.body.dataset.euaFocus,'true');assert(f.node('nutrition-lab').scrolled);f.key('Escape');assert(!f.root.body.dataset.euaFocus);assert(f.node('focus-button').focused);
await f.click('focus');await f.click('search');f.key('Escape');assert(f.root.body.dataset.euaFocus,'Open modal receives Escape before study mode');f.node('eua-search-dialog').close();await f.click('focus');assert(!f.root.body.dataset.euaFocus);
const share=await f.click('share');assert.equal(copied,clean);assert(!share.disabled);assert(f.status.textContent.includes('скопійовано'));
const missing=fixture(undefined);await missing.click('share');const field=missing.status.children[0].children[0];assert.equal(field.value,clean);assert(field.selected);assert(field.readOnly);
const rejected=fixture({writeText:async()=>{throw Error('Denied');}});await rejected.click('share');assert(rejected.status.children[0].children[0].selected);
const other=fixture(undefined);other.root.createElement=()=>{throw Error('Must not mount duplicate dialog');};assert.equal(mountQuickTools(other.root),undefined);
f.ui.destroy();
for(const file of ['src/platform/materials.mjs','src/platform/quick-tools.mjs']){const text=fs.readFileSync(file,'utf8');for(const api of ['fetch(','localStorage','sendBeacon','XMLHttpRequest','new WebSocket'])assert(!text.includes(api),file);}
const css=fs.readFileSync('dist/platform.css','utf8');for(const key of ['min-height:44px','height:100dvh','grid-template-columns:minmax(0,1fr)','dialog::backdrop','prefers-reduced-motion'])assert(css.includes(key));
// Other scientific registries, artwork and original scenes remain byte-identical to v58.
// Muscle Lab allows only the explicit R1–R4 changes checked against v57 in muscle-flow.test.mjs.
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/visitor-v58-file-hashes.json','utf8'));
assert.equal(baseline.sourceCommit,'b48b9d0f5858673f8c6f9985c1984c198847031d');
assert.equal(Object.keys(baseline.files).length,8);
for(const [file,expected] of Object.entries(baseline.files))assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),expected,file);
console.log('Visitor tools: real search/open/close/focus handlers, direct materials, copy/fallback, safe URLs, feedback context, duplicate mount, no transport/storage and unchanged other scientific registries passed. No browser layout QA.');
