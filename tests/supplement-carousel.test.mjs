import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('dist/index.html','utf8');
const controller=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('const aliases = [')&&s.includes('.supplement-rail'));
assert(controller,'The real homepage carousel controller must be exercised');

function fixture({desktop=true,reduced=false}={}){
 const element=()=>({hidden:false,disabled:false,textContent:'',value:'',attributes:{},events:new Map(),setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.events.set(k,fn);}});
 const titles=['КРЕАТИН','ПРОТЕЇН','КОФЕЇН','ОМЕГА-3','ВІТАМІН D','МАГНІЙ','КОЛАГЕН','БЕТА-АЛАНІН','ЦИТРУЛІН','ЕЛЕКТРОЛІТИ'];
 const cards=titles.map(title=>({...element(),querySelector:()=>({textContent:title})}));
 const nodes=new Map(['supplement-prev','supplement-edge-prev','supplement-next','supplement-edge-next','supplement-position','supplement-search','supplement-search-status','supplement-empty'].map(id=>[id,element()]));
 const media={matches:desktop,addEventListener(k,fn){this.change=fn;}};
 const rail={...element(),scrollLeft:0,querySelectorAll:()=>cards,get clientWidth(){return media.matches?924:326;},get scrollWidth(){const count=cards.filter(c=>!c.hidden).length;return Math.max(this.clientWidth,count*312-12);},scrollTo(options){this.lastScroll=options;this.scrollLeft=Math.max(0,Math.min(options.left,this.scrollWidth-this.clientWidth));this.events.get('scroll')?.();}};
 for(const card of cards)Object.defineProperty(card,'offsetLeft',{get:()=>cards.filter(c=>!c.hidden).indexOf(card)*312});
 vm.runInNewContext(controller,{document:{querySelector:()=>rail,getElementById:id=>nodes.get(id)},window:{addEventListener(){}},matchMedia:query=>query.includes('1025px')?media:{matches:reduced}});
 return {rail,cards,nodes,position:()=>nodes.get('supplement-position').textContent,click:id=>nodes.get(id).events.get('click')(),search(value){const input=nodes.get('supplement-search');input.value=value;input.events.get('input')();},mobile(){media.matches=false;rail.scrollLeft=0;media.change();},key(key){let prevented=false;rail.events.get('keydown')({key,preventDefault(){prevented=true;}});return prevented;}};
}

// Three readable desktop cards, including a final page that cannot align to index 9.
const desktop=fixture();
assert.equal(desktop.position(),'1 / 4');
for(const [offset,page] of [[3*312,'2 / 4'],[6*312,'3 / 4'],[7*312,'4 / 4'],[0,'1 / 4']]){
 desktop.click('supplement-next');assert.equal(desktop.rail.scrollLeft,offset);assert.equal(desktop.position(),page);
}
desktop.click('supplement-prev');assert.equal(desktop.position(),'4 / 4');
desktop.click('supplement-prev');assert.equal(desktop.rail.scrollLeft,6*312);assert.equal(desktop.position(),'3 / 4');
desktop.click('supplement-edge-prev');assert.equal(desktop.rail.scrollLeft,5*312);
assert(desktop.key('ArrowRight'));assert.equal(desktop.rail.scrollLeft,6*312);
assert(!desktop.key('Enter'));

// Filtering keeps the right destinations available and disables meaningless paging.
desktop.search('omega 3');assert.equal(desktop.cards.filter(c=>!c.hidden).length,1);assert.equal(desktop.cards.findIndex(c=>!c.hidden),3);assert.equal(desktop.position(),'1 / 1');
for(const id of ['supplement-prev','supplement-next','supplement-edge-prev','supplement-edge-next'])assert(desktop.nodes.get(id).disabled);
desktop.search('нічого такого');assert.equal(desktop.position(),'—');assert.equal(desktop.nodes.get('supplement-position').attributes['aria-label'],'Немає результатів');assert(!desktop.nodes.get('supplement-empty').hidden);
desktop.search('');assert.equal(desktop.position(),'1 / 4');assert(desktop.nodes.get('supplement-empty').hidden);assert(!desktop.nodes.get('supplement-next').disabled);

// Phone arrows advance one card; motion preferences are honored by the real handler.
desktop.mobile();assert.equal(desktop.position(),'1 / 10');desktop.click('supplement-next');assert.equal(desktop.rail.scrollLeft,312);assert.equal(desktop.position(),'2 / 10');
const reduced=fixture({reduced:true});reduced.click('supplement-next');assert.equal(reduced.rail.lastScroll.behavior,'auto');
console.log('Supplement carousel: three-card desktop pages, partial final page, wraparound, previous/edge/keyboard navigation, filtering, empty/reset states, phone paging and reduced motion passed.');
