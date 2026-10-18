import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nutritionBase as base,nutritionModule as module} from '../dist/nutrition-data.js';
import {nutritionClaims as approvedProposal} from '../src/evidence/nutrition/module-proposal.mjs';
import {createNutritionPlayer} from '../dist/nutrition-player.js';
import {mountNutritionLab,dedupeContext} from '../dist/nutrition-lab.js';
import {ClaimCard,EvidenceDrawer} from '../dist/evidence/components.js';

assert.equal(base.claims.length,8);assert.equal(base.records.length,9);assert.equal(base.sources.length,4);
for(const c of base.claims){assert.equal(c.statement,approvedProposal.find(p=>p.id===c.id).statement);assert.equal(c.evidenceConfidence,null);assert.equal(c.lastReviewed,null);assert(c.publicationAcceptance&&!c.publicationAcceptance.formalScientificReview);const card=ClaimCard(c.id,base),drawer=EvidenceDrawer(c.id,base);assert(card.includes('Рівень впевненості не оцінено'));assert(drawer.includes(c.statement));assert(drawer.includes('Науковий перегляд: не завершено'));assert(!drawer.includes('Invalid Date'));assert(!drawer.includes('HIGH'));assert(!drawer.includes('Оцінка: <b>0'));for(const sourceId of new Set(base.records.filter(r=>r.claimId===c.id).map(r=>r.sourceId)))assert(drawer.includes(base.sources.find(s=>s.id===sourceId).title));}
assert(!EvidenceDrawer('CLM-000022',base).includes('Human intestinal H+'));
assert(EvidenceDrawer('CLM-000025',base).includes('Лише контекст'));
const player=createNutritionPlayer(module,{route:'unknown'});assert.equal(player.state().routeId,'glucose');player.previous();assert.equal(player.state().index,0);player.play();for(let i=0;i<3;i++)player.tick();assert.equal(player.state().index,3);assert.equal(player.state().running,false);player.play();assert.equal(player.state().index,0);player.pause();assert.equal(player.state().running,false);assert.throws(()=>player.selectStep(10),/Unknown step/);assert.throws(()=>player.selectRoute('no'),/Unknown nutrient/);player.selectRoute('lipids');assert.equal(player.state().index,0);

