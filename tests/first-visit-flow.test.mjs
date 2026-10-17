import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {catalog,learningHref,learningLocation} from '../src/platform/catalog.mjs';
import {homeLearningHTML,pathCard} from '../src/platform/learning-ui.mjs';
import {mountPlatformNavigation,learningNavigationHTML} from '../src/platform/shell.mjs';
import {feedbackMaterial,feedbackMaterialOptions,feedbackReport,mountHomeFeedback} from '../src/platform/home-feedback.mjs';
import {contextLink,materials} from '../src/platform/materials.mjs';

const retainedContent=JSON.parse(fs.readFileSync('tests/fixtures/retained-content-sha256.json','utf8'));

function scientificSectionDigests(source){
 const expectedIds=new Set(Object.keys(retainedContent.homeScientificSections));
 const digests={};const tags=/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>|<\/?section\b[^>]*>/gi;
 let depth=0,start=-1,id='';
 for(const match of source.matchAll(tags)){
  const tag=match[0];if(tag.startsWith('<!--')||/^<(script|style)\b/i.test(tag))continue;
  if(tag.startsWith('</')){
   depth--;
   if(depth===0&&start>=0){digests[id]=crypto.createHash('sha256').update(source.slice(start,match.index+tag.length)).digest('hex');start=-1;id='';}
  }else{
   if(depth===0){const found=tag.match(/\bid=["']([^"']+)["']/i);if(found&&expectedIds.has(found[1])){start=match.index;id=found[1];}}
   depth++;
  }
 }
 return digests;
}

function htmlIds(source){
 const ids=[];const tags=/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>|<([a-z][\w:-]*)\b([^>]*)>/gi;
 for(const match of source.matchAll(tags)){
  if(match[0].startsWith('<!--')||match[1])continue;
  const id=match[3].match(/\bid=["']([^"']+)["']/i);if(id)ids.push(id[1]);
 }
 return ids;
}

const home=homeLearningHTML();
assert(fs.readFileSync('dist/index.html','utf8').includes('<!-- EUA_HOME_LEARNING_START -->'+home+'<!-- EUA_HOME_LEARNING_END -->'));
assert.equal((home.match(/class="path-card"/g)||[]).length,catalog.paths.length);
for(const path of catalog.paths){
 assert(home.includes(path.title));
 for(let i=0;i<path.steps.length;i++){
  const href=learningHref(path.id,i);assert(home.includes(href.replaceAll('&','&amp;')));
  const position=learningLocation(new URL(href,'https://evidence.invalid/').href);
  const nav=learningNavigationHTML(position);assert(nav.includes(`Крок ${i+1} із ${path.steps.length}`));
  if(i>0)assert(nav.includes(learningHref(path.id,i-1).replaceAll('&','&amp;')));
  if(i<path.steps.length-1)assert(nav.includes(learningHref(path.id,i+1).replaceAll('&','&amp;')));
  assert(nav.includes('#home-learning-paths'));
 }
}
assert(pathCard({...catalog.paths[0],title:'<script>alert(1)</script>'}).includes('&lt;script&gt;'));
assert(!pathCard({...catalog.paths[0],title:'<script>alert(1)</script>'}).includes('<script>'));
assert.equal(contextLink('https://evidence.invalid/?token=secret#home-learning-paths'),'https://evidence.invalid/#home-learning-paths');

// Exercise same-page history changes, not only initial template rendering.
function shellFixture(area='cell'){
 const handlers=new Map(),routes={open:false};let nav=null,entry=null;
 const createElement=tag=>({tag,dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},remove(){if(nav===this)nav=null;}});
 const window={location:{href:new URL(learningHref('structure',0),'https://evidence.invalid/').href},addEventListener(k,f){const list=handlers.get(k)||[];list.push(f);handlers.set(k,list);},removeEventListener(k,f){handlers.set(k,(handlers.get(k)||[]).filter(item=>item!==f));}};
 window.self=window;window.top=window;
 const canvas={before(element){nav=element;}},headerNav={querySelector(){return entry;},append(element){entry=element;}};
 const root={body:{dataset:{platformArea:area}},defaultView:window,querySelector(s){if(s==='link[data-platform-style]')return {};if(s==='.eua-learning-nav')return nav;if(s==='.page > header nav')return headerNav;return null;},querySelectorAll(){return [];},getElementById(id){return id==='cell-canvas'?canvas:id==='home-learning-paths'?routes:null;},createElement};
 return {root,window,handlers,routes,getNav:()=>nav,getEntry:()=>entry,dispatch(event){for(const handler of handlers.get(event)||[])handler();}};
}
const shell=shellFixture();mountPlatformNavigation(shell.root);
assert(shell.getNav().innerHTML.includes('Будова і рух'));
shell.window.location.href=new URL(learningHref('energy',0),'https://evidence.invalid/').href;
shell.dispatch('popstate');assert(shell.getNav().innerHTML.includes('Клітина та енергія'));
shell.window.location.href='https://evidence.invalid/cell-lab.html?path=energy&lesson=99#cell-canvas';
shell.dispatch('popstate');assert.equal(shell.getNav(),null);
mountPlatformNavigation(shell.root);assert.equal(shell.handlers.get('popstate').length,1);assert.equal(shell.handlers.get('hashchange').length,1);
shell.window.location.href='https://evidence.invalid/#home-learning-paths';shell.dispatch('hashchange');assert(shell.routes.open);
const main=shellFixture('home');main.window.location.href='https://evidence.invalid/#top';mountPlatformNavigation(main.root);
assert.equal(main.getEntry().textContent,'Каталог');assert.equal(main.getEntry().href,'./directions.html');
const entry=main.getEntry();mountPlatformNavigation(main.root);assert.equal(main.getEntry(),entry);

