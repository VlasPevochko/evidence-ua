// Follow-up audit fixes refresh shared imports; these wiring expectations follow the cache cascade.
// «Від нерва до росту» (owner 26.10.2026: «м’язи та тренування» from the PDF, packed into folded blocks, merged with the existing page).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {guideParts,guideSources,chapters,evidenceRows,evidenceRowClass,conditions,chainLevels,signalChain,faq,takeaways,molecules} from '../src/muscle-lab/guide.mjs';
import {mountGuide} from '../dist/muscle-guide.js';

const html=fs.readFileSync('dist/muscle-lab.html','utf8'),css=fs.readFileSync('dist/muscle-lab.css','utf8');

// Rendered blocks are fresh; the guide script is the source copy.
for(const [key,content] of Object.entries(guideParts()))assert(html.includes(`<!-- MUSCLE-GUIDE:${key}:START -->${content}<!-- MUSCLE-GUIDE:${key}:END -->`),key+' is stale; run the build');
// 2026-10-26 (owner «1 так / 2 так»): outcome Claims with their own drawer → the built script differs from the source only by import paths; guide v2, css v74.
assert.equal(fs.readFileSync('dist/muscle-guide.js','utf8'),fs.readFileSync('src/muscle-lab/guide-ui.mjs','utf8').replace("'../evidence/core/components.mjs'","'./evidence/components.js?v=2.2'").replace("'./practice.mjs'","'./muscle-practice-data.js?v=1'"));
assert(html.includes('muscle-guide.js?v=4')&&html.includes('muscle-lab.css?v=76')); // 2026-10-31: версія піднята, бо стилі/оболонка переведені на токени кольору (палітра «космос / зелений»); зміст сторінки той самий

// Order: quick summary → model → scenes → guide → existing evidence → related → sources.
const at=s=>{const i=html.indexOf(s);assert(i>=0,'missing '+s);return i;};
const order=['id="quick"','id="explorer"','id="topics"','id="guide"','id="muscle-evidence"','class="related"','id="sources"','id="guide-sources"'];
for(let i=1;i<order.length;i++)assert(at(order[i-1])<at(order[i]),order[i-1]+' before '+order[i]);

// Every PDF part is present, each chapter folded (closed by default) and reachable by its own id.
assert.deepEqual(chapters.map(c=>c.id),['structure-deep','signal','strength','why-grow','why-shrink','training','ageing','disorders','takeaways','faq']);
for(const c of chapters)assert(html.includes(`<details class="mg-chapter" id="${c.id}">`),c.id+' is a closed chapter');
for(const topic of ['ендомізій','Фасція ≠ епімізій','клітини-сателіти','H-зона','тріаду','кальсеквестрин','Мітохондрії','Тип IIx','Ацетилхолін','SERCA','Моторна одиниця','mTORC1','IGF-1','MuRF1','FoxO','Аутофагія','Міостатин','NF-κB','10 робочих підходів','1,62 г/кг','Рослинне харчування','Вуглеводи','Сон','Старіння','CMA','БАС','Міастенія','Каналопатії','RYR1','дистрофії','Саркопенія','Кахексія','м’язова пам’ять'])assert(html.includes(topic),'PDF topic missing: '+topic);
assert.equal(molecules.length,4);assert.equal(takeaways.length,10);assert.equal(faq.length,9);assert.equal(signalChain.length,8);
assert(!html.includes('наступні теми, ще не реалізовані'),'the old «not yet» note is gone');

