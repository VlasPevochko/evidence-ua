import assert from 'node:assert/strict';
import fs from 'node:fs';
import {organelles,sources,visual,cellKnowledge,getOrganelle,adjacentOrganelle} from '../dist/cell-lab-data.js';
import {renderCell,panelContent,mount,initialCellPreferences} from '../src/cell-lab/controller.mjs';
import {entityRegistry} from '../dist/evidence/entities.js';
import {ClaimCard,EvidenceDrawer} from '../src/evidence/core/components.mjs';
assert.equal(organelles.length,11);assert.equal(new Set(organelles.map(o=>o.id)).size,11);
for(const o of organelles){assert.equal(o.label,entityRegistry.get(o.id).label);for(const id of o.sourceIds)assert(sources.some(s=>s.id===id));const svg=renderCell(o.id);assert(svg.includes(`data-organelle="${o.id}" role="button" tabindex="0" aria-pressed="true"`));for(const level of ['school','university','advanced']){assert(panelContent(o.id,'function',level).includes(o.summary));assert(panelContent(o.id,'sources',level).includes('openstax.org'));}}
assert.throws(()=>getOrganelle('ORG-UNKNOWN'),/Unknown organelle/);assert.throws(()=>renderCell('ORG-UNKNOWN'),/Unknown organelle/);assert.throws(()=>panelContent(organelles[0].id,'function','bad'),/Unknown learning level/);
assert(visual.simplified);assert.deepEqual(visual.claimIds,organelles.map(o=>o.claimId));assert.equal(visual.lastReviewed,null);assert.equal(cellKnowledge.claims.length,11);
const html=fs.readFileSync('dist/cell-lab.html','utf8'),css=fs.readFileSync('dist/cell-lab.css','utf8'),js=fs.readFileSync('dist/cell-lab.js','utf8');
assert(html.includes('role="status"'));assert(html.includes('aria-live="polite"'));assert(html.includes('type="search"'));assert(html.includes('еритроцити не мають ядра'));assert(html.includes('формального рейтингу доказів'));
assert(css.includes('min-height:44px'));assert(css.includes("grid-template-areas:'cell' 'panel' 'list'"));assert(css.includes('#organelle-list button[hidden]'));assert(js.includes("e.key==='Enter'||e.key===' '"));assert(js.includes('getOrganelle(b.dataset.organelle)'));
console.log('Cell Lab: eleven canonical entities, selected SVG states, three learning levels, source references, invalid-ID guards, honest review state and static mobile/accessibility checks passed. Browser verification pending.');
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/cell-v0.1-wording.json','utf8'));
assert.equal(cellKnowledge.records.length,11);
assert.equal(adjacentOrganelle(organelles.at(-1).id,1),organelles[0].id);
assert.equal(adjacentOrganelle(organelles[0].id,-1),organelles.at(-1).id);
assert.throws(()=>adjacentOrganelle(organelles[0].id,0),/Invalid/);
for(const old of baseline){
 const o=getOrganelle(old.id),c=cellKnowledge.claims.find(c=>c.id===o.claimId),r=cellKnowledge.records.find(r=>r.claimId===c.id);
 assert.equal(o.summary,old.summary);assert.equal(o.detail,old.detail);assert.equal(c.statement,old.summary);assert.equal(c.evidenceSummary,old.detail);
 assert.equal(c.evidenceConfidence,null);assert.equal(c.lastReviewed,null);assert.equal(c.scientificApproval,null);
 assert.deepEqual([r.sourceId],o.sourceIds);assert.equal(r.recordKind,'textbook_description');assert.equal(r.reviewStatus,'pending');assert.equal(r.result.estimate,undefined);
 const card=ClaimCard(c.id,cellKnowledge),drawer=EvidenceDrawer(c.id,cellKnowledge);
 assert(card.includes('Рівень впевненості не оцінено'));assert(drawer.includes('openstax.org'));assert(drawer.includes('не завершено'));assert(!drawer.includes('Invalid Date'));assert(!drawer.includes('Ефект і конкретні результати'));assert(drawer.includes(r.extractionLocator));assert(!drawer.includes('HIGH'));
}
// Run real handlers with a DOM adapter; these checks do not certify browser layout.
function fixture(href){
 const nodes=new Map(),listeners=new Map(),groups=new Map();
 const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',hidden:false,dataset:{},attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},handlers:new Map(),addEventListener(k,fn){this.handlers.set(k,fn);},removeEventListener(k,fn){if(this.handlers.get(k)===fn)this.handlers.delete(k);},querySelector:node,querySelectorAll:s=>groups.get(s)||[],focus(options){this.focused=true;this.focusOptions=options;},scrollIntoView(options){this.scrollOptions=options;},showModal(){this.open=true;},close(){this.open=false;this.handlers.get('close')?.();}});return nodes.get(key);};
 const make=(key,data)=>{const b=node(key);b.dataset=data;return b;};
 const list=organelles.map(o=>make('list-'+o.id,{organelle:o.id})),svg=organelles.map(o=>make(`[data-organelle="${o.id}"]`,{organelle:o.id})),quick=organelles.map(o=>make('quick-'+o.id,{organelle:o.id}));
 for(const b of svg)b.closest=selector=>selector==='[data-organelle]'?b:null;
 node('#cell-canvas').contains=target=>svg.includes(target);
 groups.set('[data-organelle]',[...list,...svg,...quick]);groups.set('button',list);
 const levelButtons=[...html.matchAll(/<button\b[^>]*data-level="([^"]+)"[^>]*>/g)].map((match,index)=>make('level-'+index,{level:match[1]}));
 groups.set('[data-level]',levelButtons);groups.set('[data-tab]',['function','sources'].map(tab=>make(tab,{tab})));
 const windowHandlers=new Map(),location={href},root={defaultView:{location,history:{replaceState(a,b,url){location.href=url;}},addEventListener(k,fn){windowHandlers.set(k,fn);},removeEventListener(){}},querySelector:node,querySelectorAll:s=>groups.get(s)||[],addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,[]);listeners.get(k).push(fn);},removeEventListener(){}};
 const ui=mount(root);
 const click=dataset=>{const b=make('click-'+JSON.stringify(dataset),dataset);for(const fn of listeners.get('click')||[])fn({target:{closest(selector){if(selector.includes('data-organelle')&&Object.keys(dataset).some(k=>['organelle','level','tab','cellAction','cellDetailAction'].includes(k)))return b;if(selector==='[data-claim-open]'&&dataset.claimOpen)return b;if(selector==='[data-evidence-close]'&&dataset.close)return b;return null;}}});return b;};
 const key=(key,id=ui.state().selected)=>node('#cell-canvas').handlers.get('keydown')({key,target:{dataset:{organelle:id},matches:()=>true,closest(){return this;}},preventDefault(){}});
 const preview=(type,id,relatedId)=>node('#cell-canvas').handlers.get(type)?.({target:{closest:()=>id?node(`[data-organelle="${id}"]`):null},relatedTarget:relatedId?node(`[data-organelle="${relatedId}"]`):null});
 const search=value=>node('#organelle-search').handlers.get('input')({target:{value}});
 return {node,ui,click,key,preview,search,list,levelButtons,location,windowHandlers};
}
// A transient atlas preview must not commit selection, explanation or URL state.
const previewUI=fixture('https://evidence.invalid/cell-lab.html?organelle=ORG-NUCLEUS&level=university&tab=function#cell-canvas');
const previewState=previewUI.ui.state(),previewHref=previewUI.location.href,previewCopy=previewUI.node('#organelle-copy').innerHTML;
const pressedBefore=organelles.map(o=>previewUI.node(`[data-organelle="${o.id}"]`).attributes['aria-pressed']);
previewUI.preview('pointerover','ORG-GOLGI');
assert.equal(previewUI.node('#cell-preview-name').textContent,'Апарат Гольджі');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Попередній перегляд');
assert.deepEqual(previewUI.ui.state(),previewState);assert.equal(previewUI.location.href,previewHref);assert.equal(previewUI.node('#organelle-copy').innerHTML,previewCopy);assert.equal(previewUI.node('#organelle-title').textContent,'Ядро');assert.deepEqual(organelles.map(o=>previewUI.node(`[data-organelle="${o.id}"]`).attributes['aria-pressed']),pressedBefore);
// Moving from an organelle to unassigned cytoplasm inside the atlas clears its preview.
previewUI.preview('pointerover');assert.equal(previewUI.node('#cell-preview-name').textContent,'Ядро');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Обрана структура');assert.deepEqual(previewUI.ui.state(),previewState);assert.equal(previewUI.location.href,previewHref);assert.equal(previewUI.node('#organelle-copy').innerHTML,previewCopy);assert.deepEqual(organelles.map(o=>previewUI.node(`[data-organelle="${o.id}"]`).attributes['aria-pressed']),pressedBefore);
previewUI.preview('pointerover','ORG-NUCLEUS');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Обрана структура');
previewUI.preview('pointerleave');assert.equal(previewUI.node('#cell-preview-name').textContent,'Ядро');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Обрана структура');
previewUI.preview('focusin','ORG-RIBOSOME');assert.equal(previewUI.node('#cell-preview-name').textContent,'Рибосома');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Попередній перегляд');
previewUI.preview('focusout','ORG-RIBOSOME','ORG-GOLGI');assert.equal(previewUI.node('#cell-preview-name').textContent,'Апарат Гольджі');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Попередній перегляд');assert.equal(previewUI.location.href,previewHref);assert.deepEqual(previewUI.ui.state(),previewState);assert.equal(previewUI.node('#organelle-copy').innerHTML,previewCopy);assert.deepEqual(organelles.map(o=>previewUI.node(`[data-organelle="${o.id}"]`).attributes['aria-pressed']),pressedBefore);
previewUI.preview('focusout','ORG-GOLGI');assert.equal(previewUI.node('#cell-preview-name').textContent,'Ядро');
previewUI.preview('pointerover','ORG-UNKNOWN');assert.equal(previewUI.node('#cell-preview-name').textContent,'Ядро');
previewUI.preview('pointerover','ORG-GOLGI');previewUI.click({organelle:'ORG-GOLGI'});assert.equal(previewUI.ui.state().selected,'ORG-GOLGI');assert.equal(previewUI.node('#cell-preview-name').textContent,'Апарат Гольджі');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Обрана структура');
previewUI.preview('pointerover','ORG-RIBOSOME');previewUI.click({level:'school'});assert.equal(previewUI.node('#cell-preview-name').textContent,'Апарат Гольджі');
previewUI.preview('focusin','ORG-RIBOSOME');previewUI.key('Enter','ORG-RIBOSOME');assert.equal(previewUI.ui.state().selected,'ORG-RIBOSOME');assert.equal(previewUI.node('#cell-preview-caption').textContent,'Обрана структура');
previewUI.preview('focusin','ORG-NUCLEUS');previewUI.key(' ','ORG-NUCLEUS');assert.equal(previewUI.ui.state().selected,'ORG-NUCLEUS');assert.equal(previewUI.node('#cell-preview-name').textContent,'Ядро');
previewUI.ui.destroy();previewUI.node('#cell-preview-name').textContent='Атлас від’єднано';
for(const event of [['pointerover','ORG-GOLGI'],['focusin','ORG-RIBOSOME'],['pointerleave'],['focusout','ORG-NUCLEUS','ORG-GOLGI']]){previewUI.preview(...event);assert.equal(previewUI.node('#cell-preview-name').textContent,'Атлас від’єднано');}assert.equal(previewUI.ui.state().selected,'ORG-NUCLEUS');
const f=fixture('https://evidence.invalid/cell-lab.html?v=56&organelle=ORG-NUCLEUS#cell-canvas');
assert.deepEqual(initialCellPreferences('https://evidence.invalid/cell-lab.html?level=bad&tab=bad'),{level:'university',tab:'function'});
const deep=fixture('https://evidence.invalid/cell-lab.html?organelle=ORG-RIBOSOME&level=school&tab=sources#cell-canvas');assert.equal(deep.ui.state().level,'school');assert.equal(deep.ui.state().tab,'sources');assert(deep.node('#organelle-copy').innerHTML.includes('openstax.org'));
// Both visible level groups must follow saved URLs, navigation and user selection.
const assertLevelButtons=(ui,level)=>{assert.equal(ui.levelButtons.filter(b=>b.attributes['aria-pressed']==='true').length,2);for(const b of ui.levelButtons)assert.equal(b.attributes['aria-pressed'],String(b.dataset.level===level));};
assertLevelButtons(deep,'school');
deep.location.href='https://evidence.invalid/cell-lab.html?organelle=ORG-NUCLEUS&level=advanced&tab=function#cell-canvas';deep.windowHandlers.get('popstate')();assert.deepEqual(deep.ui.state(),{selected:'ORG-NUCLEUS',level:'advanced',tab:'function'});assertLevelButtons(deep,'advanced');
assert.equal(f.ui.state().selected,'ORG-NUCLEUS');f.click({cellAction:'previous'});assert.equal(f.ui.state().selected,organelles.at(-1).id);f.click({cellAction:'next'});assert.equal(f.ui.state().selected,'ORG-NUCLEUS');
for(const o of organelles){f.click({organelle:o.id});assert.equal(f.node('#organelle-title').textContent,o.label);assert(f.node('#organelle-copy').innerHTML.includes(o.summary));assert.equal(new URL(f.location.href).searchParams.get('organelle'),o.id);assert.equal(new URL(f.location.href).hash,'#cell-canvas');assert.equal(new URL(f.location.href).searchParams.get('v'),'56');}
f.key('ArrowRight');assert.equal(f.ui.state().selected,'ORG-NUCLEUS');assert(f.node('[data-organelle="ORG-NUCLEUS"]').focused);f.key('ArrowLeft');assert.equal(f.ui.state().selected,organelles.at(-1).id);f.key('Enter');f.key(' ');
f.click({level:'school'});assert(!f.node('#organelle-copy').innerHTML.includes(organelles.at(-1).detail));assertLevelButtons(f,'school');f.click({level:'advanced'});assert(f.node('#organelle-copy').innerHTML.includes(organelles.at(-1).detail));assertLevelButtons(f,'advanced');assert.equal(new URL(f.location.href).searchParams.get('level'),'advanced');
f.click({tab:'sources'});assert(f.node('#organelle-copy').innerHTML.includes('openstax.org'));assert(f.node('#organelle-copy').innerHTML.includes('data-claim-open'));
f.search('ЯДРО');assert.equal(f.list.filter(b=>!b.hidden).length,1);f.search('ххххх');assert.equal(f.list.filter(b=>!b.hidden).length,0);assert(f.node('#search-result').textContent.includes('Нічого'));f.search('');assert.equal(f.list.filter(b=>!b.hidden).length,11);
for(const c of cellKnowledge.claims){const opener=f.click({claimOpen:c.id});assert(f.node('#eua-evidence-dialog').open);assert(f.node('[data-evidence-content]').innerHTML.includes(c.statement));f.click({close:true});assert(!f.node('#eua-evidence-dialog').open);assert(opener.focused);}
assert.equal(fixture('https://evidence.invalid/cell-lab.html?organelle=missing').ui.state().selected,'ORG-MITOCHONDRION');assert(html.includes('id="organelle-quick"'));assert(html.includes('id="eua-evidence-dialog"'));assert(css.includes('height:100dvh'));assert(css.includes('.cell-claims{grid-template-columns:minmax(0,1fr)}'));
console.log('Cell Lab migration: frozen original wording, 11 linked descriptive records, null confidence, shared drawers, cyclic model controls, keyboard selection, search, deep links and focus return passed.');

