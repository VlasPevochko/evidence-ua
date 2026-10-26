// 2026-10-26 Muscle Lab guide: catalog/materials gained muscle units and search words → versions cascade (catalog/materials/tools/shell/directions/home-feedback 98→99, site-header 5→6, search 3→4).
// Shared shell cache version includes the Nutrition route migration.
// 2026-10-22: search finds supplements by topic (new keywords in platform-materials) → cascade: materials v84, search v2, header v4, tools v85, shell v97.
// Cache expectations updated for the scoped shared-header geometry fix.
// Shared header release bumps the shell cache version to 84; science contracts are unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog,createCatalog,findAreas,learningHref,learningLocation} from '../dist/platform-catalog.js';
import {areaCard,pathCard,mountDirectory} from '../dist/directions.js';
import {navigationHTML,learningNavigationHTML,mountPlatformNavigation} from '../dist/platform-shell.js';
import {initialStructure,renderTopics,mount as mountMuscle} from '../dist/muscle-lab.js';
import {initialOrganelle,mount as mountCell} from '../dist/cell-lab.js';

assert.equal(catalog.areas.filter(a=>a.available).length,6);
assert.equal(catalog.paths.length,3);
assert.equal(findAreas('протеїн')[0].id,'supplements');
assert.equal(findAreas('саркомер')[0].id,'muscle');
assert.equal(findAreas('', 'atlas').length,2);
assert.equal(findAreas('невідомий матеріал').length,0);
assert(!findAreas('').some(a=>a.group==='planned'));
assert.throws(()=>createCatalog([catalog.areas[0],catalog.areas[0]],[]),/Duplicate area/);
assert.throws(()=>createCatalog([{...catalog.areas[0],href:'https://example.com'}],[]),/Invalid/);
assert.throws(()=>createCatalog([{...catalog.areas.find(a=>!a.available),href:'./missing.html'}],[]),/Planned/);
assert.throws(()=>createCatalog(catalog.areas,[{id:'bad',steps:[{areaId:'muscle',unitId:'missing'}]}]),/Unresolved/);
assert.throws(()=>createCatalog([{...catalog.areas[0],units:[{id:'bad',href:'./muscle-lab.html',entityIds:['UNKNOWN']}]}],[]),/Unknown scientific entity/);
for(const area of catalog.areas){
  if(!area.available){assert.equal(area.href,undefined);continue;}
  assert(areaCard(area).includes(area.review));
  for(const unit of [{href:area.href},...area.units]){
    const url=new URL(unit.href,'https://evidence.invalid/'),file='dist'+url.pathname;
    assert(fs.existsSync(file),file);
    if(url.hash){const html=fs.readFileSync(file,'utf8')+(file==='dist/muscle-lab.html'?renderTopics('university'):''),id=url.hash.slice(1);assert(html.includes(`id="${id}"`)||['supplement-library','evidence-guide-title'].includes(id),`Missing ${unit.href}`);}
  }
}
for(const path of catalog.paths){assert(pathCard(path).includes('Почати маршрут'));for(let i=0;i<path.steps.length;i++){
  const href=learningHref(path.id,i),location=learningLocation(new URL(href,'https://evidence.invalid/').href);
  assert.equal(location.path.id,path.id);assert.equal(location.index,i);
  assert(learningNavigationHTML(location).includes(`Крок ${i+1} із ${path.steps.length}`));
}}
assert.equal(learningLocation('https://evidence.invalid/muscle-lab?path=structure&lesson=1#explorer').index,1);
assert.equal(learningLocation('https://evidence.invalid/?path=energy&lesson=2#creatine-mechanism').index,2);
assert.equal(learningLocation('https://evidence.invalid/cell-lab.html?path=unknown&lesson=0'),null);
assert.equal(learningLocation('https://evidence.invalid/cell-lab.html?path=energy&lesson=99'),null);
assert.equal(learningLocation('https://evidence.invalid/cell-lab.html?path=energy&lesson=0#sources'),null);
assert.throws(()=>learningHref('energy',99),/Unknown/);
assert(!navigationHTML('cell').includes('Metabolism'));
assert(navigationHTML('cell').includes('href="./cell-lab.html" aria-current="page"'));
assert.equal(initialStructure('https://evidence.invalid/muscle-lab.html?structure=CELL-MUSCLE').id,'CELL-MUSCLE');
assert.equal(initialStructure('https://evidence.invalid/muscle-lab.html?structure=UNKNOWN').id,'TISSUE-SKELETAL-MUSCLE');
assert.equal(initialOrganelle('https://evidence.invalid/cell-lab.html?organelle=ORG-RIBOSOME'),'ORG-RIBOSOME');
assert.equal(initialOrganelle('https://evidence.invalid/cell-lab.html?organelle=UNKNOWN'),'ORG-MITOCHONDRION');

