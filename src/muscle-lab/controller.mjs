import {moduleMeta,sources,structures,topics,muscleKnowledge,topicClaimIds,visual} from './module.mjs';
import {sceneFrame} from './scenes.mjs';
import {structureLearningCopy} from './learning-copy.mjs';
import {ClaimCard,SourceCard,claimButton,mountEvidenceDrawer} from '../evidence/core/components.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const levels=['school','university','advanced'],tabs=['description','function','sources'];
const readingHints={school:'Школа — коротко й просто.',university:'Університет — повний опис будови та функції.',advanced:'Поглиблено — більше деталей і межі пояснення.'};
export function initialStructure(href){const id=new URL(href||'https://evidence.invalid').searchParams.get('structure');return structures.find(s=>s.id===id)||structures[0];}
export function initialPreferences(href){const url=new URL(href||'https://evidence.invalid');return {level:levels.includes(url.searchParams.get('level'))?url.searchParams.get('level'):'university',tab:tabs.includes(url.searchParams.get('tab'))?url.searchParams.get('tab'):'description'};}
export function adjacentStructure(id,direction){const index=structures.findIndex(s=>s.id===id);if(index<0)throw new Error('Unknown structure');if(![-1,1].includes(direction))throw new Error('Invalid direction');return structures[Math.max(0,Math.min(structures.length-1,index+direction))];}
export function structureURL(href,id,level='university',tab='description'){
 if(!structures.some(s=>s.id===id)||!levels.includes(level)||!tabs.includes(tab))throw Error('Unknown selection');
 const url=new URL(href||'https://evidence.invalid/muscle-lab.html');url.searchParams.set('structure',id);url.searchParams.set('level',level);url.searchParams.set('tab',tab);return url;
}
export function renderHotspots(){return structures.slice(0,4).map((s,i)=>`<button class="art-hotspot" data-structure="${s.id}" style="--point:${[16,38,55,82][i]}%" aria-label="Обрати: ${esc(s.label)}" aria-controls="structure-copy" aria-pressed="${i===0}" title="${esc(s.label)}">${i+1}</button>`).join('');}
export function sourceLinks(ids){return ids.map(id=>{const s=sources.find(s=>s.id===id);if(!s)throw Error('Unknown source');return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`;}).join('<br>');}
export function structureContent(s,tab,level){
 const text=structureLearningCopy(s,tab,level);
 const claim=muscleKnowledge.claims.find(c=>c.id===s.claimId);
 const records=muscleKnowledge.records.filter(r=>r.claimId===s.claimId);
 const groups=[...new Set(records.map(r=>r.claimPart))].map(part=>{const matching=records.filter(r=>r.claimPart===part);return `<h3>${esc(matching[0].claimPartLabel)}</h3>${sourceLinks([...new Set(matching.map(r=>r.sourceId))])}`;}).join('');
 const note=claim.claimType==='physiology'?'Навчальне пояснення будови.':'Механістичне пояснення.';
 const content=tab==='sources'?`<p class="small">Джерела для визначення та функції наведено окремо. Повний науковий перегляд ще не завершено.</p>${groups}`:`<p>${esc(text)}</p>${level==='advanced'?`<p class="small">${note} Не встановлює силу, швидкість або довгостроковий ефект конкретної програми у людей.</p>`:''}`;
 return content+claimButton(s.claimId);
}
export function renderTopics(level){return topics.map(t=>{const c=muscleKnowledge.claims.find(c=>c.id===topicClaimIds[t.id]),modelNote=t.id==='growth'||t.id==='atrophy'?c.limitations[0]:null;return `<article class="topic" id="${t.id}" tabindex="-1" data-color="${t.color}"><p class="eyebrow">${t.id==='contraction'?'МЕХАНІЗМ':'АДАПТАЦІЯ З ЧАСОМ'}</p><h2>${esc(t.title)}</h2><p>${esc(t.description)}</p>
<div class="topic-player"><div class="topic-scene" id="scene-${t.id}" data-topic-scene="${t.id}" aria-describedby="progress-${t.id}">${sceneFrame(t.id)}</div><div class="player-panel">
<div class="step-picker" role="group" aria-label="Обрати крок: ${esc(t.title)}">${t.steps.map((text,i)=>`<button data-step-topic="${t.id}" data-step-index="${i}" aria-pressed="false" aria-controls="scene-${t.id}"><span>${i+1}</span>${esc(text)}</button>`).join('')}</div>
<div class="scene-controls"><button data-previous="${t.id}" aria-label="Попередній крок: ${esc(t.title)}" disabled>← Назад</button><button data-next="${t.id}" aria-label="Наступний крок: ${esc(t.title)}">Далі →</button><button data-play="${t.id}" aria-pressed="false">▶ Показати послідовність</button><button data-reset="${t.id}">↺ Спочатку</button></div><p class="small" id="progress-${t.id}" data-progress="${t.id}" aria-live="polite">Кроки умовні: не реальний час і не кількісна симуляція.</p><p data-topic-copy="${t.id}">${esc(t[level])}</p>${modelNote?`<p class="small">${esc(modelNote)}</p>`:''}${claimButton(topicClaimIds[t.id])}</div></div>
<details class="step-details"><summary>Усі кроки та пояснення</summary><ol>${t.steps.map((s,i)=>`<li data-topic-step="${t.id}-${i}">${esc(s)}</li>`).join('')}</ol></details><details><summary>Контекстні джерела</summary><p class="small">Не окрема оцінка величини ефекту у людей.</p><p class="source-links">${sourceLinks(t.sourceIds)}</p></details><a class="return-to-structure" href="#explorer">↑ Повернутися до будови м’яза</a></article>`;}).join('');}
export function mount(root=document){
 const view=root.defaultView,preferences=initialPreferences(view?.location?.href);
 let selected=initialStructure(view?.location?.href),tab=preferences.tab,level=preferences.level;
 const timers=new Map(),indices=new Map();
 const motion=view?.matchMedia?.('(prefers-reduced-motion: reduce)');
 const schedule=view?.setInterval?.bind(view)||setInterval,cancel=view?.clearInterval?.bind(view)||clearInterval;
 root.querySelector('#scales').innerHTML=structures.map(s=>`<button data-structure="${s.id}" aria-pressed="${s.id===selected.id}" aria-controls="structure-copy">${esc(s.label)}</button>`).join('');
 root.querySelector('#topics').innerHTML=renderTopics(level);
 root.querySelector('#art-hotspots').innerHTML=renderHotspots();
 root.querySelector('#art-key').innerHTML=structures.slice(0,4).map((s,i)=>`<span>${i+1} · ${esc(s.label)}</span>`).join('');
 const stop=id=>{cancel(timers.get(id));timers.delete(id);const button=root.querySelector(`[data-play="${id}"]`);button.setAttribute('aria-pressed','false');button.textContent='▶ Показати послідовність';};
 const stopAll=()=>topics.forEach(t=>stop(t.id));
 const step=(id,index)=>{
  const t=topics.find(t=>t.id===id);if(!t||!Number.isInteger(index)||index< -1||index>=t.steps.length)throw Error('Invalid topic step');
  indices.set(id,index);root.querySelector(`[data-topic-scene="${id}"]`).innerHTML=sceneFrame(id,index);
  root.querySelector(`[data-previous="${id}"]`).disabled=index<=0;root.querySelector(`[data-next="${id}"]`).disabled=index>=t.steps.length-1;
  root.querySelectorAll(`[data-step-topic="${id}"]`).forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  root.querySelectorAll(`[data-topic-step^="${id}-"]`).forEach((li,i)=>li.classList.toggle('active',i===index));
  root.querySelector(`[data-progress="${id}"]`).textContent=index<0?'Кроки умовні: не реальний час і не кількісна симуляція.':`Крок ${index+1} із ${t.steps.length}: ${t.steps[index]}`;
 };
 const slide=value=>{const bounded=Math.max(0,Math.min(100,Number(value)||0));root.querySelector('#left-filament').setAttribute('transform',`translate(${bounded*.7} 0)`);root.querySelector('#right-filament').setAttribute('transform',`translate(${-bounded*.7} 0)`);root.querySelector('#shortening').value=bounded;};
 const render=()=>{
  root.querySelector('#structure-title').textContent=selected.label;root.querySelector('#structure-copy').innerHTML=structureContent(selected,tab,level);
  root.querySelectorAll('[data-structure]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.structure===selected.id)));
  root.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
  root.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)));
  const hint=root.querySelector('#reading-level-hint');if(hint)hint.textContent=`${readingHints[level]} Вибір діє для всього модуля.`;
  const selectedIndex=structures.indexOf(selected),molecular=selectedIndex>=4;
  root.querySelector('#art-view').hidden=molecular;root.querySelector('#sarcomere-view').hidden=!molecular;
  root.querySelector('#scale-progress').textContent=`Масштаб ${selectedIndex+1} із ${structures.length}`;
  root.querySelector('#scale-name').textContent=selected.label;
  root.querySelector('[data-move-structure="-1"]').disabled=selectedIndex===0;root.querySelector('[data-move-structure="1"]').disabled=selectedIndex===structures.length-1;
  const art=root.querySelector('#muscle-art');art.style.setProperty('--zoom',selected.zoom);art.style.setProperty('--origin',selected.position+'%');
  const markers=root.querySelector('#art-hotspots'),overview=root.querySelector('#art-overview');markers.hidden=selected.zoom>1;overview.hidden=selected.zoom===1||molecular;
  root.querySelector('#art-selection').textContent=`Обрано: ${selected.label}`;
  if(markers.hidden&&markers.contains(root.activeElement))overview.focus();
  if(view?.location?.href){
   const url=structureURL(view.location.href,selected.id,level,tab);view.history?.replaceState(null,'',url.toString());
   const share=root.querySelector('#structure-link');if(share){const clean=new URL(url.pathname,url.origin);for(const key of ['structure','level','tab'])clean.searchParams.set(key,url.searchParams.get(key));clean.hash='explorer';share.href=clean.toString();}
  }
 };
 const onClick=e=>{
  const learning=e.target.closest?.('[data-learning-tab]');
  if(learning&&tabs.includes(learning.dataset.learningTab)){tab=learning.dataset.learningTab;render();return;}
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.moveStructure){const direction=Number(b.dataset.moveStructure);if([-1,1].includes(direction)){selected=adjacentStructure(selected.id,direction);render();}}
  if(b.dataset.structure){const item=structures.find(s=>s.id===b.dataset.structure);if(item){selected=item;render();}}
  if(b.dataset.tab&&tabs.includes(b.dataset.tab)){tab=b.dataset.tab;render();}
  if(b.dataset.level&&levels.includes(b.dataset.level)){level=b.dataset.level;stopAll();topics.forEach(t=>{root.querySelector(`[data-topic-copy="${t.id}"]`).textContent=t[level];});render();}
  if(b.dataset.stepTopic){const t=topics.find(t=>t.id===b.dataset.stepTopic),index=Number(b.dataset.stepIndex);if(t&&Number.isInteger(index)&&index>=0&&index<t.steps.length){stop(t.id);step(t.id,index);}}
  if(b.dataset.play){
   const t=topics.find(t=>t.id===b.dataset.play);if(!t)return;
   if(timers.has(t.id)){stop(t.id);return;}stopAll();let i=(indices.get(t.id)??-1)+1;if(i>=t.steps.length)i=0;step(t.id,i);
   if(motion?.matches){root.querySelector(`[data-progress="${t.id}"]`).textContent+=' · Зменшений рух: наступний крок обери вручну.';return;}
   b.textContent='Ⅱ Пауза';b.setAttribute('aria-pressed','true');timers.set(t.id,schedule(()=>{i++;if(i>=t.steps.length){stop(t.id);return;}step(t.id,i);},1800));
  }
  if(b.dataset.next||b.dataset.previous){const id=b.dataset.next||b.dataset.previous,t=topics.find(t=>t.id===id);if(t){stop(id);step(id,Math.max(0,Math.min(t.steps.length-1,(indices.get(id)??-1)+(b.dataset.next?1:-1))));}}
  if(b.dataset.reset&&topics.some(t=>t.id===b.dataset.reset)){stop(b.dataset.reset);step(b.dataset.reset,-1);}
  if(b.id==='lesson'||b.id==='lesson-exit'){
   const on=root.body.classList.toggle('lesson');let exit=root.querySelector('#lesson-exit');
   if(on&&!exit){exit=root.createElement('button');exit.id='lesson-exit';exit.textContent='Вийти з режиму заняття';root.body.append(exit);exit.focus();}
   root.querySelector('#lesson').setAttribute('aria-pressed',String(on));
   if(!on&&exit){exit.remove();root.querySelector('#lesson').focus();}
  }
 };
 const onKey=e=>{if(e.key==='Escape'&&root.body?.classList.contains('lesson')&&!root.querySelector('dialog[open]')){root.querySelector('#lesson-exit')?.click();return;}const b=e.target.closest?.('[data-structure]');if(!b||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();selected=adjacentStructure(selected.id,e.key==='ArrowRight'?1:-1);render();root.querySelector(`#scales [data-structure="${selected.id}"]`)?.focus();};
 const onSlide=e=>{stop('contraction');slide(e.target.value);};
 const onVisibility=()=>{if(root.hidden)stopAll();};
 const onMotion=()=>{if(motion.matches)stopAll();};
 const onPop=()=>{selected=initialStructure(view.location.href);({tab,level}=initialPreferences(view.location.href));stopAll();topics.forEach(t=>{root.querySelector(`[data-topic-copy="${t.id}"]`).textContent=t[level];});render();};
 root.addEventListener('click',onClick);root.addEventListener('keydown',onKey);root.querySelector('#shortening').addEventListener('input',onSlide);root.addEventListener('visibilitychange',onVisibility);
 view?.addEventListener?.('pagehide',stopAll);view?.addEventListener?.('popstate',onPop);motion?.addEventListener?.('change',onMotion);
 root.querySelector('#source-list').innerHTML=sources.map(s=>SourceCard(s,[])).join('');
 root.querySelector('#claim-list').innerHTML=muscleKnowledge.claims.map(c=>ClaimCard(c.id,muscleKnowledge)).join('');
 root.querySelector('#review-meta').textContent=`Версія ${moduleMeta.version} · перевірка структури модуля ${moduleMeta.lastChecked} · ${moduleMeta.status}`;
 root.querySelector('#visual-note').textContent=visual.simplificationNote;
 const unmountDrawer=mountEvidenceDrawer(root,muscleKnowledge);render();
 // Topic anchors are inserted by the module, after the static document has parsed.
 const hash=view?.location?.hash;if(['#contraction','#growth','#atrophy'].includes(hash))view.requestAnimationFrame?.(()=>root.querySelector(hash)?.scrollIntoView());
 return {state:()=>({selected:selected.id,tab,level,steps:Object.fromEntries(indices),playing:[...timers.keys()]}),destroy(){stopAll();root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKey);root.removeEventListener('visibilitychange',onVisibility);root.querySelector('#shortening').removeEventListener('input',onSlide);view?.removeEventListener?.('pagehide',stopAll);view?.removeEventListener?.('popstate',onPop);motion?.removeEventListener?.('change',onMotion);unmountDrawer?.();}};
}
if(typeof document!=='undefined')mount();
