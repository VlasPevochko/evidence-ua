import {ClaimCard,claimButton,mountEvidenceDrawer} from './evidence/components.js?v=2.2';
import {organelles,getOrganelle,learningLevels,sources,moduleMeta,visual,cellKnowledge,adjacentOrganelle} from './cell-lab-data.js?v=56';
import {renderCellAtlas} from './cell-illustration.js?v=73';
import {renderCellSources} from './cell-sources.js?v=72';
import {renderCellDetail} from './cell-detail-view.js?v=73';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderCell(selectedId='ORG-MITOCHONDRION'){
 getOrganelle(selectedId);return renderCellAtlas(selectedId);
}
export function panelContent(id,tab,level){
 const o=getOrganelle(id);if(!learningLevels[level])throw Error('Unknown learning level');
 const content=tab==='sources'?o.sourceIds.map(id=>{const s=sources.find(s=>s.id===id);return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><p class="small">${esc(s.scope)}</p>`;}).join(''):`<p class="answer">${esc(o.summary)}</p>${level==='school'?'':`<p>${esc(o.detail)}</p>`}<p class="small">${esc(learningLevels[level].note)}</p>`;
 return content+claimButton(o.claimId);
}
export function initialOrganelle(href){const id=new URL(href||'https://evidence.invalid').searchParams.get('organelle');return organelles.some(o=>o.id===id)?id:'ORG-MITOCHONDRION';}
export function initialCellPreferences(href){const url=new URL(href||'https://evidence.invalid');return {level:['school','university','advanced'].includes(url.searchParams.get('level'))?url.searchParams.get('level'):'university',tab:['function','sources'].includes(url.searchParams.get('tab'))?url.searchParams.get('tab'):'function'};}
export function mount(root=document){
 let selected=initialOrganelle(root.defaultView?.location?.href),{level,tab}=initialCellPreferences(root.defaultView?.location?.href);
 let detailOpen=false,detailZoom=4;
 const canvas=root.querySelector('#cell-canvas'),list=root.querySelector('#organelle-list'),quick=root.querySelector('#organelle-quick');
 canvas.innerHTML=renderCell(selected)+'<section id="cell-detail" hidden aria-label="Детальна будова обраної структури"></section>';
 const atlasFrame=canvas.querySelector('.cell-atlas-frame'),detailHost=canvas.querySelector('#cell-detail');
 const renderDetail=(focusAction,center)=>{
  atlasFrame.hidden=detailOpen;detailHost.hidden=!detailOpen;
  if(detailOpen){detailHost.innerHTML=renderCellDetail(selected,detailZoom);if(center){const stage=detailHost.querySelector('.cell-detail-stage');stage.scrollLeft=Math.max(0,center.x*stage.scrollWidth-stage.clientWidth/2);stage.scrollTop=Math.max(0,center.y*stage.scrollHeight-stage.clientHeight/2);}if(focusAction){const button=detailHost.querySelector(`[data-cell-detail-action="${focusAction}"]`);(button?.disabled?detailHost.querySelector('[data-cell-detail-action="fit"]'):button)?.focus({preventScroll:true});}}
 };
 const closeDetail=()=>{detailOpen=false;renderDetail();canvas.querySelector(`[data-organelle="${selected}"]`).focus({preventScroll:true});};
 const previewName=canvas.querySelector('#cell-preview-name'),previewCaption=canvas.querySelector('#cell-preview-caption');
 const showPreview=id=>{previewName.textContent=getOrganelle(id).label;previewCaption.textContent=id===selected?'Обрана структура':'Попередній перегляд';};
 const previewTarget=target=>{const button=target?.closest?.('[data-organelle]');return button&&canvas.contains(button)&&organelles.some(o=>o.id===button.dataset.organelle)?button.dataset.organelle:null;};
 const onPreview=e=>showPreview(previewTarget(e.target)||selected);
 const onPointerLeave=()=>showPreview(selected);
 const onFocusOut=e=>showPreview(previewTarget(e.relatedTarget)||selected);
 const buttons=()=>organelles.map(o=>`<button type="button" data-organelle="${o.id}" aria-pressed="${o.id===selected}" aria-controls="organelle-panel"><span class="dot" style="--dot:${o.color}"></span>${esc(o.label)}</button>`).join('');
 list.innerHTML=buttons();quick.innerHTML=buttons();
 const render=()=>{
  const o=getOrganelle(selected);
  root.querySelector('#organelle-title').textContent=o.label;root.querySelector('#organelle-tag').textContent=o.tag;
  root.querySelector('#organelle-copy').innerHTML=panelContent(selected,tab,level);
  root.querySelector('#selected-label').textContent=`Обрано: ${o.label}`;
  root.querySelector('#structure-position').textContent=`${organelles.indexOf(o)+1} / ${organelles.length}`;
  root.querySelectorAll('[data-organelle]').forEach(b=>{const active=b.dataset.organelle===selected;b.setAttribute('aria-pressed',String(active));b.classList.toggle('selected',active);});
  root.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)));
  root.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
  showPreview(selected);
  renderDetail();
  const url=root.defaultView?.location?.href;
  if(url&&root.defaultView.history){const link=new URL(url);link.searchParams.set('organelle',selected);link.searchParams.set('level',level);link.searchParams.set('tab',tab);root.defaultView.history.replaceState(null,'',link.toString());}
 };
 const choose=e=>{
  const b=e.target.closest('[data-organelle],[data-level],[data-tab],[data-cell-action],[data-cell-detail-action]');if(!b)return;
  if(b.dataset.cellDetailAction){
   const action=b.dataset.cellDetailAction;
   if(action==='close'){closeDetail();return;}
   if(!detailOpen)return;
   const stage=detailHost.querySelector('.cell-detail-stage');
   const center=action.startsWith('zoom-')&&stage.clientWidth>0&&stage.clientHeight>0?{x:(stage.scrollLeft+stage.clientWidth/2)/stage.scrollWidth,y:(stage.scrollTop+stage.clientHeight/2)/stage.scrollHeight}:null;
   if(action==='fit')detailZoom=4;
   if(action==='zoom-in')detailZoom=Math.min(8,detailZoom+2);
   if(action==='zoom-out')detailZoom=Math.max(2,detailZoom-2);
   renderDetail(action,center);return;
  }
  if(b.dataset.organelle){getOrganelle(b.dataset.organelle);selected=b.dataset.organelle;detailOpen=true;detailZoom=4;}
  if(b.dataset.cellAction)selected=adjacentOrganelle(selected,b.dataset.cellAction==='previous'?-1:1);
  if(b.dataset.level)level=b.dataset.level;if(b.dataset.tab)tab=b.dataset.tab;render();
  if(b.dataset.organelle)renderDetail('close');
  if(b.dataset.organelle&&!canvas.contains(b)&&b.dataset.sourceJump!=='true')canvas.scrollIntoView({behavior:'auto',block:'start'});
  if(b.dataset.sourceJump==='true'){
   const href=root.defaultView?.location?.href;
   if(href&&root.defaultView.history){const link=new URL(href);link.hash='cell-canvas';root.defaultView.history.replaceState(null,'',link.toString());}
   canvas.scrollIntoView({behavior:'auto',block:'start'});canvas.focus({preventScroll:true});
  }
 };
 const onKeys=e=>{
  if(e.key==='Escape'&&detailOpen){e.preventDefault();closeDetail();return;}
  if(!e.target.matches('[data-organelle]'))return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(e);}
  if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();detailOpen=false;selected=adjacentOrganelle(e.target.dataset.organelle,['ArrowRight','ArrowDown'].includes(e.key)?1:-1);render();canvas.querySelector(`[data-organelle="${selected}"]`).focus();}
 };
 const onSearch=e=>{const query=e.target.value.trim().toLocaleLowerCase('uk');let count=0;list.querySelectorAll('button').forEach(b=>{const o=getOrganelle(b.dataset.organelle);b.hidden=!`${o.label} ${o.tag}`.toLocaleLowerCase('uk').includes(query);if(!b.hidden)count++;});root.querySelector('#search-result').textContent=count?`Структур: ${count}`:'Нічого не знайдено. Спробуй іншу назву.';};
 root.addEventListener('click',choose);canvas.addEventListener('keydown',onKeys);root.querySelector('#organelle-search').addEventListener('input',onSearch);
 canvas.addEventListener('pointerover',onPreview);canvas.addEventListener('focusin',onPreview);canvas.addEventListener('pointerleave',onPointerLeave);canvas.addEventListener('focusout',onFocusOut);
 root.querySelector('#claim-list').innerHTML=cellKnowledge.claims.map(c=>ClaimCard(c.id,cellKnowledge)).join('');
 root.querySelector('#source-list').innerHTML=renderCellSources();
 root.querySelector('#visual-note').textContent=visual.simplificationNote;
 root.querySelector('#review-meta').textContent=`Версія ${moduleMeta.version} · джерела звірено ${moduleMeta.lastChecked} · ${moduleMeta.status}`;
 const onPop=()=>{selected=initialOrganelle(root.defaultView.location.href);({level,tab}=initialCellPreferences(root.defaultView.location.href));render();};
 root.defaultView?.addEventListener?.('popstate',onPop);
 const unmountDrawer=mountEvidenceDrawer(root,cellKnowledge);render();
 return {state:()=>({selected,level,tab}),detailState:()=>({open:detailOpen,zoom:detailZoom}),destroy(){root.removeEventListener('click',choose);canvas.removeEventListener('keydown',onKeys);canvas.removeEventListener('pointerover',onPreview);canvas.removeEventListener('focusin',onPreview);canvas.removeEventListener('pointerleave',onPointerLeave);canvas.removeEventListener('focusout',onFocusOut);root.querySelector('#organelle-search').removeEventListener('input',onSearch);root.defaultView?.removeEventListener?.('popstate',onPop);unmountDrawer();}};
}
if(typeof document!=='undefined')mount();
