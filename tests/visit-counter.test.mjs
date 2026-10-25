import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COUNTER,counterState,counterEndpoint,mountVisitCounter} from '../src/platform/visit-counter.mjs';

// Лічильник відвідувань (рішення власника 2026-10-25): вимкнений, доки власник не дасть код сайту; зі сторонніх запитів лише після «Дозволити».
assert.equal(COUNTER.code,'','the counter ships switched off until the owner sets a site code');
assert.equal(counterState('', 'yes'),'off');assert.equal(counterState('abc','yes'),'on');assert.equal(counterState('abc','no'),'declined');assert.equal(counterState('abc',null),'ask');
assert.equal(counterEndpoint('evidenceua'),'https://evidenceua.goatcounter.com/count');
for(const bad of ['','a','-bad','bad-','Has Space','a.b','x/../y','evil.com/#'])assert.equal(counterEndpoint(bad),'','rejects '+JSON.stringify(bad));

// Minimal DOM double: enough to prove what is shown and loaded.
function fakeDoc(){
  const added=[];const body={appendChild:n=>added.push(n)};
  const mk=()=>{const el={handlers:{},className:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(t,f){this.handlers[t]=f},remove(){added.splice(added.indexOf(this),1)},set innerHTML(v){this.html=v}};return el};
  return {added,body,querySelector:sel=>sel==='.eua-counter-ask'?added[0]||null:null,createElement:mk};
}
const memory=(init=null)=>{let v=init;return {getItem:()=>v,setItem:(k,x)=>{v=x},get value(){return v}};};
const click=(bar,choice)=>bar.handlers.click({target:{closest:()=>({dataset:{counter:choice}})}});

// Off: nothing shown, nothing loaded.
{const d=fakeDoc(),loads=[];assert.equal(mountVisitCounter(d,{code:'',store:memory(),load:u=>loads.push(u)}),'off');assert.equal(d.added.length,0);assert.equal(loads.length,0);}
// Ask: shown once, no third-party load before the click.
{const d=fakeDoc(),loads=[],store=memory();assert.equal(mountVisitCounter(d,{code:'evidenceua',store,load:u=>loads.push(u)}),'ask');assert.equal(d.added.length,1);assert.equal(loads.length,0,'no request before the visitor agrees');
 mountVisitCounter(d,{code:'evidenceua',store,load:u=>loads.push(u)});assert.equal(d.added.length,1,'asked only once per page');
 click(d.added[0],'no');assert.equal(d.added.length,0);assert.equal(loads.length,0,'declining loads nothing');assert.equal(store.value,'no');
 assert.equal(mountVisitCounter(d,{code:'evidenceua',store,load:u=>loads.push(u)}),'declined');assert.equal(d.added.length,0,'a declined visitor is not asked again');}
// Agree: loads once, remembered, no question next time.
{const d=fakeDoc(),loads=[],store=memory();mountVisitCounter(d,{code:'evidenceua',store,load:u=>loads.push(u)});click(d.added[0],'yes');
 assert.deepEqual(loads,['https://evidenceua.goatcounter.com/count']);assert.equal(store.value,'yes');
 assert.equal(mountVisitCounter(fakeDoc(),{code:'evidenceua',store,load:u=>loads.push(u)}),'on');assert.equal(loads.length,2);}

// Wiring: generated copy equals source, the header loads it, and no page hard-codes a third-party counter.
const src=fs.readFileSync('src/platform/visit-counter.mjs','utf8');
assert.equal(fs.readFileSync('dist/visit-counter.js','utf8'),src,'the built copy equals the source');
assert(fs.readFileSync('dist/site-header.js','utf8').includes("import('./visit-counter.js?v=1')")&&fs.readFileSync('dist/site-header.js','utf8').includes('site-header.css?v=6'),'the header loads the counter lazily and the stylesheet version was bumped');
for(const f of fs.readdirSync('dist').filter(n=>n.endsWith('.html')))assert(!/goatcounter|zgo\.at/.test(fs.readFileSync('dist/'+f,'utf8')),`${f} has no hard-coded third-party counter`);
assert(fs.readFileSync('dist/site-header.css','utf8').includes('.eua-counter-ask'),'the question bar is styled');
console.log('Visit counter: off by default, asks before any third-party request, remembers the choice, wired into the header passed.');
