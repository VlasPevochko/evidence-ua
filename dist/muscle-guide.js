// Behaviour for «Від нерва до росту»: signal chain player, disorder map, deep links into folded chapters.
// One control per action; reduced motion shows the whole chain at once; everything stops when the page is hidden.
import {mountEvidenceDrawer} from './evidence/components.js?v=2.2';
import {practiceBase} from './muscle-practice-data.js?v=1';
const STEP_MS=900;

export function mountGuide(root=document){
 const view=root.defaultView;
 const schedule=view?.setInterval?.bind(view)||setInterval,cancel=view?.clearInterval?.bind(view)||clearInterval;
 const motion=view?.matchMedia?.('(prefers-reduced-motion: reduce)');
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const chain=$('[data-chain]'),play=$('[data-chain-play]'),status=$('[data-chain-status]');
 const items=$$('[data-chain-index]');
 let timer=null,step=-1,condition=$('[data-condition][aria-pressed="true"]')?.dataset.condition||null;

 const setStep=i=>{
  step=i;chain?.setAttribute('data-chain-step',String(i));
  items.forEach((li,k)=>{li.classList.toggle('is-on',k<=i&&i>=0);li.classList.toggle('is-now',k===i);});
 };
 const stop=(label='▶ Пустити сигнал')=>{
  if(timer!==null){cancel(timer);timer=null;}
  play?.setAttribute('aria-pressed','false');if(play)play.textContent=label;
 };
 const start=()=>{
  if(motion?.matches){setStep(items.length-1);if(status)status.textContent='Зменшений рух: показано весь ланцюг одразу.';return;}
  setStep(0);play.setAttribute('aria-pressed','true');play.textContent='❚❚ Пауза';
  timer=schedule(()=>{
   if(step>=items.length-1){stop('↺ Ще раз');return;}
   setStep(step+1);
  },STEP_MS);
 };
 const pick=id=>{
  const buttons=$$('[data-condition]');const target=buttons.find(b=>b.dataset.condition===id);
  if(!target)return;
  condition=id;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===target)));
  $$('[data-condition-panel]').forEach(p=>{p.hidden=p.dataset.conditionPanel!==id;});
  const level=target.dataset.hitLevel;
  $$('.mg-path-levels [data-hit-level]').forEach(li=>li.classList.toggle('is-hit',li.dataset.hitLevel===level));
 };
 // Deep link: #training (or an element inside a chapter) opens the chapter that holds it.
 const openFromHash=()=>{
  const hash=(view?.location?.hash||'').slice(1);if(!hash)return;
  const target=root.getElementById?.(hash)||$('#'+CSS_escape(hash));
  let node=target;
  while(node&&node!==root){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
 };
 const onClick=e=>{
  if(e.target.closest?.('[data-chain-play]')){if(timer!==null)stop();else start();return;}
  const b=e.target.closest?.('[data-condition]');if(b)pick(b.dataset.condition);
 };
 // Схема залучення м'язових одиниць (розділ «Сила ≠ маса»): повзунок «Зусилля (умовно)» лише перемикає, скільки груп світиться.
 // Без скрипта повзунка немає (він схований), а малюнок показує початковий стан. Кількостей і сили схема не показує.
 const recruit=$('[data-recruit]');
 const recruitRange=recruit?.querySelector?.('[data-recruit-range]'),recruitText=recruit?.querySelector?.('[data-recruit-text]');
 const recruitLines=['Невелике зусилля: працюють переважно малі одиниці.','Більше зусилля: до малих додаються середні.','Максимум зусилля: вмикаються й великі одиниці, імпульси частіші.'];
 const setEffort=v=>{
  const e=Math.max(0,Math.min(100,Number(v)||0)),level=e===0?0:Math.ceil(e/12.5),line=recruitLines[level<=3?0:level<=6?1:2];
  recruit.setAttribute('data-recruit-level',String(level));recruit.style?.setProperty?.('--gap',(7-5.5*e/100).toFixed(2));
  recruitRange?.setAttribute('aria-valuetext',line);if(recruitText)recruitText.textContent=line;
  return {level,line};
 };
 if(recruit&&recruitRange){const ctl=recruit.querySelector('[data-recruit-ctl]');if(ctl)ctl.hidden=false;setEffort(recruitRange.value);}
 const onInput=e=>{const r=e.target?.closest?.('[data-recruit-range]');if(r&&recruit)setEffort(r.value);};
 const halt=()=>stop();
 root.addEventListener('click',onClick);
 root.addEventListener('input',onInput);
 view?.addEventListener?.('pagehide',halt);view?.addEventListener?.('hashchange',openFromHash);
 root.addEventListener('visibilitychange',()=>{if(root.hidden)halt();});
 motion?.addEventListener?.('change',()=>{if(motion.matches)halt();});
 // Outcome Claims open in their own drawer; the model's drawer ignores Claims it does not know.
 const unmountDrawer=$('[data-muscle-practice-dialog]')?mountEvidenceDrawer(root,practiceBase,{dialogSelector:'[data-muscle-practice-dialog]'}):null;
 openFromHash();
 return {state:()=>({step,playing:timer!==null,condition}),pick,effort:v=>recruit?setEffort(v):null,destroy(){halt();root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);unmountDrawer?.();}};
}
function CSS_escape(s){return String(s).replace(/[^\w-]/g,c=>'\\'+c);}

if(typeof document!=='undefined'&&document.querySelector('[data-chain]'))mountGuide(document);
