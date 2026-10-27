import {materials,findMaterials,materialKinds,contextLink,materialContext} from './platform-materials.js?v=103';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function materialCard(m){return `<a class="eua-material" href="${esc(m.href)}"><span>${esc(m.areaTitle)} · ${esc(materialKinds[m.kind])}</span><strong>${esc(m.title)} →</strong><small>${esc(m.review)}</small></a>`;}
export function toolsHTML(area){return `<div class="eua-tools"><button type="button" data-eua-tool="search">Знайти матеріал</button>${['cell','nutrition'].includes(area)?'<button type="button" data-eua-tool="focus" aria-pressed="false">Режим заняття</button>':''}<button type="button" data-eua-tool="share">Скопіювати посилання</button>${area==='home'?'':'<a href="./index.html#home-feedback">Поділитися враженням</a>'}</div><p class="eua-tool-status" role="status" aria-live="polite"></p>`;}
export function mountQuickTools(root=document){
 if(!root.body?.append||root.getElementById('eua-search-dialog'))return;
 const dialog=root.createElement('dialog');dialog.id='eua-search-dialog';dialog.className='eua-search-dialog';dialog.setAttribute('aria-labelledby','eua-search-title');
 dialog.innerHTML='<div class="eua-search-head"><h2 id="eua-search-title">Знайти матеріал</h2><button type="button" data-eua-search-close aria-label="Закрити пошук">✕</button></div><label for="eua-material-query">Тема, структура або добавка</label><input id="eua-material-query" type="search" maxlength="120" placeholder="Наприклад, саркомер або протеїн" autocomplete="off" aria-controls="eua-material-results"><p class="eua-search-note">Пошук лише серед наявних матеріалів Evidence UA. Це не пошук нових публікацій і не медична порада.</p><p id="eua-material-count" role="status" aria-live="polite"></p><div id="eua-material-results" class="eua-material-grid"></div><a class="eua-directory-return" href="./directions.html#available">Усі напрями та маршрути →</a>';
 root.body.append(dialog);
 const input=root.getElementById('eua-material-query'),results=root.getElementById('eua-material-results'),count=root.getElementById('eua-material-count');
 let opener=null,focusOpener=null;
 const render=()=>{const matches=findMaterials(input.value),query=input.value.trim();const visible=query?matches:materials.filter(m=>['muscle-structure','muscle-contraction','cell-general','nutrition-enterocyte','supplements-creatine','supplements-protein','guide-evidence','guide-protein-meta'].includes(m.id));count.textContent=!query?`У каталозі ${materials.length} прямих переходів. Нижче — швидкий старт.`:matches.length?`Матеріалів: ${matches.length}`:'Нічого не знайдено. Спробуй іншу назву або відкрий усі напрями.';results.innerHTML=visible.map(materialCard).join('');};
 const focusButtons=()=>root.querySelectorAll('[data-eua-tool="focus"]');
 const exitFocus=()=>{if(!root.body.dataset.euaFocus)return;delete root.body.dataset.euaFocus;focusButtons().forEach(b=>{b.setAttribute('aria-pressed','false');b.textContent='Режим заняття';});focusOpener?.focus();};
 const statusFor=b=>b.closest('.eua-platform-nav,.eua-home-tools,.eua-article-bar')?.querySelector('.eua-tool-status');
 const onClick=async event=>{
  const anchor=event.target.closest('a');if(anchor){const href=new URL(anchor.href,root.defaultView.location.href);if(href.origin===root.defaultView.location.origin&&href.hash==='#home-feedback'){const material=materialContext(root.defaultView.location.href);if(material){href.searchParams.set('feedbackFor',material.id);anchor.href=href.href;}}}
  const close=event.target.closest('[data-eua-search-close]');if(close){dialog.close();return;}
  const b=event.target.closest('[data-eua-tool]');if(!b)return;
  if(b.dataset.euaTool==='search'){opener=b;input.value='';render();if(typeof dialog.showModal==='function'){dialog.showModal();input.focus();}else root.defaultView.location.href='./directions.html#available';}
  if(b.dataset.euaTool==='focus'){
   if(root.body.dataset.euaFocus){exitFocus();return;}
   focusOpener=b;root.body.dataset.euaFocus='true';focusButtons().forEach(x=>{x.setAttribute('aria-pressed','true');x.textContent='Вийти з режиму заняття';});
   const target=root.getElementById(root.body.dataset.focusTarget||(root.body.dataset.platformArea==='cell'?'explorer':'nutrition-lab'));target?.scrollIntoView({block:'start'});
  }
  if(b.dataset.euaTool==='share'){
   const status=statusFor(b),link=contextLink(root.defaultView.location.href);b.disabled=true;
   try{const clipboard=root.defaultView.navigator?.clipboard;if(!clipboard?.writeText)throw Error('Unavailable');await clipboard.writeText(link);if(status)status.textContent='Посилання скопійовано. Параметри сторонніх сервісів не включено.';}
   catch{if(status){status.replaceChildren();const label=root.createElement('label');label.textContent='Копіювання недоступне — скопіюй посилання вручну:';const field=root.createElement('input');field.type='text';field.readOnly=true;field.value=link;label.append(field);status.append(label);field.focus();field.select();}}
   finally{b.disabled=false;}
  }
 };
 const onKey=event=>{if(event.key==='Escape'&&!root.querySelector('dialog[open]'))exitFocus();};
 const onClose=()=>opener?.focus();
 const onResult=event=>{if(event.target.closest('a'))dialog.close();};
 root.addEventListener('click',onClick);root.addEventListener('keydown',onKey);input.addEventListener('input',render);dialog.addEventListener('close',onClose);results.addEventListener('click',onResult);
 return {render,exitFocus,destroy(){exitFocus();root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKey);dialog.remove();}};
}
