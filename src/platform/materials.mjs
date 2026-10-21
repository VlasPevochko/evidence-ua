import {catalog,learningLocation} from './catalog.mjs';
import {entityRegistry} from '../evidence/core/entities.mjs';

// Navigation metadata only. No new scientific statements, assessments or sources.
const guides=[
 {id:'guide-evidence',title:'Як читати докази',href:'./index.html#evidence-guide-title',areaId:'supplements',kind:'guide'},
 {id:'guide-protein-meta',title:'Розбір метааналізу білка',href:'./protein-meta.html',areaId:'supplements',kind:'guide'},
 {id:'guide-glossary',title:'Словник термінів',href:'./glossary.html',areaId:'supplements',kind:'guide'},
 {id:'guide-compare',title:'Порівняння добавок',href:'./compare.html',areaId:'supplements',kind:'guide'},
 {id:'guide-map',title:'Карта знань',href:'./map.html',areaId:'supplements',kind:'guide'},
 {id:'guide-changes',title:'Що нового й що перевірено',href:'./changes.html',areaId:'supplements',kind:'guide'}
];
export const materialKinds={interactive:'Інтерактив',dossier:'Досьє',guide:'Розбір',section:'Матеріал'};
const listedMaterials=catalog.areas.filter(a=>a.available).flatMap(area=>{
 const units=area.units.length?area.units:[{id:area.id,title:area.title,href:area.href,entityIds:[]}];
 return units.map(unit=>({id:area.id+'-'+unit.id,title:unit.title,href:unit.href,areaId:area.id,areaTitle:area.title,review:area.review,group:area.group,kind:unit.kind||(area.id==='supplements'?(unit.id==='atp-pcr'?'interactive':'dossier'):unit.id==='sources'?'section':'interactive')}));
});
const structureMaterials=[
 {areaId:'muscle',file:'muscle-lab',param:'structure',hash:'explorer',ids:['TISSUE-SKELETAL-MUSCLE','STRUCT-FASCICLE','CELL-MUSCLE','STRUCT-MYOFIBRIL','STRUCT-SARCOMERE','PRT-ACTIN-MYOSIN']},
 {areaId:'cell',file:'cell-lab',param:'organelle',hash:'cell-canvas',ids:['ORG-NUCLEUS','ORG-NUCLEOLUS','ORG-MITOCHONDRION','ORG-RIBOSOME','ORG-ROUGH-ER','ORG-SMOOTH-ER','ORG-GOLGI','ORG-LYSOSOME','ORG-PEROXISOME','STRUCT-CYTOSKELETON','STRUCT-PLASMA-MEMBRANE']}
].flatMap(config=>config.ids.map(id=>{const area=catalog.getArea(config.areaId);return {id:config.areaId+'-'+id.toLowerCase(),title:entityRegistry.get(id).label,href:`./${config.file}.html?${config.param}=${id}#${config.hash}`,areaId:area.id,areaTitle:area.title,review:area.review,group:area.group,kind:'interactive'};})).filter(m=>!listedMaterials.some(old=>old.href===m.href));
export const materials=listedMaterials.concat(structureMaterials,guides.map(g=>({...g,areaTitle:catalog.getArea(g.areaId).title,review:catalog.getArea(g.areaId).review,group:'evidence'})));
export const normalizeSearch=text=>String(text||'').toLocaleLowerCase('uk').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').trim().slice(0,120);
// Alternative topic names for discovery only; scientific content is not changed.
const searchTerms={
 'supplements-protein':'білок білка білки білкові протеїнові protein',
 'supplements-berberine':'берберин берберину berberine цукор глюкоза діабет холестерин ліпіди',
 'nutrition-protein-absorption':'білок білка білки білкові засвоєння білка',
 'guide-protein-meta':'білок білка білки білкові',
 'guide-changes':'оновлення зміни новини журнал що нового історія перевірки як ми перевіряємо',
 'guide-map':'карта знань схема зв’язки між темами навігація як пов’язані матеріали',
 'guide-compare':'порівняння порівняти добавки поруч два досьє кофеїн креатин магній різниця',
 'guide-glossary':'словник терміни глосарій значення слів що означає ДІ РКД GRADE інтервал',
 'cell-mitochondrion':'енергія енергії енергетичний атф ATP мітохондрії',
 'supplements-atp-pcr':'енергія енергії енергетичний атф ATP фосфокреатин',
 'nutrition-glucose':'вуглеводи вуглеводів цукор цукру засвоєння',
 'nutrition-lipids':'жир жири жирів ліпіди засвоєння',
 'muscle-growth':'гіпертрофія гіпертрофії ріст м’язів збільшення м’язів',
 'muscle-atrophy':'втрата м’язів зменшення м’язів',
 'supplements-omega':'омега 3 omega-3',
 'supplements-vitd':'вітамін д vitamin d',
 'nutrition-digestion':'травлення їжі перетравлення засвоєння',
 'nutrition-fat-loss':'жироспалення спалювання жиру fat burning fat loss схуднення жир жирів ліполіз окиснення жирової маси',
 'movement-elbow':'лікоть ліктя біцепс згинання розгинання',
 'movement-shoulder':'плече плеча рука відведення приведення',
 'movement-walk':'крок крокування ходьба суглоби коліно',
 'movement-lever':'важіль важелі плече момент сили вантаж відстань маса',
 'movement-team':'агоніст синергіст антагоніст стабілізатор біцепс трицепс команда м’язів',
 'movement-questions':'запитання завдання перевір себе біомеханіка рух',
 'sleep-stages':'фази стадії сну nrem rem циркадний ритм',
 'sleep-performance':'недосипання недосип сонливість втома працездатність',
 'sleep-habits':'звички режим кофеїн світло відпочинок'
};
export function findMaterials(query='',group='all'){
 const words=normalizeSearch(query).split(' ').filter(Boolean);
 return materials.filter(m=>{
  const text=normalizeSearch(m.title+' '+m.areaTitle+' '+materialKinds[m.kind])+' '+normalizeSearch(searchTerms[m.id]);
  return (group==='all'||m.group===group)&&words.every(w=>text.includes(w));
 });
}
export function materialContext(href){
 const url=new URL(href),route=p=>p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'')||'/';
 const matches=materials.filter(m=>{const target=new URL(m.href,url);return route(target.pathname)===route(url.pathname)&&target.hash===url.hash&&[...target.searchParams].every(([key,value])=>url.searchParams.get(key)===value);});
 const exact=matches.sort((a,b)=>new URL(b.href,url).searchParams.size-new URL(a.href,url).searchParams.size)[0];if(exact)return exact;
 if(route(url.pathname)==='/')return /^#creatine-/.test(url.hash)||url.hash==='#evidence-card'?materials.find(m=>m.id==='supplements-creatine'):null;
 return materials.find(m=>{const target=new URL(m.href,url);return route(target.pathname)===route(url.pathname)&&!target.hash;})||materials.find(m=>route(new URL(m.href,url).pathname)===route(url.pathname))||null;
}
export function contextLink(href){
 const original=new URL(href),clean=new URL(original.pathname,original.origin),route=original.pathname.replace(/\.html$/,'').replace(/\/$/,'');
 const rules=route.endsWith('/muscle-lab')?{structure:/^(TISSUE-SKELETAL-MUSCLE|STRUCT-FASCICLE|CELL-MUSCLE|STRUCT-MYOFIBRIL|STRUCT-SARCOMERE|PRT-ACTIN-MYOSIN)$/,level:/^(school|university|advanced)$/,tab:/^(description|function|sources)$/}:route.endsWith('/cell-lab')?{organelle:/^(ORG-(NUCLEUS|NUCLEOLUS|MITOCHONDRION|RIBOSOME|ROUGH-ER|SMOOTH-ER|GOLGI|LYSOSOME|PEROXISOME)|STRUCT-(PLASMA-MEMBRANE|CYTOSKELETON))$/,level:/^(school|university|advanced)$/,tab:/^(function|sources)$/}:route.endsWith('/nutrition')?{nutrient:/^(glucose|protein|lipids)$/,step:/^[0-3]$/,depth:/^(simple|detailed)$/,scale:/^(body|cell)$/,structure:/^(sglt1|glut2|pump|pept1|micelle|chylomicron)$/}:{};
 for(const [key,rule] of Object.entries(rules)){const value=original.searchParams.get(key);if(value&&rule.test(value))clean.searchParams.set(key,value);}
 const hashes=new Set(['#top','#start-here','#home-learning-paths','#home-feedback','#categories','#cards','#supplement-library','#pubmed-live','#evidence-card','#explorer','#sources',...materials.map(m=>new URL(m.href,original).hash)]);
 if(hashes.has(original.hash)||/^#creatine-(short|mechanism|evidence|dosing|kidney|myths|sources|review)$/.test(original.hash))clean.hash=original.hash;
 const position=learningLocation(original.href);if(position){clean.searchParams.set('path',position.path.id);clean.searchParams.set('lesson',String(position.index));}
 return clean.href;
}
