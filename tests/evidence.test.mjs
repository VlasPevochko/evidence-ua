// ui.js bumped 2.0 -> 2.1: creatine dosing details and kidney explanation folded (owner «креатин коротше», 2026-10-22).
// ui.js bumped 1.9 -> 2.0: the creatine article was rebuilt as a compact card (claims first, mechanism/myths/sources folded).
// evidence.css bumped 1.8 -> 1.9: accent colours snapped to the shared gold/cyan set (cache busting).
// evidence.css version bumped 1.7 -> 1.8 because its border-radius values moved to the 8/16/30 scale (cache busting).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {evidenceBase, getClaim, recordsFor, ClaimCard, EvidenceDrawer, ConfidenceBadge, renderModule, MechanismInteractive, escapeHTML, mountEvidenceUI, PhaseExplorer, mountPhaseExplorer, StructureExplorer, mountStructureExplorer} from '../dist/evidence/ui.js';
import {creatineModule,presentation,legacySources} from '../dist/evidence/data.js?v=1.8';
import {createEvidenceBase,approvalProblems} from '../dist/evidence/registry.js';
import {ClaimCard as SharedClaimCard,EvidenceDrawer as SharedEvidenceDrawer,bindEvidenceUI} from '../dist/evidence/components.js';
import {renderEvidenceModule} from '../dist/evidence/module-composer.js';
let checks=0;function check(name,run){run();checks++;console.log('PASS',name);}
check('stable unique IDs and eight production Claims',()=>{assert.equal(evidenceBase.claims.length,8);for(const array of ['claims','sources','records','assessments','reviews'].map(key=>evidenceBase[key]))assert.equal(new Set(array.map(x=>x.id)).size,array.length);});
check('all EVRs resolve Source and Claim; records are outcome-specific',()=>{for(const record of evidenceBase.records){getClaim(record.claimId);assert(evidenceBase.sources.some(s=>s.id===record.sourceId));assert(record.outcome.name);assert(record.roleForClaim);assert(record.reviewStatus);}});
check('module resolves every configured Claim',()=>{for(const section of creatineModule.sections)for(const id of section.claimIds||[])getClaim(id);});
check('CLM-TEST-001 renders through generic ClaimCard without special component',()=>{const test={...structuredClone(getClaim('CLM-000001')),id:'CLM-TEST-001',shortStatement:'Тестове твердження',outcome:{name:'Тест'},evidenceConfidence:'insufficient'};const base={...evidenceBase,claims:[...evidenceBase.claims,test]};const card=ClaimCard(test.id,base);assert(card.includes('Тестове твердження'));assert(card.includes('Недостатньо даних'));assert(card.includes('Межа знання'));});
check('HIGH → MODERATE updates card, drawer, module and badge; original restored',()=>{const claim=getClaim('CLM-000001'),original=claim.evidenceConfidence;try{claim.evidenceConfidence='moderate';assert(ClaimCard(claim.id).includes('MODERATE'));assert(EvidenceDrawer(claim.id).includes('MODERATE'));assert(ConfidenceBadge(claim).includes('Помірна впевненість'));const home=renderModule();const card=home.slice(home.indexOf('data-claim-id="CLM-000001"'));assert(card.slice(0,card.indexOf('</article>')).includes('MODERATE'));}finally{claim.evidenceConfidence=original;}assert.equal(claim.evidenceConfidence,'high');});
check('drawer selects only sources linked via EVRs',()=>{const drawer=EvidenceDrawer('CLM-000007');assert(drawer.includes('drawer-CLM-000007-SRC-000008'));assert(!drawer.includes('drawer-CLM-000007-SRC-000001'));assert(recordsFor('CLM-000007').every(r=>r.sourceId==='SRC-000008'));});
check('drawer and page source IDs remain unique for every Claim',()=>{for(const c of evidenceBase.claims){const html=renderModule()+EvidenceDrawer(c.id);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);}});
check('effect numbers come from EVR, not hardcoded component values',()=>{const r=evidenceBase.records.find(r=>r.id==='EVR-000004'),original=r.result.estimate;try{r.result.estimate=2.37;assert(EvidenceDrawer('CLM-000002').includes('2,37'));}finally{r.result.estimate=original;}});
check('all badges carry text and provisional state',()=>{for(const c of evidenceBase.claims){const h=ConfidenceBadge(c);assert(h.includes('впевненість'));assert(h.includes('Попередня оцінка'));}assert.equal(creatineModule.evidenceStatus,'reviewing');});
check('scientific distinctions and uncertainty preserved',()=>{const h=renderModule();assert(h.includes(presentation.notes.lean));assert(h.includes('≠ автоматично ушкодження нирок'));assert(h.includes('Механізм пояснює процес'));assert(h.includes('не доказ повної еквівалентності'));assert(!/95%\s*(ефектив|effectiveness)|98%\s*evidence/.test(h));});
check('mechanism has controls, chemistry, provenance and no auto-play',()=>{const h=MechanismInteractive();for(const action of ['play','pause','previous','next','reset'])assert(h.includes(`data-mechanism-action="${action}"`));assert(h.includes('+ ADP + H⁺'));assert(h.includes('Креатинкіназа'));assert(h.includes('VIS-ATP-PCR-001'));assert(h.includes('28615996'));});
check('legacy source discovery preserved, not auto-claimed as evidence',()=>{assert(legacySources.some(s=>s.url.includes('39519498')));assert(legacySources.some(s=>s.url.includes('40944139')));assert(legacySources.every(s=>s.reviewStatus.includes('перевірки')));});
check('HTML safe interpolation',()=>assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;'));
const html=fs.readFileSync('dist/index.html','utf8');
check('new module assets and existing routes / PubMed controls present',()=>{for(const id of ['creatine','supplement-protein','supplement-caffeine','research-load','pubmed-live','research-topic','research-results','eua-evidence-dialog'])assert(html.includes(`id="${id}"`));for(const file of ['movement.html','nutrition.html','protein-meta.html'])assert(fs.existsSync('dist/'+file));assert(html.includes('evidence/ui.js?v=2.2'));assert(html.includes('evidence/evidence.css?v=1.9'));});
check('module IDs unique; full-width mobile / dialog / reduced-motion CSS',()=>{const start=html.indexOf('<section id="creatine"'),end=html.indexOf('</dialog>',start);const module=html.slice(start,end);const ids=[...module.matchAll(/(?:^|\s)id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);const css=fs.readFileSync('dist/evidence/evidence.css','utf8');assert(css.includes('grid-template-columns:minmax(0,1fr)'));assert(css.includes('height:100dvh'));assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes(':focus-visible'));});
check('legacy inline scripts remain syntactically valid',()=>{for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(m[1].trim())new vm.Script(m[1]);}});
check('hero cannot inherit legacy 88px header; module layout is explicitly in flow',()=>{
 const module=renderModule();
 assert(module.includes('<div class="eua-hero">'));
 assert(!module.includes('<header class="eua-hero">'));
 const css=fs.readFileSync('dist/evidence/evidence.css','utf8');
 for(const selector of ['.eua-hero','.eua-section-nav','.eua-short-list','.eua-block']){
  const key='#creatine.eua-module '+selector+'{';
  const start=css.indexOf(key);assert(start>=0,selector+' missing scoped flow reset');
  const declaration=css.slice(start,css.indexOf('}',start)+1);
  if(selector!=='.eua-block')assert(declaration.includes('height:auto'),selector+' has fixed legacy height');
 }
 assert(html.includes('evidence/evidence.css?v=1.9'));
});
check('build is idempotent',()=>{execFileSync(process.execPath,['scripts/build-evidence.mjs']);assert.equal(fs.readFileSync('dist/index.html','utf8'),html);});
check('client controllers: drawer, focus return, next/previous/reset/play/pause',()=>{
 const saved={document:globalThis.document,window:globalThis.window,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
 const node=()=>({textContent:'',innerHTML:'',disabled:false,dataset:{},focus(){this.focused=true;},classList:{add(){},remove(){},contains(){return true;}}});
 const listeners={},widgetListeners={},dialogListeners={};
 const content=node(),close=node(),fields=new Map();
 for(const selector of ['[data-step-count]','[data-step-title]','[data-step-text]','.eua-scene',...['previous','play','pause','next','reset'].map(action=>`[data-mechanism-action="${action}"]`)])fields.set(selector,node());
 const dialog={...node(),querySelector:s=>s==='[data-evidence-content]'?content:close,addEventListener:(name,fn)=>dialogListeners[name]=fn,showModal(){this.open=true;},close(){this.open=false;dialogListeners.close?.();}};
 const widget={...node(),querySelector:s=>fields.get(s),addEventListener:(name,fn)=>widgetListeners[name]=fn};
 const root={...node(),querySelector:s=>s==='#eua-evidence-dialog'?dialog:s==='[data-mechanism]'?widget:null,addEventListener:(name,fn)=>listeners[name]=fn};
 let tick=null,cleared=false;
 try{
  globalThis.document={hidden:false,addEventListener(){}};globalThis.window={addEventListener(){}};
  globalThis.setInterval=fn=>{tick=fn;return 1;};globalThis.clearInterval=()=>cleared=true;
  mountEvidenceUI(root);
  assert(fields.get('[data-step-count]').textContent.includes('1 / 4'));
  const click=action=>widgetListeners.click({target:{closest:()=>({...fields.get(`[data-mechanism-action="${action}"]`),dataset:{mechanismAction:action}})}});
  click('next');assert(fields.get('[data-step-count]').textContent.includes('2 / 4'));
  click('previous');assert(fields.get('[data-step-count]').textContent.includes('1 / 4'));
  click('play');assert.equal(fields.get('[data-mechanism-action="pause"]').disabled,false);tick();assert(fields.get('[data-step-count]').textContent.includes('2 / 4'));
  click('pause');assert(cleared);assert.equal(fields.get('[data-mechanism-action="pause"]').disabled,true);
  click('reset');assert(fields.get('[data-step-count]').textContent.includes('1 / 4'));
  const opener={...node(),dataset:{claimOpen:'CLM-000007'}};
  listeners.click({target:{closest:s=>s==='[data-claim-open]'?opener:null}});
  assert(dialog.open);assert(content.innerHTML.includes('CLM-000007'));assert(close.focused);
  listeners.click({target:{closest:s=>s==='[data-evidence-close]'?close:null}});
  assert.equal(dialog.open,false);assert(opener.focused);
 }finally{Object.assign(globalThis,saved);}
});
check('three physiological states and detail mode update from configuration',()=>{
 const fields=new Map();
 for(const key of ['title','description','pcr','atp','demand','glycolysis','oxphos','ph','advanced','detail','marker'])fields.set(`[data-phase-${key}]`,{textContent:'',hidden:true,setAttribute(k,v){this[k]=v;}});
 const phases=presentation.mechanism.phases.map(p=>({dataset:{phaseSelect:p.id},setAttribute(k,v){this[k]=v;}}));
 const levels=['simple','detailed'].map(id=>({dataset:{levelSelect:id},setAttribute(k,v){this[k]=v;}}));
 let click;
 const explorer={dataset:{},querySelector:s=>fields.get(s),querySelectorAll:s=>s==='[data-phase-select]'?phases:levels,addEventListener:(name,fn)=>click=fn};
 mountPhaseExplorer(explorer);
 assert.equal(explorer.dataset.phaseState,'rest');
 for(const phase of phases){click({target:{closest:s=>s==='[data-phase-select]'?phase:null}});assert.equal(explorer.dataset.phaseState,phase.dataset.phaseSelect);assert.equal(phase['aria-pressed'],'true');assert(fields.get('[data-phase-title]').textContent);}
 click({target:{closest:s=>s==='[data-level-select]'?levels[1]:null}});assert.equal(fields.get('[data-phase-detail]').hidden,false);
 click({target:{closest:s=>s==='[data-level-select]'?levels[0]:null}});assert.equal(fields.get('[data-phase-detail]').hidden,true);
 const h=PhaseExplorer();assert(h.includes('не експериментальні криві'));assert(h.includes('26503399'));assert(!h.includes('% ефективності'));
 assert.equal(presentation.mechanism.version,'1.1');
});
check('structure selection and explanation tabs stay in the same scene',()=>{
 const content={innerHTML:''},title={textContent:''};let handler;
 const structures=['pcr','atp','ck','mito'].map(id=>({dataset:{structureSelect:id},setAttribute(k,v){this[k]=v;}}));
 const tabs=['summary','detail','sources'].map(id=>({dataset:{structureTab:id},setAttribute(k,v){this[k]=v;}}));
 const root={querySelector:s=>s==='[data-structure-title]'?title:content,querySelectorAll:s=>s==='[data-structure-select]'?structures:tabs,addEventListener:(_,fn)=>handler=fn};
 mountStructureExplorer(root);
 for(const structure of structures){handler({target:{closest:s=>s==='[data-structure-select]'?structure:null}});assert.equal(structure['aria-pressed'],'true');assert(content.innerHTML.length>20);}
 for(const tab of tabs){handler({target:{closest:s=>s==='[data-structure-tab]'?tab:null}});assert.equal(tab['aria-pressed'],'true');}
 assert(content.innerHTML.includes('26503399'));
 const h=StructureExplorer();assert(h.includes('aria-live="polite"'));assert.equal((h.match(/data-structure-select=/g)||[]).length,4);assert(h.includes('не видимі молекули'));assert(fs.existsSync(new URL('../dist/evidence/muscle-fiber-v1.webp',import.meta.url)));
});
check('topic-independent registry and UI accept another domain',()=>{
 const c={...structuredClone(getClaim('CLM-000001')),id:'CLM-TEST-ARCH',domain:'training',outcome:{name:'Інший outcome'},statement:'Тест іншої теми',shortStatement:'Тест іншої теми'};
 const base=createEvidenceBase({claims:[c]});assert(ClaimCard(c.id,base).includes(c.statement));assert(EvidenceDrawer(c.id,base).includes(c.statement));assert(!EvidenceDrawer(c.id,base).includes('SRC-000001'));
 assert.throws(()=>createEvidenceBase({claims:[c,c]}),/Duplicate/);
 assert.throws(()=>createEvidenceBase({claims:[c],records:[{id:'EVR-TEST',claimId:c.id,sourceId:'MISSING'}]}),/Unresolved/);
});
check('review migration does not manufacture assessment or approval',()=>{
 assert.equal(evidenceBase.assessments.length,8);assert.equal(evidenceBase.reviews.length,8);
 for(const c of evidenceBase.claims){assert(c.provisional);const a=evidenceBase.assessments.find(a=>a.claimId===c.id);assert.equal(a.proposedConfidence,c.evidenceConfidence);assert(Object.values(a.domains).every(d=>d.status==='not_assessed'));}
 assert(evidenceBase.reviews.every(r=>r.status==='pending'&&!r.approverId&&!r.approvedAt));
 assert(EvidenceDrawer('CLM-000001').includes('не виконане'));
 const invalid=structuredClone(evidenceBase);invalid.reviews[0].status='approved';assert.throws(()=>createEvidenceBase(invalid),/Invalid scientific approval/);
 assert(approvalProblems(invalid.reviews[0],invalid).some(x=>x.includes('Unassessed domain')));
});
check('review gate rejects stale or flagged evidence even with approval metadata',()=>{
 const b=structuredClone(evidenceBase),r=b.reviews[0],a=b.assessments.find(a=>a.id===r.assessmentId);
 a.status='ready_for_review';for(const d of Object.values(a.domains)){d.status='assessed';d.rationale='Synthetic test only';}
 r.approverId='TEST-REVIEWER';r.approvedAt='2026-10-10';r.reason='Synthetic test only';
 for(const evr of b.records.filter(e=>a.evidenceRecordIds.includes(e.id)))evr.reviewStatus='scientifically_reviewed';
 assert.deepEqual(approvalProblems(r,b),[]);
 a.claimVersion='outdated';assert(approvalProblems(r,b).includes('Stale claim version'));a.claimVersion=b.claims[0].version;
 b.sources.find(s=>s.id===b.records[0].sourceId).sourceStatus='retracted';assert(approvalProblems(r,b).some(x=>x.includes('Source requires reassessment')));
 assert(evidenceBase.reviews.every(r=>r.status==='pending'));
});
check('shared components import without topic or page data and preserve output',()=>{
 const source=fs.readFileSync('src/evidence/core/components.mjs','utf8');assert.deepEqual([...source.matchAll(/^import .* from '([^']+)'/gm)].map(m=>m[1]),['./public-text.mjs']);assert(!source.includes('creatine'));assert(!source.includes('presentation.mechanism'));
 const id='CLM-000001';assert.equal(SharedClaimCard(id,evidenceBase),ClaimCard(id));assert.equal(SharedEvidenceDrawer(id,evidenceBase),EvidenceDrawer(id));
 const alternate=structuredClone(getClaim(id));alternate.id='CLM-OTHER-TOPIC';alternate.domain='rehabilitation';alternate.statement='Тест іншої теми';alternate.shortStatement=alternate.statement;
 const base=createEvidenceBase({claims:[alternate]});const ui=bindEvidenceUI(base);assert(ui.ClaimCard(alternate.id).includes(alternate.statement));assert(ui.EvidenceDrawer(alternate.id).includes(alternate.statement));assert.throws(()=>ui.ClaimCard(id),/Unknown Claim/);
});
check('another module assembles from configuration without page cloning',()=>{
 const c=structuredClone(getClaim('CLM-000001'));c.id='CLM-MODULE-TEST';c.shortStatement='Інша тема — тест';const base=createEvidenceBase({claims:[c]});
 const module={id:'MOD-TEST',slug:'module-test',title:'Тестова тема',subtitle:'Лише fixture',version:'1.0',lastReviewed:'2026-10-10',evidenceStatus:'reviewing',sections:[{id:'hero',type:'hero'},{id:'short',type:'short_answer',claimIds:[c.id]},{id:'proof',type:'evidence_grid',claimIds:[c.id]},{id:'sources',type:'sources'},{id:'review',type:'last_reviewed'}]};
 const h=renderEvidenceModule(module,base);assert(h.includes('Тестова тема'));assert(h.includes(c.shortStatement));assert(h.includes('data-evidence-dialog'));assert(!h.includes('SRC-000001'));assert(!h.includes('creatine-mechanism'));
 module.sections[2].claimIds=['MISSING'];assert.throws(()=>renderEvidenceModule(module,base),/Unknown Claim/);module.sections[2].claimIds=[c.id];
 module.sections.push({id:'extra',type:'custom'});assert.throws(()=>renderEvidenceModule(module,base),/No renderer/);assert(renderEvidenceModule(module,base,{renderers:{custom:()=>'<p>Test extension</p>'}}).includes('Test extension'));
});
check('production module order and configured Claim lists actually drive rendering',()=>{
 const original=structuredClone(creatineModule.sections);try{
  const proof=creatineModule.sections.find(s=>s.type==='evidence_grid');proof.claimIds=['CLM-000008'];let h=renderModule();const grid=h.slice(h.indexOf('id="evidence-card"'),h.indexOf('id="creatine-dosing"'));assert(grid.includes('data-claim-id="CLM-000008"'));assert(!grid.includes('data-claim-id="CLM-000001"'));
  const i=creatineModule.sections.findIndex(s=>s.type==='short_answer'),j=creatineModule.sections.findIndex(s=>s.type==='mechanism');[creatineModule.sections[i],creatineModule.sections[j]]=[creatineModule.sections[j],creatineModule.sections[i]];
  h=renderModule();assert(h.indexOf('id="creatine-mechanism"')<h.indexOf('id="creatine-short"'));
 }finally{creatineModule.sections=original;}
});
check('movement has one header entry and retains its page link',()=>{
// navigation-v17.js 74 -> 75: the home supplement carousel was replaced by a catalogue entry (the guide now follows .supplement-entry).
 const nav=fs.readFileSync('dist/navigation-v17.js','utf8');assert(nav.includes("movement.href = './movement.html'"));assert(!nav.includes("['Рух', './movement.html']"));assert(nav.includes("['Харчування', './nutrition.html']"));assert(html.includes('navigation-v17.js?v=76'));
});
check('mobile structure explanation shares a compact frame with its controls',()=>{
 const css=fs.readFileSync('src/evidence/evidence.css','utf8');const mobile=css.slice(css.lastIndexOf('@media(max-width:760px)'));
 assert(mobile.includes('.eua-structure-layout{gap:0;'));assert(mobile.includes('.eua-structure-panel{padding:12px 14px 16px;'));
 assert(css.includes('min-height:44px'));assert(html.includes('evidence.css?v=1.9'));
});
check('additional mechanism scenes collapse and kidney evidence is not duplicated',()=>{
 const h=renderModule();assert.equal((h.match(/class="eua-mechanism-extra"/g)||[]).length,2);
 const kidney=h.slice(h.indexOf('id="creatine-kidney"'),h.indexOf('id="creatine-myths"'));
 assert(!kidney.includes('class="eua-claim"'));assert(kidney.includes('data-claim-open="CLM-000003"'));assert(kidney.includes('data-claim-open="CLM-000004"'));
 assert(h.includes('Практичні поради · із зазначенням джерел'));assert(!h.includes('Межі ілюстрації та provenance'));
});
console.log(`${checks} architecture / scientific-content / static regression checks passed. Browser layout verification not performed.`);