const href='https://evidence.invalid/?feedbackFor=supplements-protein&token=secret#home-feedback';
assert.equal(feedbackMaterial(href).id,'supplements-protein');assert.equal(feedbackMaterial(href,''),null);
assert.equal(feedbackMaterial(href,'<script>'),null);
assert(!feedbackReport({useful:'Зрозуміло',materialId:''},href).includes('Матеріал:'));
assert(feedbackReport({useful:'Зрозуміло',materialId:'cell-general'},href).includes('Матеріал: Загальна клітина'));
assert(!feedbackReport({useful:'Зрозуміло',materialId:'cell-general'},href).includes('Протеїн'));
assert(!feedbackReport({useful:'Зрозуміло',materialId:'unknown'},href).includes('secret'));
const options=feedbackMaterialOptions();assert(options.includes('Головна сторінка'));
assert.equal((options.match(/<option value=/g)||[]).length,materials.length+1);
for(const material of materials)assert(options.includes(`value="${material.id}"`));
for(const planned of catalog.areas.filter(a=>!a.available))assert(!options.includes(`value="${planned.id}"`));

function feedbackFixture(){
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',hidden:true,events:new Map(),addEventListener(k,f){this.events.set(k,f);},removeEventListener(k){this.events.delete(k);},focus(){this.focused=true;},select(){this.selected=true;}});return nodes.get(id);};
 const root={querySelector:node,defaultView:{location:{href,hash:'#home-feedback'},navigator:{}},addEventListener(){},removeEventListener(){}};
 const destroy=mountHomeFeedback(root);return {node,destroy,submit:()=>node('#home-feedback-form').events.get('submit')({preventDefault(){}})};
}
const feedback=feedbackFixture();assert.equal(feedback.node('#feedback-material').value,'supplements-protein');
assert(feedback.node('#home-feedback').open);
feedback.node('#feedback-useful').value='Зрозуміла схема';feedback.submit();assert(feedback.node('#home-feedback-text').value.includes('Матеріал: Протеїн'));
feedback.node('#feedback-material').value='cell-general';feedback.node('#home-feedback-form').events.get('change')();assert(feedback.node('#home-feedback-output').hidden);
feedback.submit();assert(feedback.node('#home-feedback-text').value.includes('Матеріал: Загальна клітина'));
feedback.node('#feedback-material').value='';feedback.submit();assert(!feedback.node('#home-feedback-text').value.includes('Матеріал:'));
feedback.node('#feedback-clear').events.get('click')();assert.equal(feedback.node('#feedback-useful').value,'');assert.equal(feedback.node('#home-feedback-text').value,'');assert(feedback.node('#home-feedback-output').hidden);assert(feedback.node('#feedback-useful').focused);
feedback.submit();assert(feedback.node('#home-feedback-output').hidden);feedback.destroy();assert(!feedback.node('#feedback-clear').events.has('click'));

const page=fs.readFileSync('dist/index.html','utf8');
assert.deepEqual(scientificSectionDigests(page),retainedContent.homeScientificSections,'Scientific homepage sections changed from the checked-in baseline');
assert.equal((page.match(/id="home-learning-paths"/g)||[]).length,1);
const renderedPaths=page.match(/<details\b[^>]*\bid="home-learning-paths"[^>]*>([\s\S]*?)<\/details>/);
assert(renderedPaths);assert.equal((renderedPaths[1].match(/<article\b/g)||[]).length,catalog.paths.length);
assert(page.includes('<label for="feedback-material">'));
assert(page.includes('id="feedback-clear"')&&page.includes('type="button"'));
const ids=htmlIds(page);assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
console.log('First visit: shared route cards, valid curriculum links, popstate/reset, unique header entry, explicit feedback context/clearing and frozen science baselines passed. Browser layout QA pending.');
