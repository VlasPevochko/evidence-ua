import assert from 'node:assert/strict';
import {findMaterials} from '../src/platform/materials.mjs';
import {mountDirectory} from '../src/platform/directory.mjs';

// These queries use everyday names for topics already present in the site.
assert(findMaterials('білок').some(m=>m.id==='supplements-protein'));
assert(findMaterials('білка').some(m=>m.id==='nutrition-protein-absorption'));
assert(findMaterials('енергія').some(m=>m.id==='cell-mitochondrion'));
assert(findMaterials('енергія','evidence').some(m=>m.id==='supplements-atp-pcr'));
assert(findMaterials('білок','nutrition').every(m=>m.areaId==='nutrition'));
assert(!findMaterials('білок','nutrition').some(m=>m.id==='supplements-protein'));
assert.equal(findMaterials('неіснуюча-тема').length,0);

function fixture(state={existing:'preserved'}){
 const nodes=new Map(),events=new Map();
 const node=()=>({value:'',innerHTML:'',textContent:'',hidden:false,open:false,handlers:{},dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,f){this.handlers[k]=f;},focus(){this.focused=true;}});
 const buttons=['all','atlas','nutrition','evidence','movement'].map(group=>{const b=node();b.dataset.group=group;return b;});
 const history={state,replaceState(next){this.state=next;}};
 const root={defaultView:{history,addEventListener(k,f){events.set(k,f);}},querySelector(key){if(!nodes.has(key))nodes.set(key,node());return nodes.get(key);},querySelectorAll(selector){return selector==='[data-group]'?buttons:[];}};
 mountDirectory(root);
 return {history,node:key=>root.querySelector(key),button:group=>buttons.find(b=>b.dataset.group===group),events};
}
const original=fixture();
original.node('#area-search').value='білок';original.node('#area-search').handlers.input();
original.button('nutrition').handlers.click();
assert(original.node('#material-list').innerHTML.includes('Амінокислоти й пептиди'));
assert(!original.node('#material-list').innerHTML.includes('#supplement-protein'));
assert(original.node('#area-list').innerHTML.includes('Харчування'));
assert.equal(original.history.state.existing,'preserved');

// A fresh document represents navigation away and return, or a reload.
const returned=fixture(original.history.state);
assert.equal(returned.node('#area-search').value,'білок');
assert.equal(returned.button('nutrition').attributes['aria-pressed'],'true');
assert(returned.node('#material-list').innerHTML.includes('Амінокислоти й пептиди'));
assert(returned.node('#material-results').open);
returned.node('#area-search').value='unrelated';returned.events.get('pageshow')();
assert.equal(returned.node('#area-search').value,'білок');
returned.node('#clear-search').handlers.click();
const cleared=fixture(returned.history.state);
assert.equal(cleared.node('#area-search').value,'');
assert.equal(cleared.button('all').attributes['aria-pressed'],'true');
const invalid=fixture({euaDirectory:{query:123,group:'unknown'}});
assert.equal(invalid.node('#area-search').value,'');
assert.equal(invalid.button('all').attributes['aria-pressed'],'true');
console.log('Everyday search terms, scoped results, area matches, history restoration/reset and unrelated history state passed.');
