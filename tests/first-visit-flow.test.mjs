import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog,learningHref,learningLocation} from '../src/platform/catalog.mjs';
import {homeLearningHTML,pathCard} from '../src/platform/learning-ui.mjs';
import {mountPlatformNavigation,learningNavigationHTML} from '../src/platform/shell.mjs';
import {feedbackMaterial,feedbackMaterialOptions,feedbackReport,mountHomeFeedback} from '../src/platform/home-feedback.mjs';
import {contextLink,materials} from '../src/platform/materials.mjs';

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

// Independent v59 baseline: preserve all scientific article subtrees exactly.
execFileSync('python',['-c',`from pathlib import Path
from lxml import html
import subprocess
before=html.fromstring(subprocess.check_output(['git','show','9d174ef146c09936be2c615e1a663b7e4f7dbd29:dist/index.html']))
after=html.fromstring(Path('dist/index.html').read_text())
for expression in ['//body/section[@id="creatine" or starts-with(@id,"supplement-")]']:
    a=before.xpath(expression); b=after.xpath(expression)
    assert len(a)==len(b)
    for old,new in zip(a,b): assert html.tostring(old)==html.tostring(new), old.get('id')
routes=after.xpath('//*[@id="home-learning-paths"]')
assert len(routes)==1 and len(routes[0].xpath('.//article'))==3
assert after.xpath('//label[@for="feedback-material"]')
assert after.xpath('//*[@id="feedback-clear" and @type="button"]')
ids=after.xpath('//@id'); assert len(ids)==len(set(ids)), 'Duplicate HTML IDs'
`]);
console.log('First visit: shared route cards, valid curriculum links, popstate/reset, unique header entry, explicit feedback context/clearing and unchanged v59 scientific articles passed. Browser layout QA pending.');
