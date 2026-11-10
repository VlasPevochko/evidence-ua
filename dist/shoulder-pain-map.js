import {shoulderViews as views, shoulderPoints as hotspots, shoulderLabels as labels} from './atlas-points.js?v=1';
import {shoulderDiagram} from './atlas-diagrams.js?v=1';

const ZONE='shoulder';
const mount=document.getElementById('shoulder-pain-map');
const kneeMount=document.getElementById('knee-pain-map');
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
let activated=false;
let suppressed=false;

function shoulderSelected(){return document.querySelector('[data-zone="shoulder"]')?.getAttribute('aria-pressed')==='true';}
function overviewSelected(){return document.querySelector('[data-atlas-tab="overview"]')?.getAttribute('aria-selected')==='true';}
function kneeMapVisible(){return Boolean(kneeMount&&!kneeMount.hidden);}
function currentView(){return views.find(view=>view.id===activeView)||views[0];}
function currentSpots(){return hotspots.filter(spot=>spot.view===activeView);}
function restoreLegend(){if(legend)legend.innerHTML=originalLegend;}
function painLegend(){if(legend)legend.innerHTML='<span><i class="atlas-dot atlas-dot--active"></i> Обрана точка болю</span><span><i class="atlas-dot"></i> Локальна зона</span><span><i class="atlas-dot atlas-dot--referred"></i> Можливий реферований патерн</span>';}
function announce(point,user){document.dispatchEvent(new CustomEvent('atlas:point',{detail:{zone:ZONE,point,title:point?hotspots.find(item=>item.id===point)?.title:null,user}}));}

function labelSpans(){
 const shown=labels.filter(label=>label.view===activeView);
 const lines=shown.filter(label=>label.line).map(label=>`<line x1="${label.line[0]}" y1="${label.line[1]}" x2="${label.line[2]}" y2="${label.line[3]}"/><line class="dot" x1="${label.line[2]}" y1="${label.line[3]}" x2="${label.line[2]}" y2="${label.line[3]}"/>`).join('');
 return `<svg class="map-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>`+shown.map(label=>`<span class="map-label" data-align="${label.align||'left'}" style="--x:${label.x}%;--y:${label.y}%${label.w?`;--w:${label.w}%`:''}" aria-hidden="true">${label.text}</span>`).join('');
}
function hotspotButtons(){return currentSpots().map(spot=>`<button type="button" class="shoulder-hotspot" data-shoulder-hotspot="${spot.id}" data-kind="${spot.kind||'local'}" aria-pressed="${String(activeHotspot===spot.id)}" data-edge="${spot.x>64?'right':spot.x<36?'left':'mid'}" style="--x:${spot.x}%;--y:${spot.y}%"><span>${spot.title}</span></button>`).join('');}

function renderMap(){
 if(!mount)return;
 const focused=document.activeElement;
 const focusAttribute=mount.contains(focused)?['data-shoulder-view','data-shoulder-hotspot','data-shoulder-return'].find(name=>focused.hasAttribute(name)):null;
 const focusValue=focusAttribute?focused.getAttribute(focusAttribute):null;
 const view=currentView();
 mount.innerHTML=`<header class="shoulder-map-head"><button type="button" data-shoulder-return>← Усе тіло</button><div><strong>Плече · карта болю</strong><small>${view.title} · натисніть на точну зону болю</small></div></header><div class="shoulder-view-switch" role="tablist" aria-label="Ракурс плеча">${views.map(item=>`<button type="button" role="tab" data-shoulder-view="${item.id}">${item.label}</button>`).join('')}</div><div class="shoulder-stage">${shoulderDiagram(activeView)}${labelSpans()}${hotspotButtons()}</div><div class="shoulder-map-rule"><strong>Точка болю ≠ джерело болю</strong><span>Локалізація допомагає побудувати диференціальну карту, але сама по собі не встановлює діагноз. Для плеча особливо важливо відрізняти локальні структури від реферованого болю з шийного відділу.</span></div>`;
 mount.querySelectorAll('[data-shoulder-view]').forEach(button=>{
  const selected=button.dataset.shoulderView===activeView;
  button.setAttribute('aria-selected',String(selected));
  button.tabIndex=selected?0:-1;
 });
 if(focusAttribute)mount.querySelector(`[${focusAttribute}="${focusValue}"]`)?.focus();
}

function showMap(){
 if(!mount||!wrap||suppressed||!activated)return;
 mount.hidden=false;wrap.classList.add('is-shoulder-map');
 if(globalFigure)globalFigure.hidden=true;zoneButtons.forEach(button=>button.hidden=true);painLegend();renderMap();
}
function hideMap(){
 if(!mount||!wrap)return;
 mount.hidden=true;wrap.classList.remove('is-shoulder-map');
 if(kneeMapVisible())return;
 if(globalFigure)globalFigure.hidden=false;zoneButtons.forEach(button=>button.hidden=false);restoreLegend();
}
function sync(){if(shoulderSelected()&&overviewSelected()&&activated&&!suppressed)showMap();else hideMap();}

