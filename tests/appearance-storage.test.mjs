import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mountAppearance,APPEARANCE_KEY} from '../src/platform/appearance.mjs';

// Exercise the real mounted handlers: storage denial must not remove session controls.
// 2026-10-31: the panel got a third group «Колір» (cosmic / green) between theme and text, so groups are addressed by their kind, not by position.
function fixture(storageMode,stored=null,home=false){
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
  if(home)doc.body={dataset:{platformArea:'home'}};
  const controls=()=>{const [toggle,panel]=header.children[0].children;return {toggle,panel,group:kind=>panel.children.find(n=>n.dataset.kind===kind),pick:(kind,value)=>{const group=panel.children.find(n=>n.dataset.kind===kind);const button=group.children[1].children.find(n=>n.dataset.value===value);button.events.get('click')();}};};
  return {doc,writes,events,controls,media};
}
for(const mode of ['getter','read','write','working'])test(`appearance controls survive ${mode} storage`,()=>{
  const f=fixture(mode);assert.equal(mountAppearance(f.doc),true);
  let c=f.controls();c.toggle.events.get('click')();assert.equal(c.panel.hidden,false);
  c.pick('theme','light');assert.equal(f.doc.documentElement.dataset.theme,'light');
  c=f.controls();assert.equal(c.group('theme').querySelector('[aria-checked="true"]').dataset.value,'light');
  c.pick('text','xl');assert.equal(f.doc.documentElement.dataset.text,'xl');
  assert.equal(f.doc.documentElement.dataset.theme,'light','text choice preserves in-memory theme');
  c=f.controls();assert.equal(c.group('text').querySelector('[aria-checked="true"]').dataset.value,'xl');
  c.pick('theme','auto');f.media.matches=false;f.events.get('media-change')();assert.equal(f.doc.documentElement.dataset.theme,undefined);
  assert.equal(f.doc.documentElement.dataset.text,'xl');
  f.events.get('keydown')({key:'Escape',preventDefault(){}});assert.equal(c.panel.hidden,true);assert.equal(f.doc.activeElement,c.toggle);
  assert.equal(mountAppearance(f.doc),true);assert.equal(f.doc.documentElement.dataset.text,'xl','duplicate mount preserves choices');
  if(mode==='working')assert.deepEqual(JSON.parse(f.writes.at(-1)[1]),{theme:'auto',text:'xl',palette:'cosmic'},'the record carries the palette; cosmic is the default');
  else assert.equal(f.writes.length,0);
});
test('appearance restores working storage and writes the existing key',()=>{
  const f=fixture('working',JSON.stringify({theme:'light',text:'lg'}));mountAppearance(f.doc);
  assert.deepEqual(f.doc.documentElement.dataset,{theme:'light',text:'lg'});f.controls().pick('text','md');
  assert.equal(f.writes[0][0],APPEARANCE_KEY);assert.deepEqual(JSON.parse(f.writes[0][1]),{theme:'light',text:'md',palette:'cosmic'},'an old record without a palette is read as cosmic and saved with it');
});

// Колір: космос (за замовчуванням) або зелений. Вибір пишеться в той самий ключ, зелений ставить data-palette на <html>.
test('palette choice sets data-palette, is saved with the existing key and survives other choices',()=>{
  const f=fixture('working');mountAppearance(f.doc);
  assert.equal('palette' in f.doc.documentElement.dataset,false,'first visit: cosmic, no attribute');
  let c=f.controls();c.toggle.events.get('click')();
  assert.equal(c.group('palette').querySelector('[aria-checked="true"]').dataset.value,'cosmic');
  c.pick('palette','green');assert.equal(f.doc.documentElement.dataset.palette,'green');
  assert.equal(f.writes.at(-1)[0],APPEARANCE_KEY);assert.deepEqual(JSON.parse(f.writes.at(-1)[1]),{theme:'dark',text:'md',palette:'green'});
  c=f.controls();assert.equal(c.group('palette').querySelector('[aria-checked="true"]').dataset.value,'green','the panel is rebuilt with the new choice checked');
  c.pick('theme','light');c.pick('text','lg');
  assert.equal(f.doc.documentElement.dataset.palette,'green','theme and text choices keep the palette');
  c=f.controls();c.pick('palette','cosmic');
  assert.equal('palette' in f.doc.documentElement.dataset,false,'back to cosmic removes the attribute');
  assert.deepEqual(JSON.parse(f.writes.at(-1)[1]),{theme:'light',text:'lg',palette:'cosmic'});
});
test('a stored green choice is applied on mount',()=>{
  const f=fixture('working',JSON.stringify({theme:'dark',text:'md',palette:'green'}));mountAppearance(f.doc);
  assert.equal(f.doc.documentElement.dataset.palette,'green');
});
test('the home page keeps its own look: no colour group in the panel there',()=>{
  const f=fixture('working',null,true);mountAppearance(f.doc);
  const kinds=f.controls().panel.children.map(n=>n.dataset.kind);
  assert.deepEqual(kinds,['theme','text'],'theme and text size only');
  const g=fixture('working',null,false);mountAppearance(g.doc);
  assert.deepEqual(g.controls().panel.children.map(n=>n.dataset.kind),['theme','palette','text'],'other pages get the colour group between theme and text');
});
