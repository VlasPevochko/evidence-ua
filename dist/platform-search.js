// Пошук по сайту: кнопка в шапці відкриває вікно з полем. Шукає по назвах матеріалів, розборах досліджень, розділах усередині сторінок і словнику термінів, нічого не надсилає.
// Дані підвантажуються лише при першому відкритті, щоб не обтяжувати сторінки.
const fold=text=>String(text||'').toLocaleLowerCase('uk').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').trim().slice(0,120);
export const SUGGESTIONS=['білок','креатин','сон','кофеїн','жир','інтервал'];

// Рішення власника D3 (2026-11-02, бриф T7): підказка в полі й текст порожнього результату. Підказку беруть і поле на головній (src/platform/home-spectrum.mjs),
// і це вікно, тож вони не розійдуться. Посилання в порожньому результаті стоїть на словах «всі напрями», видимий текст той самий. Слів «так», «ні», «міф» тут нема:
// пошук нічого не оцінює, він лише веде до сторінок.
export const SEARCH_PLACEHOLDER='Знайти розбір або перевірити твердження';
const EMPTY_BEFORE='Нічого не знайшли. Спробуйте інше слово або відкрийте ',EMPTY_LINK='всі напрями';
export const EMPTY_RESULT_TEXT=`${EMPTY_BEFORE}${EMPTY_LINK}.`;
const emptyResultHTML=()=>`${EMPTY_BEFORE}<a href="./directions.html">${EMPTY_LINK}</a>.`;

// Розділи всередині сторінок (2026-11-02). Рядок індексу: [посилання, назва, матеріал, вид, слова для пошуку] (див. scripts/build-sections.mjs).
// Слова запиту, що лише називають матеріал («креатин» у запиті «як пити креатин»), для розділу є контекстом, а не змістом: збіг мусить бути
// ще хоча б за одним словом у назві розділу чи його словах. Для запиту з кількох слів потрібно 60% збігів, а розділи, що збіглись більшою
// кількістю слів, стоять вище. Однакових назв (у кожної добавки є «Перш ніж приймати») показуємо не більше двох, один розділ не повторюється.
const needed=total=>Math.max(1,Math.ceil(total*0.6));
export function findSections(rows,keys,{scoreFields,exclude=new Set(),limit=6,perTitle=2}){
  if(!keys.length||!rows.length)return [];
  const scored=[];
  rows.forEach(([href,title,parent,kind,words],i)=>{
    if(exclude.has(href))return;
    const own=keys.filter(key=>!scoreFields([key],[[1,parent]]).matched);
    if(!own.length||!scoreFields(own,[[4,title],[3,words||'']]).matched)return;
    const all=scoreFields(keys,[[4,title],[3,words||''],[1,parent]]);
    if(all.matched<needed(keys.length))return;
    scored.push({section:{href,title,parent,kind},i,matched:all.matched,score:all.score});
  });
  scored.sort((a,b)=>b.matched-a.matched||b.score-a.score||a.i-b.i);
  const titles=new Map(),hrefs=new Set(),out=[];
  for(const {section} of scored){
    const t=fold(section.title);
    if(hrefs.has(section.href)||(titles.get(t)||0)>=perTitle)continue;
    hrefs.add(section.href);titles.set(t,(titles.get(t)||0)+1);out.push(section);
    if(out.length>=limit)break;
  }
  return out;
}

