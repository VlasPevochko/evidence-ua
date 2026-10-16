import {toolsHTML,mountQuickTools} from './platform-tools.js?v=81';
import {catalog,learningHref,learningLocation} from './platform-catalog.js?v=59';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const learningListeners=new WeakMap();
export function navigationHTML(current){return `<a class="eua-catalog-link" href="./directions.html">Напрями Evidence UA →</a><details><summary>Перейти до іншого напряму</summary><div class="eua-area-links">${catalog.areas.filter(a=>a.available).map(a=>`<a href="${esc(a.href)}"${current===a.id?' aria-current="page"':''}>${esc(a.title)}</a>`).join('')}</div></details>`;}
export function learningNavigationHTML(location){const {path,index}=location;return `<p><strong>${esc(path.title)}</strong><span>Крок ${index+1} із ${path.steps.length}</span></p><div>${index>0?`<a href="${esc(learningHref(path.id,index-1))}">← Попередній матеріал</a>`:''}${index<path.steps.length-1?`<a href="${esc(learningHref(path.id,index+1))}">Наступний матеріал →</a>`:'<a href="./directions.html#learning-paths">До маршрутів →</a>'}<a href="./index.html#home-learning-paths">Обрати інший маршрут</a></div>`;}
export function mountPlatformNavigation(root=document){
  if(root.defaultView&&root.defaultView.self!==root.defaultView.top)return;
  if(!root.querySelector('link[data-platform-style]')){const css=root.createElement('link');css.rel='stylesheet';css.href='./platform.css?v=63';css.dataset.platformStyle='';root.head.append(css);}
  const selected=root.body.dataset.platformArea||null;
  // Keep the existing home hero height: one header link, no extra first-screen bar.
  if(selected==='home'){
    const homeNav=root.querySelector('.page > header nav');
    if(homeNav&&!homeNav.querySelector('.eua-home-catalog-entry')){const link=root.createElement('a');link.href='./directions.html';link.className='eua-home-catalog-entry';link.textContent='Каталог';link.setAttribute('aria-label','Усі матеріали Evidence UA');homeNav.append(link);}
  }
  const headers=[...root.querySelectorAll('header')].filter(h=>selected!=='home'&&!h.closest('dialog'));
  const targets=[...headers.map(header=>({element:header,current:selected})),...catalog.getArea('supplements').units.filter(u=>u.id!=='atp-pcr').map(u=>({element:root.getElementById(u.id==='creatine'?'creatine':'supplement-'+u.id),current:'supplements',prepend:true})).filter(t=>t.element)];
  for(const target of targets){if(target.prepend&&target.element.querySelector(':scope > .eua-platform-nav'))continue;if(!target.prepend&&target.element.nextElementSibling?.classList.contains('eua-platform-nav'))continue;
    const nav=root.createElement('nav');nav.className='eua-platform-nav';nav.setAttribute('aria-label','Напрями платформи');nav.innerHTML=navigationHTML(target.current)+toolsHTML(target.current);
    if(target.prepend)target.element.prepend(nav);else target.element.after(nav);
  }
  if(selected==='home'){
    const start=root.getElementById('start-here');
    if(start&&!start.querySelector('.eua-home-tools')){const tools=root.createElement('div');tools.className='eua-home-tools';tools.innerHTML=toolsHTML('home');start.append(tools);}
  }
  mountQuickTools(root);
  const renderLearning=()=>{
    root.querySelector('.eua-learning-nav')?.remove();
    const href=root.defaultView?.location?.href;
    if(href&&new URL(href).hash==='#home-learning-paths'){const routes=root.getElementById('home-learning-paths');if(routes)routes.open=true;}
    const position=learningLocation(href);if(!position)return;
    const anchor=new URL(position.step.href,href).hash.slice(1),target=anchor?root.getElementById(anchor):root.querySelector('main');if(!target)return;
    const nav=root.createElement('nav');nav.className='eua-learning-nav';nav.setAttribute('aria-label','Поточний маршрут навчання');nav.innerHTML=learningNavigationHTML(position);
    if(anchor)target.before(nav);else target.prepend(nav);
  };
  const previous=learningListeners.get(root);
  if(previous)for(const event of ['hashchange','popstate'])root.defaultView?.removeEventListener?.(event,previous);
  renderLearning();for(const event of ['hashchange','popstate'])root.defaultView?.addEventListener(event,renderLearning);
  learningListeners.set(root,renderLearning);
}
if(typeof document!=='undefined')mountPlatformNavigation();