function renderPainDetail(spot){
 if(!content)return;
 const typeCopy=spot.kind==='referred'?'Ця точка позначає не одну тканину плеча, а можливий реферований патерн. Симптоми, що починаються в шиї та йдуть далі по руці, особливо з онімінням, поколюванням або слабкістю, потребують окремої оцінки шийного відділу й нервової системи.':'Це анатомічна зона для навігації. Одна й та сама ділянка болю може відповідати кільком структурам або поєднанню факторів.';
 content.innerHTML=`<div class="shoulder-pain-detail"><button type="button" class="atlas-link-button atlas-topics-back" data-atlas-topics>← Усі теми</button><p class="shoulder-detail-kicker">Карта болю · ${currentView().title}</p><h3 tabindex="-1" data-point-title>${spot.title}</h3><p class="shoulder-detail-location">${spot.location}</p><div class="shoulder-rule-card"><strong>Точка болю ≠ джерело болю</strong><p>${typeCopy}</p></div><div class="shoulder-detail-grid"><section><h4>Що тут анатомічно</h4><ul>${spot.structures.map(item=>`<li>${item}</li>`).join('')}</ul></section><section><h4>Що може давати схожий патерн</h4><ul>${spot.similar.map(item=>`<li>${item}</li>`).join('')}</ul></section></div><section class="shoulder-detail-note"><h4>Що допомагає уточнити картину</h4><p>${spot.clarify}</p></section><section class="shoulder-red-flags"><h4>Коли потрібна очна оцінка швидше</h4><p>Гостра травма з деформацією або різкою втратою функції, гаряче червоне набрякле плече з температурою, прогресуюча слабкість чи порушення чутливості, або біль у плечі разом із болем у грудях чи задишкою.</p></section><p class="shoulder-pain-disclaimer">Освітній матеріал. Карта болю допомагає структурувати можливі джерела симптомів, але не є автодіагностикою чи персональною медичною рекомендацією.</p></div>`;
 if(breadcrumbTab)breadcrumbTab.textContent=`Карта болю · ${spot.title}`;
}

function selectHotspot(id,{user=true,focusDetail=false}={}){
 const spot=hotspots.find(item=>item.id===id);if(!spot)return;
 activeHotspot=id;renderMap();
 const finish=()=>{renderPainDetail(spot);announce(id,user);if(focusDetail)content?.querySelector('[data-point-title]')?.focus({preventScroll:true});};
 if(!overviewSelected()){
  const overview=atlasTabs.find(button=>button.dataset.atlasTab==='overview');
  if(overview){overview.click();requestAnimationFrame(finish);return;}
 }
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
 if(zone!==ZONE){if(activated||activeHotspot){activated=false;activeHotspot=null;}suppressed=false;sync();return;}
 const spot=hotspots.find(item=>item.id===point);
 if(spot){activated=true;suppressed=false;activeView=spot.view;showMap();selectHotspot(spot.id,{user,focusDetail});return;}
 activeHotspot=null;
 if(activated&&!suppressed)renderMap();
 sync();
}

mount?.addEventListener('click',event=>{
 const returnButton=event.target.closest('[data-shoulder-return]');if(returnButton){suppressed=true;activated=false;hideMap();zoneButtons.find(button=>button.dataset.zone==='shoulder')?.focus();return;}
 const viewButton=event.target.closest('[data-shoulder-view]');if(viewButton){selectView(viewButton.dataset.shoulderView);return;}
 const hotspot=event.target.closest('[data-shoulder-hotspot]');if(hotspot)selectHotspot(hotspot.dataset.shoulderHotspot);
});
mount?.addEventListener('keydown',event=>{
 const viewButton=event.target.closest('[data-shoulder-view]');if(!viewButton||!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();const index=views.findIndex(view=>view.id===viewButton.dataset.shoulderView);const step=event.key==='ArrowRight'?1:-1;const next=views[(index+step+views.length)%views.length];selectView(next.id);mount.querySelector(`[data-shoulder-view="${next.id}"]`)?.focus();
});
zoneButtons.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{
 if(button.dataset.zone==='shoulder'){activated=true;suppressed=false;}else{activated=false;suppressed=false;}
 sync();
})));
atlasTabs.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{
 sync();
 if(shoulderSelected()&&overviewSelected()&&activeHotspot){const spot=hotspots.find(item=>item.id===activeHotspot);if(spot)renderPainDetail(spot);}
})));
document.addEventListener('atlas:goto-point',event=>{const detail=event.detail||{};if(detail.zone===ZONE)applyState(ZONE,detail.point,{user:true,focusDetail:true});});
document.addEventListener('atlas:state',event=>{const detail=event.detail||{};applyState(detail.zone,detail.point||null);});
document.addEventListener('atlas:clear-point',event=>{if((event.detail||{}).zone===ZONE)clearHotspot();});

renderMap();sync();
{const params=new URLSearchParams(location.search);if(params.get('zone')===ZONE&&params.get('point'))applyState(ZONE,params.get('point'));}
