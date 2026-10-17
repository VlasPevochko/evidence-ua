import {toolsHTML,mountQuickTools} from './quick-tools.mjs';
import {catalog,learningHref,learningLocation} from './catalog.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const learningListeners=new WeakMap();
const atlasLink=current=>`<a class="eua-atlas-link" href="./atlas.html"${current==='atlas'?' aria-current="page"':''}>Атлас</a>`;
const atlasTeaserHTML=()=>`<aside class="eua-atlas-teaser" aria-labelledby="eua-atlas-teaser-title"><div><span>АТЛАС EVIDENCE</span><h2 id="eua-atlas-teaser-title">Досліджуйте лінії навігації</h2></div></aside>`;
export function navigationHTML(current){return `<a class="eua-catalog-link" href="./directions.html">Напрями Evidence UA →</a>${atlasLink(current)}<details><summary>Перейти до інформації</summary></details>`}
export function learningNavigationHTML(location){const {path,index}=location;return `<p><strong>${esc(path.title)}</strong><span>Крок ${index+1} із ${path.steps.length}</span></p><div></div>`}
export function mountPlatformNavigation(root=document){
  if(root.defaultView&&root.defaultView.self!==root.defaultView.top)return;

  // Guard against environments where document.head is not present (test DOM mocks).
  const head = root.head ?? root.document?.head;
  if(!root.querySelector('link[data-platform-style]') && head && typeof head.append === 'function'){
    const css=root.createElement('link');css.rel='stylesheet';css.href='./platform.css?v=84';css.dataset.platformStyle='';head.append(css);
  }

  const selected=root.body.dataset.platformArea||null;
  // Keep the existing home hero height: compact header entries only.
  if(selected==='home'){
    const homeNav=root.querySelector('.page > header nav');
    if(homeNav&&!homeNav.querySelector('.eua-home-catalog-entry')){const link=root.createElement('a');link.href='./directions.html';link.className='eua-home-catalog-entry';link.textContent='Каталог';homeNav.append(link);}
    if(homeNav&&!homeNav.querySelector('.eua-home-atlas-entry')){const link=root.createElement('a');link.href='./atlas.html';link.className='eua-home-atlas-entry';link.textContent='Атлас';homeNav.append(link);}
  }
  const headers=[...root.querySelectorAll('header')].filter(h=>selected!=='home'&&!h.closest('dialog'));
  const targets=[...headers.map(header=>({element:header,current:selected})),...catalog.getArea('supplements').units.filter(u=>u.id!=='atp-pcr').map(u=>({element:root.getElementById(u.id==='creatine'?'creatine-section':u.id),current:selected}))];
  for(const target of targets){if(target.prepend&&target.element.querySelector(':scope > .eua-platform-nav'))continue;if(!target.prepend&&target.element.nextElementSibling?.classList.contains('eua-platform-nav'))continue;
    const nav=root.createElement('nav');nav.className='eua-platform-nav';nav.setAttribute('aria-label','Напрями платформи');const contents=navigationHTML(target.current)+toolsHTML(target.current);
    if(target.prepend)target.element.prepend(nav);else target.element.after(nav);
  }
  if(selected==='home'){
    const start=root.getElementById('start-here');
    if(start&&!start.querySelector('.eua-home-tools')){const tools=root.createElement('div');tools.className='eua-home-tools';tools.innerHTML=toolsHTML('home');start.append(tools);}
    if(start&&!start.querySelector('.eua-atlas-teaser')){const teaser=root.createElement('div');teaser.innerHTML=atlasTeaserHTML();const atlas=teaser.firstElementChild;if(atlas)start.append(atlas);} 
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
