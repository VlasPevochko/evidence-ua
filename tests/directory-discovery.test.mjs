import test from 'node:test';
import assert from 'node:assert/strict';
import {mountDirectory} from '../src/platform/directory.mjs';
import {findMaterials} from '../src/platform/materials.mjs';

function fixture(href='https://evidence.invalid/directions.html',state=null){
 const nodes=new Map(),events=new Map(),groups=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},attributes:{},handlers:new Map(),setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.handlers.set(k,fn);},focus(){this.focused=true;}});return nodes.get(id);};
 const make=(id,key,value)=>{const b=node(id);b.dataset[key]=value;return b;};
 groups.set('[data-group]',['all','atlas','nutrition','evidence','movement'].map(v=>make('group-'+v,'group',v)));
 groups.set('[data-kind]',['all','interactive','dossier','guide'].map(v=>make('kind-'+v,'kind',v)));
 groups.set('[data-query]',['м’яз','травлення','енергія','протеїн'].map(v=>make('query-'+v,'query',v)));
 const location={href},history={state,replaceState(next,_,url){this.state=next;if(url)location.href=String(url);}};
 const root={defaultView:{location,history,addEventListener(k,fn){events.set(k,fn);}},querySelector:node,querySelectorAll:s=>groups.get(s)||[]};
 mountDirectory(root);
 return {node,events,location,history,click:id=>node(id).handlers.get('click')?.(),search(value){node('#area-search').value=value;node('#area-search').handlers.get('input')();}};
}

test('format filtering shows only the chosen material kind and saves a reusable URL',()=>{
 const f=fixture('https://evidence.invalid/directions.html?from=home#available');
 f.click('kind-dossier');
 const html=f.node('#material-list').innerHTML;
 for(const m of findMaterials('').filter(m=>m.kind==='dossier'))assert(html.includes(m.title));
 assert(!html.includes('Мітохондрія'));
 assert.equal(f.node('#material-results').hidden,false);
 assert.equal(f.node('kind-dossier').attributes['aria-pressed'],'true');
 const url=new URL(f.location.href);assert.equal(url.searchParams.get('kind'),'dossier');assert.equal(url.searchParams.get('from'),'home');assert.equal(url.hash,'#available');
});

test('opening a catalog URL restores query, topic, and format before rendering',()=>{
 const f=fixture('https://evidence.invalid/directions.html?q=білок&group=evidence&kind=guide');
 assert.equal(f.node('#area-search').value,'білок');
 assert.equal(f.node('group-evidence').attributes['aria-pressed'],'true');
 assert.equal(f.node('kind-guide').attributes['aria-pressed'],'true');
 assert(f.node('#material-list').innerHTML.includes('Розбір метааналізу білка'));
 assert(!f.node('#material-list').innerHTML.includes('href="./index.html#creatine"'));
});

test('quick topics reset incompatible filters and focus the editable query',()=>{
 const f=fixture('https://evidence.invalid/directions.html?group=evidence&kind=dossier');
 f.click('query-травлення');
 assert.equal(f.node('#area-search').value,'травлення');
 assert.equal(f.node('group-all').attributes['aria-pressed'],'true');
 assert.equal(f.node('kind-all').attributes['aria-pressed'],'true');
 assert(f.node('#material-list').innerHTML.includes('Травлення та всмоктування'));
 assert(f.node('#area-search').focused);
});

test('reset clears all discovery filters and browser history can restore the format',()=>{
 const f=fixture();
 f.search('no-such-topic');f.click('kind-guide');assert.equal(f.node('#search-empty').hidden,false);
 f.click('#clear-search');
 assert.equal(f.node('#area-search').value,'');assert.equal(f.node('kind-all').attributes['aria-pressed'],'true');
 assert.equal(f.node('#material-results').hidden,true);assert.equal(f.node('#search-empty').hidden,true);
 assert.equal(new URL(f.location.href).search,'');
 f.location.href='https://evidence.invalid/directions.html?q=креатин&kind=dossier';f.events.get('popstate')();
 assert.equal(f.node('kind-dossier').attributes['aria-pressed'],'true');assert(f.node('#material-list').innerHTML.includes('Креатин'));
});

test('invalid URL filters fall back safely and old saved query state stays compatible',()=>{
 const invalid=fixture('https://evidence.invalid/directions.html?q=ядро&group=unknown&kind=invalid');
 assert.equal(invalid.node('group-all').attributes['aria-pressed'],'true');assert.equal(invalid.node('kind-all').attributes['aria-pressed'],'true');
 assert(invalid.node('#material-list').innerHTML.includes('Ядро'));
 const old=fixture(undefined,{euaDirectory:{query:'саркомер',group:'atlas'}});
 assert.equal(old.node('#area-search').value,'саркомер');assert.equal(old.node('group-atlas').attributes['aria-pressed'],'true');assert.equal(old.node('kind-all').attributes['aria-pressed'],'true');
});