// Honesty: numbers come from PubMed abstracts; intervals crossing zero are «різниці не виявлено», a row without a CI has no bar.
const row=label=>evidenceRows.find(r=>r.label.includes(label));
assert.deepEqual([row('розмір м’язів').est,row('розмір м’язів').lo,row('розмір м’язів').hi],[-0.01,-0.16,0.18]);
assert.deepEqual([row('вибухова').est,row('вибухова').lo,row('вибухова').hi],[-0.28,-0.48,-0.08]);
assert.deepEqual([row('повної відмови').est,row('повної відмови').lo,row('повної відмови').hi],[0.12,-0.13,0.37]);
assert.deepEqual([row('безжирова').est,row('безжирова').lo,row('безжирова').hi],[0.25,0.10,0.40]);
assert.equal(evidenceRowClass(row('розмір м’язів')),'mg-ev-null');assert.equal(evidenceRowClass(row('вибухова')),'mg-ev-down');
const carbs=row('вуглеводів');assert.equal(carbs.lo,null);assert.equal(evidenceRowClass(carbs),'mg-ev-noci');
const chart=html.slice(html.indexOf('class="mg-ev-list"'),html.indexOf('</ul>',html.indexOf('class="mg-ev-list"')));
assert.equal((chart.match(/class="mg-ev-row/g)||[]).length,evidenceRows.length);
assert.equal((chart.match(/mg-ev-row mg-ev-null/g)||[]).length,3,'three comparisons cross zero');
for(const li of chart.split('<li').filter(x=>x.includes('mg-ev-noci')))assert(!li.includes('mg-ev-ci"'),'no invented interval');
// Mechanisms stay explanations; outcome statements are approved Claims with their provisional level and one evidence button each.
const practice=await import('../src/muscle-lab/practice.mjs');
const {approvedLevels,assertApprovedLevel}=await import('./approved-confidence-levels.mjs');
assert.deepEqual(practice.practiceIds,['CLM-000105','CLM-000106','CLM-000107','CLM-000108','CLM-000109','CLM-000110','CLM-000111','CLM-000112','CLM-000113']);
assert.deepEqual(practice.practiceIds.map(id=>approvedLevels[id]),['moderate','low','moderate','moderate','low','very_low','moderate','low','very_low'],'levels exactly as approved on 26.10.2026');
for(const c of practice.practiceClaims){assertApprovedLevel(c);assert.equal(c.publicationAcceptance.kind,'user_wording_approval');assert.equal(c.publicationAcceptance.formalScientificReview,false);assert(practice.practiceRecords.some(r=>r.claimId===c.id&&r.roleForClaim==='primary_support'),c.id+' has primary evidence');}
const sec=(id)=>html.slice(html.indexOf(`id="${id}"`),html.indexOf('</details>\n<details class="mg-chapter"',html.indexOf(`id="${id}"`)));
const opens=t=>[...t.matchAll(/data-claim-open="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(opens(sec('training')),['CLM-000105','CLM-000106','CLM-000107','CLM-000108','CLM-000109','CLM-000110','CLM-000113','CLM-000010','CLM-000009','CLM-000053','CLM-000054','CLM-000055']);
assert.deepEqual(opens(sec('strength')),['CLM-000112']);assert.deepEqual(opens(sec('ageing')),['CLM-000111']);
const all=opens(guideParts().GUIDE);assert.equal(new Set(all).size,all.length,'one control per Claim');
assert(!guideParts().GUIDE.includes('Рівень впевненості не оцінено'),'every Claim shown carries its level');
assert(html.includes('data-muscle-practice-dialog')&&practice.practiceBase.claims.length===14,'own drawer with the nine Claims and five protein Claims');
const rec=(id)=>practice.practiceRecords.find(x=>x.id===id).result;
assert.deepEqual([rec('EVR-000218').estimate,rec('EVR-000218').lowerCI,rec('EVR-000218').upperCI],[0.12,-0.13,0.37]);
assert.deepEqual([rec('EVR-000224').estimate,rec('EVR-000224').lowerCI,rec('EVR-000224').upperCI],[-0.28,-0.48,-0.08]);
assert.deepEqual([rec('EVR-000227').estimate,rec('EVR-000227').lowerCI,rec('EVR-000227').upperCI],[0.25,0.10,0.40]);
assert(rec('EVR-000225').summary.includes('p = 0,23')&&rec('EVR-000226').summary.includes('−18%'));
assert(html.includes('Концептуальна шкала, не розмір ефекту'),'conceptual bars are labelled');
for(const n of ['3,3 імпульсу','на 18%','0,30 кг','137 систематичних оглядів','151 рандомізованого','2,5 місяця'])assert(html.includes(n),n);

// Sources: every one has PMID + DOI and is linked; citations point only to known sources; no request before a click.
assert.equal(new Set(guideSources.map(s=>s.id)).size,guideSources.length);
for(const s of guideSources){assert(/^\d{8}$/.test(s.pmid),s.id);assert(s.doi.startsWith('10.'),s.id);assert(html.includes('https://doi.org/'+s.doi.replace(/&/g,'&amp;')),s.id+' is linked');}
for(const c of conditions)assert(guideSources.some(s=>s.id===c.src)&&chainLevels.some(l=>l.id===c.level),c.id);
const guide=html.slice(at('<!-- MUSCLE-GUIDE:QUICK:START -->'),at('<!-- MUSCLE-GUIDE:SOURCES:END -->'));
assert(!/<(img|iframe|script)[^>]+src="https?:/.test(guide));
assert(!/<header\b/.test(guide),'the shell injects navigation after every <header>');
assert(!/<svg[^>]*>[\s\S]*?<text/.test(guide),'labels are HTML, not SVG text');
assert(!/wikimedia|openstax\.org\/resources/i.test(guide),'own visuals only');
// Safety: the disorder map is educational and sends to a doctor; protein note names kidney disease.
assert(guide.includes('Навчальна схема, не діагностика')&&guide.includes('зверніться до лікаря'));
assert(guide.includes('За хвороб нирок'));

// Phone first and motion: stacked tables, one-column forest, reduced motion respected.
for(const key of ['.mg-table td::before{content:attr(data-label)','.mg-ev-row{grid-template-columns:minmax(0,1fr)','.mg-chapter[open] .mg-flow li{animation:none}','.mg-chain-list li.is-now .mg-chain-dot{animation:none}','.mg-src a{display:inline-flex;align-items:center;min-height:44px}'])assert(css.includes(key),'CSS missing '+key);

// Behaviour through an in-memory DOM: chain player, disorder picker, deep link opening a folded chapter, stop on hide.
function fixture({hash='',reduced=false}={}){
 const listeners=new Map(),win=new Map(),timers=new Map();let next=0;
 const el=(attrs={},dataset={})=>({attrs,dataset,hidden:false,open:false,textContent:'',tagName:attrs.tag||'DIV',parentElement:null,classes:new Set(),
  setAttribute(k,v){this.attrs[k]=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-(\w)/g,(m,c)=>c.toUpperCase())]=v;},getAttribute(k){return this.attrs[k];},
  classList:null,closest(){return null;}});
 const withClass=n=>{n.classList={toggle:(c,on)=>on?n.classes.add(c):n.classes.delete(c)};return n;};
 const chain=withClass(el({},{chainStep:'-1'})),play=withClass(el({'aria-pressed':'false'})),status=el();
 const items=signalChain.map((_,i)=>withClass(el({},{chainIndex:String(i)})));
 const buttons=conditions.map((c,i)=>withClass(el({'aria-pressed':String(i===0)},{condition:c.id,hitLevel:c.level})));
 const panels=conditions.map((c,i)=>{const p=el({},{conditionPanel:c.id});p.hidden=i!==0;return p;});
 const levels=chainLevels.map(l=>withClass(el({},{hitLevel:l.id})));
 const chapter=el({tag:'DETAILS'});chapter.tagName='DETAILS';const inner=el();inner.parentElement=chapter;
 const motion={matches:reduced,addEventListener(){}};
 const view={location:{hash},matchMedia:()=>motion,setInterval(fn){const id=++next;timers.set(id,fn);return id;},clearInterval(id){timers.delete(id);},addEventListener(k,f){win.set(k,f);}};
 const root={defaultView:view,hidden:false,
  querySelector:s=>({'[data-chain]':chain,'[data-chain-play]':play,'[data-chain-status]':status,'[data-condition][aria-pressed="true"]':buttons[0]})[s]||null,
  querySelectorAll:s=>({'[data-chain-index]':items,'[data-condition]':buttons,'[data-condition-panel]':panels,'.mg-path-levels [data-hit-level]':levels})[s]||[],
  getElementById:id=>id==='training'?inner:null,addEventListener(k,f){listeners.set(k,f);},removeEventListener(){}};
 const ui=mountGuide(root);
 const click=target=>listeners.get('click')({target:{closest:s=>s==='[data-chain-play]'&&target===play?play:s==='[data-condition]'&&buttons.includes(target)?target:null}});
 return {ui,click,play,items,chain,buttons,panels,levels,timers,win,status,chapter,root,listeners,tick:()=>[...timers.values()].forEach(f=>f())};
}
const f=fixture({hash:'#training'});
assert.equal(f.chapter.open,true,'#training opens its folded chapter');
f.click(f.play);assert.equal(f.ui.state().step,0);assert.equal(f.timers.size,1);assert.equal(f.play.attrs['aria-pressed'],'true');
for(let i=1;i<signalChain.length;i++){f.tick();assert.equal(f.ui.state().step,i);}
assert(f.items.every(li=>li.classes.has('is-on')));assert(f.items.at(-1).classes.has('is-now'));
f.tick();assert.equal(f.timers.size,0,'stops after the last step');assert.equal(f.play.textContent,'↺ Ще раз');
f.click(f.play);f.click(f.play);assert.equal(f.timers.size,0,'second press pauses');
f.click(f.play);f.win.get('pagehide')();assert.equal(f.timers.size,0,'stops when the page is left');
f.click(f.play);f.root.hidden=true;f.listeners.get('visibilitychange')();assert.equal(f.timers.size,0,'stops when hidden');
assert.equal(f.ui.state().condition,'als');
f.click(f.buttons[1]);assert.equal(f.ui.state().condition,'mg');
assert.deepEqual(f.buttons.map(b=>b.attrs['aria-pressed']),conditions.map(c=>String(c.id==='mg')));
assert.deepEqual(f.panels.map(p=>p.hidden),conditions.map(c=>c.id!=='mg'));
assert.deepEqual(f.levels.filter(l=>l.classes.has('is-hit')).map(l=>l.dataset.hitLevel),['nmj']);
const r=fixture({reduced:true});r.click(r.play);assert.equal(r.timers.size,0,'no timed animation under reduced motion');assert.equal(r.ui.state().step,signalChain.length-1);assert(r.status.textContent.includes('Зменшений рух'));
f.ui.destroy();r.ui.destroy();
console.log(`Muscle guide: ${chapters.length} folded chapters from the owner's PDF, ${guideSources.length} PubMed-checked sources, honest forest rows, safety notes, chain player and disorder map passed.`);
// Two drawers on one page never answer for each other's Claims (the shared drawer ignores unknown IDs).
{const {muscleKnowledge}=await import('../src/muscle-lab/module.mjs');const practice=await import('../src/muscle-lab/practice.mjs');
 for(const c of practice.practiceBase.claims)assert(!muscleKnowledge.claims.some(m=>m.id===c.id),c.id+' collides with the model drawer');}
console.log('Muscle guide Claims: nine approved outcome Claims with levels, five protein Claims reused, own drawer, no duplicate controls passed.');
