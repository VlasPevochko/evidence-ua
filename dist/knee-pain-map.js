import {kneeViews as views, kneePoints as hotspots, kneeLabels as labels} from './atlas-points.js?v=1';
import {kneeDiagram} from './atlas-diagrams.js?v=1';

const ZONE='knee';
const mount=document.getElementById('knee-pain-map');
const wrap=mount?.closest('.atlas-figure-wrap');
// Фігура Атласу має дві копії за палітрою (img[data-art]): ховаємо й показуємо обидві разом.
const figures=wrap?[...wrap.querySelectorAll('.atlas-figure')]:[];
const globalFigure=figures.length?{set hidden(value){figures.forEach(figure=>{figure.hidden=value;});}}:null;
const zoneButtons=wrap?[...wrap.querySelectorAll('[data-zone]')]:[];
const legend=wrap?.parentElement?.querySelector('.atlas-legend');
const content=document.getElementById('atlas-content');
const breadcrumbTab=document.getElementById('atlas-breadcrumb-tab');
const atlasTabs=[...document.querySelectorAll('[data-atlas-tab]')];
const originalLegend=legend?.innerHTML||'';
let activeView='front';
let activeHotspot=null;
let suppressed=false;

function kneeSelected(){return document.querySelector('[data-zone="knee"]')?.getAttribute('aria-pressed')==='true';}
function overviewSelected(){return document.querySelector('[data-atlas-tab="overview"]')?.getAttribute('aria-selected')==='true';}
function currentView(){return views.find(view=>view.id===activeView)||views[0];}
function currentSpots(){return hotspots.filter(spot=>spot.view===activeView);}
function restoreLegend(){if(legend)legend.innerHTML=originalLegend;}
function painLegend(){if(legend)legend.innerHTML='<span><i class="atlas-dot atlas-dot--active"></i> Обрана точка болю</span><span><i class="atlas-dot"></i> Інші точки болю</span>';}
function announce(point,user){document.dispatchEvent(new CustomEvent('atlas:point',{detail:{zone:ZONE,point,title:point?hotspots.find(item=>item.id===point)?.title:null,user}}));}

function labelSpans(){
 const shown=labels.filter(label=>label.view===activeView);
 const lines=shown.filter(label=>label.line).map(label=>`<line x1="${label.line[0]}" y1="${label.line[1]}" x2="${label.line[2]}" y2="${label.line[3]}"/><line class="dot" x1="${label.line[2]}" y1="${label.line[3]}" x2="${label.line[2]}" y2="${label.line[3]}"/>`).join('');
 return `<svg class="map-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>`+shown.map(label=>`<span class="map-label" data-align="${label.align||'left'}" style="--x:${label.x}%;--y:${label.y}%${label.w?`;--w:${label.w}%`:''}" aria-hidden="true">${label.text}</span>`).join('');
}
function hotspotButtons(){return currentSpots().map(spot=>`<button type="button" class="knee-hotspot" data-knee-hotspot="${spot.id}" aria-pressed="${String(activeHotspot===spot.id)}" data-edge="${spot.x>64?'right':spot.x<36?'left':'mid'}" style="--x:${spot.x}%;--y:${spot.y}%"><span>${spot.title}</span></button>`).join('');}
function renderMap(){
 if(!mount)return;
 const focused=document.activeElement;
 const focusAttribute=mount.contains(focused)?['data-knee-view','data-knee-hotspot','data-knee-return'].find(name=>focused.hasAttribute(name)):null;
 const focusValue=focusAttribute?focused.getAttribute(focusAttribute):null;
 const view=currentView();
 mount.innerHTML=`<header class="knee-map-head"><button type="button" data-knee-return>← Усе тіло</button><div><strong>Коліно · карта болю</strong><small>${view.title} · натисніть на точну точку болю</small></div></header><div class="knee-view-switch" role="tablist" aria-label="Ракурс коліна">${views.map(item=>`<button type="button" role="tab" data-knee-view="${item.id}">${item.label}</button>`).join('')}</div><div class="knee-stage">${kneeDiagram(activeView)}${labelSpans()}${hotspotButtons()}</div><div class="knee-map-rule"><strong>Точка болю ≠ джерело болю</strong><span>Локалізація допомагає звузити анатомічні варіанти, але сама по собі не встановлює діагноз.</span></div>`;
 mount.querySelectorAll('[data-knee-view]').forEach(button=>{
  const selected=button.dataset.kneeView===activeView;
  button.setAttribute('aria-selected',String(selected));
  button.tabIndex=selected?0:-1;
 });
 if(focusAttribute)mount.querySelector(`[${focusAttribute}="${focusValue}"]`)?.focus();
}

function showMap(){
 if(!mount||!wrap||suppressed)return;
 mount.hidden=false;wrap.classList.add('is-knee-map');
 if(globalFigure)globalFigure.hidden=true;zoneButtons.forEach(button=>button.hidden=true);painLegend();renderMap();
}
function hideMap(){
 if(!mount||!wrap)return;
 mount.hidden=true;wrap.classList.remove('is-knee-map');
 if(globalFigure)globalFigure.hidden=false;zoneButtons.forEach(button=>button.hidden=false);restoreLegend();
}
function sync(){
 if(kneeSelected()&&!suppressed)showMap();
 else {hideMap();if(!kneeSelected())activeHotspot=null;}
}

