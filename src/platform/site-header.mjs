// One header for all top-level pages. Embedded learning scenes retain their UI.
const entries=[['Напрями','./index.html#start-here'],['Харчування','./nutrition.html'],['Каталог','./directions.html'],['Дослідження','./index.html#pubmed-live'],['Атлас','./atlas.html'],['Вправи','./exercises.html'],['Добавки','./supplements.html']];
export function headerHTML(){return `<header class="eua-site-header home-header"><a class="eua-header-brand" href="./index.html#top" aria-label="Evidence UA — на головну"><span class="eua-header-emblem" aria-hidden="true">E</span><span class="eua-header-wordmark"><strong>Evidence <b>UA</b></strong><small>НАУКА · ЗДОРОВ’Я · РУХ</small></span></a><button class="eua-header-toggle home-menu-toggle" type="button" aria-label="Відкрити меню" aria-expanded="false" aria-controls="eua-header-links" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button><div class="eua-header-links" id="eua-header-links"><nav aria-label="Основна навігація">${entries.map(([label,href])=>`<a href="${href}">${label}</a>`).join('')}</nav><a class="eua-header-about" href="./index.html#about">Про проєкт <span aria-hidden="true">↗</span></a></div></header>`;}

export function mountSiteHeader(doc=document){
  const view=doc.defaultView;
  if(!view||view.self!==view.top||doc.querySelector('.eua-site-header'))return;
  const previous=doc.querySelector('header');
  if(!previous)return;
  if(!doc.querySelector('link[data-site-header-style]')){
    const css=doc.createElement('link');css.rel='stylesheet';css.href='./site-header.css?v=2';css.dataset.siteHeaderStyle='';doc.head.append(css);
  }
  const holder=doc.createElement('div');holder.innerHTML=headerHTML();
  const header=holder.firstElementChild;
  // Home keeps its header over the geometric background; other pages get a
  // full-width header outside any constrained article/main container.
  if(doc.body.dataset.platformArea==='home')previous.before(header);else doc.body.prepend(header);
  previous.remove();
  const toggle=header.querySelector('.eua-header-toggle');
  const links=header.querySelector('.eua-header-links');
  const media=view.matchMedia('(max-width:1100px)');
  let expanded=false;
  function render(){toggle.hidden=!media.matches;links.hidden=media.matches&&!expanded;toggle.setAttribute('aria-expanded',String(media.matches&&expanded));toggle.setAttribute('aria-label',expanded?'Закрити меню':'Відкрити меню');}
  function close(focus=false){expanded=false;render();if(focus&&media.matches)toggle.focus();}
  toggle.addEventListener('click',()=>{expanded=!expanded;render();});
  links.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&expanded){event.preventDefault();close(true);}});
  doc.addEventListener('click',event=>{if(expanded&&!header.contains(event.target))close();});
  media.addEventListener('change',()=>close());
  const about=doc.getElementById('about');
  if(about&&typeof about.showModal==='function'){
    header.querySelector('.eua-header-about').addEventListener('click',event=>{event.preventDefault();close();if(!about.open)about.showModal();});
    if(view.location.hash==='#about'&&!about.open)about.showModal();
    about.addEventListener('close',()=>{if(media.matches)toggle.focus();else header.querySelector('.eua-header-about').focus();});
  }
  const current=view.location.pathname.split('/').pop()||'index.html';
  for(const link of header.querySelectorAll('nav a')){
    const target=new URL(link.getAttribute('href'),view.location.href);
    if(!target.hash&&target.pathname.split('/').pop()===current)link.setAttribute('aria-current','page');
  }
  render();
}
if(typeof document!=='undefined'){
  if(document.readyState==='complete')mountSiteHeader(document);
  else document.defaultView.addEventListener('load',()=>mountSiteHeader(document),{once:true});
}
