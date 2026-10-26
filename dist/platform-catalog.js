import {entityRegistry} from './evidence/entities.js?v=54';

// Navigation and teaching order, not scientific Claims or an efficacy graph.
export const areas = [
  {id:'muscle',title:'М’язи та тренування',lab:'Muscle Lab',href:'./muscle-lab.html',group:'atlas',available:true,state:'Навчальний модуль',review:'Науковий перегляд не завершено',description:'Будова м’яза, нерв і кальцій, ріст і атрофія, тренування, сон, старіння й хвороби м’язів.',units:[
    {id:'structure',title:'Від м’яза до молекул',href:'./muscle-lab.html#explorer',entityIds:['TISSUE-SKELETAL-MUSCLE','STRUCT-FASCICLE','CELL-MUSCLE','STRUCT-MYOFIBRIL','STRUCT-SARCOMERE','PRT-ACTIN-MYOSIN']},
    {id:'fiber',title:'М’язове волокно',href:'./muscle-lab.html?structure=CELL-MUSCLE#explorer',entityIds:['CELL-MUSCLE']},
    {id:'contraction',title:'Скорочення м’яза',href:'./muscle-lab.html#contraction',entityIds:['PRT-ACTIN-MYOSIN']},
    {id:'growth',title:'Ріст м’яза',href:'./muscle-lab.html#growth',entityIds:[]},
    {id:'atrophy',title:'Атрофія',href:'./muscle-lab.html#atrophy',entityIds:[]},
    {id:'signal',title:'Нерв → кальцій → скорочення',href:'./muscle-lab.html#signal',entityIds:[]},
    {id:'training',title:'Тренування, їжа, сон для м’язів',href:'./muscle-lab.html#training',entityIds:[]},
    {id:'ageing',title:'Старіння м’язів',href:'./muscle-lab.html#ageing',entityIds:[]},
    {id:'disorders',title:'Хвороби м’язів: де ламається ланцюг',href:'./muscle-lab.html#disorders',entityIds:[]},
    {id:'faq',title:'М’язи: часті питання',href:'./muscle-lab.html#faq',entityIds:[]},
    {id:'sources',title:'Джерела та межі пояснень',href:'./muscle-lab.html#sources',entityIds:[]}
  ]},
  {id:'cell',title:'Клітини та органели',lab:'Cell Lab',href:'./cell-lab.html',group:'atlas',available:true,state:'Навчальний атлас',review:'Формальний науковий перегляд не завершено',description:'Загальна клітина людини, вибір структури, функції та джерела.',units:[
    {id:'general',title:'Загальна клітина',href:'./cell-lab.html#cell-canvas',entityIds:['CELL-GENERAL']},
    {id:'mitochondrion',title:'Мітохондрія',href:'./cell-lab.html?organelle=ORG-MITOCHONDRION#cell-canvas',entityIds:['ORG-MITOCHONDRION']},
    {id:'ribosome',title:'Рибосома',href:'./cell-lab.html?organelle=ORG-RIBOSOME#cell-canvas',entityIds:['ORG-RIBOSOME']},
    {id:'membrane',title:'Плазматична мембрана',href:'./cell-lab.html?organelle=STRUCT-PLASMA-MEMBRANE#cell-canvas',entityIds:['STRUCT-PLASMA-MEMBRANE']},
    {id:'sources',title:'Підручникові джерела',href:'./cell-lab.html#sources',entityIds:[]}
  ]},
  {id:'nutrition',title:'Харчування',lab:'Nutrition Lab',href:'./nutrition.html',group:'nutrition',available:true,state:'Перша навчальна версія',review:'Рівні впевненості не оцінено; науковий перегляд не завершено',description:'Дієти й режими та окремий розділ «Харчування зсередини»: фізіологія й біохімія.',units:[
    {id:'diets',title:'Дієти й режими',href:'./nutrition.html#nutrition-diets',kind:'section',entityIds:[]},
    {id:'inside',title:'Харчування зсередини: фізіологія та біохімія',href:'./nutrition-inside.html',kind:'section',entityIds:[]},
    {id:'enterocyte',title:'Від їжі до клітини',href:'./nutrition-inside.html#nutrition-lab',entityIds:['CELL-ENTEROCYTE']},
    {id:'glucose',title:'Усмоктування глюкози',href:'./nutrition-inside.html?nutrient=glucose#nutrition-lab',entityIds:['TRN-SGLT1','TRN-GLUT2','PRT-NAK-ATPASE']},
    {id:'protein-absorption',title:'Амінокислоти й пептиди',href:'./nutrition-inside.html?nutrient=protein#nutrition-lab',entityIds:['TRN-PEPT1']},
    {id:'lipids',title:'Довголанцюгові жири',href:'./nutrition-inside.html?nutrient=lipids#nutrition-lab',entityIds:['PTH-LIPID-ABSORPTION']},
    {id:'timeline',title:'Нутрієнти у часі',href:'./nutrition-inside.html#nutrient-time',entityIds:[]},
    {id:'digestion',title:'Травлення та всмоктування',href:'./nutrition-digestion.html',entityIds:[]},
    {id:'fat-loss',title:'Жироспалення: куди зникає жир?',href:'./fat-burning.html',kind:'guide',entityIds:[]}
  ]},
  {id:'supplements',title:'Добавки',lab:'Досьє та докази',href:'./supplements.html',group:'evidence',available:true,state:'Креатин і попередні досьє',review:'Впевненість і статус наукового перегляду зазначено для кожного твердження',description:'Наукові пояснення, джерела, практичні орієнтири та обмеження.',units:[
    {id:'creatine',title:'Креатин',href:'./index.html#creatine',entityIds:['MOL-CREATINE']},
    {id:'atp-pcr',title:'Механізм ATP–PCr',href:'./index.html#creatine-mechanism',entityIds:['PTH-ATP-PCR','MOL-ATP','MOL-PHOSPHOCREATINE']},
    ...[['protein','Протеїн'],['caffeine','Кофеїн'],['omega','Омега-3'],['vitd','Вітамін D'],['magnesium','Магній'],['collagen','Колаген'],['beta-alanine','Бета-аланін'],['citrulline','Цитрулін'],['electrolytes','Електроліти'],['berberine','Берберин']].map(([id,title])=>({id,title,href:`./index.html#supplement-${id}`,entityIds:[]}))
  ]},
  {id:'movement',title:'Рух і біомеханіка',lab:'Movement Lab',href:'./movement.html',group:'movement',available:true,state:'Вступний навчальний модуль',review:'Підручникові пояснення; науковий перегляд не завершено',description:'Модель руху, зупинки кроку, важелі та спільна робота м’язів.',units:[
    {id:'elbow',title:'Лікоть: згинання й розгинання',href:'./movement.html#lesson-elbow',entityIds:[]},
    {id:'shoulder',title:'Підйом руки вбік',href:'./movement.html#lesson-shoulder',entityIds:[]},
    {id:'walk',title:'Крокування: рух кількох суглобів',href:'./movement.html#lesson-walk',entityIds:[]},
    {id:'lever',title:'Важелі тіла: момент сили',href:'./movement.html#lever-lab',entityIds:[]},
    {id:'team',title:'Ролі м’язів: агоністи, синергісти, антагоністи',href:'./movement.html#muscle-team',entityIds:[]},
    {id:'questions',title:'Запитання до моделі руху',href:'./movement.html#movement-questions',kind:'guide',entityIds:[]},
    {id:'sources',title:'Джерела та межі моделі',href:'./movement.html#sources',entityIds:[]}
  ]},
  {id:'sleep',title:'Сон і відновлення',lab:'Sleep & Recovery',href:'./sleep.html',group:'recovery',available:true,state:'Перша навчальна версія',review:'Рівні впевненості не оцінено; науковий перегляд не завершено',description:'Фази сну, недосипання й працездатність, умови для якісного відпочинку.',units:[
    {id:'stages',title:'Як влаштований сон',href:'./sleep.html#sleep-stages',entityIds:[]},
    {id:'performance',title:'Сон і працездатність',href:'./sleep.html#sleep-performance',kind:'guide',entityIds:[]},
    {id:'habits',title:'Умови для якісного сну',href:'./sleep.html#sleep-habits',kind:'guide',entityIds:[]},
    {id:'sources',title:'Джерела та межі пояснення',href:'./sleep.html#sources',entityIds:[]}
  ]},
  {id:'metabolism',title:'Metabolism Lab',group:'planned',available:false,state:'Заплановано',description:'Є в плані розвитку; окремого навчального модуля ще немає.',units:[]},
  {id:'comparison',title:'Порівняння доказів',group:'planned',available:false,state:'Заплановано',description:'Майбутнє порівняння конкретних результатів та їхніх обмежень.',units:[]},
  {id:'teacher',title:'Матеріали для викладачів',group:'planned',available:false,state:'Заплановано',description:'Навчальні добірки, перевірені матеріали та завдання.',units:[]},
  {id:'evi',title:'Еві',group:'planned',available:false,state:'Заплановано',description:'Майбутній провідник у межах перевіреної доказової бази.',units:[]}
];
export const learningPaths = [
  {id:'structure',title:'Будова і рух',description:'Послідовність для знайомства зі структурами.',steps:[{areaId:'cell',unitId:'general'},{areaId:'muscle',unitId:'structure'},{areaId:'muscle',unitId:'contraction'}]},
  {id:'energy',title:'Клітина та енергія',description:'Перехід від органели до волокна й окремого механізму.',steps:[{areaId:'cell',unitId:'mitochondrion'},{areaId:'muscle',unitId:'fiber'},{areaId:'supplements',unitId:'atp-pcr'}]},
  {id:'evidence',title:'Харчування і читання доказів',description:'Від навчальної схеми до джерел і розбору конкретної теми.',steps:[{areaId:'nutrition',unitId:'digestion'},{areaId:'supplements',unitId:'protein'},{href:'./protein-meta.html',title:'Розбір метааналізу білка'},{href:'./index.html#evidence-guide-title',title:'Як читати докази'}]}
];
const localLink=href=>/^\.\/[a-z0-9-]+\.html(?:\?[^#\s]*)?(?:#[a-z0-9-]+)?$/.test(href);
export function createCatalog(items=areas,paths=learningPaths,registry=entityRegistry){
  const ids=new Set();
  for(const area of items){
    if(ids.has(area.id))throw Error('Duplicate area: '+area.id);ids.add(area.id);
    if(area.available&&!localLink(area.href))throw Error('Invalid available area link: '+area.id);
    if(!area.available&&area.href)throw Error('Planned area cannot link to a page: '+area.id);
    const units=new Set();for(const unit of area.units){if(units.has(unit.id))throw Error('Duplicate unit: '+unit.id);units.add(unit.id);if(!localLink(unit.href))throw Error('Invalid unit link: '+unit.id);for(const id of unit.entityIds)registry.get(id);}
  }
  const getArea=id=>{const area=items.find(a=>a.id===id);if(!area)throw Error('Unknown area: '+id);return area;};
  const resolveStep=step=>{if(step.areaId){const area=getArea(step.areaId),unit=area.units.find(u=>u.id===step.unitId);if(!area.available||!unit)throw Error('Unresolved learning step');return {...unit,areaId:area.id};}if(!localLink(step.href)||!step.title)throw Error('Invalid learning step');return step;};
  const pathIds=new Set();for(const path of paths){if(pathIds.has(path.id))throw Error('Duplicate path: '+path.id);pathIds.add(path.id);path.steps.forEach(resolveStep);}
  return {areas:items,paths,getArea,resolveStep};
}
export const catalog=createCatalog();
export function learningHref(pathId,index){
  const path=catalog.paths.find(p=>p.id===pathId);
  if(!path||!Number.isInteger(index)||index<0||index>=path.steps.length)throw Error('Unknown learning position');
  const step=catalog.resolveStep(path.steps[index]),url=new URL(step.href,'https://evidence.invalid/');
  url.searchParams.set('path',path.id);url.searchParams.set('lesson',String(index));
  return '.'+url.pathname+url.search+url.hash;
}
export function learningLocation(href){
  const url=new URL(href||'https://evidence.invalid/'),path=catalog.paths.find(p=>p.id===url.searchParams.get('path'));
  const position=url.searchParams.get('lesson');if(!path||position===null||!/^\d+$/.test(position))return null;
  const index=Number(position);if(index>=path.steps.length)return null;
  const step=catalog.resolveStep(path.steps[index]),target=new URL(step.href,url);
  const route=p=>p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'')||'/';
  if(route(url.pathname)!==route(target.pathname)||url.hash!==target.hash)return null;
  return {path,index,step};
}
export function findAreas(query='',group='all'){
  const text=query.trim().toLocaleLowerCase('uk');
  return catalog.areas.filter(a=>a.available&&(group==='all'||a.group===group)&&`${a.title} ${a.lab} ${a.description} ${a.units.map(u=>[u.title,...u.entityIds.map(id=>entityRegistry.get(id).label)].join(' ')).join(' ')}`.toLocaleLowerCase('uk').includes(text));
}
