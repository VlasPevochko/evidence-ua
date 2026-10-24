// One header for all top-level pages. Embedded learning scenes retain their UI.
// Own stroke icons (24px grid, currentColor); decorative, so the label alone names each link.
const icons={compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',leaf:'<path d="M12 7.2c-1.4-1.8-4.9-1.6-6.2 1.2-1.3 3 .6 8.3 3 10.3 1.2 1 2.2.5 3.2.5s2 .5 3.2-.5c2.4-2 4.3-7.3 3-10.3-1.3-2.8-4.8-3-6.2-1.2z"/><path d="M12 7.2c0-2 .8-3.4 2.3-4.2"/>',books:'<path d="M4 5h4v14H4zM10 5h4v14h-4z"/><path d="M15.5 6.4l3.6-.8 3 12.3-3.6.8z"/>',flask:'<path d="M9.5 3.5h5M10.5 3.5v5.8l-5.3 8.9c-.9 1.5.2 3.3 1.9 3.3h9.8c1.7 0 2.8-1.8 1.9-3.3l-5.3-8.9V3.5M7.8 14.5h8.4"/>',map:'<path d="M3.5 6.5L9 4l6 2.5L20.5 4v13L15 19.5 9 17l-5.5 2.5zM9 4v13M15 6.5v13"/>',dumbbell:'<path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11"/>',pill:'<rect x="2.8" y="8.8" width="18.4" height="6.6" rx="3.3" transform="rotate(-45 12 12.1)"/><path d="M9.7 9.7l4.7 4.7"/>'};
const entries=[['Напрями','./index.html#start-here','compass'],['Харчування','./nutrition.html','leaf'],['Каталог','./directions.html','books'],['Дослідження','./index.html#pubmed-live','flask'],['Атлас','./atlas.html','map'],['Вправи','./exercises.html','dumbbell'],['Добавки','./supplements.html','pill']];
export function headerHTML(){return `<header class="eua-site-header home-header"><a class="eua-header-brand" href="./index.html#top" aria-label="Evidence UA — на головну"><span class="eua-header-emblem" aria-hidden="true">E</span><span class="eua-header-wordmark"><strong>Evidence <b>UA</b></strong><small>НАУКА · ЗДОРОВ’Я · РУХ</small></span></a><button class="eua-header-search" type="button" aria-label="Пошук по сайту" aria-keyshortcuts="/"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span>Пошук</span></button><button class="eua-header-toggle home-menu-toggle" type="button" aria-label="Відкрити меню" aria-expanded="false" aria-controls="eua-header-links" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button><div class="eua-header-links" id="eua-header-links"><nav aria-label="Основна навігація">${entries.map(([label,href,icon])=>`<a href="${href}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[icon]}</svg><span>${label}</span></a>`).join('')}</nav><a class="eua-header-about" href="./index.html#about">Про проєкт <span aria-hidden="true">↗</span></a></div></header>`;}

export function mountSiteHeader(doc=document){
  const view=doc.defaultView;
  if(!view||view.self!==view.top||doc.querySelector('.eua-site-header'))return;
  const previous=doc.querySelector('header');
  if(!previous)return;
  if(!doc.querySelector('link[data-site-header-style]')){
    const css=doc.createElement('link');css.rel='stylesheet';css.href='./site-header.css?v=5';css.dataset.siteHeaderStyle='';doc.head.append(css);
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
  // Search loads lazily from the generated dist copy; unit tests that import this file never click it.
  const searchButton=header.querySelector('.eua-header-search');
  let search=null;
  const withSearch=async()=>{search||=import('./platform-search.js?v=2');return (await search).mountSearch(doc,searchButton);};
  searchButton.addEventListener('click',async e=>{if(searchButton.dataset.searchMounted)return;e.stopImmediatePropagation();const s=await withSearch();s?.open();},{once:false});
  doc.addEventListener('keydown',async e=>{if(e.key==='/'&&!searchButton.dataset.searchMounted&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const t=e.target,tag=t?.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||t?.isContentEditable)return;e.preventDefault();const s=await withSearch();s?.open();}});
}
if(typeof document!=='undefined'){
  if(document.readyState==='complete')mountSiteHeader(document);
  else document.defaultView.addEventListener('load',()=>mountSiteHeader(document),{once:true});
}
