const views=[
 {id:'front',label:'Спереду',title:'Передня поверхня'},
 {id:'medial',label:'Зсередини',title:'Медіальна поверхня'},
 {id:'lateral',label:'Ззовні',title:'Латеральна поверхня'},
 {id:'posterior',label:'Ззаду',title:'Задня поверхня'}
];

const hotspots=[
 {id:'anterior-patella',view:'front',x:50,y:46,title:'Навколо або позаду надколінка',location:'Передня частина коліна — центр надколінка та перипателярна зона.',structures:['Пателофеморальний суглоб','Перипателярні м’які тканини','Ретинакулярні структури'],similar:['Сухожилок надколінка','Жирове тіло Гоффа','Сухожилок квадрицепса'],clarify:'Важливі контекст навантаження, біль при сходах або присіданні, набряк, механізм появи симптомів і реакція після активності.'},
 {id:'inferior-patella',view:'front',x:50,y:57,title:'Під надколінком',location:'Нижній полюс надколінка та початок сухожилка надколінка.',structures:['Сухожилок надколінка','Інфрапателярні тканини','Жирове тіло Гоффа'],similar:['Пателофеморальна зона','Проксимальна великогомілкова кістка','Інші передні м’які тканини'],clarify:'Фокусують увагу на точності пальпації, стрибковому навантаженні, присіданні, бігу та зміні симптомів після навантаження.'},
 {id:'superior-patella',view:'front',x:50,y:34,title:'Над надколінком',location:'Верхній полюс надколінка та зона сухожилка квадрицепса.',structures:['Сухожилок квадрицепса','Супрапателярні тканини','Пателофеморальний комплекс'],similar:['Передня частина коліна','М’язово-сухожильна зона квадрицепса'],clarify:'Уточнюють, чи біль локальний при силовому навантаженні, чи є набряк, гострий травматичний механізм або виражена втрата функції.'},
 {id:'medial-joint-line',view:'medial',x:53,y:48,title:'Медіальна суглобова щілина',location:'Внутрішня сторона коліна приблизно на рівні суглобової щілини.',structures:['Медіальний меніск','Медіальна колатеральна зв’язка (MCL)','Медіальний відділ суглоба'],similar:['pes anserinus нижче суглобової щілини','Сухожильні структури медіальної поверхні','Суміжні суглобові тканини'],clarify:'Значення мають механізм травми, набряк, клацання або блокування, нестабільність і точна відстань від суглобової щілини.'},
 {id:'pes-anserinus',view:'medial',x:59,y:66,title:'Нижче й зсередини коліна',location:'Медіальна поверхня проксимальної великогомілкової кістки нижче суглобової щілини.',structures:['pes anserinus: sartorius, gracilis, semitendinosus','Anserine bursa','Медіальна проксимальна tibia'],similar:['Медіальний меніск','MCL','Медіальний відділ колінного суглоба'],clarify:'Ця зона особливо важлива: біль може сприйматися як «біль у коліні», хоча джерелом можуть бути сухожилки та прилегла бурса нижче суглобової щілини.'},
 {id:'lateral-joint-line',view:'lateral',x:48,y:48,title:'Латеральна суглобова щілина',location:'Зовнішня сторона коліна на рівні суглобової щілини.',structures:['Латеральний меніск','Латеральна колатеральна зв’язка (LCL)','Латеральний відділ суглоба','Popliteus'],similar:['Дистальна зона iliotibial band','biceps femoris ближче до головки fibula','Проксимальний tibiofibular joint'],clarify:'Уточнюють точку максимальної болючості, зв’язок із бігом або поворотом, травматичний механізм, набряк і механічні симптоми.'},
 {id:'fibular-head',view:'lateral',x:65,y:63,title:'Біля головки малогомілкової кістки',location:'Латерально й нижче суглобової щілини, в зоні головки fibula.',structures:['biceps femoris tendon','Прикріплення LCL','Проксимальний tibiofibular joint','Common fibular nerve проходить поруч'],similar:['Латеральна суглобова щілина','Popliteus','Інші латеральні сухожильні структури'],clarify:'Корисно відрізняти біль точно в зоні прикріплення сухожилка від болю вище на суглобовій щілині та звертати увагу на неврологічні симптоми.'},
 {id:'posterior-knee',view:'posterior',x:50,y:49,title:'Задня поверхня коліна',location:'Підколінна ділянка між дистальним стегном і проксимальною гомілкою.',structures:['gastrocnemius — медіальна й латеральна головки','Hamstring tendons, зокрема semimembranosus','Popliteus','Задня капсула','Popliteal cyst може бути одним із варіантів'],similar:['Сухожильні структури задньої поверхні','Внутрішньосуглобові причини','Рідше — інші стани, що потребують окремої оцінки'],clarify:'Важливі набряк, відчуття розпирання, травма, обмеження руху, симптоми в литці та системні ознаки.'}
];

