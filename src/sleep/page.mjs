import {SLOTS, STAGE_IDS, labelOf, segmentAt, firstStart, advance} from './night.mjs';

// Кнопки стадій і пояснення до них. hooks.onSelect(id) викликається лише коли стадію обрала людина (не під час початкового вибору): на це відповідає схема ночі.
export function mountSleep(root=document,hooks={}){
 const buttons=[...root.querySelectorAll('[data-sleep-stage]')],panels=[...root.querySelectorAll('[data-stage-panel]')];
 if(!buttons.length||!panels.length)return null;
 const select=(id,source='init')=>{buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sleepStage===id)));panels.forEach(panel=>{panel.hidden=panel.dataset.stagePanel!==id;});if(source==='user')hooks.onSelect?.(id);};
 buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.sleepStage,'user')));
 select(buttons[0].dataset.sleepStage);
 return {buttons,select};
}

// Звички (рішення власника «1 так», 2026-11-09): на телефоні (до 600 px) кожна картка звички згортається в рядок «номер + назва» з кнопкою, текст відкривається дотиком.
// На комп'ютері й без JavaScript усе видно, як і раніше: розмітка статична (<h3>назва</h3><div class="habit-body" id="…">текст</div>), JavaScript лише вкладає кнопку в заголовок
// (шаблон «акордеон» з APG: заголовок лишається заголовком) і ховає тіло. Перетнули поріг у будь-який бік: усе повертається до стану, що відповідає ширині.
export function mountHabits(root=document){
 const list=root.querySelector?.('.habit-list');
 if(!list)return null;
 const doc=list.ownerDocument||root,win=doc.defaultView||globalThis;
 const items=[...list.querySelectorAll('article')].map(article=>{
  const heading=article.querySelector('h3'),body=article.querySelector('.habit-body');
  return heading&&body?{heading,body,label:heading.textContent.trim(),button:null}:null;
 }).filter(Boolean);
 if(!items.length)return null;
 const query=win.matchMedia?.('(max-width: 600px)');
 const fold=on=>{
  for(const item of items){
   if(on&&!item.button){
    const button=doc.createElement('button');
    button.type='button';
    button.className='habit-toggle';
    button.textContent=item.label;
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls',item.body.id);
    button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));item.body.hidden=!open;});
    item.heading.textContent='';
    item.heading.append(button);
    item.button=button;
    item.body.hidden=true;
   }else if(!on&&item.button){
    item.heading.textContent=item.label;
    item.button=null;
    item.body.hidden=false;
   }
  }
  list.classList.toggle('is-fold',on);
 };
 fold(Boolean(query?.matches));
 const onChange=event=>fold(Boolean(event.matches));
 if(query?.addEventListener)query.addEventListener('change',onChange);else query?.addListener?.(onChange);
 return {fold,items,isFolded:()=>list.classList.contains('is-fold')};
}

// Схема ночі (рішення власника 35, 2026-11-09). Нерухома розмітка вже є на сторінці (її збирає збірка з night.mjs), тож без JavaScript схема видна, лише без руху.
// Тут додається курсор, що повільно проходить ніч, і одна кнопка «Пауза / Відтворити». Вибір стадії кнопками зупиняє курсор на першому відрізку цієї стадії й
// підсвічує всі її відрізки; «Відтворити» знімає підсвітку й запускає ніч. Схема стоїть, поки її не видно й поки вкладка у фоні, а якщо в системі вимкнено
// анімацію (prefers-reduced-motion), починає зі стану «пауза», і запустити її може лише людина.
export function mountNight(root=document,sleep=null){
 const figure=root.querySelector?.('[data-sleep-night]');
 if(!figure)return null;
 const doc=figure.ownerDocument,win=doc.defaultView||globalThis;
 const bars=[...figure.querySelectorAll('.night-bar')];
 const reduced=Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 // Назви стадій беремо з самих кнопок стадій (одне місце для тексту): «N3 · Глибокий сон».
 const describe=id=>{
  const button=sleep?.buttons?.find(b=>b.dataset.sleepStage===id),name=button?.querySelector('span')?.textContent.trim();
  return name?`${labelOf(id)} · ${name}`:labelOf(id);
 };

 const foot=doc.createElement('div');
 foot.className='night-foot';
 const now=doc.createElement('p');
 now.className='night-now';
 now.setAttribute('aria-live','off');
 const toggle=doc.createElement('button');
 toggle.type='button';
 toggle.className='night-play';
 foot.append(now,toggle);
 figure.append(foot);

 let t=0,last=0,frame=0,playing=false,byUser=false,visible=!('IntersectionObserver' in win),selected=null,lastIndex=-1,autostarted=false;

 const label=()=>{
  if(selected)now.textContent=`Показано: ${describe(selected)}`;
  else if(playing||byUser)now.textContent=`На схемі зараз: ${describe(segmentAt(t).stage)}`;
  else now.textContent='Обери стадію або запусти ніч.';
 };
 const render=()=>{
  figure.style.setProperty('--t',t.toFixed(4));
  const seg=segmentAt(t);
  if(seg.index!==lastIndex){
   bars[lastIndex]?.classList.remove('is-now');
   bars[seg.index]?.classList.add('is-now');
   lastIndex=seg.index;
   if(!selected&&playing)label();
  }
 };
 const stop=()=>{if(frame){win.cancelAnimationFrame(frame);frame=0;}};
 const tick=time=>{
  frame=0;
  if(!playing||!visible||doc.hidden)return;
  const dt=last?Math.min(time-last,100):16;
  last=time;
  t=advance(t,dt);
  render();
  frame=win.requestAnimationFrame(tick);
 };
 const run=()=>{if(frame||!playing||!visible||doc.hidden)return;last=0;frame=win.requestAnimationFrame(tick);};
 const paint=()=>{toggle.innerHTML=playing?'<span aria-hidden="true">Ⅱ</span> Пауза':'<span aria-hidden="true">▶</span> Відтворити';};
 const setPlaying=(value,user=false)=>{
  playing=value;
  if(user)byUser=true;
  paint();
  if(value)run();else stop();
  label();
 };
 const clearSelection=()=>{selected=null;delete figure.dataset.selected;};

 toggle.addEventListener('click',()=>{
  if(playing)setPlaying(false,true);
  else{clearSelection();setPlaying(true,true);}
 });
 const show=id=>{
  if(!STAGE_IDS.includes(id))return;
  selected=id;
  figure.dataset.selected=id;
  t=firstStart(id)+0.5/SLOTS;
  setPlaying(false);
  render();
  label();
 };

 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop();else run();});
 if('IntersectionObserver' in win){
  new win.IntersectionObserver(entries=>{
   visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=0.35);
   if(!visible)stop();
   else if(!autostarted&&!reduced&&!byUser&&!selected){autostarted=true;setPlaying(true);}
   else run();
  },{threshold:[0,0.35,0.6]}).observe(figure);
 }else if(!reduced){autostarted=true;setPlaying(true);}

 figure.classList.add('is-live');
 render();
 paint();
 label();
 return {show,play:()=>{clearSelection();setPlaying(true,true);},pause:()=>setPlaying(false,true),state:()=>({t,playing,selected})};
}

if(typeof document!=='undefined'){
 let night=null;
 const sleep=mountSleep(document,{onSelect:id=>night?.show(id)});
 night=mountNight(document,sleep);
 mountHabits(document);
}
