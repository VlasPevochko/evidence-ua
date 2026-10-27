import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mountAppearance,APPEARANCE_KEY} from '../src/platform/appearance.mjs';

// Exercise the real mounted handlers: storage denial must not remove session controls.
function fixture(storageMode,stored=null){
  const events=new Map(),writes=[];
  let doc;
  function node(){return {children:[],dataset:{},attributes:{},events:new Map(),hidden:false,
    setAttribute(k,v){this.attributes[k]=v;},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},
    addEventListener(k,f){this.events.set(k,f);},focus(){doc.activeElement=this;},
    querySelector(selector){return this.children.flatMap(function walk(n){return [n,...n.children.flatMap(walk)];}).find(n=>selector==='[aria-checked="true"]'?n.attributes['aria-checked']==='true':selector==='.eua-appearance'&&n.className==='eua-appearance');}};}
  const header=node(),meta={},media={matches:true,addEventListener(k,f){events.set('media-'+k,f);}};
  const storage={getItem(){if(storageMode==='read')throw new DOMException('Denied','SecurityError');return stored;},setItem(k,v){if(storageMode==='write'||storageMode==='read')throw new DOMException('Denied','SecurityError');writes.push([k,v]);}};
  const view={matchMedia:()=>media};Object.defineProperty(view,'localStorage',{get(){if(storageMode==='getter')throw new DOMException('Denied','SecurityError');return storage;}});
  doc={defaultView:view,documentElement:{dataset:{}},createElement:node,querySelector:s=>s==='.eua-site-header'?header:meta,addEventListener(k,f){events.set(k,f);}};
  const controls=()=>{const [toggle,panel]=header.children[0].children;return {toggle,panel,pick:(group,value)=>{const button=panel.children[group].children[1].children.find(n=>n.dataset.value===value);button.events.get('click')();}};};
  return {doc,writes,events,controls,media};
}
for(const mode of ['getter','read','write','working'])test(`appearance controls survive ${mode} storage`,()=>{
  const f=fixture(mode);assert.equal(mountAppearance(f.doc),true);
  let c=f.controls();c.toggle.events.get('click')();assert.equal(c.panel.hidden,false);
  c.pick(0,'light');assert.equal(f.doc.documentElement.dataset.theme,'light');
  c=f.controls();assert.equal(c.panel.children[0].querySelector('[aria-checked="true"]').dataset.value,'light');
  c.pick(1,'xl');assert.equal(f.doc.documentElement.dataset.text,'xl');
  assert.equal(f.doc.documentElement.dataset.theme,'light','text choice preserves in-memory theme');
  c=f.controls();assert.equal(c.panel.children[1].querySelector('[aria-checked="true"]').dataset.value,'xl');
  c.pick(0,'auto');f.media.matches=false;f.events.get('media-change')();assert.equal(f.doc.documentElement.dataset.theme,undefined);
  assert.equal(f.doc.documentElement.dataset.text,'xl');
  f.events.get('keydown')({key:'Escape',preventDefault(){}});assert.equal(c.panel.hidden,true);assert.equal(f.doc.activeElement,c.toggle);
  assert.equal(mountAppearance(f.doc),true);assert.equal(f.doc.documentElement.dataset.text,'xl','duplicate mount preserves choices');
  if(mode==='working')assert.deepEqual(JSON.parse(f.writes.at(-1)[1]),{theme:'auto',text:'xl'});
  else assert.equal(f.writes.length,0);
});
test('appearance restores working storage and writes the existing key',()=>{
  const f=fixture('working',JSON.stringify({theme:'light',text:'lg'}));mountAppearance(f.doc);
  assert.deepEqual(f.doc.documentElement.dataset,{theme:'light',text:'lg'});f.controls().pick(1,'md');
  assert.equal(f.writes[0][0],APPEARANCE_KEY);assert.deepEqual(JSON.parse(f.writes[0][1]),{theme:'light',text:'md'});
});
