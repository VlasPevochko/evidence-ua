import {entityRegistry} from './evidence/entities.js?v=58';
import {createEvidenceBase} from './evidence/registry.js?v=58';
export const moduleMeta={id:'MOD-MUSCLE-INTRO-001',version:'1.1',lastChecked:'2026-10-12',lastReviewed:null,status:'Навчальна версія · науковий перегляд не завершено',history:[{version:'1.0',sourceVersion:57,kind:'existing_public_wording_migration'},{version:'1.1',at:'2026-10-12',kind:'user_requested_R1_R4_implementation',report:'docs/MUSCLE-LAB-SOURCE-PASS-2.md',scientificReviewCompleted:false}]};
const sourceDefinitions=[
 {id:'SRC-MUSCLE-001',title:'Signaling in muscle contraction',year:2015,url:'https://pubmed.ncbi.nlm.nih.gov/25646377/',scope:'Огляд механізмів Ca²⁺-регуляції та актин-міозинової взаємодії. Не оцінка ефекту тренувальної програми.'},
 {id:'SRC-MUSCLE-002',title:'Exercise and the Regulation of Skeletal Muscle Hypertrophy',year:2015,url:'https://pubmed.ncbi.nlm.nih.gov/26477914/',scope:'Огляд білкового обміну та адаптації до вправ. Не окремий прогноз приросту м’язів.'},
 {id:'SRC-MUSCLE-003',title:'Signaling pathways controlling skeletal muscle mass',year:2014,url:'https://pubmed.ncbi.nlm.nih.gov/24237131/',scope:'Огляд сигнальних механізмів; включає різні експериментальні моделі. Не всі результати можна прямо переносити на людей.'}
];
// Each fragment covers a named part of an explanation, not the whole publication.
// IDs remain stable; the four superseded context links are retained below.
const recordBindings=[
 ['EVR-000061','CLM-000040','SRC-000025','definition','10.2: абзац про склад скелетного м’яза перед Figure 10.3'],
 ['EVR-000062','CLM-000040','SRC-000025','function','10.2: абзац про передавання напруги через сполучну тканину й сухожилля'],
 ['EVR-000063','CLM-000040','SRC-000027','function','10.4: вступ про режими скорочення; Figure 10.13'],
 ['EVR-000064','CLM-000041','SRC-000025','definition','10.2: абзац про пучки та перимізій; Figure 10.3'],
 ['EVR-000065','CLM-000041','SRC-000028','function','11.1: підрозділ про розташування пучків; абзац про силу та діапазон руху'],
 ['EVR-000066','CLM-000042','SRC-000025','definition','10.2: Skeletal Muscle Fibers; Figure 10.4'],
 ['EVR-000052','CLM-000042','SRC-MUSCLE-001','function','Розділ 2; Figure 3A та підпис, с. 4–5'],
 ['EVR-000067','CLM-000043','SRC-000025','definition','10.2: The Sarcomere; абзац про міофібрили; Figures 10.4–10.5'],
 ['EVR-000068','CLM-000043','SRC-000026','function','10.3: абзац про послідовні саркомери в міофібрилах; The Sliding Filament Model of Contraction'],
 ['EVR-000069','CLM-000044','SRC-000025','definition','10.2: The Sarcomere; Figure 10.5 і підпис'],
 ['EVR-000070','CLM-000044','SRC-000026','function','10.3: The Sliding Filament Model of Contraction; Figure 10.10 і підпис'],
 ['EVR-000071','CLM-000045','SRC-000025','definition','10.2: The Sarcomere; опис тонких і товстих філаментів; Figure 10.5'],
 ['EVR-000055','CLM-000045','SRC-MUSCLE-001','function','Вступ; Figure 2A–B та підпис, с. 3–4'],
 ['EVR-000056','CLM-000046','SRC-MUSCLE-001','mechanism','Вступ; Figure 2B та підпис, с. 3–4'],
 ['EVR-000072','CLM-000046','SRC-000026','mechanism','10.3: ATP and Muscle Contraction; Figure 10.11 і підпис'],
 ['EVR-000057','CLM-000047','SRC-MUSCLE-002','adaptation','Анотація, вступ і уривки розділів офіційного preview; повний розділ не прочитано'],
 ['EVR-000058','CLM-000047','SRC-MUSCLE-003','mechanism','Розділи про IGF1/PI3K/Akt і TORC1; Figure 1, с. 59–61'],
 ['EVR-000059','CLM-000048','SRC-MUSCLE-002','adaptation','Анотація й уривок про розвантаження в офіційному preview; повний розділ не прочитано'],
 ['EVR-000060','CLM-000048','SRC-MUSCLE-003','mechanism','Розділи про MuRF1/MAFbx і глюкокортикоїди; обговорення FOXO та аутофагії, с. 61–62']
];
const sourceIdsFor=claimId=>[...new Set(recordBindings.filter(r=>r[1]===claimId).map(r=>r[2]))];
const structureDefinitions=[
 {id:'TISSUE-SKELETAL-MUSCLE',label:'М’яз',position:10,zoom:1,description:'Скелетний м’яз — орган, утворений м’язовими волокнами, сполучною тканиною, судинами та нервами.',function:'Волокна створюють напругу, яка передається через сполучні тканини. Скорочення не завжди означає вкорочення всього м’яза: він може працювати ізометрично або подовжуватися під навантаженням.',sourceIds:['SRC-MUSCLE-001']},
 {id:'STRUCT-FASCICLE',label:'Пучок',position:30,zoom:1.4,description:'Пучок — група м’язових волокон, оточена сполучною тканиною.',function:'Пучки є рівнем організації м’яза. Їхня орієнтація й взаємодія зі сполучною тканиною впливають на передачу напруги.',sourceIds:['SRC-MUSCLE-001']},
 {id:'CELL-MUSCLE',label:'М’язове волокно',position:55,zoom:1.7,description:'М’язове волокно — видовжена багатоядерна клітина. Усередині розташовані міофібрили та органели.',function:'Збудження клітини пов’язане з вивільненням Ca²⁺ із саркоплазматичного ретикулума. Це дозволяє регулювати взаємодію актину та міозину.',sourceIds:['SRC-MUSCLE-001']},
 {id:'STRUCT-MYOFIBRIL',label:'Міофібрила',position:78,zoom:2,description:'Міофібрила — структура всередині волокна з послідовно розташованими саркомерами.',function:'Зміна довжини саркомерів у міофібрилах бере участь у зміні довжини волокна. Напруга й довжина — різні характеристики.',sourceIds:['SRC-MUSCLE-001']},
 {id:'STRUCT-SARCOMERE',label:'Саркомер',position:90,zoom:2,description:'Саркомер — повторювана скоротлива одиниця міофібрили між двома Z-дисками.',function:'Тонкі та товсті філаменти ковзають відносно один одного. При вкороченні саркомера їх перекриття збільшується, але самі філаменти не стають коротшими.',sourceIds:['SRC-MUSCLE-001']},
 {id:'PRT-ACTIN-MYOSIN',label:'Актин і міозин',position:90,zoom:2,description:'Актин утворює основу тонких філаментів, міозин — товстих. Головки міозину взаємодіють з актином.',function:'Ca²⁺ зв’язується з тропоніном і змінює положення тропоміозину. Зв’язування ATP від’єднує міозин від актину; гідроліз ATP готує головку до наступного циклу.',sourceIds:['SRC-MUSCLE-001']}
];
export const structureClaimIds={'TISSUE-SKELETAL-MUSCLE':'CLM-000040','STRUCT-FASCICLE':'CLM-000041','CELL-MUSCLE':'CLM-000042','STRUCT-MYOFIBRIL':'CLM-000043','STRUCT-SARCOMERE':'CLM-000044','PRT-ACTIN-MYOSIN':'CLM-000045'};
export const structures=structureDefinitions.map(s=>({...s,label:entityRegistry.get(s.id).label,claimId:structureClaimIds[s.id],sourceIds:sourceIdsFor(structureClaimIds[s.id])}));
export const topicClaimIds={contraction:'CLM-000046',growth:'CLM-000047',atrophy:'CLM-000048'};
export const topics=[
 {id:'contraction',title:'Скорочення м’яза',color:'blue',description:'Як актин і міозин створюють механічну напругу, використовуючи енергію ATP.',school:'Міозин взаємодіє з актином. Для повторення циклу потрібен ATP; кальцій допомагає дозволити цю взаємодію.',university:'Ca²⁺ регулює доступ до актину через тропонін–тропоміозиновий комплекс. ATP потрібен для від’єднання головок міозину та підтримки повторюваного циклу.',advanced:'Схема не відтворює кінетику поперечних містків, силу–довжину, силу–швидкість, титин або енергетичну вартість транспорту Ca²⁺.',steps:['Ca²⁺: доступ до ділянок актину','Взаємодія міозину з актином і робочий хід','ATP зв’язується: міозин від’єднується','Гідроліз ATP: підготовка наступного циклу'],sourceIds:['SRC-MUSCLE-001']},
 {id:'growth',title:'Як росте м’яз (гіпертрофія)',color:'green',description:'Механічне навантаження, білковий обмін і довгострокова адаптація.',school:'М’яз може збільшуватися у відповідь на повторюване навантаження та відновлення. Це відбувається поступово, а не за один підхід.',university:'Розмір м’яза пов’язаний із накопичувальним балансом синтезу та розпаду білків. mTORC1 бере участь у регуляції синтезу, але не є єдиним чинником адаптації.',advanced:'Гостра активація mTORC1 чи зростання синтезу білка не дорівнюють прямому доказу величини довгострокової гіпертрофії. Потрібні відповідні дослідження у людей.',steps:['Повторюване механічне навантаження','Сигнальні процеси, зокрема mTORC1','Регуляція синтезу й розпаду білків','Можлива адаптація з часом — не гарантований прогноз'],sourceIds:['SRC-MUSCLE-002','SRC-MUSCLE-003']},
 {id:'atrophy',title:'Чому м’яз атрофується?',color:'pink',description:'Втрата м’язового білка та зміни при бездіяльності або захворюванні.',school:'Коли м’яз втрачає білки протягом часу, його волокна можуть зменшуватися. Причини бувають різними.',university:'Атрофія пов’язана з порушенням балансу білкового обміну: зниженням синтезу, збільшенням розпаду або їх поєднанням залежно від контексту.',advanced:'FOXO, убіквітин–протеасомна система та аутофагія беруть участь у регуляції білкового обміну. Аутофагія також потрібна для нормального оновлення клітини; вона не є просто «поганим» процесом.',steps:['Контекст: бездіяльність або захворювання','Зміни синтезу та/або розпаду білків','Втрата білкового матеріалу з часом','Можливе зменшення волокна — причини потребують оцінки'],sourceIds:['SRC-MUSCLE-002','SRC-MUSCLE-003']}
].map(t=>({...t,sourceIds:sourceIdsFor(topicClaimIds[t.id])}));