// Pure: rank materials, sections and terms for a query. Title starts-with beats title contains beats other fields.
export function searchSite({materials=[],terms=[],sections=[],findMaterials=null,scoreFields=null,searchKeywords=null,enoughMatches=null},query,limit=8){
  const q=fold(query);if(!q)return {materials:[],studies:[],sections:[],terms:[]};
  // Пошук за ключовими словами (2026-11-01): службові слова відкидаються, збіг хоча б половини слів, результати за вагою (див. materials.mjs).
  // Матеріали вже відранжовані findMaterials; терміни оцінюємо так само за назвою (вага 4) і означенням (вага 1).
  if(findMaterials&&scoreFields&&searchKeywords&&enoughMatches){
    const keys=searchKeywords(query);
    const mats=findMaterials(query).slice(0,limit);
    const trm=terms.map((t,i)=>({t,i,...scoreFields(keys,[[4,t.title],[1,t.definition]])})).filter(x=>x.score>0&&enoughMatches(x.matched,keys.length))
      .sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,Math.max(2,limit-mats.length)).map(x=>x.t);
    // Розділ, що веде туди ж, куди вже показаний матеріал (той самий якір), не повторюємо.
    const exclude=new Set(mats.map(m=>String(m.href).replace(/^\.\//,'')));
    // Розбори (16 коротких розборів досліджень, kind «study») шукаються тим самим способом, але виходять окремою групою: підказка в полі обіцяє «знайти розбір».
    // Показуємо лише назву-питання; відповідей і висновків пошук не показує й не оцінює.
    const studies=findSections(sections.filter(row=>row[3]==='study'),keys,{scoreFields,exclude,limit:4,perTitle:1});
    return {materials:mats,studies,sections:findSections(sections.filter(row=>row[3]!=='study'),keys,{scoreFields,exclude}),terms:trm};
  }
  const words=q.split(' ');
  const rank=(title,text)=>{const t=fold(title);return t.startsWith(q)?0:t.includes(q)?1:words.every(w=>t.includes(w))?2:3;};
  const found=(findMaterials?findMaterials(query):materials.filter(m=>words.every(w=>fold(m.title+' '+m.areaTitle).includes(w))));
  const mats=found.map((m,i)=>({m,r:rank(m.title),i})).sort((a,b)=>a.r-b.r||a.i-b.i).slice(0,limit).map(x=>x.m);
  const trm=terms.filter(t=>words.every(w=>fold(t.title+' '+t.definition).includes(w))).map((t,i)=>({t,r:rank(t.title),i})).sort((a,b)=>a.r-b.r||a.i-b.i).slice(0,Math.max(2,limit-mats.length)).map(x=>x.t);
  return {materials:mats,studies:[],sections:[],terms:trm};
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Loaded from dist/, where the generated copies of the catalogue modules live.
const defaultLoader=async()=>{
  // Розділи сторінок необов’язкові: якщо файл не завантажився, пошук працює по матеріалах і термінах.
  const [mat,terms,gl,sec]=await Promise.all([import('./platform-materials.js?v=109'),import('./platform-terms.js?v=4'),import('./platform-glossary-data.js'),import('./platform-sections.js?v=3').catch(()=>({sections:[]}))]);
  const extra=[...(gl.glossary?.movement||[]),...(gl.glossary?.sleep||[])];
  return {materials:mat.materials,findMaterials:mat.findMaterials,scoreFields:mat.scoreFields,searchKeywords:mat.searchKeywords,enoughMatches:mat.enoughMatches,kinds:mat.materialKinds,sections:sec.sections,terms:[...terms.TERMS,...extra]};
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
    dialog.innerHTML=`<form method="dialog" class="eua-search-form">${doc.body.dataset?.platformArea==='home'?'<h2 class="eua-search-title">Пошук по сайту</h2>':''}<div class="eua-search-bar"><input type="search" id="eua-search-q" placeholder="${esc(SEARCH_PLACEHOLDER)}" autocomplete="off" enterkeyhint="search" aria-label="Пошук по сайту"><button type="submit" class="eua-search-close" aria-label="Закрити пошук">×</button></div><p class="eua-search-status" role="status" aria-live="polite"></p><div class="eua-search-results"></div></form>`;
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
    const r=searchSite(data,q),n=r.materials.length+r.studies.length+r.sections.length+r.terms.length;
    // Порожній результат (рішення D3): готовий текст зі сталої, запит у ньому не повторюється, тож написане в полі ніколи не стає розміткою.
    if(n)status.textContent=`Знайдено: ${n}`;else status.innerHTML=emptyResultHTML();
    const kind=m=>data.kinds?.[m.kind]||'Матеріал';
    const mats=r.materials.length?`<h2>Матеріали</h2><ul>${r.materials.map(m=>`<li><a href="${esc(m.href)}"><strong>${esc(m.title)}</strong><span>${esc(kind(m))} · ${esc(m.areaTitle||'')}</span></a></li>`).join('')}</ul>`:'';
    // Розбори: показуємо лише питання-назву й сторінку, на якій розбір лежить (без відповіді): рядок індексу веде на research.html#<id>, картку відкриває сторінка розборів.
    const stu=r.studies.length?`<h2>Розбори</h2><ul>${r.studies.map(s=>`<li><a href="./${esc(s.href)}"><strong>${esc(s.title)}</strong><span>${esc(s.parent||'')}</span></a></li>`).join('')}</ul>`:'';
    // Розділи: посилання відносні, усі сторінки лежать в одній теці. Вид показуємо словом: «Твердження» (картка з рівнем впевненості) або «Розділ».
    const secs=r.sections.length?`<h2>Розділи на сторінках</h2><ul>${r.sections.map(s=>`<li><a href="./${esc(s.href)}"><strong>${esc(s.title)}</strong><span>${s.kind==='claim'?'Твердження':'Розділ'} · ${esc(s.parent||'')}</span></a></li>`).join('')}</ul>`:'';
    const trm=r.terms.length?`<h2>Терміни</h2><ul>${r.terms.map(t=>`<li><a href="./glossary.html#term-${esc(t.id)}"><strong>${esc(t.title)}</strong><span>Словник термінів</span></a></li>`).join('')}</ul>`:'';
    list.innerHTML=mats+stu+secs+trm;
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