function renderPainDetail(spot){
 if(!content)return;
 const view=views.find(item=>item.id===spot.view);
 content.classList.add('is-changing');
 content.innerHTML=`<article class="knee-pain-detail"><button type="button" class="atlas-link-button atlas-topics-back" data-atlas-topics>← Усі теми</button><p class="knee-detail-kicker">${view?.label||''} · точка болю</p><h3 tabindex="-1" data-point-title>${spot.title}</h3><p class="knee-detail-location">${spot.location}</p><div class="knee-rule-card"><strong>Точка болю ≠ джерело болю</strong><p>Карта показує анатомію під точкою та сусідні структури, які можуть давати схожий патерн болю. Це старт для клінічного мислення, а не готовий діагноз.</p></div><div class="knee-detail-grid"><section><h4>Що знаходиться під точкою</h4><ul>${spot.structures.map(item=>`<li>${item}</li>`).join('')}</ul></section><section><h4>Що може давати схожий біль</h4><ul>${spot.similar.map(item=>`<li>${item}</li>`).join('')}</ul></section></div><section class="knee-detail-note"><h4>Що допомагає уточнити</h4><p>${spot.clarify}</p></section><section class="knee-red-flags"><h4>Коли не варто покладатися лише на карту</h4><p>Після значної травми з деформацією або неможливістю опори, при швидкому великому набряку чи «заблокованому» коліні, гарячому червоному набряклому суглобі з температурою, а також при раптовому набряку литки або задишці потрібна очна медична оцінка.</p></section><p class="knee-pain-disclaimer">Карта локалізації не встановлює діагноз і не замінює клінічний огляд. Вона показує можливі анатомічні джерела та диференційні напрямки для подальшої оцінки.</p></article>`;
 requestAnimationFrame(()=>content.classList.remove('is-changing'));
 if(breadcrumbTab)breadcrumbTab.textContent=`Карта болю · ${spot.title}`;
}

function selectHotspot(id,{user=true,focusDetail=false}={}){
 const spot=hotspots.find(item=>item.id===id);if(!spot)return;
 activeHotspot=id;renderMap();
 const finish=()=>{renderPainDetail(spot);announce(id,user);if(focusDetail)content?.querySelector('[data-point-title]')?.focus({preventScroll:true});};
 const overview=atlasTabs.find(button=>button.dataset.atlasTab==='overview');
 if(!overviewSelected()&&overview){overview.click();requestAnimationFrame(finish);return;}
 finish();
}
function clearHotspot({user=true}={}){
 if(!activeHotspot)return;
 activeHotspot=null;renderMap();announce(null,user);
}
function selectView(id){
 if(!views.some(view=>view.id===id))return;
 const had=activeHotspot;
 activeView=id;activeHotspot=null;renderMap();
 if(overviewSelected())atlasTabs.find(button=>button.dataset.atlasTab==='overview')?.click();
 if(had)announce(null,true);
}
// Стан з адреси, історії браузера й карток тем (події atlas:*), див. atlas.js.
function applyState(zone,point,{user=false,focusDetail=false}={}){
 if(zone!==ZONE){activeHotspot=null;suppressed=false;sync();return;}
 suppressed=false;
 const spot=hotspots.find(item=>item.id===point);
 if(spot){activeView=spot.view;showMap();selectHotspot(spot.id,{user,focusDetail});return;}
 activeHotspot=null;showMap();
}

mount?.addEventListener('click',event=>{
 const returnButton=event.target.closest('[data-knee-return]');if(returnButton){suppressed=true;hideMap();zoneButtons.find(button=>button.dataset.zone==='knee')?.focus();return;}
 const viewButton=event.target.closest('[data-knee-view]');if(viewButton){selectView(viewButton.dataset.kneeView);return;}
 const hotspot=event.target.closest('[data-knee-hotspot]');if(hotspot)selectHotspot(hotspot.dataset.kneeHotspot);
});
mount?.addEventListener('keydown',event=>{
 const viewButton=event.target.closest('[data-knee-view]');if(!viewButton||!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();const index=views.findIndex(view=>view.id===viewButton.dataset.kneeView);const step=event.key==='ArrowRight'?1:-1;const next=views[(index+step+views.length)%views.length];selectView(next.id);mount.querySelector(`[data-knee-view="${next.id}"]`)?.focus();
});
zoneButtons.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{suppressed=false;sync();})));
atlasTabs.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{if(kneeSelected()&&overviewSelected()&&activeHotspot){const spot=hotspots.find(item=>item.id===activeHotspot);if(spot)renderPainDetail(spot);}})));
document.addEventListener('atlas:goto-point',event=>{const detail=event.detail||{};if(detail.zone===ZONE)applyState(ZONE,detail.point,{user:true,focusDetail:true});});
document.addEventListener('atlas:state',event=>{const detail=event.detail||{};applyState(detail.zone,detail.point||null);});
document.addEventListener('atlas:clear-point',event=>{if((event.detail||{}).zone===ZONE)clearHotspot();});

renderMap();sync();
{const params=new URLSearchParams(location.search);if(params.get('zone')===ZONE&&params.get('point'))applyState(ZONE,params.get('point'));}
