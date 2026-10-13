import {findMaterials,materials} from './materials.mjs';
import {materialCard} from './quick-tools.mjs';
import {catalog,findAreas} from './catalog.mjs';
import {pathCard} from './learning-ui.mjs';
export {pathCard};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function areaCard(area){
 const artwork={muscle:'muscle-lab-art-v1.webp',cell:'card-organism.svg',nutrition:'card-nutrition.svg',supplements:'card-evidence.svg',movement:'card-organism.svg'}[area.id];
 return `<article class="area-card">${artwork?`<div class="area-visual" aria-hidden="true"><img src="./${artwork}" alt="" loading="lazy" width="480" height="180"></div>`:''}<p class="area-kind">${esc(area.lab)}</p><h3>${esc(area.title)}</h3><p>${esc(area.description)}</p><p class="area-status"><strong>${esc(area.state)}</strong><br>${esc(area.review)}</p><a class="area-open" href="${esc(area.href)}">Відкрити напрям <span aria-hidden="true">→</span></a>${area.units.length?`<details><summary>Матеріали напряму</summary><div class="unit-links">${area.units.map(u=>`<a href="${esc(u.href)}">${esc(u.title)} →</a>`).join('')}</div></details>`:''}</article>`;
}
export function mountDirectory(root=document){
 let group='all',kind='all';const search=root.querySelector('#area-search'),view=root.defaultView;
 const groups=new Set(['all','atlas','nutrition','evidence','movement']);
 const kinds=new Set(['all','interactive','dossier','guide']);
 const restore=()=>{
  const url=view?.location?.href?new URL(view.location.href):null,fromURL=url&&['q','group','kind'].some(key=>url.searchParams.has(key));
  const state=fromURL?{query:url.searchParams.get('q')||'',group:url.searchParams.get('group'),kind:url.searchParams.get('kind')}:view?.history?.state?.euaDirectory;
  group=groups.has(state?.group)?state.group:'all';kind=kinds.has(state?.kind)?state.kind:'all';search.value=typeof state?.query==='string'?state.query.slice(0,120):'';
 };
 const save=()=>{const history=view?.history;if(!history?.replaceState)return;const current=history.state;
  try{const url=view?.location?.href?new URL(view.location.href):null;if(url)for(const [key,value] of [['q',search.value.slice(0,120).trim()],['group',group==='all'?'':group],['kind',kind==='all'?'':kind]]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}
   history.replaceState({...((current&&typeof current==='object')?current:{}),euaDirectory:{query:search.value.slice(0,120),group,kind}},'',url?.href);
  }catch{/* Search still works when history updates are unavailable. */}
 };
 const render=()=>{
  const matches=findMaterials(search.value,group).filter(m=>kind==='all'||m.kind===kind),areaIds=new Set([...(kind==='all'?findAreas(search.value,group):[]).map(a=>a.id),...matches.map(m=>m.areaId)]);
  const found=catalog.areas.filter(a=>a.available&&areaIds.has(a.id));
  const active=Boolean(search.value.trim()||group!=='all'||kind!=='all'),section=root.querySelector('#material-results');if(section){section.hidden=!active;section.open=active;root.querySelector('#material-list').innerHTML=matches.map(materialCard).join('');root.querySelector('#material-count').textContent=`Матеріалів у вибірці: ${matches.length}`;}
  root.querySelector('#clear-search').hidden=!active;
  root.querySelector('#area-list').innerHTML=found.map(areaCard).join('');root.querySelector('#area-count').textContent=`Доступних напрямків у вибірці: ${found.length}`;root.querySelector('#search-empty').hidden=found.length>0||matches.length>0;root.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));
  root.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));
 };
 const update=()=>{save();render();};
 search.addEventListener('input',update);root.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=groups.has(b.dataset.group)?b.dataset.group:'all';update();}));
 root.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{kind=kinds.has(b.dataset.kind)?b.dataset.kind:'all';update();}));
 root.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{group=kind='all';search.value=b.dataset.query.slice(0,120);update();search.focus();}));
 root.querySelector('#clear-search').addEventListener('click',()=>{group=kind='all';search.value='';update();search.focus();});
 for(const [id,value] of [['#catalog-area-total',catalog.areas.filter(a=>a.available).length],['#catalog-material-total',materials.length],['#catalog-path-total',catalog.paths.length]]){const target=root.querySelector(id);if(target)target.textContent=String(value);}
 root.querySelector('#path-list').innerHTML=catalog.paths.map(pathCard).join('');root.querySelector('#planned-list').innerHTML=catalog.areas.filter(a=>!a.available).map(a=>`<article class="planned-card"><span>${esc(a.state)}</span><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></article>`).join('');
 restore();render();for(const event of ['pageshow','popstate'])view?.addEventListener?.(event,()=>{restore();render();});
}
if(typeof document!=='undefined')mountDirectory();
