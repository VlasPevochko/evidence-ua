import {entityRegistry} from './evidence/entities.js?v=56';
import {createEvidenceBase} from './evidence/registry.js?v=56';
export const moduleMeta={id:'MOD-CELL-GENERAL-001',version:'1.0',lastChecked:'2026-10-11',lastReviewed:null,status:'Навчальна версія · формальний науковий перегляд не завершено'};
const sourceDefinitions=[
 {id:'SRC-CELL-TEXT-001',title:'OpenStax · Cytoplasm and Cellular Organelles',publicationType:'textbook',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/3-2-the-cytoplasm-and-cellular-organelles',scope:'Базова будова й функції органел; навчальний текст, не дослідження клінічного ефекту.'},
 {id:'SRC-CELL-TEXT-002',title:'OpenStax · Nucleus and DNA Replication',publicationType:'textbook',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/3-3-the-nucleus-and-dna-replication',scope:'Ядро, ядерце та відмінності між клітинами людини.'},
 {id:'SRC-CELL-TEXT-003',title:'OpenStax · Cell Membrane',publicationType:'textbook',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/3-1-the-cell-membrane',scope:'Ліпідний бішар і вибірковий транспорт через мембрану.'}
];
export const sources=sourceDefinitions.map(s=>({...s,publicationType:'textbook_chapter',year:2022,shortCitation:'OpenStax · Anatomy and Physiology 2e',identifiers:{},sourceStatus:'not_checked',lastChecked:'2026-10-11',methodsSummary:s.scope,populationSummary:'Навчальний опис будови клітини людини.',keyLimitations:['Розділ підручника: опис будови та функцій, не дослідження ефективності втручання.'],fullTextAccess:'relevant_sections_read',funding:{status:'not_checked'},conflicts:{status:'not_checked'}}));
export const definitions=[
 ['ORG-NUCLEUS','Генетична інформація','Містить більшу частину ДНК клітини.','Подвійна оболонка з порами регулює обмін із цитоплазмою.',320,210,'#9782df',2],
 ['ORG-NUCLEOLUS','Підготовка рибосом','Утворення рРНК і збирання рибосомних субодиниць.','Ядерце — ділянка всередині ядра, не окрема мембранна органела.',340,220,'#7551aa',2],
 ['ORG-MITOCHONDRION','Перетворення енергії','Бере участь у синтезі ATP.','Внутрішня мембрана утворює кристи.',235,365,'#ed9560',1],
 ['ORG-RIBOSOME','Синтез білка','Збирає білок за інформацією мРНК.','Бувають вільними й пов’язаними з ЕПС.',530,230,'#bd6493',1],
 ['ORG-ROUGH-ER','Білки для експорту','Синтез і початкова обробка частини білків.','На поверхні розташовані рибосоми.',210,215,'#6a9ccc',1],
 ['ORG-SMOOTH-ER','Ліпідний обмін','Бере участь у синтезі ліпідів.','Функції залежать від типу клітини.',205,115,'#80bcb9',1],
 ['ORG-GOLGI','Сортування і транспорт','Модифікує та сортує клітинні продукти.','Далі продукти транспортуються у везикулах.',440,345,'#d7a268',1],
 ['ORG-LYSOSOME','Оновлення компонентів','Розщеплює матеріал усередині клітини.','Участь в оновленні клітини не означає «шкідливий» процес.',490,125,'#cc8bba',1],
 ['ORG-PEROXISOME','Окисні реакції','Участь у метаболізмі ліпідів.','Ферменти також переробляють пероксид водню.',555,350,'#82b96d',1],
 ['STRUCT-CYTOSKELETON','Організація простору','Підтримка форми, рух і внутрішній транспорт.','Мережа мікротрубочок та інших білкових філаментів.',420,440,'#aeac68',1],
 ['STRUCT-PLASMA-MEMBRANE','Межа й обмін','Відділяє клітину від середовища та регулює транспорт.','Ліпідний бішар із білками; не суцільна непроникна стіна.',655,250,'#69b9d8',3]
];
const claimIdsByEntity={'ORG-NUCLEUS':'CLM-000029','ORG-NUCLEOLUS':'CLM-000030','ORG-MITOCHONDRION':'CLM-000031','ORG-RIBOSOME':'CLM-000032','ORG-ROUGH-ER':'CLM-000033','ORG-SMOOTH-ER':'CLM-000034','ORG-GOLGI':'CLM-000035','ORG-LYSOSOME':'CLM-000036','ORG-PEROXISOME':'CLM-000037','STRUCT-CYTOSKELETON':'CLM-000038','STRUCT-PLASMA-MEMBRANE':'CLM-000039'};
export const organelles=definitions.map(([id,tag,summary,detail,x,y,color,source])=>({id,label:entityRegistry.get(id).label,tag,summary,detail,x,y,color,sourceIds:[`SRC-CELL-TEXT-00${source}`],claimId:claimIdsByEntity[id]}));
export function getOrganelle(id){const item=organelles.find(o=>o.id===id);if(!item)throw Error('Unknown organelle: '+id);return item;}
export const learningLevels={school:{label:'Школа',note:'Почни з ролі структури. Вибирай її на схемі або у списку.'},university:{label:'Університет',note:'Функції різних структур пов’язані між собою. Ця схема показує лише базову організацію.'},advanced:{label:'Поглиблено',note:'Це навчальна модель. Вона не відтворює молекулярну кінетику, концентрації або клінічні ефекти.'}};
export const visual={id:'VIS-CELL-GENERAL-001',title:'Загальна клітина людини',type:'interactive_svg',entityIds:['CELL-GENERAL',...organelles.map(o=>o.id)],claimIds:organelles.map(o=>o.claimId),sourceIds:sources.map(s=>s.id),simplified:true,simplificationNote:'Умовні кольори, кількість, розташування й масштаб структур. Не мікрофотографія і не універсальна форма всіх клітин людини.',version:'1.0',lastReviewed:null};
// Migration of existing public descriptions: no new scientific conclusion or confidence.
export const cellClaims=organelles.map(o=>({
 id:o.claimId,statement:o.summary,shortStatement:o.summary,claimType:'physiology',evidenceLayer:'mechanistic',
 domain:'cell_biology',topics:[o.id],entityIds:[o.id],
 population:{description:'Загальна навчальна модель клітини людини.'},
 outcome:{name:o.label},evidenceConfidence:null,confidenceFramework:'not_assessed',
 confidenceRationale:{summary:'Рівень впевненості не оцінено. Науковий перегляд не завершено.'},
 evidenceSummary:o.detail,limitations:[visual.simplificationNote,'Опис структури не є доказом клінічної або спортивної користі втручання.'],
 explanations:{simple:o.summary,detailed:o.detail},status:'educational',version:'1.0',lastReviewed:null,nextReview:null,
 provenance:{kind:'existing_public_wording_migration',sourceVersion:55},scientificApproval:null
}));
const locators={'ORG-NUCLEUS':'3.3 · The Nucleus','ORG-NUCLEOLUS':'3.3 · The Nucleus / nucleolus','ORG-MITOCHONDRION':'3.2 · Mitochondria','ORG-RIBOSOME':'3.2 · Endoplasmic Reticulum / ribosomes','ORG-ROUGH-ER':'3.2 · Endoplasmic Reticulum','ORG-SMOOTH-ER':'3.2 · Endoplasmic Reticulum','ORG-GOLGI':'3.2 · The Golgi Apparatus','ORG-LYSOSOME':'3.2 · Lysosomes','ORG-PEROXISOME':'3.2 · Peroxisomes','STRUCT-CYTOSKELETON':'3.2 · The Cytoskeleton','STRUCT-PLASMA-MEMBRANE':'3.1 · Structure and Composition of the Cell Membrane'};
const recordIdsByEntity={'ORG-NUCLEUS':'EVR-000039','ORG-NUCLEOLUS':'EVR-000040','ORG-MITOCHONDRION':'EVR-000041','ORG-RIBOSOME':'EVR-000042','ORG-ROUGH-ER':'EVR-000043','ORG-SMOOTH-ER':'EVR-000044','ORG-GOLGI':'EVR-000045','ORG-LYSOSOME':'EVR-000046','ORG-PEROXISOME':'EVR-000047','STRUCT-CYTOSKELETON':'EVR-000048','STRUCT-PLASMA-MEMBRANE':'EVR-000049'};
export const cellRecords=organelles.map(o=>({
 id:recordIdsByEntity[o.id],sourceId:o.sourceIds[0],claimId:o.claimId,evidenceLayer:'mechanistic',recordKind:'textbook_description',
 outcome:{name:o.label},populationContext:{description:'Підручниковий опис клітинної структури.'},
 interventionContext:{description:'Не застосовується: не дослідження втручання.'},comparatorContext:{description:'Не застосовується.'},
 result:{summary:o.summary+' '+o.detail},direction:'supports_claim',relevance:'direct',roleForClaim:'mechanistic_support',
 riskOfBias:{status:'not_assessed',summary:'Не оцінено; опис із підручника, не результат випробування.'},
 extractionLocator:locators[o.id],reviewStatus:'pending',reviewNote:'Звірено відповідний навчальний розділ; повний науковий перегляд не завершено.'
}));
export const cellKnowledge=createEvidenceBase({entities:entityRegistry.entities,claims:cellClaims,records:cellRecords,sources,visualizations:[visual],presentation:{labels:Object.fromEntries(organelles.map(o=>[o.claimId,o.label])),confidenceNote:'Навчальний опис клітинної структури. Механізм не доводить клінічний або спортивний результат; рівні впевненості тут не оцінено.'}});
export function adjacentOrganelle(id,direction){getOrganelle(id);if(![-1,1].includes(direction))throw Error('Invalid structure direction');return organelles[(organelles.findIndex(o=>o.id===id)+direction+organelles.length)%organelles.length].id;}
