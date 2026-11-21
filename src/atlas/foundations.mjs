import {atlasFoundationBase,foundationModules,foundationTabs} from '../evidence/atlas/foundations.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceById=new Map(atlasFoundationBase.sources.map(s=>[s.id,s]));
const selectionByZone=new Map();
const sourceLink=s=>'<a class="af-source-link" href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.shortCitation||s.title)+'</a>';
function citation(ids,all=false){
 const sources=[...new Set(ids)].map(id=>sourceById.get(id)).filter(Boolean);
 if(!sources.length)return '';
 return '<div class="af-citation"><span>Джерело</span>'+(all?sources.map(sourceLink).join(' '):sourceLink(sources[0]))+(!all&&sources.length>1?'<span>Інші першоджерела — у «Джерелах».</span>':'')+'</div>';
}
function lessonHTML(item){
 return '<section class="af-lesson"'+(item.claimId?' data-claim-id="'+esc(item.claimId)+'"':'')+'><h3>'+esc(item.title)+'</h3><p>'+esc(item.body)+'</p>'+(item.boundary?'<p class="af-boundary">'+esc(item.boundary)+'</p>':'')+citation(item.sourceIds)+'</section>';
}
function brainSVG(){
 return '<svg class="af-diagram af-brain" viewBox="0 0 320 235" aria-hidden="true" focusable="false">'
 +'<path class="af-shape" data-foundation-shape="brainstem" d="M163 133 C164 152 177 167 185 180 L190 219 L172 224 L163 184 C151 175 146 159 147 142 Z"/>'
 +'<path class="af-shape" data-foundation-shape="cerebellum" d="M207 120 C243 111 277 133 274 157 C271 184 239 190 215 174 C199 163 198 140 207 120 Z"/>'
 +'<path class="af-shape" data-foundation-shape="cerebrum" d="M45 126 C22 109 30 77 49 67 C50 42 78 23 100 27 C119 9 146 18 160 24 C185 10 218 24 226 39 C253 39 279 65 278 89 C292 113 273 135 250 137 C226 152 208 141 190 148 C165 157 146 143 126 146 C105 153 84 137 70 139 C58 140 50 136 45 126 Z"/>'
 +'<g class="af-folds"><path d="M57 98 Q72 70 94 77 T131 63 T163 54 M82 118 Q108 97 133 107 T181 91 T229 91 M118 40 Q103 63 123 82 M178 40 Q194 60 179 79 M232 59 Q250 77 237 111 M223 142 Q247 132 261 146 M222 158 Q242 151 262 161"/></g>'
 +'<circle class="af-shape af-inner" data-foundation-shape="hypothalamus" cx="163" cy="128" r="13"/>'
 +'</svg>';
}
function gutSVG(){
 return '<svg class="af-diagram af-gut" viewBox="0 0 320 270" aria-hidden="true" focusable="false">'
 +'<defs><marker id="af-food-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10"/></marker></defs>'
 +'<g class="af-food-route"><path d="M165 30 V54 M165 87 L178 103 M181 133 L161 151 M178 193 L213 203 M210 228 L185 244" marker-end="url(#af-food-arrow)"/></g>'
 +'<ellipse class="af-shape" data-foundation-shape="mouth" cx="165" cy="23" rx="21" ry="10"/>'
 +'<path class="af-shape" data-foundation-shape="esophagus" d="M157 48 H173 V91 H157 Z"/>'
 +'<path class="af-shape" data-foundation-shape="stomach" d="M173 99 C174 114 197 103 204 116 C217 141 184 150 173 134 C165 124 159 124 159 114 V101 Z"/>'
 +'<path class="af-shape" data-foundation-shape="small-intestine" d="M132 155 Q153 146 169 157 Q189 148 187 165 Q174 174 143 165 Q125 171 143 178 Q174 168 184 184 Q176 200 147 188 Q123 196 128 180 Q115 170 132 155 Z"/>'
 +'<path class="af-shape" data-foundation-shape="large-intestine" d="M110 143 H123 V199 Q156 208 204 198 V147 H217 V205 Q214 221 198 223 H130 Q109 220 110 201 Z"/>'
 +'<path class="af-shape" data-foundation-shape="rectum" d="M178 235 H193 L190 260 H181 Z"/>'
 +'<g class="af-helper-shapes"><path d="M58 108 Q79 79 117 96 L105 116 Z"/><ellipse cx="101" cy="121" rx="8" ry="11"/><path d="M212 127 Q239 114 260 126 L251 135 L214 139 Z"/><path class="af-helper-duct" d="M105 128 L143 147 M221 137 L168 146"/></g>'
 +'</svg>';
}
function helperHTML(module){
 if(!module.helpers?.length)return '';
 return '<aside class="af-helpers"><h3>Допоміжні органи — поза шляхом їжі</h3><dl>'+module.helpers.map(p=>'<div><dt>'+esc(p.title)+'</dt><dd>'+esc(p.body)+'</dd></div>').join('')+'</dl>'+citation(['SRC-000122'])+'</aside>';
}
const diagramPositions={
 brain:{cerebrum:[41,34],cerebellum:[75,66],brainstem:[55,84],hypothalamus:[51,54]},
 gut:{mouth:[52,9],esophagus:[52,24],stomach:[59,45],'small-intestine':[48,66],'large-intestine':[66,69],rectum:[58,92],liver:[26,37],gallbladder:[32,45],pancreas:[74,47]}
};
function diagramLabels(zone,module){
 const items=[...module.parts.map((p,i)=>({...p,key:String(i+1),primary:true})),...(module.helpers||[]).map((p,i)=>({...p,key:['A','B','C'][i]}))];
 const marks=items.map(p=>{const [x,y]=diagramPositions[zone][p.id];return '<span class="af-diagram-mark" data-diagram-mark="'+p.id+'" style="left:'+x+'%;top:'+y+'%" aria-hidden="true">'+p.key+'</span>';}).join('');
 const key='<ul class="af-diagram-key'+(zone==='brain'?' af-diagram-key--brain':'')+'" aria-label="Позначення на схемі">'+items.map(p=>'<li'+(p.primary?' class="af-key-primary"':'')+'><span>'+p.key+'</span> '+esc(p.title)+'</li>').join('')+'</ul>';
 return {marks,key};
}
function anatomyHTML(zone,module){
 const labels=diagramLabels(zone,module);
 return '<p class="af-diagram-note">'+esc(module.diagramNote)+'</p><div class="af-explorer" data-foundation-root="'+zone+'">'
 +'<div class="af-map"><div class="af-picture">'+(zone==='brain'?brainSVG():gutSVG())+labels.marks+'</div><p class="af-selection" data-foundation-selection aria-live="polite">Усі пояснення наведено нижче. Інтерактивний вибір завантажується.</p>'+labels.key+'</div>'
 +'<div class="af-choices" role="group" aria-label="'+(zone==='brain'?'Відділи мозку':'Шлях їжі')+'">'+module.parts.map((p,i)=>'<button type="button" id="af-choice-'+zone+'-'+p.id+'" data-foundation-choice="'+p.id+'" aria-pressed="false" aria-controls="af-part-'+zone+'-'+p.id+'" disabled><span aria-hidden="true">'+(i+1)+'</span>'+esc(p.title)+'</button>').join('')+'</div>'
 +'<div class="af-readings">'+module.parts.map(p=>'<section class="af-part" id="af-part-'+zone+'-'+p.id+'" data-foundation-part="'+p.id+'" aria-labelledby="af-choice-'+zone+'-'+p.id+'"><h3>'+esc(p.title)+'</h3><p>'+esc(p.body)+'</p>'+(p.boundary?'<p class="af-boundary">'+esc(p.boundary)+'</p>':'')+citation(p.sourceIds)+'</section>').join('')+'</div></div>'+helperHTML(module);
}
function researchHTML(zone,module){
 const sources=module.sourceIds.map(id=>sourceById.get(id));
 let html='<section class="af-review"><h3>Джерела й межі пояснень</h3><p>Навчальний матеріал про будову й фізіологію. Незалежний науковий перегляд не завершено; рівні впевненості не присвоєно.</p><p>Ці довідкові сторінки не є випробуваннями лікування. Схеми спрощують будову й не визначають причини симптомів.</p></section>'
 +'<h3>Навчальні першоджерела</h3><ol class="af-sources">'+sources.map(s=>'<li data-source-id="'+esc(s.id)+'">'+sourceLink(s)+'<p>'+esc(s.title)+'</p><p class="af-boundary">Навчальний матеріал NIH. Прочитано повну сторінку 14.11.2026; дату публікації не встановлено.</p></li>').join('')+'</ol>';
 if(zone==='gut')html+='<details class="af-borrowed"><summary>Чинні фізіологічні твердження</summary><p>Формулювання й записи доказів повторно використано з «Шляху їжі». Це механізми, а не доведення клінічного ефекту; їхні рівні впевненості не оцінено.</p>'+atlasFoundationBase.claims.map(c=>'<section class="af-physiology" data-claim-id="'+esc(c.id)+'"><p>'+esc(c.statement)+'</p>'+citation(atlasFoundationBase.records.filter(r=>r.claimId===c.id).map(r=>r.sourceId),true)+'</section>').join('')+'<a class="af-source-link" href="./nutrition-digestion.html">Повний розбір, першоджерела та межі — «Шлях їжі»</a></details>';
 return html;
}
export function renderFoundation(zone,tab){
 const module=foundationModules[zone];
 if(!module||!foundationTabs.includes(tab))return '';
 const intro='<p class="af-editorial-note">Навчальна бета · незалежний науковий перегляд не завершено</p>';
 let body;
 if(tab==='overview')body=module.lessons.map(lessonHTML).join('')+(zone==='brain'?'<ol class="af-signal" aria-label="Умовна послідовність передавання сигналу"><li>Дендрити</li><li>Тіло клітини</li><li>Аксон</li><li>Хімічний синапс</li></ol>':'')+'<nav class="af-related" aria-label="Пов’язані матеріали"><h3>Дослідити далі</h3>'+module.related.map(r=>'<a href="'+esc(r.href)+'"><strong>'+esc(r.title)+'</strong><span>'+esc(r.copy)+'</span></a>').join('')+'</nav>';
 if(tab==='anatomy')body=anatomyHTML(zone,module);
 if(tab==='research')body=researchHTML(zone,module);
 return '<div class="atlas-foundation" data-foundation-zone="'+zone+'">'+intro+body+'</div>';
}
function transcript(zone,module){
 return '<section class="af-transcript" aria-labelledby="af-transcript-'+zone+'"><h2 id="af-transcript-'+zone+'">'+esc(module.title)+' · навчальний матеріал</h2><p>'+esc(module.summary)+'</p><p>Схеми умовні; незалежний науковий перегляд не завершено.</p>'
 +module.lessons.map(lessonHTML).join('')+'<h3>Будова й функції</h3>'+module.parts.map(p=>'<section><h4>'+esc(p.title)+'</h4><p>'+esc(p.body)+'</p>'+(p.boundary?'<p>'+esc(p.boundary)+'</p>':'')+citation(p.sourceIds)+'</section>').join('')+helperHTML(module)+researchHTML(zone,module)+'</section>';
}
export function renderFoundationTemplates(){
 return Object.entries(foundationModules).flatMap(([zone,module])=>foundationTabs.map(tab=>'<template id="atlas-foundation-'+zone+'-'+tab+'">'+renderFoundation(zone,tab)+'</template>')).join('')
 +'<noscript><div class="af-noscript"><h2>Мозок і ШКТ: текстовий виклад</h2><p>Без JavaScript усі пояснення доступні нижче.</p>'+Object.entries(foundationModules).map(([z,m])=>transcript(z,m)).join('')+'</div></noscript>';
}
export function mountFoundation(root){
 if(!root||root.dataset.foundationReady==='true')return;
 const buttons=[...root.querySelectorAll('[data-foundation-choice]')];
 const panels=[...root.querySelectorAll('[data-foundation-part]')];
 if(!buttons.length||panels.length!==buttons.length)return;
 const zone=root.dataset.foundationRoot;
 function select(id){
  const target=buttons.find(b=>b.dataset.foundationChoice===id);
  if(!target||!panels.some(p=>p.dataset.foundationPart===id))return;
  selectionByZone.set(zone,id);
  for(const b of buttons)b.setAttribute('aria-pressed',String(b===target));
  for(const p of panels)p.hidden=p.dataset.foundationPart!==id;
  for(const shape of root.querySelectorAll('[data-foundation-shape]'))shape.classList.toggle('is-selected',shape.dataset.foundationShape===id);
  const label=root.querySelector('[data-foundation-selection]');
  if(label)label.textContent='Обрано: '+target.textContent.replace(/^\s*\d+\s*/,'').trim();
 }
 root.addEventListener('click',event=>{
  const b=event.target?.closest?.('[data-foundation-choice]');
  if(b&&root.contains(b))select(b.dataset.foundationChoice);
 });
 root.addEventListener('keydown',event=>{
  const b=event.target?.closest?.('[data-foundation-choice]');
  if(!b||!root.contains(b))return;
  const i=buttons.indexOf(b);
  const indices={ArrowRight:(i+1)%buttons.length,ArrowDown:(i+1)%buttons.length,ArrowLeft:(i+buttons.length-1)%buttons.length,ArrowUp:(i+buttons.length-1)%buttons.length,Home:0,End:buttons.length-1};
  if(!(event.key in indices))return;
  event.preventDefault();const next=buttons[indices[event.key]];next.focus();select(next.dataset.foundationChoice);
 });
 root.dataset.foundationReady='true';
 root.classList.add('is-enhanced');
 for(const b of buttons)b.disabled=false;
 const initial=selectionByZone.get(zone);
 select(buttons.some(b=>b.dataset.foundationChoice===initial)?initial:buttons[0].dataset.foundationChoice);
}
