import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {test} from 'node:test';
import {mountSearch} from '../src/platform/search.mjs';
import {headerHTML} from '../src/platform/site-header.mjs';

// Browser boundaries only: dispatch the production listeners, preserve default
// link actions, and make focus/dialog state observable without a layout engine.
class Node {
  constructor(doc, tag='DIV') { this.doc=doc; this.tagName=tag; this.events=new Map(); this.attributes={}; this.dataset={}; this.value=''; this.hidden=false; this.isConnected=true; this.innerHTML=''; }
  addEventListener(type, fn, options={}) { const list=this.events.get(type)||[]; list.push({fn,once:options.once}); this.events.set(type,list); }
  removeEventListener(type, fn) { this.events.set(type,(this.events.get(type)||[]).filter(item=>item.fn!==fn)); }
  async fire(type, init={}) { const event={type,target:this,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...init}; for(const item of [...(this.events.get(type)||[])]) { await item.fn(event); if(item.once)this.removeEventListener(type,item.fn); if(event.stopped)break; } return event; }
  setAttribute(name,value) { this.attributes[name]=String(value); }
  getAttribute(name) { return this.attributes[name]??null; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus() { if(this.isConnected!==false&&this.getClientRects().length)this.doc.activeElement=this; }
  closest(selector) { if(selector==='a')return this.tagName==='A'?this:null; if(selector==='[hidden]')return this.hidden?this:this.parent?.closest(selector)||null; return null; }
  contains(node) { return node===this||node?.parent===this; }
  getClientRects() { for(let node=this;node;node=node.parent)if(node.hidden||node.rendered===false||node.isConnected===false||(node.tagName==='DIALOG'&&!node.open))return []; return [{}]; }
  getBoundingClientRect() { return this.bounds||{left:100,top:100,right:500,bottom:700}; }
}

function searchFixture() {
  const doc=new Node(null); doc.doc=doc;
  doc.defaultView=new Node(doc); doc.defaultView.location={href:'https://evidence.invalid/index.html',hash:''};
  doc.body=new Node(doc); doc.appended=[]; doc.body.append=node=>doc.appended.push(node);
  doc.createElement=tag=>{
    const dialog=new Node(doc,tag.toUpperCase()); dialog.open=false;
    const input=new Node(doc,'INPUT'), list=new Node(doc), status=new Node(doc);
    input.parent=list.parent=status.parent=dialog;
    dialog.querySelector=selector=>selector==='input'?input:selector==='.eua-search-results'?list:status;
    list.querySelectorAll=()=>[];
    dialog.showModal=()=>{dialog.open=true;};
    dialog.close=()=>{dialog.open=false;doc.activeElement=doc.body;void dialog.fire('close');};
    return dialog;
  };
  return {doc,button:new Node(doc,'BUTTON'),hero:new Node(doc,'INPUT')};
}

test('shared search reuses its controller and seeds the hero query with visible close focus',async()=>{
  const {doc,button,hero}=searchFixture();
  let loads=0;
  const loader=async()=>{loads++;return {materials:[{title:'Креатин',href:'./index.html#creatine',areaTitle:'Добавки'}],terms:[]};};
  const first=mountSearch(doc,button,loader);
  const second=mountSearch(doc,button,loader);
  assert.equal(second,first,'Header lazy loading and hero submission must share one controller');
  assert.equal(doc.events.get('keydown').length,1,'Remounting must not duplicate the / shortcut');
  await first.open('Креатин',hero);
  const dialog=doc.appended[0],input=dialog.querySelector('input');
  assert.equal(input.value,'Креатин');
  assert.match(dialog.querySelector('.eua-search-results').innerHTML,/#creatine/);
  dialog.close();
  assert.equal(doc.activeElement,hero,'Closing hero search returns focus to the visible hero input');
  await second.open();
  assert.equal(doc.appended.length,1);
  assert.equal(loads,1);
  dialog.close();
  assert.equal(doc.activeElement,button,'Legacy open() returns focus to its header button');
});

test('concurrent shared-search opens load once and retain the latest submitted query',async()=>{
  const {doc,button,hero}=searchFixture();
  let finish,loads=0;
  const controller=mountSearch(doc,button,()=>{loads++;return new Promise(resolve=>{finish=resolve;});});
  const first=controller.open('сон',hero), second=controller.open('Креатин',hero);
  assert.equal(loads,1,'Repeated submission while loading shares the data request');
  finish({materials:[{title:'Креатин',href:'./index.html#creatine'}],terms:[]});
  await Promise.all([first,second]);
  assert.equal(doc.appended.length,1);
  assert.equal(doc.appended[0].querySelector('input').value,'Креатин');
  assert.match(doc.appended[0].querySelector('.eua-search-results').innerHTML,/#creatine/);
});

test('shared keyboard search restores a configured visible opener and does not nest another dialog',async()=>{
  const {doc,button,hero}=searchFixture();
  button.dataset.searchFocus='spectrum-query';doc.getElementById=id=>id==='spectrum-query'?hero:null;
  let otherDialog=null;doc.querySelector=selector=>selector==='dialog[open]'?otherDialog:null;
  const controller=mountSearch(doc,button,async()=>({materials:[],terms:[]}));
  const shortcut=await doc.fire('keydown',{key:'/',target:doc.body});
  assert(shortcut.defaultPrevented);assert.equal(doc.appended.length,1);
  doc.appended[0].close();
  assert.equal(doc.activeElement,hero,'The hidden home header search returns keyboard users to the hero');
  otherDialog={open:true};
  const withinModal=await doc.fire('keydown',{key:'/',target:new Node(doc,'BUTTON')});
  assert.equal(withinModal.defaultPrevented,false);
  assert.equal(doc.appended[0].open,false,'A shortcut cannot layer search over the directions/about dialog');
  await controller.open();
  assert.equal(doc.appended[0].open,false,'An import that settles after another modal opens cannot create nested dialogs');
});

test('failed shared-search data provides a real catalog link and can be retried',async()=>{
  const {doc,button,hero}=searchFixture();let calls=0;
  const controller=mountSearch(doc,button,async()=>{if(++calls===1)throw Error('offline');return {materials:[{title:'Сон',href:'./sleep.html'}],terms:[]};});
  await controller.open('сон',hero);
  const dialog=doc.appended[0];
  assert.match(dialog.querySelector('.eua-search-results').innerHTML,/href="\.\/directions\.html"/);
  assert.match(dialog.querySelector('.eua-search-status').textContent,/Не вдалося/);
  await controller.open('сон',hero);
  assert.equal(calls,2);assert.match(dialog.querySelector('.eua-search-results').innerHTML,/\.\/sleep\.html/);
});

test('search focus skips hidden, unrendered or detached hero inputs on article routes',async()=>{
  for(const unavailable of ['hidden','ancestor','unrendered','detached']){
    const {doc,button,hero}=searchFixture(),container=new Node(doc);
    hero.parent=container;button.dataset.searchFocus='spectrum-query';doc.getElementById=()=>hero;
    if(unavailable==='hidden')hero.hidden=true;
    if(unavailable==='ancestor')container.hidden=true;
    if(unavailable==='unrendered')hero.rendered=false;
    if(unavailable==='detached')hero.isConnected=false;
    const controller=mountSearch(doc,button,async()=>({materials:[],terms:[]}));
    await controller.open();doc.appended[0].close();
    assert.equal(doc.activeElement,button,`${unavailable} hero input must give close focus to the visible header search`);
  }
});

test('search rechecks an explicit opener when navigation hides it before close',async()=>{
  const {doc,button,hero}=searchFixture(),container=new Node(doc);hero.parent=container;
  button.dataset.searchFocus='spectrum-query';doc.getElementById=()=>hero;
  const controller=mountSearch(doc,button,async()=>({materials:[],terms:[]}));
  await controller.open('сон',hero);
  container.rendered=false;doc.body.dataset.routeView='article';
  doc.appended[0].close();
  assert.equal(doc.activeElement,button,'Close must revalidate the requested hero opener after a route change');
});

test('home header has one compact navigation while the shared default retains every destination',()=>{
  // The owner selected a question-led homepage; only that page reduces its header.
  const home=headerHTML({home:true});
  assert.match(home,/eua-header-home-spectrum/);
  assert.match(home,/\.\/directions\.html/);
  assert.match(home,/#pubmed-live/);
  assert.match(home,/data-search-focus="spectrum-query"/);
  // All six native destinations survive in the same header for article routes;
  // only the home-scoped CSS hides the four secondary entries on the homepage.
  for(const href of ['./nutrition.html','./atlas.html','./exercises.html','./supplements.html'])assert(home.includes(`href="${href}"`));
  assert.equal((home.match(/data-home-secondary/g)||[]).length,4);
  assert.doesNotMatch(headerHTML(),/data-home-secondary/);
  assert.match(headerHTML(),/\.\/supplements\.html/);
});

async function homeModule(searchImport=new URL('../src/platform/search.mjs',import.meta.url).href) {
  // Canvas is a separately tested rendering boundary. Keep the real search
  // controller; only resolve its generated browser path to its source module.
  const wave='data:text/javascript,export const mountSpectrumWave=()=>()=>{};';
  const source=(await fs.readFile(new URL('../dist/home-spectrum.js',import.meta.url),'utf8'))
    .replace('./home-spectrum-wave.mjs?v=1',wave)
    .replace('./platform-search.js?v=10',searchImport);
  return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}

function homeFixture({modal=true,header=true}={}) {
  const fixture=searchFixture(),{doc,button,hero}=fixture;
  doc.body.dataset.platformArea='home';doc.body.dataset.routeView='home';
  const root=new Node(doc), form=new Node(doc,'FORM'), trigger=new Node(doc,'A');
  const menu=new Node(doc,'DIALOG'),close=new Node(doc,'BUTTON'),destination=new Node(doc,'A');
  const headerLink=new Node(doc,'A'),headerLinks=new Node(doc),toggle=new Node(doc,'BUTTON');
  form.parent=root;hero.parent=form;trigger.parent=root;button.rendered=false;
  trigger.setAttribute('href','./directions.html');
  destination.setAttribute('href','./nutrition.html');destination.parent=menu;
  headerLink.setAttribute('href','./directions.html');headerLink.parent=headerLinks;
  form.setAttribute('action','./directions.html');hero.setAttribute('name','q');
  close.parent=menu; menu.open=false; menu.id='spectrum-directions';
  if(modal)menu.showModal=()=>{menu.open=true;};
  menu.close=()=>{menu.open=false;void menu.fire('close');};
  menu.querySelector=selector=>selector==='[data-spectrum-close]'?close:null;
  menu.contains=node=>node===close||node===destination||node===menu;
  const headerNode=new Node(doc);
  headerNode.querySelector=selector=>selector==='.eua-header-search'?button:selector==='.eua-header-toggle'?toggle:selector==='.eua-header-links'?headerLinks:selector.includes('directions.html')?headerLink:null;
  headerNode.querySelectorAll=()=>[headerLink];
  let hasHeader=header;
  doc.getElementById=id=>({'spectrum-search':form,'spectrum-query':hero,'spectrum-directions-trigger':trigger,'spectrum-directions':menu}[id]||null);
  doc.querySelector=selector=>selector==='.spectrum-home'?root:selector==='.eua-site-header'?(hasHeader?headerNode:null):selector==='.eua-header-search'?(hasHeader?button:null):selector==='.eua-header-toggle'?toggle:selector.includes('.eua-search')?doc.appended.find(item=>item.open)||null:selector.includes('directions.html')?(hasHeader?headerLink:null):null;
  return {...fixture,root,form,trigger,menu,close,destination,headerNode,headerLink,headerLinks,toggle,attachHeader(){hasHeader=true;}};
}

test('the unloaded header search shortcut leaves an existing modal in control',async()=>{
  const controller='data:text/javascript,export const mountSearch=()=>({open(){}});';
  const source=(await fs.readFile(new URL('../src/platform/site-header.mjs',import.meta.url),'utf8')).replace('./platform-search.js?v=10',controller);
  const {mountSiteHeader}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  const f=homeFixture({header:false}),view=f.doc.defaultView,query=f.doc.querySelector,create=f.doc.createElement;
  view.self=view.top=view;view.location.pathname='/index.html';view.Event=Event;
  view.matchMedia=()=>Object.assign(new Node(f.doc),{matches:false});
  const previous={before(){f.attachHeader();},remove(){}};
  f.doc.querySelector=selector=>selector==='header'?previous:selector==='dialog[open]'?(f.menu.open?f.menu:null):query(selector);
  f.doc.createElement=tag=>tag==='div'?{firstElementChild:f.headerNode}:create(tag);
  f.doc.head={append(){}};f.doc.dispatchEvent=event=>{void f.doc.fire(event.type);};
  mountSiteHeader(f.doc);
  f.menu.open=true;
  const event=await f.doc.fire('keydown',{key:'/',target:f.close});
  assert.equal(event.defaultPrevented,false,'Lazy loading must respect the active directions/about dialog too');
  assert.equal(f.doc.appended.length,0);
});

test('home directions supports repeated click and Space opens, Escape and backdrop close with focus',async()=>{
  const {mountHomeSpectrum}=await homeModule();
  const f=homeFixture(),dispose=mountHomeSpectrum(f.doc);
  assert.equal(mountHomeSpectrum(f.doc),dispose,'Repeated mount reuses one set of handlers');
  assert.equal(f.trigger.attributes.role,'button');
  assert.equal(f.trigger.attributes['aria-controls'],'spectrum-directions');
  assert((await f.trigger.fire('click')).defaultPrevented);
  assert.equal(f.menu.open,true);assert.equal(f.doc.activeElement,f.close);
  assert.equal(f.trigger.attributes['aria-expanded'],'true');
  await f.menu.fire('cancel');
  assert.equal(f.menu.open,false);assert.equal(f.doc.activeElement,f.trigger);
  const space=await f.trigger.fire('keydown',{key:' '});
  assert(space.defaultPrevented);assert.equal(f.menu.open,true);
  await f.menu.fire('click',{clientX:20,clientY:20});
  assert.equal(f.menu.open,false);assert.equal(f.doc.activeElement,f.trigger);
  await f.trigger.fire('click');await f.close.fire('click');
  assert.equal(f.menu.open,false);assert.equal(f.trigger.attributes['aria-expanded'],'false');
  dispose();dispose();
  assert.equal(f.trigger.attributes.role,undefined,'Teardown restores native link semantics');
  assert.equal((await f.trigger.fire('click')).defaultPrevented,false);
  const fresh=mountHomeSpectrum(f.doc);assert.notEqual(fresh,dispose);fresh();
});

test('directions restores native article header links and enhances them again on return home',async()=>{
  const {mountHomeSpectrum}=await homeModule(),f=homeFixture();
  const dispose=mountHomeSpectrum(f.doc);
  await f.headerLink.fire('click');assert.equal(f.menu.open,true);
  f.doc.body.dataset.routeView='article';f.root.rendered=false;
  assert.equal((await f.headerLink.fire('click')).defaultPrevented,false,'The runtime route guard precedes hash lifecycle cleanup');
  await f.doc.defaultView.fire('hashchange');
  assert.equal(f.menu.open,false);
  assert.equal(f.headerLink.attributes.role,undefined);
  assert.equal(f.headerLink.attributes['aria-controls'],undefined);
  assert.equal((await f.headerLink.fire('keydown',{key:' '})).defaultPrevented,false);
  assert.equal((await f.headerLink.fire('click')).defaultPrevented,false);
  assert.equal(f.headerLink.getAttribute('href'),'./directions.html');
  assert.notEqual(f.doc.activeElement,f.headerLink,'Leaving home does not restore focus to the old menu opener');
  f.doc.body.dataset.routeView='home';f.root.rendered=true;
  await f.doc.defaultView.fire('hashchange');
  assert.equal(f.headerLink.attributes.role,'button');
  assert.equal(f.headerLink.events.get('click').length,1);
  await f.headerLink.fire('click');assert.equal(f.menu.open,true);
  dispose();
  const article=homeFixture();article.doc.body.dataset.routeView='article';article.root.rendered=false;
  const cleanup=mountHomeSpectrum(article.doc);
  assert.equal(article.headerLink.attributes.role,undefined,'A document opened directly into an article retains link semantics');
  assert.equal((await article.headerLink.fire('click')).defaultPrevented,false);cleanup();
});

test('directions blank interior stays open while a pointer outside its bounds closes it',async()=>{
  const {mountHomeSpectrum}=await homeModule(),f=homeFixture(),dispose=mountHomeSpectrum(f.doc);
  await f.trigger.fire('click');
  await f.menu.fire('click',{clientX:150,clientY:150});
  assert.equal(f.menu.open,true,'A click on dialog padding is inside the panel');
  await f.menu.fire('click',{clientX:99,clientY:150});
  assert.equal(f.menu.open,false);assert.equal(f.doc.activeElement,f.trigger);dispose();
});

test('a pending hero search cannot open after an article route change or pagehide',async()=>{
  let sequence=0;
  for(const lifecycle of ['hashchange','pagehide']){
    const key=`spectrum-import-${lifecycle}-${sequence++}`;
    let release;globalThis[key]=new Promise(resolve=>{release=resolve;});
    const dependency=`data:text/javascript,${encodeURIComponent(`await globalThis[${JSON.stringify(key)}]; export {mountSearch} from ${JSON.stringify(new URL('../src/platform/search.mjs',import.meta.url).href)};`)}`;
    const {mountHomeSpectrum}=await homeModule(dependency),f=homeFixture();
    mountSearch(f.doc,f.button,async()=>({materials:[],terms:[]}));
    const dispose=mountHomeSpectrum(f.doc);
    const submission=f.form.fire('submit');
    if(lifecycle==='hashchange'){f.doc.body.dataset.routeView='article';f.root.rendered=false;f.button.rendered=true;}
    await f.doc.defaultView.fire(lifecycle);release();await submission;
    assert.equal(f.doc.appended.length,0,`${lifecycle} cancels a submitted query before its lazy import resolves`);
    dispose();delete globalThis[key];
  }
});

test('directions preserves modified/native fallback links and closes normal destinations before navigation',async()=>{
  const {mountHomeSpectrum}=await homeModule(),f=homeFixture();
  const dispose=mountHomeSpectrum(f.doc);
  for(const modifier of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]){
    assert.equal((await f.trigger.fire('click',modifier)).defaultPrevented,false);
    assert.equal(f.menu.open,false);
  }
  await f.trigger.fire('click');
  await f.menu.fire('click',{target:f.destination,ctrlKey:true});
  assert.equal(f.menu.open,true,'Opening a destination in another tab leaves the current panel available');
  const selected=await f.menu.fire('click',{target:f.destination});
  assert.equal(selected.defaultPrevented,false,'Real catalog links keep browser navigation');
  assert.equal(f.menu.open,false);
  assert.equal(f.destination.getAttribute('href'),'./nutrition.html');
  await f.trigger.fire('click');f.doc.defaultView.location.hash='#creatine';
  await f.doc.defaultView.fire('hashchange');assert.equal(f.menu.open,false);
  dispose();
  const fallback=homeFixture({modal:false});mountHomeSpectrum(fallback.doc);
  assert.equal((await fallback.trigger.fire('click')).defaultPrevented,false);
  assert.equal(fallback.trigger.attributes.role,undefined,'Unsupported dialogs retain the catalog anchor');
});

test('a late shared header gains directions behavior and returns focus to its visible mobile toggle',async()=>{
  const {mountHomeSpectrum}=await homeModule(),f=homeFixture({header:false});
  const dispose=mountHomeSpectrum(f.doc);
  f.attachHeader();await f.doc.fire('eua:header-mounted');await f.doc.defaultView.fire('load');
  assert.equal(f.headerLink.events.get('click').length,1,'Header lifecycle events must bind each link once');
  await f.headerLink.fire('click');f.headerLinks.hidden=true;
  await f.menu.fire('cancel');
  assert.equal(f.doc.activeElement,f.toggle,'A collapsed mobile navigation link cannot receive visible focus');
  dispose();
});

test('hero submission opens the existing shared search and preserves direct question navigation',async()=>{
  const {mountHomeSpectrum}=await homeModule(),f=homeFixture();
  mountSearch(f.doc,f.button,async()=>({materials:[{title:'Креатин',href:'./index.html#creatine'}],terms:[]}));
  const dispose=mountHomeSpectrum(f.doc);
  f.hero.value='Креатин';
  assert((await f.form.fire('submit')).defaultPrevented);
  assert.equal(f.doc.appended.length,1);
  assert.match(f.doc.appended[0].innerHTML,/class="eua-search-title">Пошук по сайту<\/h2>/);
  assert.equal(f.doc.appended[0].querySelector('input').value,'Креатин');
  f.doc.appended[0].close();assert.equal(f.doc.activeElement,f.hero);
  await f.form.fire('submit');assert.equal(f.doc.appended.length,1);
  assert.equal(f.doc.events.get('keydown').length,1);
  const question=new Node(f.doc,'A');question.dataset.spectrumQuestion='';
  assert.equal((await f.doc.fire('click',{target:question})).defaultPrevented,false,'Questions remain ordinary content links');
  dispose();
});

test('missing shared header falls back to the real catalog and other pages receive no behavior',async()=>{
  const {mountHomeSpectrum}=await homeModule(),f=homeFixture({header:false});
  mountHomeSpectrum(f.doc);f.hero.value='сон';await f.form.fire('submit');
  const fallback=new URL(f.doc.defaultView.location.href);
  assert.equal(fallback.pathname,'/directions.html');assert.equal(fallback.searchParams.get('q'),'сон');
  const other=homeFixture();other.doc.body.dataset.platformArea='nutrition';
  mountHomeSpectrum(other.doc);
  assert.equal((await other.form.fire('submit')).defaultPrevented,false);
  assert.equal((await other.trigger.fire('click')).defaultPrevented,false);
});
