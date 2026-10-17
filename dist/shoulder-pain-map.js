const views=[
 {id:'front',label:'Спереду',title:'Передня поверхня'},
 {id:'lateral',label:'Збоку',title:'Латеральна поверхня'},
 {id:'posterior',label:'Ззаду',title:'Задня поверхня'}
];

const hotspots=[
 {id:'ac-joint',view:'front',x:62,y:30,title:'Верх плеча · AC-суглоб',location:'Верхня частина плеча в зоні акроміально-ключичного суглоба.',structures:['AC-суглоб','Дистальна ключиця','Акроміон'],similar:['Subacromial зона','Дельтоподібна зона','Гленогумеральні структури'],clarify:'Точна локальна болючість зверху плеча, травма або біль при приведенні руки поперек тіла можуть змінювати клінічну ймовірність, але одна точка не встановлює діагноз.'},
 {id:'bicipital-groove',view:'front',x:62,y:48,title:'Передня борозна плеча',location:'Передня поверхня проксимальної плечової кістки в зоні міжгорбкової борозни.',structures:['Сухожилок: довга голівка біцепса','Міжгорбкова борозна','Rotator cuff interval'],similar:['Передня гленогумеральна зона','Subscapularis','Subacromial структури'],clarify:'Біль попереду плеча може бути пов’язаний із сухожилком довгої голівки біцепса, але він часто співіснує з іншими структурами плечового комплексу.'},
 {id:'anterior-gh',view:'front',x:53,y:42,title:'Передня частина суглоба',location:'Передньо-латеральна зона гленогумерального суглоба.',structures:['Гленогумеральний суглоб','Передня капсула','Subscapularis','Rotator cuff'],similar:['Довга голівка біцепса','Subacromial/subdeltoid region','AC-суглоб'],clarify:'Важливі механізм травми, відчуття нестабільності, обсяг активного й пасивного руху та реакція на навантаження.'},
 {id:'lateral-deltoid',view:'lateral',x:66,y:47,title:'Латеральна дельтоподібна зона',location:'Зовнішня поверхня плеча під акроміоном, де люди часто відчувають біль при підніманні руки.',structures:['Дельтоподібний м’яз','Subacromial/subdeltoid region','Rotator cuff'],similar:['Гленогумеральний суглоб','AC-суглоб','Реферований біль із шийного відділу'],clarify:'Латеральний біль є поширеним патерном при різних shoulder-related станах; сама зона не дозволяє визначити одну конкретну структуру.'},
 {id:'posterior-cuff',view:'posterior',x:63,y:42,title:'Задньо-латеральна зона',location:'Задня частина плеча навколо великого горбка та задньої ротаторної манжети.',structures:['Rotator cuff: infraspinatus, teres minor','Задня капсула','Задня частина гленогумерального комплексу'],similar:['Перискапулярні м’язи','Subacromial зона','Шийний відділ'],clarify:'Контекст зовнішньої ротації, силових рухів, нічного болю, травми та неврологічних симптомів допомагає відрізняти можливі джерела.'},
 {id:'scapular-region',view:'posterior',x:43,y:51,title:'Зона лопатки',location:'Медіальніше плечового суглоба, у над- та міжлопатковій ділянці.',structures:['Лопатка','Перискапулярні м’язи','Suprascapular region'],similar:['Rotator cuff','Шийний відділ хребта','М’язово-фасціальні структури'],clarify:'Біль біля лопатки може виникати локально або бути реферованим; важливі рухи шиї, плеча та супутні неврологічні симптоми.'},
 {id:'cervical-referred',view:'posterior',x:38,y:22,title:'Шия → плече / лопатка',location:'Нижня шийна та надлопаткова зона — патерн, який може віддавати в плече або руку.',structures:['Шийний відділ хребта','Cervical nerve roots','Паравертебральні тканини'],similar:['Локальні структури плеча','Перискапулярна зона','Rotator cuff'],clarify:'реферований біль із шиї стає важливішим у диференціальній оцінці, якщо симптоми починаються в шиї, іррадіюють далі по руці або супроводжуються онімінням, поколюванням чи слабкістю.',kind:'referred'}
];