const mount=document.getElementById('knee-pain-map');
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
let suppressed=false;

function kneeSelected(){return document.querySelector('[data-zone="knee"]')?.getAttribute('aria-pressed')==='true';}
function overviewSelected(){return document.querySelector('[data-atlas-tab="overview"]')?.getAttribute('aria-selected')==='true';}
function currentView(){return views.find(view=>view.id===activeView)||views[0];}
function currentSpots(){return hotspots.filter(spot=>spot.view===activeView);}
function restoreLegend(){if(legend)legend.innerHTML=originalLegend;}
function painLegend(){if(legend)legend.innerHTML='<span><i class="atlas-dot atlas-dot--active"></i> Обрана точка болю</span><span><i class="atlas-dot"></i> Інші pain-hotspots</span>';}

function diagramFor(view){
 const common='<defs><linearGradient id="boneShade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efe5ca"/><stop offset="1" stop-color="#bcb49f"/></linearGradient></defs>';
 if(view==='front')return `<svg class="knee-diagram" viewBox="0 0 320 420" role="img" aria-label="Схема коліна спереду">${common}<path class="bone" fill="url(#boneShade)" d="M126 24h68l-8 126c22 18 26 48 10 68l-18 13h-36l-18-13c-16-20-12-50 10-68z"/><path class="bone" fill="url(#boneShade)" d="M139 224h42l16 172h-74z"/><path class="bone" fill="url(#boneShade)" d="M207 238h18l14 150h-27z"/><ellipse class="patella" cx="160" cy="199" rx="31" ry="40"/><path class="tendon" d="M160 147v-44M160 240v72"/><path class="joint" d="M124 217q36 18 72 0v16q-36 15-72 0z"/><text x="32" y="56">стегнова кістка</text><text x="30" y="356">tibia</text><text x="232" y="350">fibula</text></svg>`;
 if(view==='medial')return `<svg class="knee-diagram" viewBox="0 0 320 420" role="img" aria-label="Схема медіальної поверхні коліна">${common}<path class="bone" fill="url(#boneShade)" d="M132 25h64l-6 125c24 17 28 48 10 72l-26 14h-42l-17-20c-12-26-4-52 20-67z"/><path class="bone" fill="url(#boneShade)" d="M142 226h46l15 171h-77z"/><ellipse class="patella" cx="111" cy="202" rx="23" ry="34" transform="rotate(-13 111 202)"/><path class="ligament" d="M185 181L194 286"/><path class="tendon" d="M146 286q-28 16-40 42M155 294q-30 15-44 44M164 301q-28 14-40 43"/><text x="208" y="200">MCL</text><text x="40" y="347">pes anserinus</text></svg>`;
 if(view==='lateral')return `<svg class="knee-diagram" viewBox="0 0 320 420" role="img" aria-label="Схема латеральної поверхні коліна">${common}<path class="bone" fill="url(#boneShade)" d="M126 24h65l-5 126c22 18 28 47 11 70l-24 15h-43l-18-19c-13-25-6-52 18-68z"/><path class="bone" fill="url(#boneShade)" d="M139 227h45l13 170h-76z"/><path class="bone" fill="url(#boneShade)" d="M204 239h21l14 149h-29z"/><ellipse class="patella" cx="104" cy="201" rx="22" ry="33" transform="rotate(-12 104 201)"/><path class="ligament" d="M187 183L220 265"/><path class="tendon" d="M244 94q-12 110-28 178"/><text x="221" y="292">fibular head</text><text x="226" y="115">biceps femoris</text></svg>`;
 return `<svg class="knee-diagram" viewBox="0 0 320 420" role="img" aria-label="Схема коліна ззаду">${common}<path class="bone" fill="url(#boneShade)" d="M126 24h68l-9 130c21 19 25 47 9 66l-20 13h-35l-19-13c-15-20-11-49 11-67z"/><path class="bone" fill="url(#boneShade)" d="M139 226h42l15 171h-72z"/><path class="bone" fill="url(#boneShade)" d="M205 239h19l14 149h-28z"/><path class="muscle" d="M102 177q34-33 52 4l-8 93q-42 26-55-14z"/><path class="muscle" d="M218 177q-34-33-52 4l8 93q42 26 55-14z"/><ellipse class="soft" cx="160" cy="220" rx="34" ry="50"/><text x="45" y="165">gastrocnemius</text><text x="196" y="165">gastrocnemius</text></svg>`;
}

