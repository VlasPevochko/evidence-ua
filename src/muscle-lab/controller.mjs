import {moduleMeta,sources,structures,topics,muscleKnowledge,topicClaimIds,visual} from './module.mjs';
import {sceneFrame} from './scenes.mjs';
import {structureLearningCopy} from './learning-copy.mjs';
import {scaleArt,scaleLegend} from './scale-art.mjs';
import {sarcomereSVG,sarcomereState} from './sarcomere.mjs';
import {ClaimCard,SourceCard,claimButton,mountEvidenceDrawer} from '../evidence/core/components.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The reading-level switcher is removed from the page; the full (university) wording is always shown.
// Level wording stays in the data for a later, separate feature.
const LEVEL='university';
const tabs=['description','function','sources'];
const PLAY_HINT='Кроки умовні: не реальний час і не кількісна симуляція.';
const SLIDE_MS=3200,HOLD_MS=500;

export function initialStructure(href){
 const id=new URL(href||'https://evidence.invalid').searchParams.get('structure');
 return structures.find(s=>s.id===id)||structures[0];
}
export function initialPreferences(href){
 const url=new URL(href||'https://evidence.invalid');
 return {level:LEVEL,tab:tabs.includes(url.searchParams.get('tab'))?url.searchParams.get('tab'):'description'};
}
export function adjacentStructure(id,direction){
 const index=structures.findIndex(s=>s.id===id);
 if(index<0)throw new Error('Unknown structure');
 if(![-1,1].includes(direction))throw new Error('Invalid direction');
 return structures[Math.max(0,Math.min(structures.length-1,index+direction))];
}
export function structureURL(href,id,tab='description'){
 if(!structures.some(s=>s.id===id)||!tabs.includes(tab))throw Error('Unknown selection');
 const url=new URL(href||'https://evidence.invalid/muscle-lab.html');
 url.searchParams.set('structure',id);url.searchParams.set('tab',tab);url.searchParams.delete('level');
 return url;
}
export function renderScaleButtons(selectedId){
 return structures.map((s,i)=>`<button type="button" class="scale-btn" data-structure="${s.id}" aria-pressed="${s.id===selectedId}" aria-controls="structure-copy"><span class="scale-num" aria-hidden="true">${i+1}</span><span class="scale-name">${esc(s.label)}</span></button>`).join('');
}
export function renderLegend(id){
 return (scaleLegend[id]||[]).map(item=>`<li><i style="background:${item.color}" aria-hidden="true"></i>${esc(item.text)}</li>`).join('');
}
export function sourceLinks(ids){
 return ids.map(id=>{
  const s=sources.find(s=>s.id===id);if(!s)throw Error('Unknown source');
  return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`;
 }).join('<br>');
}
export function structureContent(s,tab,level=LEVEL){
 const text=structureLearningCopy(s,tab,level);
 const claim=muscleKnowledge.claims.find(c=>c.id===s.claimId);
 const records=muscleKnowledge.records.filter(r=>r.claimId===s.claimId);
 const groups=[...new Set(records.map(r=>r.claimPart))].map(part=>{
  const matching=records.filter(r=>r.claimPart===part);
  return `<h3>${esc(matching[0].claimPartLabel)}</h3>${sourceLinks([...new Set(matching.map(r=>r.sourceId))])}`;
 }).join('');
 const note=claim.claimType==='physiology'?'Навчальне пояснення будови.':'Механістичне пояснення.';
 const content=tab==='sources'
  ?`<p class="small">Джерела для визначення та функції наведено окремо. Повний науковий перегляд ще не завершено.</p>${groups}`
  :`<p>${esc(text)}</p>${level==='advanced'?`<p class="small">${note} Не встановлює силу, швидкість або довгостроковий ефект конкретної програми у людей.</p>`:''}`;
 return content+claimButton(s.claimId);
}

const claimOf=id=>muscleKnowledge.claims.find(c=>c.id===topicClaimIds[id]);
const stepButtons=(t,attr)=>t.steps.map((text,i)=>`<button type="button" class="step-dot" ${attr}="${t.id}" data-step-index="${i}" aria-pressed="false" aria-controls="scene-${t.id}" aria-label="Крок ${i+1}: ${esc(text)}"><span aria-hidden="true">${i+1}</span></button>`).join('');
const mirrorSteps=()=>[0,1,2,3].map(i=>`<button type="button" class="step-dot" data-mirror-step="${i}" aria-pressed="false" aria-controls="scene-growth scene-atrophy" aria-label="Крок ${i+1} для росту й атрофії"><span aria-hidden="true">${i+1}</span></button>`).join('');
const modelNoteOf=t=>(t.id==='growth'||t.id==='atrophy')?claimOf(t.id).limitations[0]:null;

function renderContraction(t,level){
 const state=sarcomereState(0);
 return `<article class="topic topic-contraction" id="contraction" tabindex="-1" data-color="${t.color}" aria-labelledby="contraction-title">
<div class="topic-head"><p class="eyebrow">МЕХАНІЗМ</p><h2 id="contraction-title">${esc(t.title)}</h2><p class="topic-lead">${esc(t.description)}</p></div>
<div class="contraction-grid">
<section class="panel sarcomere-panel" aria-labelledby="sliding-title"><h3 id="sliding-title">Ковзання ниток</h3>
<div class="sarcomere-stage" data-sarcomere-stage>${sarcomereSVG({t:0,idPrefix:'ctr'})}</div>
<ul class="slide-readout" data-slide-readout aria-label="Що змінюється під час скорочення">
<li><span>Відстань між Z-дисками</span><b class="bar"><i data-readout-bar="distance" style="width:${state.relative.sarcomere*100}%"></i></b><em data-readout-state="distance">у спокої</em></li>
<li><span>Перекриття ниток</span><b class="bar"><i data-readout-bar="overlap" style="width:${state.relative.overlap*100}%"></i></b><em data-readout-state="overlap">у спокої</em></li>
<li><span>Довжина самих ниток</span><b class="bar"><i data-readout-bar="length" style="width:100%"></i></b><em data-readout-state="length">не змінюється</em></li>
</ul>
<div class="sarcomere-controls"><button type="button" class="play-btn" data-sarcomere-play aria-pressed="false">▶ Показати скорочення</button>
<label class="slide-label" for="shortening">Положення (умовно)</label><input id="shortening" type="range" min="0" max="100" value="0" aria-label="Умовне ковзання філаментів"></div>
<p class="small" id="slide-note">Нитки не вкорочуються: змінюється їх перекриття. Повзунок не задає силу чи відсоток реального скорочення.</p></section>
<section class="panel cycle-panel" aria-labelledby="cycle-title"><h3 id="cycle-title">Один цикл головки міозину</h3>
<div class="topic-scene" id="scene-contraction" data-topic-scene="contraction" aria-describedby="progress-contraction">${sceneFrame('contraction')}</div>
<div class="cycle-controls"><div class="step-picker" role="group" aria-label="Обрати крок: ${esc(t.title)}">${stepButtons(t,'data-step-topic')}</div>
<button type="button" class="play-btn" data-play="contraction" aria-pressed="false">▶ Цикл</button><button type="button" class="ghost-btn" data-reset="contraction" aria-label="Спочатку: ${esc(t.title)}">↺</button></div>
<p class="step-text" id="progress-contraction" data-progress="contraction" aria-live="polite">${PLAY_HINT}</p></section>
</div>
<p class="topic-copy" data-topic-copy="contraction">${esc(t[level])}</p>
${claimButton(topicClaimIds.contraction)}
</article>`;
}

function renderAdaptation(t,level,mirror=false){
 const note=modelNoteOf(t);
 const arrow=t.id==='growth'?'↑':'↓';
 return `<article class="topic topic-${t.id}" id="${t.id}" tabindex="-1" data-color="${t.color}" aria-labelledby="${t.id}-title">
<h3 id="${t.id}-title"><span class="dir" aria-hidden="true">${arrow}</span> ${esc(t.title)}</h3>
<p class="topic-lead">${esc(t.description)}</p>
<div class="topic-scene" id="scene-${t.id}" data-topic-scene="${t.id}" aria-describedby="progress-${t.id}">${sceneFrame(t.id)}</div>
<p class="balance-legend" aria-hidden="true"><span>← синтез білків</span><span>розпад білків →</span></p>
<p class="step-text" id="progress-${t.id}" data-progress="${t.id}" aria-live="polite">${PLAY_HINT}</p>
<p class="topic-copy" data-topic-copy="${t.id}">${esc(t[level])}</p>
${note?`<p class="small">${esc(note)}</p>`:''}
${claimButton(topicClaimIds[t.id])}
</article>`;
}

export function renderTopics(level=LEVEL){
 const [contraction,growth,atrophy]=['contraction','growth','atrophy'].map(id=>topics.find(t=>t.id===id));
 return renderContraction(contraction,level)+`<section class="mirror" id="adaptation" data-mirror-view="growth" aria-labelledby="mirror-title">
<div class="topic-head"><p class="eyebrow">АДАПТАЦІЯ З ЧАСОМ</p><h2 id="mirror-title">Ріст і атрофія: дві протилежності</h2>
<p class="topic-lead">Той самий м’яз і той самий баланс синтезу та розпаду білків, але протилежний напрямок.</p>
<div class="mirror-controls"><div class="mirror-tabs" role="group" aria-label="Що показувати">
<button type="button" data-mirror-show="growth" aria-pressed="true">↑ Ріст</button><button type="button" data-mirror-show="atrophy" aria-pressed="false">↓ Атрофія</button></div>
<div class="step-picker" role="group" aria-label="Крок для росту й атрофії">${mirrorSteps()}</div>
<button type="button" class="play-btn" data-mirror-play aria-pressed="false">▶ Показати</button></div>
<p class="small">Схематично: розмір волокна й нахил ваг умовні. Це не вимірювання і не прогноз для конкретної людини.</p></div>
<div class="mirror-grid">${renderAdaptation(growth,level)}${renderAdaptation(atrophy,level)}</div></section>`;
}

export function mount(root=document){
 const view=root.defaultView,preferences=initialPreferences(view?.location?.href);
 let selected=initialStructure(view?.location?.href),tab=preferences.tab,slideT=0,mirrorView='growth';
 const timers=new Map(),indices=new Map();
 let frame=null,slidePhase=null;
 const motion=view?.matchMedia?.('(prefers-reduced-motion: reduce)');
 const schedule=view?.setInterval?.bind(view)||setInterval,cancel=view?.clearInterval?.bind(view)||clearInterval;
 const raf=view?.requestAnimationFrame?.bind(view),caf=view?.cancelAnimationFrame?.bind(view);
 const $=s=>root.querySelector(s);
 $('#scales').innerHTML=renderScaleButtons(selected.id);
 $('#topics').innerHTML=renderTopics(LEVEL);
 const clamp=v=>Math.max(0,Math.min(1,v));

 // Cycle and mirror steps: the scene is drawn once; the step is a data attribute that CSS animates.
 const stepScene=(id,index)=>{
  const t=topics.find(t=>t.id===id);
  if(!t||!Number.isInteger(index)||index< -1||index>=t.steps.length)throw Error('Invalid topic step');
  indices.set(id,index);
  const holder=$(`[data-topic-scene="${id}"]`),svg=holder.querySelector?.('svg');
  if(svg?.setAttribute)svg.setAttribute('data-step',String(index));else holder.innerHTML=sceneFrame(id,index);
  const pressed=i=>String(i===index);
  root.querySelectorAll(`[data-step-topic="${id}"]`).forEach((button,i)=>button.setAttribute('aria-pressed',pressed(i)));
  const progress=$(`[data-progress="${id}"]`);
  progress.textContent=index<0?PLAY_HINT:`Крок ${index+1} із ${t.steps.length}: ${t.steps[index]}`;
 };
 const syncMirrorButtons=()=>{
  const index=indices.get('growth')??-1;
  root.querySelectorAll('[data-mirror-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mirrorStep)===index)));
 };
 const stepMirror=index=>{stepScene('growth',index);stepScene('atrophy',index);syncMirrorButtons();};
 const stop=id=>{
  cancel(timers.get(id));timers.delete(id);
  const button=id==='mirror'?$('[data-mirror-play]'):$(`[data-play="${id}"]`);
  if(button){button.setAttribute('aria-pressed','false');button.textContent=id==='mirror'?'▶ Показати':'▶ Цикл';}
 };
 const stopSlide=()=>{
  if(frame!==null){caf?.(frame);frame=null;}slidePhase=null;
  const button=$('[data-sarcomere-play]');if(button){button.setAttribute('aria-pressed','false');button.textContent='▶ Показати скорочення';}
 };
 const stopAll=()=>{['contraction','mirror'].forEach(stop);stopSlide();};
 const play=(id,total,go)=>{
  if(timers.has(id)){stop(id);return;}
  stopAll();
  const current=id==='mirror'?(indices.get('growth')??-1):(indices.get(id)??-1);
  let i=current+1;if(i>=total)i=0;go(i);
  if(motion?.matches){$(`[data-progress="${id==='mirror'?'growth':id}"]`).textContent+=' · Зменшений рух: наступний крок обери вручну.';return;}
  const button=id==='mirror'?$('[data-mirror-play]'):$(`[data-play="${id}"]`);
  button.textContent='Ⅱ Пауза';button.setAttribute('aria-pressed','true');
  timers.set(id,schedule(()=>{i++;if(i>=total){stop(id);return;}go(i);},1800));
 };

 // Sarcomere: continuous sliding. t is a schematic position, never a measured shortening.
 const readout=state=>{
  const set=(key,width,text)=>{
   const bar=$(`[data-readout-bar="${key}"]`),label=$(`[data-readout-state="${key}"]`);
   if(bar)bar.style.width=`${Math.round(width*100)}%`;
   if(label)label.textContent=text;
  };
  const moved=state.t>0.005;
  set('distance',state.relative.sarcomere,moved?'зменшується':'у спокої');
  set('overlap',state.relative.overlap,moved?'збільшується':'у спокої');
  set('length',1,'не змінюється');
 };
 const slide=value=>{
  slideT=clamp(Number(value)/100||0);
  const stage=$('[data-sarcomere-stage]');if(stage)stage.innerHTML=sarcomereSVG({t:slideT,idPrefix:'ctr'});
  const input=$('#shortening');if(input)input.value=Math.round(slideT*100);
  readout(sarcomereState(slideT));
 };
 const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
 const playSlide=()=>{
  if(frame!==null){stopSlide();return;}
  stopAll();
  if(motion?.matches||!raf){slide(slideT<.5?100:0);$('#slide-note').textContent='Зменшений рух: використай повзунок, щоб змінювати положення.';return;}
  const button=$('[data-sarcomere-play]');button.textContent='Ⅱ Пауза';button.setAttribute('aria-pressed','true');
  // 0 -> 1, hold, 1 -> 0, then stop.
  slidePhase={from:slideT,start:null};
  const tick=now=>{
   if(!slidePhase)return;
   if(slidePhase.start===null)slidePhase.start=now;
   const elapsed=now-slidePhase.start,span=SLIDE_MS;
   if(elapsed<span){slide(ease(elapsed/span)*100*(1-slidePhase.from)+slidePhase.from*100);}
   else if(elapsed<span+HOLD_MS){slide(100);}
   else if(elapsed<2*span+HOLD_MS){slide((1-ease((elapsed-span-HOLD_MS)/span))*100);}
   else{slide(0);stopSlide();return;}
   frame=raf(tick);
  };
  frame=raf(tick);
 };

 const render=()=>{
  $('#structure-title').textContent=selected.label;
  $('#structure-copy').innerHTML=structureContent(selected,tab,LEVEL);
  root.querySelectorAll('[data-structure]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.structure===selected.id)));
  root.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
  const art=$('#scale-art');if(art)art.innerHTML=scaleArt(selected.id);
  const legend=$('#scale-legend');if(legend)legend.innerHTML=renderLegend(selected.id);
  const index=structures.indexOf(selected);
  $('#art-selection').textContent=`Обрано: ${selected.label} (масштаб ${index+1} із ${structures.length})`;
  if(view?.location?.href){
   const url=structureURL(view.location.href,selected.id,tab);
   view.history?.replaceState(null,'',url.toString());
  }
 };
 const setMirrorView=name=>{
  if(!['growth','atrophy'].includes(name))return;
  mirrorView=name;const section=$('#adaptation');if(section)section.setAttribute('data-mirror-view',name);
  root.querySelectorAll('[data-mirror-show]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mirrorShow===name)));
 };

 const onClick=e=>{
  const learning=e.target.closest?.('[data-learning-tab]');
  if(learning&&tabs.includes(learning.dataset.learningTab)){tab=learning.dataset.learningTab;render();return;}
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.structure){const item=structures.find(s=>s.id===b.dataset.structure);if(item){selected=item;render();}}
  if(b.dataset.tab&&tabs.includes(b.dataset.tab)){tab=b.dataset.tab;render();}
  if(b.dataset.stepTopic==='contraction'){
   const t=topics.find(t=>t.id==='contraction'),index=Number(b.dataset.stepIndex);
   if(Number.isInteger(index)&&index>=0&&index<t.steps.length){stop('contraction');stepScene('contraction',index);}
  }
  if(b.dataset.play==='contraction'){play('contraction',topics.find(t=>t.id==='contraction').steps.length,i=>stepScene('contraction',i));}
  if(b.dataset.reset==='contraction'){stop('contraction');stepScene('contraction',-1);}
  if(b.dataset.mirrorStep!==undefined){
   const index=Number(b.dataset.mirrorStep);
   if(Number.isInteger(index)&&index>=0&&index<4){stop('mirror');stepMirror(index);}
  }
  if(b.dataset.mirrorPlay!==undefined){play('mirror',4,stepMirror);}
  if(b.dataset.mirrorShow)setMirrorView(b.dataset.mirrorShow);
  if(b.dataset.sarcomerePlay!==undefined)playSlide();
  if(b.id==='lesson'||b.id==='lesson-exit'){
   const on=root.body.classList.toggle('lesson');let exit=$('#lesson-exit');
   if(on&&!exit){exit=root.createElement('button');exit.id='lesson-exit';exit.textContent='Вийти з режиму заняття';root.body.append(exit);exit.focus();}
   $('#lesson').setAttribute('aria-pressed',String(on));
   if(!on&&exit){exit.remove();$('#lesson').focus();}
  }
 };
 const onKey=e=>{
  if(e.key==='Escape'&&root.body?.classList.contains('lesson')&&!root.querySelector('dialog[open]')){$('#lesson-exit')?.click();return;}
  const b=e.target.closest?.('[data-structure]');
  if(!b||!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();selected=adjacentStructure(selected.id,e.key==='ArrowRight'?1:-1);render();
  $(`#scales [data-structure="${selected.id}"]`)?.focus();
 };
 const onSlide=e=>{stopSlide();slide(e.target.value);};
 const onVisibility=()=>{if(root.hidden)stopAll();};
 const onMotion=()=>{if(motion.matches)stopAll();};
 const onPop=()=>{selected=initialStructure(view.location.href);({tab}=initialPreferences(view.location.href));stopAll();render();};
 root.addEventListener('click',onClick);root.addEventListener('keydown',onKey);
 $('#shortening').addEventListener('input',onSlide);root.addEventListener('visibilitychange',onVisibility);
 view?.addEventListener?.('pagehide',stopAll);view?.addEventListener?.('popstate',onPop);motion?.addEventListener?.('change',onMotion);
 $('#source-list').innerHTML=sources.map(s=>SourceCard(s,[])).join('');
 const count=$('#source-count');if(count)count.textContent=String(sources.length);
 $('#claim-list').innerHTML=muscleKnowledge.claims.map(c=>ClaimCard(c.id,muscleKnowledge)).join('');
 $('#review-meta').textContent=`Версія ${moduleMeta.version} · перевірка структури модуля ${moduleMeta.lastChecked} · ${moduleMeta.status}`;
 $('#visual-note').textContent=visual.simplificationNote;
 const unmountDrawer=mountEvidenceDrawer(root,muscleKnowledge);render();readout(sarcomereState(0));
 // Topic anchors are inserted by the module, after the static document has parsed.
 const hash=view?.location?.hash;
 if(['#contraction','#growth','#atrophy','#adaptation'].includes(hash))view.requestAnimationFrame?.(()=>{
  if(hash==='#growth'||hash==='#atrophy')setMirrorView(hash.slice(1));
  $(hash)?.scrollIntoView();
 });
 return {
  state:()=>({selected:selected.id,tab,steps:Object.fromEntries(indices),playing:[...timers.keys(),...(frame!==null?['sarcomere']:[])],slide:slideT,mirrorView}),
  destroy(){
   stopAll();root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKey);root.removeEventListener('visibilitychange',onVisibility);
   $('#shortening').removeEventListener('input',onSlide);view?.removeEventListener?.('pagehide',stopAll);view?.removeEventListener?.('popstate',onPop);
   motion?.removeEventListener?.('change',onMotion);unmountDrawer?.();
  }
 };
}
if(typeof document!=='undefined')mount();
