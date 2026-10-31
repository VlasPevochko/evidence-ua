// «Вигляд»: тема (темна / світла / як у системі), колір (космос / зелений) і розмір тексту. Вибір лишається тільки в браузері відвідувача.
// Ранній вбудований скрипт у <head> (див. earlyScript) ставить атрибути до першого малювання, щоб не мигало.
export const APPEARANCE_KEY='eua-appearance-v1';
export const THEMES=[['dark','Темна'],['light','Світла'],['auto','Як у системі']];
export const SIZES=[['md','Звичайний'],['lg','Більший'],['xl','Великий']];
// Колір: космічний (як на головній) за замовчуванням, зелений (колишній сосновий) як варіант. Зелений вмикає html[data-palette="green"].
export const PALETTES=[['cosmic','Космос'],['green','Зелений']];
export const earlyScript="try{var a=JSON.parse(localStorage.getItem('eua-appearance-v1')||'{}'),d=document.documentElement,t=a.theme;if(t==='auto')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';if(t==='light')d.dataset.theme='light';if(a.text==='lg'||a.text==='xl')d.dataset.text=a.text;if(a.palette==='green')d.dataset.palette='green'}catch(e){}";
export function normalize(raw){
  let v={};try{v=JSON.parse(raw)||{};}catch{}
  return {theme:THEMES.some(([k])=>k===v.theme)?v.theme:'dark',text:SIZES.some(([k])=>k===v.text)?v.text:'md',palette:PALETTES.some(([k])=>k===v.palette)?v.palette:'cosmic'};
}
export function resolveTheme(theme,prefersLight){return theme==='light'||(theme==='auto'&&prefersLight)?'light':'dark';}
export function applyAppearance(doc,settings){
  const root=doc.documentElement,light=resolveTheme(settings.theme,!!doc.defaultView?.matchMedia?.('(prefers-color-scheme: light)').matches)==='light';
  if(light)root.dataset.theme='light';else delete root.dataset.theme;
  if(settings.text==='lg'||settings.text==='xl')root.dataset.text=settings.text;else delete root.dataset.text;
  if(settings.palette==='green')root.dataset.palette='green';else delete root.dataset.palette;
  const meta=doc.querySelector('meta[name="theme-color"]');if(meta)meta.content=light?'#e6f2ee':'#08090b';
}
function group(doc,kind,label,items,current,onPick){
  const wrap=doc.createElement('div');wrap.className='eua-appearance-group';wrap.dataset.kind=kind;wrap.setAttribute('role','radiogroup');wrap.setAttribute('aria-label',label);
  const title=doc.createElement('p');title.textContent=label;title.setAttribute('aria-hidden','true');wrap.append(title);
  const row=doc.createElement('div');
  for(const [key,text] of items){
    const b=doc.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.value=key;b.textContent=text;
    b.setAttribute('aria-checked',String(key===current));
    b.addEventListener('click',()=>onPick(key));row.append(b);
  }
  wrap.append(row);return wrap;
}
export function mountAppearance(doc=document){
  const view=doc.defaultView,header=doc.querySelector('.eua-site-header');
  if(!view||!header||header.querySelector('.eua-appearance'))return !!header;
  let stored=null;
  // Access to localStorage itself can throw, as can getItem (for example in a restricted frame).
  try{stored=view.localStorage?.getItem(APPEARANCE_KEY);}catch{}
  let settings=normalize(stored);
  const wrap=doc.createElement('div');wrap.className='eua-appearance';
  const button=doc.createElement('button');button.type='button';button.className='eua-appearance-toggle';
  // Колір належить кольоровим сторінкам сайту; головна має власний космічний вигляд, тож перемикач кольору там не показуємо (і в назві кнопки його немає).
  const isHome=doc.body?.dataset.platformArea==='home';
  button.setAttribute('aria-haspopup','true');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',isHome?'Вигляд сайту: тема й розмір тексту':'Вигляд сайту: тема, колір і розмір тексту');
  button.innerHTML='<span aria-hidden="true">Аа</span>';
  const panel=doc.createElement('div');panel.className='eua-appearance-panel';panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label','Вигляд сайту');
  function save(){try{view.localStorage.setItem(APPEARANCE_KEY,JSON.stringify(settings));}catch{}applyAppearance(doc,settings);}
  function build(){
    panel.replaceChildren(...[
      group(doc,'theme','Тема',THEMES,settings.theme,k=>{settings={...settings,theme:k};save();build();focusCurrent('theme');}),
      isHome?null:group(doc,'palette','Колір',PALETTES,settings.palette,k=>{settings={...settings,palette:k};save();build();focusCurrent('palette');}),
      group(doc,'text','Розмір тексту',SIZES,settings.text,k=>{settings={...settings,text:k};save();build();focusCurrent('text');})
    ].filter(Boolean));
  }
  function focusCurrent(kind){panel.querySelector(`[data-kind="${kind}"] [aria-checked="true"]`)?.focus();}
  function open(){panel.hidden=false;button.setAttribute('aria-expanded','true');}
  function close(focus){panel.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus();}
  button.addEventListener('click',()=>panel.hidden?open():close(false));
  doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close(true);}});
  // composedPath(): the clicked button is rebuilt by build() before this handler runs, so contains(target) would wrongly say «outside».
  doc.addEventListener('click',e=>{if(!panel.hidden&&!e.composedPath().includes(wrap))close(false);});
  view.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(settings.theme==='auto')applyAppearance(doc,settings);});
  build();wrap.append(button,panel);header.append(wrap);applyAppearance(doc,settings);
  return true;
}
if(typeof document!=='undefined'){
  const go=()=>{if(!mountAppearance(document)){const w=new MutationObserver(()=>{if(mountAppearance(document))w.disconnect();});w.observe(document.body,{childList:true,subtree:true});setTimeout(()=>w.disconnect(),8000);}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();
}
