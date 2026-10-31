// Пошук по сайту: кнопка в шапці відкриває вікно з полем. Шукає по назвах матеріалів і словнику термінів, нічого не надсилає.
// Дані підвантажуються лише при першому відкритті, щоб не обтяжувати сторінки.
const fold=text=>String(text||'').toLocaleLowerCase('uk').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').trim().slice(0,120);
export const SUGGESTIONS=['білок','сон','кофеїн','жир','інтервал'];

// Pure: rank materials and terms for a query. Title starts-with beats title contains beats other fields.
export function searchSite({materials=[],terms=[],findMaterials=null},query,limit=8){
  const q=fold(query);if(!q)return {materials:[],terms:[]};
  const words=q.split(' ');
  const rank=(title,text)=>{const t=fold(title);return t.startsWith(q)?0:t.includes(q)?1:words.every(w=>t.includes(w))?2:3;};
  const found=(findMaterials?findMaterials(query):materials.filter(m=>words.every(w=>fold(m.title+' '+m.areaTitle).includes(w))));
  const mats=found.map((m,i)=>({m,r:rank(m.title),i})).sort((a,b)=>a.r-b.r||a.i-b.i).slice(0,limit).map(x=>x.m);
  const trm=terms.filter(t=>words.every(w=>fold(t.title+' '+t.definition).includes(w))).map((t,i)=>({t,r:rank(t.title),i})).sort((a,b)=>a.r-b.r||a.i-b.i).slice(0,Math.max(2,limit-mats.length)).map(x=>x.t);
  return {materials:mats,terms:trm};
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Loaded from dist/, where the generated copies of the catalogue modules live.
const defaultLoader=async()=>{
  const [mat,terms,gl]=await Promise.all([import('./platform-materials.js?v=103'),import('./platform-terms.js?v=3'),import('./platform-glossary-data.js')]);
  const extra=[...(gl.glossary?.movement||[]),...(gl.glossary?.sleep||[])];
  return {materials:mat.materials,findMaterials:mat.findMaterials,kinds:mat.materialKinds,terms:[...terms.TERMS,...extra]};
};
// The header and a page's search form share one lazy controller and shortcut.
const controllers=new WeakMap();
const focusable=node=>node&&typeof node.focus==='function'&&node.isConnected!==false&&!node.hidden&&!node.closest?.('[hidden]')&&(typeof node.getClientRects!=='function'||node.getClientRects().length>0);

export function mountSearch(doc=document,button,loader=defaultLoader){
  if(!button)return null;
  if(controllers.has(button))return controllers.get(button);
  if(button.dataset.searchMounted)return null;
  button.dataset.searchMounted='1';
  const view=doc.defaultView;
  let dialog=null,data=null,loading=null,input,list,status,opener=button;
  const configuredFocus=()=>button.dataset.searchFocus?doc.getElementById(button.dataset.searchFocus):null;
  const build=()=>{
    dialog=doc.createElement('dialog');dialog.className='eua-search';dialog.setAttribute('aria-label','Пошук по сайту');
    dialog.innerHTML=`<form method="dialog" class="eua-search-form">${doc.body.dataset?.platformArea==='home'?'<h2 class="eua-search-title">Пошук по сайту</h2>':''}<div class="eua-search-bar"><input type="search" id="eua-search-q" placeholder="Матеріал або термін" autocomplete="off" aria-label="Пошук по сайту"><button type="submit" class="eua-search-close" aria-label="Закрити пошук">×</button></div><p class="eua-search-status" role="status" aria-live="polite"></p><div class="eua-search-results"></div></form>`;
    doc.body.append(dialog);
    input=dialog.querySelector('input');list=dialog.querySelector('.eua-search-results');status=dialog.querySelector('.eua-search-status');
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>{[opener,configuredFocus(),button].find(focusable)?.focus();});
    input.addEventListener('input',render);
    dialog.addEventListener('keydown',onKey);
    list.addEventListener('click',e=>{if(e.target.closest('a')){dialog.close();return;}const chip=e.target.closest('[data-q]');if(chip){input.value=chip.dataset.q;render();input.focus();}});
  };
  function links(){return [...list.querySelectorAll('a')];}
  function onKey(e){
    if(e.key!=='ArrowDown'&&e.key!=='ArrowUp'&&e.key!=='Enter')return;
    const items=links(),at=items.indexOf(doc.activeElement);
    if(e.key==='Enter'){if(doc.activeElement===input&&items[0]){e.preventDefault();items[0].click();}return;}
    e.preventDefault();
    if(e.key==='ArrowDown'){(items[at+1]||items[0])?.focus();}
    else if(at<=0)input.focus();else items[at-1].focus();
  }
  function render(){
    if(!data)return;
    const q=input.value.trim();
    if(!q){
      status.textContent='Введіть слово або виберіть підказку.';
      list.innerHTML=`<p class="eua-search-hint">Часті запити</p><div class="eua-search-chips">${SUGGESTIONS.map(s=>`<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
      return;
    }
    const r=searchSite(data,q),n=r.materials.length+r.terms.length;
    status.textContent=n?`Знайдено: ${n}`:'Нічого не знайдено. Спробуйте інше слово.';
    const kind=m=>data.kinds?.[m.kind]||'Матеріал';
    const mats=r.materials.length?`<h2>Матеріали</h2><ul>${r.materials.map(m=>`<li><a href="${esc(m.href)}"><strong>${esc(m.title)}</strong><span>${esc(kind(m))} · ${esc(m.areaTitle||'')}</span></a></li>`).join('')}</ul>`:'';
    const trm=r.terms.length?`<h2>Терміни</h2><ul>${r.terms.map(t=>`<li><a href="./glossary.html#term-${esc(t.id)}"><strong>${esc(t.title)}</strong><span>Словник термінів</span></a></li>`).join('')}</ul>`:'';
    list.innerHTML=mats+trm;
  }
  async function open(query,focusTarget){
    const activeDialog=doc.querySelector?.('dialog[open]');
    if(activeDialog&&activeDialog!==dialog)return;
    if(typeof doc.createElement('dialog').showModal!=='function'){view.location.href='./directions.html';return;}
    if(!dialog)build();
    opener=[focusTarget,configuredFocus(),button].find(focusable);
    if(typeof query==='string')input.value=query;
    if(!dialog.open)dialog.showModal();
    input.focus();
    if(!data){status.textContent='Завантаження…';try{loading||=loader();data=await loading;}catch{loading=null;status.textContent='Не вдалося завантажити пошук. Спробуйте каталог напрямів.';list.innerHTML='<p class="eua-search-hint"><a href="./directions.html">Відкрити каталог напрямів</a></p>';return;}}
    render();
  }
  button.addEventListener('click',()=>open());
  doc.addEventListener('keydown',e=>{
    if(e.key!=='/'||e.ctrlKey||e.metaKey||e.altKey)return;
    const t=e.target,tag=t?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||t?.isContentEditable||dialog?.open||doc.querySelector?.('dialog[open]'))return;
    e.preventDefault();open();
  });
  const controller={open};
  controllers.set(button,controller);
  return controller;
}
