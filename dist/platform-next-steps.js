// «Куди далі»: три сусідні матеріали внизу кожної сторінки. Це навігація, а не наукові твердження:
// назви беруться з каталогу, жодних нових пояснень чи обіцянок тут немає.
export const NEXT_STEPS={
  'nutrition-inside.html':[['./nutrition.html#nutrition-diets','Дієти й режими','Харчування'],['./nutrition-digestion.html','Травлення та всмоктування','Харчування'],['./fat-burning.html','Куди зникає жир?','Харчування']],
  'nutrition.html':[['./nutrition-inside.html','Харчування зсередини','Фізіологія та біохімія'],['./supplements.html','Що відомо про добавки','Докази'],['./protein-meta.html','Розбір метааналізу білка','Докази']],
  'nutrition-digestion.html':[['./nutrition-inside.html','Харчування зсередини','Харчування'],['./fat-burning.html','Куди зникає жир?','Харчування'],['./cell-lab.html','Клітина людини','Cell Lab']],
  'fat-burning.html':[['./nutrition-inside.html','Харчування зсередини','Харчування'],['./exercises.html','Бібліотека вправ','Практика'],['./sleep.html','Сон і відновлення','Відновлення']],
  'muscle-lab.html':[['./movement.html','Рух і біомеханіка','Movement Lab'],['./exercises.html','Бібліотека вправ','Практика'],['./cell-lab.html','Клітина людини','Cell Lab']],
  'cell-lab.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./nutrition-inside.html','Харчування зсередини','Харчування'],['./atlas.html','Атлас людського тіла','Атлас']],
  'movement.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./exercises.html','Бібліотека вправ','Практика'],['./atlas.html','Атлас людського тіла','Атлас']],
  'sleep.html':[['./movement.html','Рух і біомеханіка','Movement Lab'],['./nutrition-inside.html','Харчування зсередини','Харчування'],['./fat-burning.html','Куди зникає жир?','Харчування']],
  'atlas.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./movement.html','Рух і біомеханіка','Movement Lab'],['./exercises.html','Бібліотека вправ','Практика']],
  'exercises.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./movement.html','Рух і біомеханіка','Movement Lab'],['./atlas.html','Атлас людського тіла','Атлас']],
  'supplements.html':[['./protein-meta.html','Розбір метааналізу білка','Докази'],['./nutrition-inside.html','Харчування зсередини','Харчування'],['./index.html#evidence-guide-title','Як читати докази','Докази']],
  'protein-meta.html':[['./supplements.html','Що відомо про добавки','Докази'],['./nutrition-inside.html','Харчування зсередини','Харчування'],['./exercises.html','Бібліотека вправ','Практика']]
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function nextStepsHTML(file){
  const items=NEXT_STEPS[file];if(!items)return '';
  return `<h2 id="eua-next-title">Куди далі</h2><ul>${items.map(([href,title,tag])=>`<li><a href="${esc(href)}"><span>${esc(tag)}</span><strong>${esc(title)}</strong><b aria-hidden="true">→</b></a></li>`).join('')}</ul>`;
}
// «Мій список»: матеріали, до яких людина хоче повернутися. Лише localStorage цього браузера, нічого не надсилається.
export const SAVED_KEY='eua-saved-v1';
export const SAVED_MAX=12;
const SAVED_PATH=/^[a-z0-9-]+\.html$/;
export function savedFromStorage(raw){
  try{const v=JSON.parse(raw);if(!Array.isArray(v))return [];
    return v.filter(i=>i&&typeof i.href==='string'&&typeof i.title==='string'&&SAVED_PATH.test(i.href)&&i.title.trim()).slice(0,SAVED_MAX).map(i=>({href:i.href,title:i.title.trim().slice(0,70)}));}catch{return [];}
}
export function toggleSaved(list,entry){
  const has=list.some(i=>i.href===entry.href);
  return has?list.filter(i=>i.href!==entry.href):[entry,...list].slice(0,SAVED_MAX);
}
const pageTitle=title=>String(title||'').replace(/^\s*Evidence UA\s*[—–-]\s*/i,'').replace(/\s*[—–-]\s*Evidence UA\s*$/i,'').trim().slice(0,70);
function readSaved(view){try{return savedFromStorage(view.localStorage.getItem(SAVED_KEY));}catch{return [];}}
function writeSaved(view,list){try{view.localStorage.setItem(SAVED_KEY,JSON.stringify(list));}catch{}}
function mountSavedButton(root,nav){
  const view=root.defaultView,file=String(view.location?.pathname||'').split('/').pop(),title=pageTitle(root.title);
  if(!SAVED_PATH.test(file)||!title)return;
  const button=root.createElement('button');button.type='button';button.className='eua-save';
  const paint=()=>{const on=readSaved(view).some(i=>i.href===file);button.setAttribute('aria-pressed',String(on));button.textContent=on?'✓ У моєму списку · прибрати':'☆ Зберегти в мій список';};
  button.addEventListener('click',()=>{writeSaved(view,toggleSaved(readSaved(view),{href:file,title}));paint();});
  paint();nav.append(button);
  const print=root.createElement('button');print.type='button';print.className='eua-print';print.textContent='Друкувати або зберегти PDF';
  print.addEventListener('click',()=>view.print());nav.append(print);
}
function ensureStyle(root){
  const head=root.head;if(head&&!root.querySelector('link[data-next-steps-style]')){const css=root.createElement('link');css.rel='stylesheet';css.href='./next-steps.css?v=6';css.dataset.nextStepsStyle='';head.append(css);}
}
export function mountSavedHome(root,start){
  if(!start||start.querySelector('.eua-saved'))return;
  const view=root.defaultView,list=readSaved(view);if(!list.length)return;
  const box=root.createElement('section');box.className='eua-saved';box.setAttribute('aria-labelledby','eua-saved-title');
  const h=root.createElement('h3');h.id='eua-saved-title';h.textContent='Мій список';
  const ul=root.createElement('ul');
  for(const item of list){
    const li=root.createElement('li');
    const a=root.createElement('a');a.href='./'+item.href;a.textContent=item.title;
    const x=root.createElement('button');x.type='button';x.textContent='×';x.setAttribute('aria-label','Прибрати з мого списку: '+item.title);
    x.addEventListener('click',()=>{writeSaved(view,readSaved(view).filter(i=>i.href!==item.href));li.remove();if(!ul.children.length)box.remove();});
    li.append(a,x);ul.append(li);
  }
  ensureStyle(root);box.append(h,ul);
  const anchor=start.querySelector('.eua-continue')||start.querySelector('.start-choices');
  if(anchor?.classList.contains('eua-continue'))anchor.after(box);else anchor?.before(box);
}
export function mountNextSteps(root=document){
  const view=root.defaultView;if(!view||view.self!==view.top||root.querySelector('.eua-next'))return;
  const file=String(view.location?.pathname||'').split('/').pop()||'index.html',html=nextStepsHTML(file);if(!html)return;
  const host=root.querySelector('main')||root.body;if(!host)return;
  ensureStyle(root);
  const nav=root.createElement('nav');nav.className='eua-next';nav.setAttribute('aria-labelledby','eua-next-title');nav.innerHTML=html;
  const footer=[...host.children].reverse().find(c=>c.tagName==='FOOTER');
  mountSavedButton(root,nav);
  if(footer)footer.before(nav);else host.append(nav);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountNextSteps(document),{once:true});else mountNextSteps(document);}
