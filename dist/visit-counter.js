// Лічильник відвідувань (рішення власника 2026-10-25). За замовчуванням ВИМКНЕНИЙ: поки COUNTER.code порожній, цей файл нічого не робить,
// не показує вікон і не робить жодних запитів. Коли власник створить безкоштовний обліковий запис GoatCounter і дасть код сайту,
// код вписується сюди одним рядком. Лічильник GoatCounter не ставить cookie й не зберігає особистих даних.
// Правило проєкту «жодних сторонніх запитів до явного кліку»: відвідувач бачить коротке питання, і лише після «Дозволити»
// підвантажується сторонній скрипт. Вибір пам'ятається в цьому браузері.
export const COUNTER={code:''};
const KEY='eua-visit-counter';

// Pure helpers (unit-tested).
export function counterState(code,stored){return !code?'off':stored==='yes'?'on':stored==='no'?'declined':'ask';}
export function counterEndpoint(code){return /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(String(code||''))?`https://${code}.goatcounter.com/count`:'';}

function safeStore(win){try{const s=win.localStorage;s.getItem(KEY);return s;}catch{return {getItem:()=>null,setItem:()=>{}};}}
function injectScript(doc,endpoint){const s=doc.createElement('script');s.async=true;s.dataset.goatcounter=endpoint;s.src='https://gc.zgo.at/count.js';doc.head.appendChild(s);}

export function mountVisitCounter(doc=document,{code=COUNTER.code,store=safeStore(doc.defaultView||window),load=endpoint=>injectScript(doc,endpoint)}={}){
  const endpoint=counterEndpoint(code),state=endpoint?counterState(code,store.getItem(KEY)):'off';
  if(state==='on'){load(endpoint);return 'on';}
  if(state!=='ask'||doc.querySelector('.eua-counter-ask'))return state;
  const bar=doc.createElement('div');bar.className='eua-counter-ask';bar.setAttribute('role','region');bar.setAttribute('aria-label','Лічильник відвідувань');
  bar.innerHTML='<p>Рахуємо відвідування без cookie й особистих даних, щоб знати, які матеріали читають. Дозволити?</p><div><button type="button" data-counter="yes">Дозволити</button><button type="button" data-counter="no">Ні, дякую</button></div>';
  bar.addEventListener('click',e=>{const b=e.target.closest('button[data-counter]');if(!b)return;const yes=b.dataset.counter==='yes';try{store.setItem(KEY,yes?'yes':'no');}catch{}bar.remove();if(yes)load(endpoint);});
  doc.body.appendChild(bar);return 'ask';
}