function hotspotButtons(){return currentSpots().map(spot=>`<button type="button" class="knee-hotspot" data-knee-hotspot="${spot.id}" aria-pressed="${String(activeHotspot===spot.id)}" style="--x:${spot.x}%;--y:${spot.y}%"><span>${spot.title}</span></button>`).join('');}
function renderMap(){
 if(!mount)return;
 const view=currentView();
 mount.innerHTML=`<header class="knee-map-head"><button type="button" data-knee-return>← Усе тіло</button><div><strong>Коліно · Pain Map</strong><small>${view.title} · натисніть на точну точку болю</small></div><span class="knee-map-badge">v1</span></header><div class="knee-view-switch" role="tablist" aria-label="Ракурс коліна">${views.map(item=>`<button type="button" role="tab" data-knee-view="${item.id}" aria-pressed="${String(item.id===activeView)}">${item.label}</button>`).join('')}</div><div class="knee-stage">${diagramFor(activeView)}${hotspotButtons()}</div><div class="knee-map-rule"><strong>Точка болю ≠ джерело болю</strong><span>Локалізація допомагає звузити анатомічні варіанти, але сама по собі не встановлює діагноз.</span></div>`;
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
 content.innerHTML=`<article class="knee-pain-detail"><p class="knee-detail-kicker">${view?.label||''} · PAIN HOTSPOT</p><h3>${spot.title}</h3><p class="knee-detail-location">${spot.location}</p><div class="knee-rule-card"><strong>Точка болю ≠ джерело болю</strong><p>Карта показує анатомію під точкою та сусідні структури, які можуть давати схожий патерн болю. Це старт для клінічного мислення, а не готовий діагноз.</p></div><div class="knee-detail-grid"><section><h4>Що знаходиться під точкою</h4><ul>${spot.structures.map(item=>`<li>${item}</li>`).join('')}</ul></section><section><h4>Що може давати схожий біль</h4><ul>${spot.similar.map(item=>`<li>${item}</li>`).join('')}</ul></section></div><section class="knee-detail-note"><h4>Що допомагає уточнити</h4><p>${spot.clarify}</p></section><section class="knee-red-flags"><h4>Коли не варто покладатися лише на карту</h4><p>Після значної травми з деформацією або неможливістю опори, при швидкому великому набряку чи «заблокованому» коліні, гарячому червоному набряклому суглобі з температурою, а також при раптовому набряку литки або задишці потрібна очна медична оцінка.</p></section><p class="knee-pain-disclaimer">Карта локалізації не встановлює діагноз і не замінює клінічний огляд. Вона показує можливі анатомічні джерела та диференційні напрямки для подальшої оцінки.</p></article>`;
 requestAnimationFrame(()=>content.classList.remove('is-changing'));
 if(breadcrumbTab)breadcrumbTab.textContent=`Pain Map · ${spot.title}`;
}

function selectHotspot(id){
 const spot=hotspots.find(item=>item.id===id);if(!spot)return;
 activeHotspot=id;renderMap();
 const overview=atlasTabs.find(button=>button.dataset.atlasTab==='overview');
 if(!overviewSelected()&&overview){overview.click();requestAnimationFrame(()=>renderPainDetail(spot));return;}
 renderPainDetail(spot);
}
function selectView(id){
 if(!views.some(view=>view.id===id))return;
 activeView=id;activeHotspot=null;renderMap();
 if(overviewSelected())atlasTabs.find(button=>button.dataset.atlasTab==='overview')?.click();
}

mount?.addEventListener('click',event=>{
 const returnButton=event.target.closest('[data-knee-return]');if(returnButton){suppressed=true;hideMap();return;}
 const viewButton=event.target.closest('[data-knee-view]');if(viewButton){selectView(viewButton.dataset.kneeView);return;}
 const hotspot=event.target.closest('[data-knee-hotspot]');if(hotspot)selectHotspot(hotspot.dataset.kneeHotspot);
});
mount?.addEventListener('keydown',event=>{
 const viewButton=event.target.closest('[data-knee-view]');if(!viewButton||!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();const index=views.findIndex(view=>view.id===viewButton.dataset.kneeView);const step=event.key==='ArrowRight'?1:-1;const next=views[(index+step+views.length)%views.length];selectView(next.id);mount.querySelector(`[data-knee-view="${next.id}"]`)?.focus();
});
zoneButtons.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{suppressed=false;sync();})));
atlasTabs.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{if(kneeSelected()&&overviewSelected()&&activeHotspot){const spot=hotspots.find(item=>item.id===activeHotspot);if(spot)renderPainDetail(spot);}})));
renderMap();sync();