// Run actual rendering/event handlers with an in-memory DOM adapter; no browser layout assertion.
function fixture(href){
 const nodes=new Map(),listeners=new Map(),groups=new Map();
 const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',hidden:false,disabled:false,dataset:{},attributes:{},style:{setProperty(k,v){this[k]=v;}},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},toggleAttribute(k,on){this.attributes[k]=on;if(k==='hidden')this.hidden=on;},handlers:new Map(),addEventListener(k,fn){this.handlers.set(k,fn);},removeEventListener(){},querySelector:node,focus(){this.focused=true;},showModal(){this.open=true;},close(){this.open=false;this.handlers.get('close')?.();}});return nodes.get(key);};
 const buttons=(selector,field,values)=>groups.set(selector,values.map(value=>{const b=node(field+'-'+value);b.dataset[field]=value;return b;}));
 buttons('[data-nl-route]','nlRoute',['glucose','protein','lipids']);buttons('[data-nl-nutrient]','nlNutrient',['glucose','protein','lipids']);buttons('[data-nl-action]','nlAction',['previous','play','pause','next','reset']);buttons('[data-nl-view]','nlView',['body','cell']);buttons('[data-nl-step]','nlStep',['0','1','2','3']);buttons('[data-nl-structure]','nlStructure',['sglt1','glut2','pump','pept1','micelle','chylomicron']);buttons('[data-nl-highlight]','nlHighlight',['sglt1','glut2','pump','pept1','micelle','chylomicron']);
 const reduced={matches:false,addEventListener(k,fn){this.change=fn;},removeEventListener(){}};
 const windowHandlers=new Map(),location={href};
 const root={defaultView:{location,history:{replaceState(a,b,url){location.href=url;}},addEventListener(k,fn){windowHandlers.set(k,fn);},removeEventListener(){},matchMedia:()=>reduced},querySelector:node,querySelectorAll:s=>groups.get(s)||[],addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,[]);listeners.get(k).push(fn);},removeEventListener(){},hidden:false};
 let tick=null;const ui=mountNutritionLab(root,{schedule:fn=>(tick=fn,1),unschedule:()=>{tick=null;}});
 const click=dataset=>{const b={dataset,focused:false,focus(){this.focused=true;}};for(const fn of listeners.get('click')||[])fn({target:{closest(selector){if(selector==='button')return b;if(selector==='[data-claim-open]'&&dataset.claimOpen)return b;return null;}}});return b;};
 return {node,ui,root,reduced,click,tick:()=>tick?.(),hasTimer:()=>tick!==null,hidden:()=>listeners.get('visibilitychange').forEach(fn=>fn()),windowHandlers,location};
}
const f=fixture('https://evidence.invalid/nutrition.html?nutrient=protein');
assert.equal(f.ui.player.state().routeId,'protein');assert.equal(f.node('#nl-aa-particle').hidden,true);
f.click({nlStep:'2'});assert.equal(f.node('#nl-peptide-particle').hidden,true);assert.equal(f.node('#nl-aa-particle').hidden,false);
assert(f.node('#nl-step-text').innerHTML.includes('Докладніше й межі'));assert(!f.node('#nl-step-text').innerHTML.includes('Просто'));
f.click({nlStructure:'pump'});assert.equal(f.ui.player.state().routeId,'glucose');assert(f.node('#nl-step-text').innerHTML.includes('не гідролізує ATP безпосередньо'));
f.click({nlNutrient:'lipids'});const luminalMicelle=f.node('#nl-micelle').attributes.transform;
f.click({nlStep:'3'});assert.equal(f.node('#nl-chylomicron').hidden,false);assert.equal(f.node('#nl-chylomicron').attributes.transform,'translate(785 440)');assert.equal(f.node('#nl-micelle').attributes.transform,luminalMicelle,'Whole micelle must never be transported into the cell');
f.click({nlAction:'play'});assert(f.hasTimer());f.tick();assert.equal(f.ui.player.state().index,1);f.click({nlAction:'play'});assert(!f.hasTimer(),'The single play button pauses on the second press');
f.click({nlAction:'play'});f.root.hidden=true;f.hidden();assert(!f.hasTimer());assert.equal(f.ui.player.state().running,false);
f.click({nlView:'body'});assert(f.node('#nl-enterocyte').hidden);assert(!f.node('#nl-body').hidden);assert(f.node('#digestion-panel').open);f.click({nlView:'cell'});assert(!f.node('#nl-enterocyte').hidden);assert(f.node('#nl-body').hidden);
for(const c of base.claims){const opener=f.click({claimOpen:c.id});assert(f.node('#eua-evidence-dialog').open);assert(f.node('[data-evidence-content]').innerHTML.includes(c.statement));f.node('#eua-evidence-dialog').close();assert(opener.focused);}
f.reduced.matches=true;f.reduced.change();f.click({nlAction:'play'});assert(!f.hasTimer());f.ui.destroy();
const deep=fixture('https://evidence.invalid/nutrition.html?nutrient=lipids&step=3&scale=cell&path=x&token=keep#nutrition-lab');
assert.equal(deep.ui.state().index,3);assert.equal(new URL(deep.location.href).searchParams.get('token'),'keep');
deep.click({nlNutrient:'protein'});assert.equal(new URL(deep.location.href).searchParams.get('nutrient'),'protein');
deep.click({nlStep:'2'});assert.equal(new URL(deep.location.href).searchParams.get('step'),'2');
deep.click({nlAction:'play'});deep.windowHandlers.get('pagehide')();assert(!deep.hasTimer());assert(!deep.ui.state().running);
deep.location.href='https://evidence.invalid/nutrition.html?nutrient=glucose&step=1&scale=body#nutrition-lab';deep.windowHandlers.get('popstate')();assert.equal(deep.ui.state().routeId,'glucose');assert.equal(deep.ui.state().index,1);assert.equal(deep.ui.state().view,'body');
assert.equal(fixture('https://evidence.invalid/nutrition.html?nutrient=unknown&step=999&structure=__proto__').ui.state().index,0);
const structureDeep=fixture('https://evidence.invalid/nutrition.html?nutrient=lipids&structure=pept1&step=3');assert.equal(structureDeep.ui.state().routeId,'protein');assert.equal(structureDeep.ui.state().index,1);
const html=fs.readFileSync('dist/nutrition.html','utf8'),css=fs.readFileSync('dist/nutrition-lab.css','utf8');
for(const id of ['nutrition-lab','nutrition-evidence','nutrition-sources','nutrient-time','chart','time','play','reset','detail','digestion-panel','digestion-frame'])assert(html.includes(`id="${id}"`));
assert.equal((html.match(/<h1>/g)||[]).length,1);assert(css.includes('minmax(0,1fr)'));assert(css.includes('prefers-reduced-motion'));assert(css.includes('min-height:44px'));assert(html.includes('nutrition-timeline.js?v=27'));
// Redesign v72: no depth switch, one play button, one nav, folded evidence, timeline as a section.
assert(!/data-nl-depth|data-nl-action="(previous|next|reset|pause)"/.test(html),'Retired controls');
assert.equal((html.match(/data-nl-action="play"/g)||[]).length,1);
assert.equal((html.match(/class="nl-page-nav"/g)||[]).length,1);
assert(/<details class="nl-fold">/.test(html)&&!/<details class="nl-fold" open/.test(html),'Evidence folds are collapsed by default');
assert(/<section class="nl-timeline" id="nutrient-time"/.test(html)&&html.indexOf('id="nutrient-time"')>html.indexOf('id="nutrition-lab"')&&html.indexOf('id="nutrient-time"')<html.indexOf('id="nutrition-evidence"'),'Timeline follows the lab');
assert.equal((html.match(/<header\b/g)||[]).length,1,'The shared shell injects navigation after every <header>');
const ctx=t=>`<article><div class="eua-context"><span>Для кого / контекст</span><p>${t}</p></div></article><p></p>`;
const same=dedupeContext([ctx('A'),ctx('A'),ctx('A')]);assert.equal(same.shared,'A');assert(same.cards.every(c=>!c.includes('eua-context')));
const mixed=dedupeContext([ctx('A'),ctx('B')]);assert.equal(mixed.shared,null);assert(mixed.cards[0].includes('eua-context'));
assert(/<details class="nl-fold nl-time-fold"><summary>Відкрити графік<\/summary>/.test(html)&&!/nl-time-fold" open/.test(html),'The timeline chart sits in a collapsed fold under its heading');
assert(html.indexOf('id="timeline-title"')<html.indexOf('nl-time-fold')&&html.indexOf('nl-time-fold')<html.indexOf('id="chart"'),'Heading stays visible, chart is inside the fold');
assert(/nl-time-notes/.test(html)&&/nl-time-context/.test(html),'Secondary notes are folded as well');
console.log('Nutrition Lab: approved wording, linked sources, all eight drawers, real controller events, playback, three routes, fixed luminal micelle, peptide hydrolysis, focus return and retained timeline passed. Browser visual QA not performed.');
