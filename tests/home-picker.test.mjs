import test from 'node:test';
import assert from 'node:assert/strict';

const {mountHomePicker} = await import('../src/platform/home-picker.mjs').catch(error => {
  if(error.code==='ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

class Node extends EventTarget {
  attrs=new Map(); open=false;
  setAttribute(k,v){this.attrs.set(k,String(v));}
  getAttribute(k){return this.attrs.get(k)??null;}
  removeAttribute(k){this.attrs.delete(k);}
  focus(){this.doc.activeElement=this;}
  contains(n){return n===this||n?.parent===this;}
  getBoundingClientRect(){return {left:10,right:350,top:10,bottom:600};}
  showModal(){this.open=true;}
  close(){this.open=false;this.dispatchEvent(new Event('close'));}
  closest(selector){return selector==='a'&&this.tagName==='A'?this:null;}
}
function fixture({supported=true,hash='',throws=false}={}){
  const doc=new EventTarget(),view=new EventTarget();doc.defaultView=view;
  const trigger=new Node(),panel=new Node(),close=new Node(),body=new Node();
  for(const n of [trigger,panel,close,body])n.doc=doc;
  trigger.setAttribute('href','./directions.html');close.parent=panel;
  const section={querySelector:s=>s==='[data-lens-reveal]'?trigger:s==='[data-lens-picker]'?panel:null};
  panel.querySelector=()=>close;
  if(!supported)panel.showModal=undefined;
  if(throws)panel.showModal=()=>{throw Error('unavailable');};
  doc.body=body;doc.activeElement=trigger;
  view.location={hash};
  assert.equal(typeof mountHomePicker,'function','The contextual picker controller must exist');
  const dispose=mountHomePicker(doc,section);
  function fire(target,type,props={}){
    const e=new Event(type,{cancelable:true});
    for(const [k,v]of Object.entries(props))Object.defineProperty(e,k,{value:v});
    target.dispatchEvent(e);return e;
  }
  return {doc,view,trigger,panel,close,dispose,fire};
}

test('six choices stay closed until the lens action is activated',()=>{
  const f=fixture();assert.equal(f.panel.open,false);
  assert.equal(f.trigger.getAttribute('aria-expanded'),'false');
  assert.equal(f.fire(f.trigger,'click',{button:0}).defaultPrevented,true);
  assert.equal(f.panel.open,true);assert.equal(f.doc.activeElement,f.close);
  assert.equal(f.trigger.getAttribute('aria-expanded'),'true');
  f.fire(f.close,'click');assert.equal(f.panel.open,false);
  assert.equal(f.doc.activeElement,f.trigger);
});
test('modifier clicks and unavailable dialog support retain native navigation',()=>{
  for(const props of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]){
    const f=fixture();assert.equal(f.fire(f.trigger,'click',props).defaultPrevented,false);assert.equal(f.panel.open,false);
  }
  for(const options of [{supported:false},{throws:true}]){
    const f=fixture(options);assert.equal(f.fire(f.trigger,'click').defaultPrevented,false);
    assert.equal(f.trigger.getAttribute('href'),'./directions.html');assert.equal(f.panel.open,false);
  }
});
test('Space opens the picker and Escape or backdrop closes it',()=>{
  const f=fixture();assert.equal(f.fire(f.trigger,'keydown',{key:' '}).defaultPrevented,true);
  f.fire(f.panel,'cancel');assert.equal(f.panel.open,false);assert.equal(f.doc.activeElement,f.trigger);
  f.fire(f.trigger,'click');f.fire(f.panel,'click',{clientX:1,clientY:1});assert.equal(f.panel.open,false);
  f.fire(f.trigger,'click');f.fire(f.panel,'click',{clientX:20,clientY:20});assert.equal(f.panel.open,true,'Panel padding is not the backdrop');
});
test('legacy fragments open choices and route changes dismiss without stealing focus',()=>{
  const f=fixture({hash:'#cards'});assert.equal(f.panel.open,true);
  f.doc.activeElement=f.doc.body;f.view.location.hash='#supplement-library';f.fire(f.view,'hashchange');
  assert.equal(f.panel.open,false);assert.equal(f.doc.activeElement,f.doc.body);
  f.view.location.hash='#cards';f.fire(f.view,'hashchange');assert.equal(f.panel.open,true);
  f.fire(f.view,'pagehide');assert.equal(f.panel.open,false);
});
test('choosing a direction closes the panel without cancelling its destination',()=>{
  const f=fixture();f.fire(f.trigger,'click');
  const link=new Node();link.tagName='A';link.parent=f.panel;
  assert.equal(f.fire(f.panel,'click',{target:link}).defaultPrevented,false);
  assert.equal(f.panel.open,false);
});
test('disposal closes the panel, restores attributes and removes handlers',()=>{
  const f=fixture();f.fire(f.trigger,'click');f.dispose();f.dispose();
  assert.equal(f.panel.open,false);assert.equal(f.trigger.getAttribute('aria-expanded'),null);
  assert.equal(f.fire(f.trigger,'click').defaultPrevented,false);assert.equal(f.panel.open,false);
});