// Source structure buttons must open the corresponding model without losing reading preferences.
const sourceJump=fixture('https://evidence.invalid/cell-lab.html?organelle=ORG-NUCLEUS&level=advanced&tab=sources#sources');
sourceJump.click({organelle:'ORG-GOLGI',sourceJump:'true'});
assert.deepEqual(sourceJump.ui.state(),{selected:'ORG-GOLGI',level:'advanced',tab:'sources'});
assert.equal(new URL(sourceJump.location.href).hash,'#cell-canvas');
assert(sourceJump.node('#cell-canvas').focused);
assert.deepEqual(sourceJump.node('#cell-canvas').focusOptions,{preventScroll:true});
assert.deepEqual(sourceJump.node('#cell-canvas').scrollOptions,{behavior:'auto',block:'start'});

// Clicks open the interior in the existing atlas; hover remains only a preview.
const interior=fixture('https://evidence.invalid/cell-lab.html?organelle=ORG-NUCLEUS&level=advanced&tab=sources#cell-canvas');
assert.equal(typeof interior.ui.detailState,'function');
assert.deepEqual(interior.ui.detailState(),{open:false,zoom:4});
interior.preview('pointerover','ORG-MITOCHONDRION');assert.equal(interior.ui.detailState().open,false);
interior.click({organelle:'ORG-MITOCHONDRION'});assert.deepEqual(interior.node('#cell-canvas').scrollOptions,{behavior:'auto',block:'start'});assert.deepEqual(interior.ui.detailState(),{open:true,zoom:4});
assert.equal(interior.node('#cell-detail').hidden,false);assert.equal(interior.node('.cell-atlas-frame').hidden,true);assert(interior.node('#cell-detail').innerHTML.includes('Кристи'));
assert.deepEqual(interior.ui.state(),{selected:'ORG-MITOCHONDRION',level:'advanced',tab:'sources'});
assert.equal(new URL(interior.location.href).pathname,'/cell-lab.html');
interior.click({cellDetailAction:'zoom-in'});assert.equal(interior.ui.detailState().zoom,6);
interior.click({cellDetailAction:'zoom-in'});interior.click({cellDetailAction:'zoom-in'});assert.equal(interior.ui.detailState().zoom,8);
interior.click({cellDetailAction:'zoom-out'});assert.equal(interior.ui.detailState().zoom,6);
interior.click({cellDetailAction:'fit'});assert.equal(interior.ui.detailState().zoom,4);
interior.click({cellDetailAction:'zoom-out'});interior.click({cellDetailAction:'zoom-out'});assert.equal(interior.ui.detailState().zoom,2);
const interiorHref=interior.location.href;
interior.key('Escape');assert.deepEqual(interior.ui.detailState(),{open:false,zoom:2});assert.equal(interior.node('#cell-detail').hidden,true);assert.equal(interior.node('.cell-atlas-frame').hidden,false);assert.equal(interior.location.href,interiorHref);assert(interior.node('[data-organelle="ORG-MITOCHONDRION"]').focused);
interior.key('Enter','ORG-RIBOSOME');assert.deepEqual(interior.ui.detailState(),{open:true,zoom:4});assert.equal(interior.ui.state().selected,'ORG-RIBOSOME');
interior.click({cellDetailAction:'close'});assert.equal(interior.ui.detailState().open,false);
for(const o of organelles){interior.click({organelle:o.id});assert.equal(interior.ui.detailState().open,true);assert(interior.node('#cell-detail').innerHTML.includes(o.label));interior.click({cellDetailAction:'close'});assert.equal(interior.ui.detailState().open,false);}

// Zoom keeps the viewed point instead of jumping back to the corner.
const panned=fixture('https://evidence.invalid/cell-lab.html#cell-canvas');
const stage=panned.node('.cell-detail-stage');stage.clientWidth=400;stage.clientHeight=300;stage.scrollLeft=0;stage.scrollTop=0;
Object.defineProperty(stage,'scrollWidth',{get:()=>Math.max(400,panned.ui.detailState().zoom*100)});
Object.defineProperty(stage,'scrollHeight',{get:()=>Math.max(300,panned.ui.detailState().zoom*75)});
panned.click({organelle:'ORG-MITOCHONDRION'});panned.click({cellDetailAction:'zoom-in'});panned.click({cellDetailAction:'zoom-in'});
stage.scrollLeft=360;stage.scrollTop=150;panned.click({cellDetailAction:'zoom-out'});
assert.equal(stage.scrollLeft,220);assert.equal(stage.scrollTop,75);
