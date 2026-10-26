import {bindEvidenceUI,escapeHTML as e,date,mountEvidenceDrawer} from './components.js?v=2.1';

// Scientific IDs and section order belong to module data; topic scenes are hooks.
export function renderEvidenceModule(module,base,{renderers={},view={},shell}={}){
 const ui=bindEvidenceUI(base),seen=new Set();
 const sections=module.sections.map(section=>{
  if(seen.has(section.id))throw Error('Duplicate module section: '+section.id);seen.add(section.id);
  for(const id of section.claimIds||[])ui.getClaim(id);
  const anchor=view[section.id]?.anchorId||section.anchorId||`${module.slug}-${section.id}`;
  const config={...section,...view[section.id],anchorId:anchor};
  const sourceIds=section.sourceIds||[...new Set((section.claimIds||module.sections.flatMap(s=>s.claimIds||[])).flatMap(id=>ui.recordsFor(id).map(r=>r.sourceId)))];
  const sources=sourceIds.map(id=>{const s=base.sources.find(s=>s.id===id);if(!s)throw Error('Unknown module Source: '+id);return s;});
  const context={module,base,section:config,ui,sources};
  const custom=renderers[section.type];let html;
  if(custom)html=custom(context);
  else if(section.type==='hero')html=`<div class="eua-hero"><h1>${e(module.title)}</h1><p class="eua-lead">${e(module.subtitle)}</p></div>`;
  else if(section.type==='short_answer')html=wrap(config,`<div class="eua-short-list">${(section.claimIds||[]).map(id=>`<div><p>${e(ui.getClaim(id).shortStatement)}</p>${ui.claimButton(id,'Докази та межі висновку')}</div>`).join('')}</div>`);
  else if(section.type==='evidence_grid')html=wrap(config,`<div class="eua-claim-grid">${(section.claimIds||[]).map(id=>ui.ClaimCard(id)).join('')}</div>`);
  else if(section.type==='sources')html=wrap(config,`<div class="eua-source-grid">${sources.map(s=>ui.SourceCard(s,base.records.filter(r=>r.sourceId===s.id))).join('')}</div>`);
  else if(section.type==='last_reviewed')html=wrap(config,`<p>Дата попереднього огляду: <time datetime="${e(module.lastReviewed)}">${date(module.lastReviewed)}</time></p><p>Evidence version: ${e(module.version)} · Статус: ${e({up_to_date:'Актуально',new_evidence_detected:'Є нові дані — перевіряємо',reviewing:'Науковий перегляд триває',update_required:'Потребує оновлення',updated:'Оновлено'}[module.evidenceStatus]||module.evidenceStatus)}</p>`);
  else throw Error('No renderer registered for section type: '+section.type);
  return {section:config,html};
 });
 const hero=sections.filter(s=>s.section.type==='hero').map(s=>s.html).join('');
 const body=sections.filter(s=>s.section.type!=='hero').map(s=>s.html).join('');
 const nav=`<nav class="eua-section-nav" aria-label="Розділи ${e(module.title)}">${sections.filter(s=>s.section.type!=='hero'&&s.section.type!=='last_reviewed').map(s=>`<a href="#${e(s.section.anchorId)}">${e(s.section.navLabel||s.section.title||s.section.id)}</a>`).join('')}</nav>`;
 return shell?shell({hero,body,nav}):`<section id="${e(module.slug)}" class="eua-module">${hero}<div class="eua-content">${nav}${body}</div><dialog data-evidence-dialog class="eua-dialog" aria-labelledby="eua-drawer-title"><div data-evidence-content></div></dialog></section>`;
}
export function mountEvidenceModule(root,base){return mountEvidenceDrawer(root,base,{dialogSelector:'[data-evidence-dialog]'});}
function wrap(section,content){return `<section class="eua-block" id="${e(section.anchorId)}">${section.title?`<h2>${e(section.title)}</h2>`:''}${content}</section>`;}