const mount=document.getElementById('shoulder-pain-map');
const kneeMount=document.getElementById('knee-pain-map');
const wrap=mount?.closest('.atlas-figure-wrap');
const globalFigure=wrap?.querySelector('.atlas-figure');
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
function painLegend(){if(legend)legend.innerHTML='<span><i class="atlas-dot atlas-dot--active"></i> Обрана точка болю</span><span><i class="atlas-dot"></i> Локальна зона</span><span><i class="atlas-dot" style="background:#b889ec;box-shadow:0 0 10px #b889ec"></i> Можливий реферований патерн</span>';}

function diagramFor(view){
 const defs='<defs><linearGradient id="shoulderBone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efe5ca"/><stop offset="1" stop-color="#bcb49f"/></linearGradient></defs>';
 if(view==='front')return `<svg class="shoulder-diagram" viewBox="0 0 360 420" role="img" aria-label="Схема плечового комплексу спереду">${defs}<path class="soft" d="M46 375V132q0-55 51-74l83-28 83 28q51 19 51 74v243Z"/><path class="bone" fill="url(#shoulderBone)" d="M84 105q54-30 96-23 42-7 96 23l-8 19q-54-22-88-15-34-7-88 15Z"/><path class="bone" fill="url(#shoulderBone)" d="M251 122q31 5 43 28l-17 20-30-10-17-22Z"/><circle class="joint" cx="244" cy="161" r="34"/><path class="bone" fill="url(#shoulderBone)" d="M231 184h26l21 183h-68Z"/><path class="cuff" d="M202 143q23-30 55-15M208 159q17 12 33 7"/><path class="tendon" d="M249 132q-5 39-1 104"/><path class="muscle" d="M264 136q48 25 38 84l-35 43-17-53Z"/><text x="208" y="103">clavicle</text><text x="286" y="145">AC</text><text x="274" y="248">deltoid</text><text x="184" y="270">humerus</text></svg>`;
 if(view==='lateral')return `<svg class="shoulder-diagram" viewBox="0 0 360 420" role="img" aria-label="Схема плечового комплексу збоку">${defs}<path class="soft" d="M74 375V95q58-50 137-33 69 15 95 77v236Z"/><path class="bone" fill="url(#shoulderBone)" d="M177 94q50-10 85 25l-13 26-49-12Z"/><circle class="joint" cx="229" cy="162" r="36"/><path class="bone" fill="url(#shoulderBone)" d="M216 187h28l25 180h-77Z"/><path class="cuff" d="M180 140q25-32 61-24M184 157q27 10 52 8"/><path class="muscle" d="M248 128q55 22 54 94l-34 63-26-71Z"/><path class="tendon" d="M232 126q-4 38 0 92"/><text x="263" y="169">deltoid</text><text x="145" y="117">acromion</text><text x="160" y="296">humerus</text></svg>`;
 return `<svg class="shoulder-diagram" viewBox="0 0 360 420" role="img" aria-label="Схема плечового комплексу ззаду">${defs}<path class="soft" d="M45 375V105q31-49 91-61l44-9 44 9q60 12 91 61v270Z"/><path class="bone" fill="url(#shoulderBone)" d="M91 107q51-24 89-20 38-4 89 20l-8 18q-50-17-81-11-31-6-81 11Z"/><path class="bone" fill="url(#shoulderBone)" d="M118 127q44-10 76 21l-19 126-65-40Z"/><path class="bone" fill="url(#shoulderBone)" d="M242 128q35 1 53 28l-17 19-31-9-20-23Z"/><circle class="joint" cx="242" cy="171" r="34"/><path class="bone" fill="url(#shoulderBone)" d="M230 194h25l22 173h-68Z"/><path class="cuff" d="M177 147q31-22 65-9M176 169q33 8 61 12"/><path class="muscle" d="M255 143q43 20 45 77l-30 55-22-66Z"/><path class="nerve" d="M161 35q-10 42 9 74t-3 58"/><text x="92" y="291">scapula</text><text x="260" y="136">posterior cuff</text><text x="117" y="36">cervical</text></svg>`;
}