const pmids={'SRC-MUSCLE-001':'25646377','SRC-MUSCLE-002':'26477914','SRC-MUSCLE-003':'24237131'};
const sourceMetadata={
 'SRC-MUSCLE-001':{authors:['Ivana Y. Kuo','Barbara E. Ehrlich'],journal:'Cold Spring Harbor Perspectives in Biology',identifiers:{pmid:'25646377',pmcid:'PMC4315934',doi:'10.1101/cshperspect.a006023'},shortCitation:'Kuo IY, Ehrlich BE · Cold Spring Harbor Perspectives in Biology · 7(2):a006023',fullTextUrl:'https://scispace.com/pdf/signaling-in-muscle-contraction-zkr1b0234k.pdf',fullTextAccess:'relevant_sections_read',accessNote:'Прочитано релевантні розділи та підписи до рисунків копії видавничого PDF. Це не завершений перегляд усіх частин модуля.',keyLimitations:['Огляд регуляції різних типів м’язів. Для будови структур використано окремі джерела; результат тренувань у людей тут не оцінено.']},
 'SRC-MUSCLE-002':{authors:['Chris McGlory','Stuart M. Phillips'],journal:'Progress in Molecular Biology and Translational Science',identifiers:{pmid:'26477914',doi:'10.1016/bs.pmbts.2015.06.018'},shortCitation:'McGlory C, Phillips SM · Progress in Molecular Biology and Translational Science · 135:153–173',fullTextUrl:'https://www.sciencedirect.com/science/article/abs/pii/S1877117315001325',fullTextAccess:'preview_only',accessNote:'Доступні анотація, вступ та уривки офіційного перегляду. Повний розділ не прочитано.',keyLimitations:['Повний розділ ще потрібен для завершення перевірки. Доступні уривки не підтверджують автоматично всі частини пояснення.']},
 'SRC-MUSCLE-003':{authors:['Marc A. Egerman','David J. Glass'],journal:'Critical Reviews in Biochemistry and Molecular Biology',identifiers:{pmid:'24237131',pmcid:'PMC3913083',doi:'10.3109/10409238.2013.857291'},shortCitation:'Egerman MA, Glass DJ · Critical Reviews in Biochemistry and Molecular Biology · 49(1):59–68',fullTextUrl:'https://www.researchgate.net/publication/258632854_Signaling_pathways_controlling_skeletal_muscle_mass',fullTextAccess:'full_text_read',accessNote:'Прочитано авторську копію основного тексту, підпис до рисунка, подяки й декларацію. Методологію всіх цитованих досліджень не перевірено.',keyLimitations:['Механістичний огляд із різними моделями. Не кількісний прогноз тренувальної адаптації у конкретної людини.'],conflicts:{status:'reported',summary:'У декларації статті автори повідомили, що обоє працюють у Novartis Institutes for Biomedical Research.',locator:'Declaration of interest',checkedAt:'2026-10-11'}}
};
const textbookSections=[
 {id:'SRC-000025',title:'10.2 Skeletal Muscle',slug:'10-2-skeletal-muscle',scope:'Навчальний виклад будови скелетного м’яза: орган, пучок, волокно, міофібрила та саркомер.'},
 {id:'SRC-000026',title:'10.3 Muscle Fiber Contraction and Relaxation',slug:'10-3-muscle-fiber-contraction-and-relaxation',scope:'Навчальний виклад ковзання філаментів і циклу міозину; використано конкретні фрагменти, не всі твердження розділу.'},
 {id:'SRC-000027',title:'10.4 Nervous System Control of Muscle Tension',slug:'10-4-nervous-system-control-of-muscle-tension',scope:'Навчальний контекст напруги та режимів скорочення; використано вступ і Figure 10.13.'},
 {id:'SRC-000028',title:'11.1 Interactions of Skeletal Muscles, Their Fascicle Arrangement, and Their Lever Systems',slug:'11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems',scope:'Навчальний контекст орієнтації пучків; використано відповідний підрозділ.'}
];
const textbookAuthors=['J. Gordon Betts','Kelly A. Young','James A. Wise','Eddie Johnson','Brandon Poe','Dean H. Kruse','Oksana Korol','Jody E. Johnson','Mark Womble','Peter DeSaix'];
export const sources=[
 ...sourceDefinitions.map(s=>({...s,publicationType:'narrative_review',identifiers:{pmid:pmids[s.id]},pubmedUrl:s.url,sourceStatus:'not_checked',publicationStatusCheck:'pending',lastChecked:'2026-10-11',methodsSummary:s.scope,populationSummary:'Огляд механізмів; не кількісне дослідження ефекту програми у людей.',funding:{status:'not_checked'},conflicts:{status:'not_checked'},...sourceMetadata[s.id]})),
 ...textbookSections.map(({slug,...s})=>({...s,year:2022,authors:textbookAuthors,book:'Anatomy and Physiology 2e',publisher:'OpenStax',publicationType:'textbook_chapter',identifiers:{},url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/'+slug,shortCitation:'J. Gordon Betts et al. · Anatomy and Physiology 2e · OpenStax',sourceStatus:'not_checked',publicationStatusCheck:'pending',lastChecked:'2026-10-12',methodsSummary:s.scope,populationSummary:'Навчальний підручник; опис будови й функції скелетного м’яза. Не дослідження ефекту втручання.',fullTextAccess:'relevant_sections_read',accessNote:'Відкрито текст розділу на сайті видавця. Рисунки й текст підручника не копіювалися на сайт.',keyLimitations:['Розділи одного підручника, а не незалежні дослідження. Джерело навчального опису, без оцінки ефекту у людей.'],funding:{status:'not_checked'},conflicts:{status:'not_checked'}}))
];
const migrationNote='Збережений опис із попередньої публічної версії. Посилання наведене для контексту; повний текст ще не зіставлено з усіма частинами опису.';
export const visual={id:'VIS-MUSCLE-OVERVIEW-001',title:'Від м’яза до молекул',type:'interactive_svg',version:'1.0',lastReviewed:null,simplified:true,entityIds:structures.map(s=>s.id),claimIds:structures.map(s=>s.claimId),sourceIds:sources.map(s=>s.id),simplificationNote:'Схематичні малюнки: форми й пропорції спрощені, масштаб умовний. Без виміряних швидкостей і клінічного прогнозу.'};
// This is a migration of already public wording, not a new scientific assessment.
const descriptions=[
 ...structures.map(s=>({id:s.claimId,statement:s.description,summary:s.function,label:s.label,entityIds:[s.id],sourceIds:s.sourceIds})),
 ...topics.map(t=>({id:topicClaimIds[t.id],statement:t.description,summary:t.university,label:t.title,entityIds:t.id==='contraction'?['PRT-ACTIN-MYOSIN']:[],sourceIds:t.sourceIds}))
];
const anatomyClaimIds=new Set(structures.slice(0,5).map(s=>s.claimId));
const modelApplicabilityNote='Частина механістичних висновків походить із дослідів на клітинах і тваринах; вони не визначають величину результату у конкретної людини.';
export const muscleClaims=descriptions.map(d=>({
 id:d.id,statement:d.statement,shortStatement:d.statement,claimType:anatomyClaimIds.has(d.id)?'physiology':'mechanism',evidenceLayer:'mechanistic',domain:'muscle_physiology',topics:[d.label],entityIds:d.entityIds,
 population:{description:'Навчальне пояснення будови та механізмів скелетного м’яза.'},outcome:{name:d.label},
 evidenceConfidence:null,confidenceFramework:'not_assessed',confidenceRationale:{summary:'Рівень впевненості не оцінено. Науковий перегляд не завершено.'},
 evidenceSummary:d.summary,limitations:[...(['CLM-000047','CLM-000048'].includes(d.id)?[modelApplicabilityNote]:[]),migrationNote,visual.simplificationNote,'Механістичне пояснення не є доказом величини довгострокового результату у людей.'],
 explanations:{simple:d.statement,detailed:d.summary},status:'educational',version:'1.1',lastReviewed:null,nextReview:null,
 provenance:{kind:'existing_public_wording_migration',sourceVersion:57,history:[{version:'1.0',kind:'existing_public_wording_migration'},{version:'1.1',at:'2026-10-12',kind:'user_requested_R1_R4_implementation',report:'docs/MUSCLE-LAB-SOURCE-PASS-2.md'}]},scientificApproval:null
}));
const recordLinks=[
 ['EVR-000050','CLM-000040','SRC-MUSCLE-001'],['EVR-000051','CLM-000041','SRC-MUSCLE-001'],
 ['EVR-000052','CLM-000042','SRC-MUSCLE-001'],['EVR-000053','CLM-000043','SRC-MUSCLE-001'],
 ['EVR-000054','CLM-000044','SRC-MUSCLE-001'],['EVR-000055','CLM-000045','SRC-MUSCLE-001'],
 ['EVR-000056','CLM-000046','SRC-MUSCLE-001'],['EVR-000057','CLM-000047','SRC-MUSCLE-002'],
 ['EVR-000058','CLM-000047','SRC-MUSCLE-003'],['EVR-000059','CLM-000048','SRC-MUSCLE-002'],
 ['EVR-000060','CLM-000048','SRC-MUSCLE-003']
];
export const legacyMuscleRecords=recordLinks.map(([id,claimId,sourceId])=>{
 const c=muscleClaims.find(c=>c.id===claimId);return {
 id,claimId,sourceId,evidenceLayer:'mechanistic',recordKind:'existing_context_link',outcome:{name:c.outcome.name},
 populationContext:{description:'Контекстний зв’язок зі збереженим оглядом; не витяг конкретного результату дослідження.'},
 interventionContext:{description:'Не застосовується: навчальний опис.'},comparatorContext:{description:'Не застосовується.'},
 result:{summary:migrationNote},direction:'unclear',relevance:'indirect',roleForClaim:'context_only',
 riskOfBias:{status:'not_assessed',summary:'Не оцінено; контекстне посилання, не перевірений outcome.'},
 extractionLocator:'Контекстне посилання попереднього модуля; конкретний фрагмент повного тексту ще не внесено.',
 reviewStatus:'pending',reviewNote:'Не трактувати як пряме підтвердження всіх частин опису.'
 };
});
const supersededIds=['EVR-000050','EVR-000051','EVR-000053','EVR-000054'];
export const muscleRecordHistory=legacyMuscleRecords.filter(r=>supersededIds.includes(r.id)).map(r=>({...r,historyStatus:'superseded',supersededAt:'2026-10-12',supersededBy:recordBindings.filter(binding=>binding[1]===r.claimId).map(binding=>binding[0]),reason:'Для визначення та функції додано відповідні фрагменти підручника. Історичне посилання на огляд сигналізації збережено, але більше не використовується для цих частин.'}));
const partLabels={definition:'Визначення структури',function:'Функція структури',mechanism:'Механістичне пояснення',adaptation:'Контекст адаптації'};
export const muscleRecords=recordBindings.map(([id,claimId,sourceId,claimPart,extractionLocator])=>{
 const c=muscleClaims.find(c=>c.id===claimId),s=sources.find(s=>s.id===sourceId);
 return {id,claimId,sourceId,claimPart,claimPartLabel:partLabels[claimPart],evidenceLayer:'mechanistic',recordKind:s.publicationType==='textbook_chapter'?'textbook_context':'located_review_context',outcome:{name:c.outcome.name+' · '+partLabels[claimPart].toLowerCase()},populationContext:{description:s.publicationType==='textbook_chapter'?'Навчальний опис скелетного м’яза в підручнику; не дослідження результату втручання.':s.populationSummary},interventionContext:{description:'Не застосовується: навчальне пояснення.'},comparatorContext:{description:'Не застосовується.'},result:{summary:'Фрагмент джерела прив’язано до цієї частини пояснення. Повний науковий перегляд ще не завершено.'},direction:'unclear',relevance:'indirect',roleForClaim:'context_only',riskOfBias:{status:'not_assessed',summary:'Не оцінено; джерельний контекст, не результат дослідження ефекту.'},extractionLocator,extractionCheckedAt:'2026-10-11',reviewStatus:'pending',reviewNote:'Локатор стосується названої частини, не підтверджує автоматично всі частини твердження.',provenance:{kind:'user_requested_R1_R4_implementation',report:'docs/MUSCLE-LAB-SOURCE-PASS-2.md'}};
});
export const muscleKnowledge=createEvidenceBase({entities:entityRegistry.entities,relations:entityRegistry.relations,claims:muscleClaims,records:muscleRecords,sources,visualizations:[visual],presentation:{showContextExplanation:true,showSourceLocators:true,showClaimType:true,labels:Object.fromEntries(descriptions.map(d=>[d.id,d.label])),confidenceNote:'Механізм не дорівнює результату у людей. Джерельні фрагменти прив’язані до визначень і функцій окремо; рівні впевненості не оцінено, науковий перегляд не завершено.'}});
