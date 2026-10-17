import test from 'node:test';
import assert from 'node:assert/strict';

const glossary=await import('../src/platform/glossary.mjs').catch(()=>({}));
function element(dataset={}){
 return {dataset,textContent:'',attributes:{},events:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.events[k]=fn;},focus(){this.focused=true;}};
}
function fixture(area='movement'){
 const ids=Object.fromEntries(['term-dialog','term-dialog-title','term-dialog-definition','term-dialog-example','term-dialog-source','term-close'].map(id=>[id,element()]));
 const dialog=ids['term-dialog'];dialog.open=false;dialog.opens=0;
 dialog.showModal=function(){this.open=true;this.opens++;};
 dialog.close=function(){this.open=false;this.events.close?.();};
 const triggers=['moment','lever-arm','rem','unknown'].map(term=>element({term}));
 const root={body:{dataset:{platformArea:area}},getElementById:id=>ids[id],querySelectorAll:selector=>selector==='[data-term]'?triggers:[]};
 return {root,ids,dialog,triggers};
}
function click(target){const event={preventDefault(){this.prevented=true;},prevented:false};target.events.click?.(event);return event;}

test('a term opens its sourced explanation without navigating away from the lesson',()=>{
 assert.equal(typeof glossary.mountGlossary,'function','The in-context glossary is missing');
 const f=fixture();glossary.mountGlossary(f.root);
 const event=click(f.triggers[0]);
 assert.equal(event.prevented,true);assert.equal(f.dialog.open,true);
 assert.equal(f.ids['term-dialog-title'].textContent,'Момент сили');
 assert.match(f.ids['term-dialog-definition'].textContent,/Н·м/);
 assert.match(f.ids['term-dialog-example'].textContent,/двер/i);
 assert.equal(f.ids['term-dialog-source'].href,'https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium');
 assert.equal(f.triggers[0].attributes['aria-expanded'],'true');
 assert.equal(f.ids['term-close'].focused,true);
});

test('changing the selected term updates the explanation and only one expanded trigger',()=>{
 assert.equal(typeof glossary.mountGlossary,'function','The in-context glossary is missing');
 const f=fixture();glossary.mountGlossary(f.root);click(f.triggers[0]);click(f.triggers[1]);
 assert.equal(f.dialog.opens,1);
 assert.equal(f.ids['term-dialog-title'].textContent,'Плече сили');
 assert.equal(f.triggers[0].attributes['aria-expanded'],'false');
 assert.equal(f.triggers[1].attributes['aria-expanded'],'true');
});

test('closing by button or native Escape close returns focus to the term that opened it',()=>{
 assert.equal(typeof glossary.mountGlossary,'function','The in-context glossary is missing');
 const f=fixture();glossary.mountGlossary(f.root);click(f.triggers[1]);click(f.ids['term-close']);
 assert.equal(f.dialog.open,false);assert.equal(f.triggers[1].focused,true);
 assert.equal(f.triggers[1].attributes['aria-expanded'],'false');
 click(f.triggers[0]);f.dialog.close();
 assert.equal(f.triggers[0].focused,true);assert.equal(f.triggers[0].attributes['aria-expanded'],'false');
});

test('unknown, other-module and unsupported-dialog links retain their normal glossary navigation',()=>{
 assert.equal(typeof glossary.mountGlossary,'function','The in-context glossary is missing');
 const f=fixture();glossary.mountGlossary(f.root);
 assert.equal(click(f.triggers[2]).prevented,false);assert.equal(click(f.triggers[3]).prevented,false);
 assert.equal(f.dialog.open,false);
 const oldBrowser=fixture();oldBrowser.dialog.showModal=undefined;glossary.mountGlossary(oldBrowser.root);
 assert.equal(click(oldBrowser.triggers[0]).prevented,false);
 const sleep=fixture('sleep');glossary.mountGlossary(sleep.root);click(sleep.triggers[2]);
 assert.equal(sleep.ids['term-dialog-title'].textContent,'REM');
 assert.equal(click(sleep.triggers[0]).prevented,false);
});