function hotspotButtons(){return currentSpots().map(spot=>`<button type="button" class="shoulder-hotspot" data-shoulder-hotspot="${spot.id}" data-kind="${spot.kind||'local'}" aria-pressed="${String(activeHotspot===spot.id)}" style="--x:${spot.x}%;--y:${spot.y}%"><span>${spot.title}</span></button>`).join('');}

function renderMap(){
 if(!mount)return;
 const view=currentView();
 mount.innerHTML=`<header class="shoulder-map-head"><button type="button" data-shoulder-return>← Усе тіло</button><div><strong>Плече · Pain Map</strong><small>${view.title} · натисніть на точну зону болю</small></div><span class="shoulder-map-badge">v1</span></header><div class="shoulder-view-switch" role="tablist" aria-label="Ракурс плеча">${views.map(item=>`<button type="button" role="tab" data-shoulder-view="${item.id}" aria-pressed="${String(item.id===activeView)}">${item.label}</button>`).join('')}</div><div class="shoulder-stage">${diagramFor(activeView)}${hotspotButtons()}</div><div class="shoulder-map-rule"><strong>Точка болю ≠ джерело болю</strong><span>Локалізація допомагає побудувати диференціальну карту, але сама по собі не встановлює діагноз. Для плеча особливо важливо відрізняти локальні структури від реферованого болю з шийного відділу.</span></div>`;
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
 content.innerHTML=`<div class="shoulder-pain-detail"><p class="shoulder-detail-kicker">PAIN MAP · ${currentView().title}</p><h3>${spot.title}</h3><p class="shoulder-detail-location">${spot.location}</p><div class="shoulder-rule-card"><strong>Точка болю ≠ джерело болю</strong><p>${typeCopy}</p></div><div class="shoulder-detail-grid"><section><h4>Що тут анатомічно</h4><ul>${spot.structures.map(item=>`<li>${item}</li>`).join('')}</ul></section><section><h4>Що може давати схожий патерн</h4><ul>${spot.similar.map(item=>`<li>${item}</li>`).join('')}</ul></section></div><section class="shoulder-detail-note"><h4>Що допомагає уточнити картину</h4><p>${spot.clarify}</p></section><section class="shoulder-red-flags"><h4>Коли потрібна очна оцінка швидше</h4><p>Гостра травма з деформацією або різкою втратою функції, гаряче червоне набрякле плече з температурою, прогресуюча слабкість чи порушення чутливості, або біль у плечі разом із болем у грудях чи задишкою.</p></section><p class="shoulder-pain-disclaimer">Освітній матеріал. Pain Map допомагає структурувати можливі джерела симптомів, але не є автодіагностикою чи персональною медичною рекомендацією.</p></div>`;
 if(breadcrumbTab)breadcrumbTab.textContent=`Pain Map · ${spot.title}`;
}

function selectHotspot(id){
 const spot=hotspots.find(item=>item.id===id);if(!spot)return;
 activeHotspot=id;renderMap();
 if(!overviewSelected()){
  const overview=atlasTabs.find(button=>button.dataset.atlasTab==='overview');
  if(overview){overview.click();requestAnimationFrame(()=>renderPainDetail(spot));return;}
 }
 renderPainDetail(spot);
}
function selectView(id){
 if(!views.some(view=>view.id===id))return;
 activeView=id;activeHotspot=null;renderMap();
 if(overviewSelected())atlasTabs.find(button=>button.dataset.atlasTab==='overview')?.click();
}

mount?.addEventListener('click',event=>{
 const returnButton=event.target.closest('[data-shoulder-return]');if(returnButton){suppressed=true;activated=false;hideMap();return;}
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

renderMap();sync();
