import {catalog,learningLocation} from './catalog.mjs';
import {entityRegistry} from '../evidence/core/entities.mjs';
import {painMaps, shoulderTopics, kneeTopics} from '../atlas/points.mjs';

// Navigation metadata only. No new scientific statements, assessments or sources.
const guides=[
 {id:'guide-evidence',title:'Як читати докази',href:'./index.html#evidence-guide-title',areaId:'supplements',kind:'guide'},
 {id:'guide-protein-meta',title:'Розбір метааналізу білка',href:'./protein-meta.html',areaId:'supplements',kind:'guide'},
 {id:'guide-glossary',title:'Словник термінів',href:'./glossary.html',areaId:'supplements',kind:'guide'},
 {id:'guide-compare',title:'Порівняння добавок',href:'./compare.html',areaId:'supplements',kind:'guide'},
 {id:'guide-map',title:'Карта знань',href:'./map.html',areaId:'supplements',kind:'guide'},
 {id:'guide-videos',title:'Відео від читачів',href:'./videos.html',areaId:'supplements',kind:'guide'},
 {id:'guide-changes',title:'Що нового й що перевірено',href:'./changes.html',areaId:'supplements',kind:'guide'},
 {id:'guide-research',title:'Дослідження простими словами',href:'./research.html',areaId:'supplements',kind:'guide'},
 {id:'guide-mechanisms',title:'Як це працює: анімовані схеми',href:'./mechanisms.html',areaId:'supplements',kind:'guide'}
];
// Атлас (рішення власника 2026-11-10, п. 6): пошук знаходить зони й теми Атласу за словами «плече», «коліно», «хребет», «мозок», «ротаторна манжета» тощо.
// Це лише навігація (назви зон і тем, які вже є на сторінці Атласу); нових тверджень немає. Теми ведуть до своєї точки карти болю, де вона є.
const atlasZones=[
 ['brain','Мозок','мозок мозку нервова система когнітивні функції сон стрес увага кофеїн нейрон нейрони синапс мозочок гіпоталамус стовбур кора великі півкулі'],
 ['shoulder','Плече','плече плеча плечовий суглоб плечовий комплекс ротаторна манжета біль у плечі акроміон ключиця лопатка дельтоподібний м’яз карта болю точка болю'],
 ['spine','Хребет','хребет хребта спина постава біль у спині поперек шия шийний грудний поперековий відділ крижі куприк 3D модель'],
 ['muscles','М’язи','м’язи м’язова система сила гіпертрофія відновлення вправи'],
 ['gut','ШКТ','шкт шлунково-кишковий тракт кишківник травлення мікробіом клітковина харчування рот стравохід шлунок тонка кишка товста кишка пряма кишка всмоктування лактоза лактаза непереносимість ферментація печінка жовчний міхур підшлункова'],
 ['knee','Коліно','коліно коліна колінний суглоб надколінок меніск зв’язки біль у коліні карта болю точка болю']
];
const atlasTopicTerms={
 'Ротаторна манжета':'ротаторна манжета надостьовий підостьовий плече',
 'Субакроміальний біль':'субакроміальний біль акроміон плече імпінджмент',
 'Нестабільність плеча':'нестабільність вивих плече',
 'Біцепс':'біцепс довга головка сухожилок плече',
 'AC-суглоб':'ac суглоб акроміально-ключичний ключиця плече',
 'Пателофеморальний біль':'пателофеморальний біль надколінок коліно',
 'Меніски':'меніск меніски коліно травма',
 'Передня хрестоподібна зв’язка':'acl передня хрестоподібна зв’язка коліно спорт',
 'Сухожилок надколінка':'сухожилок надколінка стрибки коліно тендинопатія',
 'Остеоартроз коліна':'остеоартроз артроз коліно суглоб'
};
const atlasMaterials=[
 ...atlasZones.map(([zone,name])=>({id:'atlas-zone-'+zone,title:name+' в Атласі',href:'./atlas.html?zone='+zone})),
 ...[['shoulder','Плече',shoulderTopics],['knee','Коліно',kneeTopics]].flatMap(([zone,name,topics])=>topics.map(topic=>({id:'atlas-topic-'+zone+'-'+(topic.point||topic.title.toLowerCase()),title:name+': '+(/^[A-ZА-ЯІЇЄҐ]{2}/.test(topic.title)?topic.title:topic.title.charAt(0).toLowerCase()+topic.title.slice(1)),href:'./atlas.html?zone='+zone+(topic.point?'&point='+topic.point:'')})))
].map(item=>({...item,areaId:'atlas',areaTitle:'Атлас',group:'atlas',kind:'interactive',review:['atlas-zone-brain','atlas-zone-gut'].includes(item.id)?'Навчальна бета. Науковий перегляд не завершено; рівні впевненості не присвоєно.':'Навігація до матеріалів; статус наукового перегляду зазначено окремо'}));
export const atlasSearchTerms={
 'navigation-atlas':'атлас людське тіло анатомія карта болю',
 ...Object.fromEntries(atlasZones.map(([zone,,terms])=>['atlas-zone-'+zone,terms])),
 ...Object.fromEntries([['shoulder',shoulderTopics],['knee',kneeTopics]].flatMap(([zone,topics])=>topics.map(topic=>['atlas-topic-'+zone+'-'+(topic.point||topic.title.toLowerCase()),atlasTopicTerms[topic.title]||''])))
};
const navigationMaterials=[
 {id:'navigation-atlas',title:'Атлас людського тіла',href:'./atlas.html',areaId:'atlas',areaTitle:'Атлас',group:'atlas',kind:'interactive'},
 {id:'navigation-exercises',title:'Бібліотека вправ',href:'./exercises.html',areaId:'exercises',areaTitle:'Вправи та практика',group:'movement',kind:'section'},
 {id:'navigation-about',title:'Про проєкт',href:'./about.html',areaId:'about',areaTitle:'Про сайт',group:'evidence',kind:'section'}
].map(m=>({...m,review:'Навігація до матеріалів; статус наукового перегляду зазначено окремо'}));
export const materialKinds={interactive:'Інтерактив',dossier:'Досьє',guide:'Розбір',section:'Матеріал'};
const listedMaterials=catalog.areas.filter(a=>a.available).flatMap(area=>{
 const units=area.units.length?area.units:[{id:area.id,title:area.title,href:area.href,entityIds:[]}];
 return units.map(unit=>({id:area.id+'-'+unit.id,title:unit.title,href:unit.href,areaId:area.id,areaTitle:area.title,review:area.review,group:area.group,kind:unit.kind||(area.id==='supplements'?(unit.id==='atp-pcr'?'interactive':'dossier'):unit.id==='sources'?'section':'interactive')}));
});
const structureMaterials=[
 {areaId:'muscle',file:'muscle-lab',param:'structure',hash:'explorer',ids:['TISSUE-SKELETAL-MUSCLE','STRUCT-FASCICLE','CELL-MUSCLE','STRUCT-MYOFIBRIL','STRUCT-SARCOMERE','PRT-ACTIN-MYOSIN']},
 {areaId:'cell',file:'cell-lab',param:'organelle',hash:'cell-canvas',ids:['ORG-NUCLEUS','ORG-NUCLEOLUS','ORG-MITOCHONDRION','ORG-RIBOSOME','ORG-ROUGH-ER','ORG-SMOOTH-ER','ORG-GOLGI','ORG-LYSOSOME','ORG-PEROXISOME','STRUCT-CYTOSKELETON','STRUCT-PLASMA-MEMBRANE']}
].flatMap(config=>config.ids.map(id=>{const area=catalog.getArea(config.areaId);return {id:config.areaId+'-'+id.toLowerCase(),title:entityRegistry.get(id).label,href:`./${config.file}.html?${config.param}=${id}#${config.hash}`,areaId:area.id,areaTitle:area.title,review:area.review,group:area.group,kind:'interactive'};})).filter(m=>!listedMaterials.some(old=>old.href===m.href));
export const materials=listedMaterials.concat(structureMaterials,navigationMaterials,atlasMaterials,guides.map(g=>({...g,areaTitle:catalog.getArea(g.areaId).title,review:catalog.getArea(g.areaId).review,group:'evidence'})));
export const normalizeSearch=text=>String(text||'').toLocaleLowerCase('uk').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').trim().slice(0,120);
// Пошук за ключовими словами (рішення власника 2026-11-01: «чому воно не шукає по ключовим словам?»).
// Раніше всі слова запиту мусили стояти в назві матеріалу, тож «як пити креатин» не знаходило нічого: «як» і «пити» там немає.
// Тепер службові слова («як», «що», «чи», «для»…) відкидаються, решта слів шукається в назві, у словах для пошуку, у назві напрямку й у виді матеріалу;
// слово знаходить і свої відмінки (креатин, креатину), а результати стоять за кількістю й вагою збігів. Це лише навігація: нових тверджень пошук не робить.
export const STOP_WORDS=new Set(['як','що','чи','де','коли','чому','який','яка','яке','які','яких','якого','яку','таке','такий','така','такі','для','при','про','від','до','на','в','у','і','й','та','а','або','це','цей','ця','ці','той','те','то','за','з','із','зі','по','під','над','між','без','не','ні','є','бути','мені','мене','можна','треба','потрібно','скільки','чим','кого','мій','свій','саме','тільки','також']);
// Поля матеріалів не обрізаємо (normalizeSearch лишає лише 120 літер, і це добре для запиту, але довгі списки слів для пошуку втрачали б кінець).
const foldText=text=>String(text||'').toLocaleLowerCase('uk').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').trim().replace(/'/g,'');
const tokensOf=text=>foldText(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
// Основа слова: відкидаємо до двох літер закінчення, щоб «креатину» знаходило «креатин» (більше не можна: «інтервал» без трьох літер збігався б з «інтерактив»). Короткі слова (до 3 літер) шукаємо як є.
const stemOf=word=>word.length>=6?word.slice(0,-2):word.length>=4?word.slice(0,-1):word;
export function searchKeywords(query){
  const words=foldText(normalizeSearch(query)).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const keys=words.filter(word=>!STOP_WORDS.has(word));
  return keys.length?keys:words;
}
// 2 — слово починає слово поля (так працює й набір «на льоту»: «креа» знаходить «креатин»), або основа слова починає його відмінок («креатину» → «креатин»);
// 1 — основа (від 5 літер) є всередині довшого слова (так «креатин» знаходить «фосфокреатин»); 0 — немає. Коротка основа (3 літери) годиться лише для слів
// такої самої довжини, щоб «пити» не знаходило «питання». Слова до 3 літер шукаються точно.
function hitField(word,field){
  if(word.length<3)return field.tokens.includes(word)?2:0;
  const stem=stemOf(word);
  if(field.tokens.some(token=>token.startsWith(word)||(stem.length>=4?token.startsWith(stem):token.startsWith(stem)&&token.length<=word.length+2)))return 2;
  return stem.length>=5&&field.text.includes(stem)?1:0;
}
// fields: [[вага, текст], …]. Кожне ключове слово дає вагу свого найкращого збігу; matched — скільки слів запиту знайдено.
export function scoreFields(keys,fields){
  const prepared=fields.map(([weight,text])=>({weight,text:foldText(text),tokens:tokensOf(text)}));
  let score=0,matched=0;
  for(const key of keys){let best=0;for(const field of prepared){const hit=hitField(key,field);if(hit)best=Math.max(best,field.weight*hit);}if(best){score+=best;matched++;}}
  return {score,matched};
}
// Для запиту з кількох слів досить половини збігів (округлено вгору): «як пити креатин» → «пити» й «креатин», знайдено «креатин» — цього досить.
export const enoughMatches=(matched,total)=>matched>=Math.max(1,Math.ceil(total/2));
// Alternative topic names for discovery only; scientific content is not changed.
const searchTerms={
 'navigation-exercises':'вправи вправа бібліотека практика рухові практики',
 'supplements-protein':'білок білка білки білкові протеїнові protein сила безжирова маса',
 'supplements-creatine':'креатину сила силу безжирова маса нирки креатинін витривалість пам’ять пити приймати прийом доза дозування',
 'supplements-caffeine':'кофеїну кава енергетики витривалість сила сон сном тиск вагітність',
 'supplements-magnesium':'магнію судоми судом тиск сон сном безсоння діарея',
 'supplements-collagen':'колагену суглоби коліна остеоартрит сухожилля шкіра',
 'supplements-beta-alanine':'бета аланін карнозин поколювання витривалість',
 'supplements-citrulline':'цитруліну біль у м’язах витривалість сила',
 'supplements-electrolytes':'електролітів натрій вода рідина зневоднення спортивний напій гіпонатріємія',
 'supplements-berberine':'берберин берберину berberine цукор глюкоза діабет холестерин ліпіди',
 'nutrition-protein-absorption':'білок білка білки білкові засвоєння білка',
 'guide-protein-meta':'білок білка білки білкові',
 'guide-videos':'відео ролик youtube ютуб instagram tiktok запропонувати надіслати посилання бібліотека відео',
 'guide-mechanisms':'як це працює механізм схема анімація кофеїн аденозин рецептор креатин фосфокреатин атф енергія м’яз бадьорість сонливість',
 'navigation-about':'про проєкт про сайт методика довіра застереження діагноз лікування лікар реклама рецензія рецензент незалежний перегляд помилки виправлення журнал приватність cookies куки дані відгук',
 'guide-research':'дослідження простими словами розбір мета-аналіз кроки сон дієта DASH кето середземноморська вагітність алкоголь вино підходи тренування коротко відповідь',
 'guide-changes':'оновлення зміни новини журнал що нового історія перевірки як ми перевіряємо',
 'guide-map':'карта знань схема зв’язки між темами навігація як пов’язані матеріали',
 'guide-compare':'порівняння порівняти добавки поруч два досьє кофеїн креатин магній різниця',
 'guide-glossary':'словник терміни глосарій значення слів що означає ДІ РКД GRADE інтервал',
 'cell-mitochondrion':'енергія енергії енергетичний атф ATP мітохондрії',
 'supplements-atp-pcr':'енергія енергії енергетичний атф ATP фосфокреатин',
 'nutrition-glucose':'вуглеводи вуглеводів цукор цукру засвоєння',
 'nutrition-lipids':'жир жири жирів ліпіди засвоєння',
 'muscle-growth':'гіпертрофія гіпертрофії ріст рости росте ростуть м’язів збільшення м’язів',
 'muscle-atrophy':'втрата м’язів зменшення м’язів',
 'muscle-signal':'нерв мотонейрон ацетилхолін кальцій тропонін тріада ретикулум serca атф розслаблення',
 'muscle-training':'тренування силові підходи обсяг відмова вага кардіо витривалість білок вуглеводи сон гіпертрофія',
 'muscle-ageing':'старіння літні 60 70 років саркопенія сила вік',
 'muscle-disorders':'хвороби м’язів міастенія бас als дистрофія дистрофії каналопатії кахексія саркопенія слабкість',
 'muscle-faq':'м’язова пам’ять крепатура біль після тренування відмова igf-1 mtor питання',
 'supplements-omega':'омега 3 omega-3 риб’ячий жир тригліцериди серце фібриляція',
 'supplements-vitd':'вітамін д vitamin d переломи кістки падіння інфекції застуда',
 'nutrition-diets':'дієта дієти режим харчування середземноморська dash кетогенна кето низьковуглеводна високобілкова вегетаріанська веганська інтервальне голодування',
 'nutrition-digestion':'травлення їжі перетравлення засвоєння',
 'nutrition-fat-loss':'жироспалення спалювання жиру fat burning fat loss схуднення схуднути худнути жир жирів ліполіз окиснення жирової маси',
 'movement-elbow':'лікоть ліктя біцепс згинання розгинання',
 'movement-shoulder':'плече плеча рука відведення приведення',
 'movement-walk':'крок крокування ходьба суглоби коліно',
 'movement-lever':'важіль важелі плече момент сили вантаж відстань маса',
 'movement-team':'агоніст синергіст антагоніст стабілізатор біцепс трицепс команда м’язів',
 'movement-questions':'запитання завдання перевір себе біомеханіка рух',
 'sleep-stages':'фази стадії сну nrem rem циркадний ритм',
 'sleep-performance':'недосипання недосип сонливість втома працездатність спати висипатися',
 'sleep-habits':'звички режим кофеїн світло відпочинок спати засинати безсоння'
};
// Порожній запит дає всі матеріали в порядку каталогу. Інакше матеріали стоять за вагою збігів: назва (4) > слова для пошуку (3) > назва напрямку (2) > вид матеріалу (1);
// назва, що починається з усього запиту, піднімається вище («Кофеїн» перед «Про сон і кофеїн»).
Object.assign(searchTerms,atlasSearchTerms);
export function findMaterials(query='',group='all'){
 const keys=searchKeywords(query),whole=foldText(normalizeSearch(query)),inGroup=m=>group==='all'||m.group===group;
 if(!keys.length)return materials.filter(inGroup);
 return materials.map((m,index)=>({m,index,...scoreFields(keys,[[4,m.title],[3,searchTerms[m.id]],[2,m.areaTitle],[1,materialKinds[m.kind]]])}))
  .filter(x=>inGroup(x.m)&&x.score>0&&enoughMatches(x.matched,keys.length))
  .map(x=>({...x,score:x.score+(whole&&foldText(x.m.title).startsWith(whole)?3:0)}))
  .sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.m);
}
export function materialContext(href){
 const url=new URL(href),route=p=>p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'')||'/';
 const matches=materials.filter(m=>{const target=new URL(m.href,url);return route(target.pathname)===route(url.pathname)&&target.hash===url.hash&&[...target.searchParams].every(([key,value])=>url.searchParams.get(key)===value);});
 const exact=matches.sort((a,b)=>new URL(b.href,url).searchParams.size-new URL(a.href,url).searchParams.size)[0];if(exact)return exact;
 if(route(url.pathname)==='/')return /^#creatine-/.test(url.hash)||url.hash==='#evidence-card'?materials.find(m=>m.id==='supplements-creatine'):null;
 return materials.find(m=>{const target=new URL(m.href,url);return route(target.pathname)===route(url.pathname)&&!target.hash;})||materials.find(m=>route(new URL(m.href,url).pathname)===route(url.pathname))||null;
}
// Small navigation allowlists mirror exercises-data.js and the Atlas zone picker.
// Regression tests check the known values without loading either UI in the browser.
// Free-text library search (q) is deliberately excluded from shared URLs for privacy.
const exerciseShareRules={
 e:new Set(['tyaha-hanteli-v-nahili','tyaha-hanteli-v-nahyli','kontrol-lopatky','rotatorna-manzheta-kompleks','kompleks-rotatornoyi-manzhety','mobilnist-plecha-lopatky','hrudy-plechovyi-poyas','progresiya-kontrolyu-lopatky','spyna-mobilnist-kompleks','sylovyi-kompleks-spyna','animal-flow-mobilnist','animal-flow-intehrovanyi-rukh','rukhovyi-kompleks-navychky','test-koordinatsiyi']),
 region:new Set(['shoulder','scapula','upper_back','elbow','chest','spine','full_body']),
 type:new Set(['strength','mobility','movement_control','coordination','rehab_practice','screen_or_test']),
 pattern:new Set(['horizontal_pull','scapular_control','shoulder_rotation','multiplanar_mobility','coordination_balance']),
 equipment:new Set(['dumbbell']),view:new Set(['type']),sort:new Set(['title'])
};
const atlasShareRules={zone:new Set(['brain','shoulder','spine','muscles','gut','knee']),tab:new Set(['overview','anatomy','symptoms','training','rehab','research']),point:new Set(Object.values(painMaps).flatMap(map=>map.points.map(point=>point.id)))};
export function contextLink(href){
 const original=new URL(href),clean=new URL(original.pathname,original.origin),route=original.pathname.replace(/\.html$/,'').replace(/\/$/,'');
 const rules=route.endsWith('/exercises')?exerciseShareRules:route.endsWith('/atlas')?atlasShareRules:route.endsWith('/muscle-lab')?{structure:/^(TISSUE-SKELETAL-MUSCLE|STRUCT-FASCICLE|CELL-MUSCLE|STRUCT-MYOFIBRIL|STRUCT-SARCOMERE|PRT-ACTIN-MYOSIN)$/,level:/^(school|university|advanced)$/,tab:/^(description|function|sources)$/}:route.endsWith('/cell-lab')?{organelle:/^(ORG-(NUCLEUS|NUCLEOLUS|MITOCHONDRION|RIBOSOME|ROUGH-ER|SMOOTH-ER|GOLGI|LYSOSOME|PEROXISOME)|STRUCT-(PLASMA-MEMBRANE|CYTOSKELETON))$/,level:/^(school|university|advanced)$/,tab:/^(function|sources)$/}:(route.endsWith('/nutrition')||route.endsWith('/nutrition-inside'))?{nutrient:/^(glucose|protein|lipids)$/,step:/^[0-3]$/,depth:/^(simple|detailed)$/,scale:/^(body|cell)$/,structure:/^(sglt1|glut2|pump|pept1|micelle|chylomicron)$/}:{};
 for(const [key,rule] of Object.entries(rules)){const value=original.searchParams.get(key);if(value&&(rule instanceof Set?rule.has(value):rule.test(value)))clean.searchParams.set(key,value);}
 const hashes=new Set(['#top','#start-here','#home-learning-paths','#home-feedback','#categories','#cards','#supplement-library','#pubmed-live','#evidence-card','#explorer','#sources',...materials.map(m=>new URL(m.href,original).hash)]);
 if(hashes.has(original.hash)||/^#creatine-(short|mechanism|evidence|dosing|kidney|myths|sources|review)$/.test(original.hash))clean.hash=original.hash;
 const position=learningLocation(original.href);if(position){clean.searchParams.set('path',position.path.id);clean.searchParams.set('lesson',String(position.index));clean.hash=new URL(position.step.href,original).hash;}
 return clean.href;
}