// Exercise search/filter/reset and deep-link initialization through real controllers.
const node=()=>({value:'',innerHTML:'',textContent:'',hidden:false,dataset:{},style:{setProperty(){}},classList:{toggle(){}},attributes:{},setAttribute(k,v){this.attributes[k]=v;},handlers:{},addEventListener(k,fn){this.handlers[k]=fn;},querySelector(){return node();},querySelectorAll(){return [];},contains(){return false;},focus(){this.focused=true;}});
function root(href){const nodes=new Map();return {nodes,defaultView:{location:{href}},activeElement:null,querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);},querySelectorAll(){return [];},addEventListener(){}};}
const directory=root('https://evidence.invalid/directions.html');const filterButtons=['all','atlas','nutrition','evidence','movement'].map(group=>{const button=node();button.dataset.group=group;return button;});directory.querySelectorAll=selector=>selector==='[data-group]'?filterButtons:[];mountDirectory(directory);filterButtons[1].handlers.click();assert(directory.querySelector('#area-count').textContent.endsWith(': 2'));assert.equal(filterButtons[1].attributes['aria-pressed'],'true');filterButtons[0].handlers.click();
const search=directory.querySelector('#area-search');search.value='саркомер';search.handlers.input();
assert(directory.querySelector('#area-list').innerHTML.includes('М’язи та тренування'));
assert(!directory.querySelector('#area-list').innerHTML.includes('Клітини та органели'));
search.value='not found';search.handlers.input();assert.equal(directory.querySelector('#search-empty').hidden,false);
directory.querySelector('#clear-search').handlers.click();assert.equal(search.value,'');assert.equal(search.focused,true);
assert.equal(directory.querySelector('#search-empty').hidden,true);
assert(!/<a[\s>]/.test(directory.querySelector('#planned-list').innerHTML));
const muscle=root('https://evidence.invalid/muscle-lab.html?structure=CELL-MUSCLE');mountMuscle(muscle);assert.equal(muscle.querySelector('#structure-title').textContent,'М’язове волокно');
const cell=root('https://evidence.invalid/cell-lab.html?organelle=ORG-RIBOSOME');mountCell(cell);assert.equal(cell.querySelector('#organelle-title').textContent,'Рибосома');assert(cell.querySelector('#cell-canvas').innerHTML.includes('data-organelle="ORG-RIBOSOME" role="button" tabindex="0" aria-pressed="true"'));
for(const page of ['index','muscle-lab','cell-lab','nutrition','nutrition-digestion','movement','protein-meta','sleep'])assert(fs.readFileSync(`dist/${page}.html`,'utf8').includes('platform-shell.js?v=99'));
console.log('Platform: registry, links/anchors, planned states, search/reset, learning routes and actual selected-entity initialization passed. Browser visual QA not performed.');

const created=[],header={nextElementSibling:null,closest(){return null;},after(element){this.nextElementSibling=element;}};
let style=null;
const shell={body:{dataset:{platformArea:'cell'}},head:{append(element){style=element;}},defaultView:{location:{href:'https://evidence.invalid/cell-lab.html'},addEventListener(){}},querySelector(selector){return selector==='link[data-platform-style]'?style:null;},querySelectorAll(){return [header];},getElementById(){return null;},createElement(tag){const element={...node(),tag,className:''};element.classList.contains=name=>element.className.split(' ').includes(name);created.push(element);return element;}};
shell.defaultView.self=shell.defaultView;shell.defaultView.top=shell.defaultView;
mountPlatformNavigation(shell);mountPlatformNavigation(shell);
assert.equal(created.filter(n=>n.className==='eua-platform-nav').length,1);
assert.equal(created.filter(n=>n.tag==='link').length,1);
assert(header.nextElementSibling.innerHTML.includes('aria-current="page"'));
const embedded={defaultView:{self:{},top:{}},createElement(){throw Error('Embedded page must not add navigation');}};
mountPlatformNavigation(embedded);
const extra={...catalog.areas[0],id:'test-area',title:'Тестовий напрям',units:[]};assert.equal(createCatalog([extra],[]).getArea('test-area').title,'Тестовий напрям');assert(areaCard(extra).includes('Тестовий напрям'));
console.log('Shared shell mounts once, iframe is preserved, and generic catalog accepts another area.');
