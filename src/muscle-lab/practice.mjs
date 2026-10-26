// М’язи та тренування: дев’ять тверджень про результат у людей.
// Формулювання й попередні рівні впевненості погоджено власником 26.10.2026 («1 так / 2 так»).
// Витяг: анотації PubMed (числа звірено 26.10.2026). Формального наукового перегляду не було.
// Білок: окремих тверджень тут немає — сторінка відкриває вже погоджені твердження картки протеїну (CLM-000009, 10, 53, 54, 55).
import {createEvidenceBase} from '../evidence/core/registry.mjs';
import {proteinBase} from '../evidence/supplements/protein/module.mjs';

const checked='2026-10-26';
export const practiceAcceptance={kind:'user_wording_approval',at:'2026-10-26T15:33:00+02:00',
 scope:'М’язи та тренування: дев’ять тверджень про результат і докази до них (погоджено власником у робочому чаті 26.10.2026)',
 confidenceAssessed:true,formalScientificReview:false};
export const confidenceAcceptance={kind:'user_confidence_approval',at:'2026-10-26T15:33:00+02:00',framework:'evidenceua_grade_informed_v1',provisional:true,formalScientificReview:false};
const accepted={publicationApproved:true,publicationAcceptance:practiceAcceptance};

const claim=(id,level,rationale,o)=>({id,claimType:'efficacy',evidenceLayer:'human_outcome',domain:'training',topics:['muscle'],entityIds:[],status:'educational',version:'1.0',lastReviewed:null,nextReview:null,scientificApproval:null,...accepted,
 evidenceConfidence:level,confidenceFramework:'evidenceua_grade_informed_v1',provisional:true,confidenceAcceptance,
 confidenceRationale:{summary:rationale,uncertaintyNotes:['Попередня оцінка за анотаціями; формального наукового перегляду Evidence UA не було.']},...o});
const healthy={description:'Здорові дорослі в рандомізованих дослідженнях силових тренувань (переважно від 6 тижнів).'};

export const practiceClaims=[
 claim('CLM-000105','moderate','ACSM 2026: огляд 137 систематичних оглядів (понад 30 000 людей). Це висновок про напрям, а не точний поріг для кожного.',{
  statement:'Більший тижневий обсяг (≥10 підходів на м’язову групу) пов’язаний з більшим ростом м’язів у здорових дорослих.',
  shortStatement:'≥10 підходів на тиждень — більше росту.',
  outcome:{name:'Гіпертрофія (розмір м’язів)'},population:{description:'Здорові дорослі від 18 років; систематичні огляди РКД тривалістю 6–52 тижні.'},
  intervention:{name:'Силові тренування з більшим тижневим обсягом (≥10 підходів на м’язову групу)'},comparator:{description:'Менший обсяг'},
  evidenceSummary:'Позиція ACSM 2026 (Currier та співавт.) узагальнила 137 систематичних оглядів: гіпертрофію посилювали більший обсяг (≥10 підходів на тиждень) і ексцентричне перевантаження. Більшість інших параметрів програми не давали стабільної різниці.',
  limitations:['Це огляд оглядів: точну величину ефекту для 10 підходів в анотації не наведено.','Поріг не універсальний: потреба залежить від стажу, вправ, близькості до відмови й відновлення.']}),
 claim('CLM-000106','low','15 досліджень; інтервал широкий (−0,13…0,37) і не виключає ні нульового, ні невеликого ефекту.',{
  statement:'Тренування до повної відмови не дало переваги в рості м’язів порівняно з «не до відмови».',
  shortStatement:'Повна відмова не дала переваги для росту.',
  outcome:{name:'Гіпертрофія'},population:{description:'Здорові дорослі будь-якого віку й стажу; 15 досліджень.'},
  intervention:{name:'Підходи до повної (моментальної) м’язової відмови'},comparator:{description:'Підходи не до відмови'},
  evidenceSummary:'У метааналізі Refalo 2022 повна відмова проти «не до відмови»: SMD 0,12 (95% ДІ −0,13…0,37), різниці не виявлено. Якщо рахувати будь-яке визначення «відмови», перевага тривіальна: 0,19 (0,00…0,37). У позиції ACSM 2026 тренування до відмови теж не давало стабільної різниці.',
  limitations:['Визначення «відмови» в дослідженнях різні.','Дуже легкі підходи далеко від відмови можуть давати недостатній стимул; це твердження не про них.']}),
 claim('CLM-000107','moderate','21 дослідження; висновок стосується підходів, виконаних до відмови.',{
  statement:'З легкою і важкою вагою м’язи ростуть подібно; максимальна сила (1ПМ) росте більше з важкою вагою.',
  shortStatement:'Ріст подібний; 1ПМ — більше з важкою вагою.',
  outcome:{name:'Гіпертрофія; максимальна сила (1ПМ)'},population:{description:'Люди без відомих хвороб; 21 дослідження тривалістю від 6 тижнів.'},
  intervention:{name:'Легка вага (≤60% 1ПМ), усі підходи до відмови'},comparator:{description:'Важка вага (>60% 1ПМ), усі підходи до відмови'},
  evidenceSummary:'У метааналізі Schoenfeld 2017 приріст 1ПМ був значуще більшим із важкою вагою, а зміни розміру м’язів — подібними. Для ізометричної сили різниці не виявлено.',
  limitations:['В анотації не наведено величин ефекту.','У всіх включених протоколах підходи виконували до відмови: з легкою вагою «недовиконаний» підхід може дати менше.']}),
 claim('CLM-000108','moderate','43 дослідження; інтервали для розміру м’язів і максимальної сили вузькі й близькі до нуля.',{
  statement:'Кардіо разом із силовими не зменшує ріст м’язів і максимальну силу, але трохи зменшує вибухову силу.',
  shortStatement:'Ріст і сила — без різниці; вибухова сила — трохи менша.',
  outcome:{name:'Гіпертрофія, максимальна й вибухова сила'},population:{description:'Здорові дорослі будь-якої статі й віку; 43 дослідження від 4 тижнів.'},
  intervention:{name:'Силові + аеробні тренування'},comparator:{description:'Такі самі силові тренування без аеробних'},
  evidenceSummary:'У метааналізі Schumann 2021: розмір м’язів SMD −0,01 (95% ДІ −0,16…0,18), максимальна сила −0,06 (−0,20…0,09) — різниці не виявлено; вибухова сила −0,28 (−0,48…−0,08). Вибухова сила страждала більше, коли обидва види тренувань були в одному занятті.',
  limitations:['Для спортсменів високого рівня з великим обсягом висновок переносимо обережно.']}),
 claim('CLM-000109','low','11 досліджень; автори самі оцінили певність доказів як низьку (GRADE).',{
  statement:'Більше вуглеводів (за однакового білка) не дало додаткового росту м’язів.',
  shortStatement:'Більше вуглеводів не додало росту.',
  outcome:{name:'Гіпертрофія'},population:{description:'Здорові дорослі під час силових тренувань; 11 РКД.'},
  intervention:{name:'Більше вуглеводів (добавка або раціон)'},comparator:{description:'Менше вуглеводів за однакового білка'},
  evidenceSummary:'У метааналізі Henselmans 2026: SMD 0,15, p = 0,23 — різниці не виявлено; в ізокалорійних дослідженнях — так само 0,15, p = 0,60. Певність доказів низька через неточність і помірний ризик упередженості.',
  limitations:['Довірчий інтервал в анотації не наведено.','Вуглеводи підтримують обсяг і якість тренувань; твердження лише про ріст м’язів за однакового білка.']}),
 claim('CLM-000110','very_low','Одне рандомізоване перехресне дослідження, 13 людей, короткостроковий показник (синтез білка), а не зміна м’язової маси.',{
  statement:'Одна ніч без сну знизила синтез м’язового білка на 18% наступного дня.',
  shortStatement:'Ніч без сну: синтез білка −18%.',
  outcome:{name:'Синтез м’язового білка після їжі'},population:{description:'13 здорових молодих дорослих (7 чоловіків, 6 жінок).'},
  intervention:{name:'Одна ніч повної депривації сну'},comparator:{description:'Звичайний сон (перехресний дизайн)'},
  evidenceSummary:'У Lamon 2021 швидкість синтезу знизилася з 0,072 до 0,059 %/год (−18%, p = 0,040); кортизол зріс на 21%, тестостерон знизився на 24%. Маркерів розпаду білка змінено не було.',
  limitations:['Гострий експеримент: не показує, що одна погана ніч зменшує м’язи.','Мала вибірка.']}),
 claim('CLM-000111','moderate','151 рандомізоване дослідження (6306 людей); дані переважно про фізично здорових людей.',{
  statement:'У людей від 60 років навіть малий обсяг силових тренувань збільшує безжирову масу й розмір м’язів.',
  shortStatement:'Від 60 років: навіть малий обсяг додає м’язів.',
  outcome:{name:'Безжирова маса; розмір м’язів ніг'},population:{description:'Люди від 60 років; 151 РКД, 6306 учасників.'},
  intervention:{name:'Силові тренування малого обсягу (нижня третина тижневого обсягу)'},comparator:{description:'Порівняння в мережевому метааналізі; референтну групу в анотації явно не названо'},
  evidenceSummary:'У мережевому метааналізі Radaelli 2024 малий обсяг покращував безжирову масу (SMD 0,25; 95% ДІ 0,10…0,40) і розмір м’язів ніг (0,40; 0,25…0,54). Для більшого приросту сили потрібен був середній або великий обсяг.',
  limitations:['Для людей з обмеженою фізичною функцією даних мало.','Категорії обсягу визначені за третинами досліджень, а не фіксованим числом підходів.']}),
 claim('CLM-000112','low','Одне контрольоване дослідження (14 + 14 людей), один м’яз, ізометричні тренування.',{
  claimType:'physiology',
  statement:'Перші тижні сила росте частково через нервову систему, а не лише через м’язи.',
  shortStatement:'Ранній приріст сили — частково нервова адаптація.',
  outcome:{name:'Частота розрядів і поріг увімкнення моторних одиниць'},population:{description:'14 людей, що тренувалися, і 14 у контролі; передній великогомілковий м’яз.'},
  intervention:{name:'4 тижні ізометричних силових тренувань'},comparator:{description:'Контрольна група без тренувань'},
  evidenceSummary:'У Del Vecchio 2019 після 4 тижнів частота розрядів моторних одиниць зросла в середньому на 3,3 ± 2,5 імпульсу за секунду, а поріг їх увімкнення знизився. Автори пояснюють приріст сили збільшенням сигналу від спинного мозку до м’яза.',
  limitations:['Розмір м’язів у цьому дослідженні не був основним показником, тому частку «нервового» внеску в силу не визначено.','Результат для одного м’яза й ізометричних вправ.']}),
 claim('CLM-000113','very_low','Одне рандомізоване дослідження, 22 людини; рівність груп не означає доведеної еквівалентності.',{
  statement:'Веганська й змішана високобілкові дієти дали однаковий ріст м’язів.',
  shortStatement:'Веганська чи змішана — ріст однаковий.',
  outcome:{name:'Безжирова маса, об’єм стегна, площа волокон'},population:{description:'22 здорові молоді дорослі, 10 тижнів силових тренувань 5 разів на тиждень.'},
  intervention:{name:'Веганська високобілкова дієта (≈2 г/кг, з мікопротеїном)'},comparator:{description:'Змішана високобілкова дієта (≈2 г/кг)'},
  evidenceSummary:'У Monteyne 2023 безжирова маса зросла на 3,1 кг у веганській групі й на 2,6 кг у змішаній; об’єм стегна — на 8,3% в обох; площа волокон — на 32% і 33%. Різниць між групами не виявлено.',
  limitations:['Мала вибірка: невелику різницю дослідження могло не помітити.','Висновок для добре спланованої дієти з достатнім білком.','Дослідження частково пов’язане з виробником мікопротеїну (за даними авторів — див. джерело).']})
];

const source=(id,o)=>({id,publicationType:'systematic_review_meta_analysis',metadataStatus:'checked',lastChecked:checked,publicationStatus:null,publicationStatusCheck:'pending',sourceStatus:'not_checked',
 identifiers:{doi:o.doi,pmid:o.pmid,pmcid:o.pmcid||null},url:'https://pubmed.ncbi.nlm.nih.gov/'+o.pmid+'/',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/'+o.pmid+'/',accessLevel:'abstract',funding:null,conflicts:null,methodsSummary:'Прочитано анотацію в PubMed.',...o});
export const practiceSources=[
 source('SRC-000112',{title:'American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews',authors:['Currier BS','D’Souza AC','Singh MAF','et al.'],year:2026,journal:'Medicine & Science in Sports & Exercise',publicationType:'position_statement',doi:'10.1249/MSS.0000000000003897',pmid:'41843416',pmcid:'PMC12965823',shortCitation:'Currier BS et al. · 2026 (ACSM)',populationSummary:'137 систематичних оглядів, понад 30 000 учасників.',keyLimitations:['Огляд оглядів: величини окремих ефектів в анотації не наведено.']}),
 source('SRC-000113',{title:'Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy: A Systematic Review with Meta-analysis',authors:['Refalo MC','Helms ER','Trexler ET','et al.'],year:2022,journal:'Sports Medicine',doi:'10.1007/s40279-022-01784-y',pmid:'36334240',pmcid:'PMC9935748',shortCitation:'Refalo MC et al. · 2022',populationSummary:'15 досліджень.',keyLimitations:['Різні визначення відмови.']}),
 source('SRC-000114',{title:'Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training: A Systematic Review and Meta-analysis',authors:['Schoenfeld BJ','Grgic J','Ogborn D','Krieger JW'],year:2017,journal:'Journal of Strength and Conditioning Research',doi:'10.1519/JSC.0000000000002200',pmid:'28834797',shortCitation:'Schoenfeld BJ et al. · 2017',populationSummary:'21 дослідження.',keyLimitations:['Величини ефектів в анотації не наведено.']}),
 source('SRC-000115',{title:'Compatibility of Concurrent Aerobic and Strength Training for Skeletal Muscle Size and Function: An Updated Systematic Review and Meta-Analysis',authors:['Schumann M','Feuerbacher JF','Sünkeler M','et al.'],year:2021,journal:'Sports Medicine',doi:'10.1007/s40279-021-01587-7',pmid:'34757594',pmcid:'PMC8891239',shortCitation:'Schumann M et al. · 2021',populationSummary:'43 дослідження.',keyLimitations:['Мало даних про спортсменів високого рівня.']}),
 source('SRC-000116',{title:'The Effect of Carbohydrate Intake on Muscle Hypertrophy: A Systematic Review and Meta-analysis',authors:['Henselmans M','Vårvik FT','Izquierdo M'],year:2026,journal:'Sports Medicine',doi:'10.1007/s40279-025-02341-z',pmid:'41712097',pmcid:'PMC13018098',shortCitation:'Henselmans M et al. · 2026',populationSummary:'11 РКД.',keyLimitations:['Певність доказів низька (GRADE).']}),
 source('SRC-000117',{title:'The effect of acute sleep deprivation on skeletal muscle protein synthesis and the hormonal environment',authors:['Lamon S','Morabito A','Arentson-Lantz E','et al.'],year:2021,journal:'Physiological Reports',publicationType:'original_research',doi:'10.14814/phy2.14660',pmid:'33400856',pmcid:'PMC7785053',shortCitation:'Lamon S et al. · 2021',populationSummary:'13 здорових молодих дорослих, перехресний дизайн.',keyLimitations:['Мала вибірка, гострий показник.']}),
 source('SRC-000118',{title:'Effects of Resistance Training Volume on Physical Function, Lean Body Mass and Lower-Body Muscle Hypertrophy and Strength in Older Adults: A Systematic Review and Network Meta-analysis of 151 Randomised Trials',authors:['Radaelli R','Rech A','Molinari T','et al.'],year:2024,journal:'Sports Medicine',doi:'10.1007/s40279-024-02123-z',pmid:'39405023',shortCitation:'Radaelli R et al. · 2024',populationSummary:'151 РКД, 6306 людей від 60 років.',keyLimitations:['Мало даних про людей з обмеженою функцією.']}),
 source('SRC-000119',{title:'The increase in muscle force after 4 weeks of strength training is mediated by adaptations in motor unit recruitment and rate coding',authors:['Del Vecchio A','Casolo A','Negro F','et al.'],year:2019,journal:'Journal of Physiology',publicationType:'original_research',doi:'10.1113/JP277250',pmid:'30727028',pmcid:'PMC6441907',shortCitation:'Del Vecchio A et al. · 2019',populationSummary:'14 людей у тренувальній і 14 у контрольній групі.',keyLimitations:['Один м’яз, ізометричні тренування.']}),
 source('SRC-000120',{title:'Vegan and Omnivorous High Protein Diets Support Comparable Daily Myofibrillar Protein Synthesis Rates and Skeletal Muscle Hypertrophy in Young Adults',authors:['Monteyne AJ','Coelho MOC','Murton AJ','et al.'],year:2023,journal:'Journal of Nutrition',publicationType:'original_research',doi:'10.1016/j.tjnut.2023.02.023',pmid:'36822394',pmcid:'PMC10308267',shortCitation:'Monteyne AJ et al. · 2023',populationSummary:'Фаза 2: 22 молоді дорослі, 10 тижнів.',keyLimitations:['Мала вибірка.','Серед авторів — співробітник виробника мікопротеїну (Marlow Foods).']})
];

const record=(id,sourceId,claimId,o)=>({id,sourceId,claimId,evidenceLayer:'human_outcome',direction:'supports_claim',relevance:'direct',roleForClaim:'supporting',riskOfBias:{status:'not_assessed'},reviewStatus:'pending',lastChecked:checked,extractionLocator:'Анотація PubMed',...accepted,...o});
const smd=(estimate,lowerCI,upperCI)=>({effectMeasure:'Стандартизована різниця середніх',estimate,lowerCI,upperCI,unit:'',confidenceLevel:95});
export const practiceRecords=[
 record('EVR-000217','SRC-000112','CLM-000105',{roleForClaim:'primary_support',outcome:{name:'Гіпертрофія залежно від обсягу'},result:{summary:'Гіпертрофію посилювали більший обсяг (≥10 підходів на тиждень) і ексцентричне перевантаження; тренування до відмови, періодизація, тип обладнання, час під навантаженням не давали стабільної різниці.'}}),
 record('EVR-000218','SRC-000113','CLM-000106',{roleForClaim:'primary_support',outcome:{name:'Гіпертрофія: повна відмова проти «не до відмови»'},result:smd(0.12,-0.13,0.37),populationContext:{description:'p = 0,343; різниці не виявлено'}}),
 record('EVR-000219','SRC-000113','CLM-000106',{roleForClaim:'context_only',outcome:{name:'Гіпертрофія: будь-яке визначення відмови'},result:{...smd(0.19,0.00,0.37),pValue:0.045},populationContext:{description:'Тривіальна перевага за оцінкою авторів'}}),
 record('EVR-000220','SRC-000112','CLM-000106',{roleForClaim:'context_only',outcome:{name:'Тренування до моментальної втоми (ACSM)'},result:{summary:'Не давало стабільного впливу на результати тренувань.'}}),
 record('EVR-000221','SRC-000114','CLM-000107',{roleForClaim:'primary_support',outcome:{name:'Гіпертрофія та 1ПМ: легка проти важкої ваги'},result:{summary:'Приріст 1ПМ значуще більший із важкою вагою; ізометрична сила й розмір м’язів — без значущої різниці.'}}),
 record('EVR-000222','SRC-000115','CLM-000108',{roleForClaim:'primary_support',outcome:{name:'Розмір м’язів'},result:smd(-0.01,-0.16,0.18),populationContext:{description:'p = 0,919'}}),
 record('EVR-000223','SRC-000115','CLM-000108',{roleForClaim:'primary_support',outcome:{name:'Максимальна сила'},result:smd(-0.06,-0.20,0.09),populationContext:{description:'p = 0,446'}}),
 record('EVR-000224','SRC-000115','CLM-000108',{roleForClaim:'primary_support',outcome:{name:'Вибухова сила'},result:smd(-0.28,-0.48,-0.08),populationContext:{description:'p = 0,007; більше в одному занятті'}}),
 record('EVR-000225','SRC-000116','CLM-000109',{roleForClaim:'primary_support',outcome:{name:'Гіпертрофія'},result:{summary:'SMD 0,15, p = 0,23; в ізокалорійних дослідженнях SMD 0,15, p = 0,60. Довірчий інтервал в анотації не наведено; певність низька.'}}),
 record('EVR-000226','SRC-000117','CLM-000110',{roleForClaim:'primary_support',outcome:{name:'Синтез м’язового білка після їжі'},result:{summary:'0,072 ± 0,015 проти 0,059 ± 0,014 %/год (−18%, p = 0,040); кортизол +21% (p = 0,030), тестостерон −24% (p = 0,029).'}}),
 record('EVR-000227','SRC-000118','CLM-000111',{roleForClaim:'primary_support',outcome:{name:'Безжирова маса, малий обсяг'},result:smd(0.25,0.10,0.40)}),
 record('EVR-000228','SRC-000118','CLM-000111',{roleForClaim:'primary_support',outcome:{name:'Розмір м’язів ніг, малий обсяг'},result:smd(0.40,0.25,0.54)}),
 record('EVR-000229','SRC-000119','CLM-000112',{roleForClaim:'primary_support',outcome:{name:'Частота розрядів моторних одиниць'},result:{summary:'+3,3 ± 2,5 імпульсу за секунду (p < 0,001) під час субмаксимальних скорочень; поріг увімкнення знизився (p < 0,05).'}}),
 record('EVR-000230','SRC-000120','CLM-000113',{roleForClaim:'primary_support',outcome:{name:'Безжирова маса, об’єм стегна, площа волокон'},result:{summary:'Безжирова маса +3,1 ± 2,5 кг (веганська) і +2,6 ± 1,1 кг (змішана); об’єм стегна +8,3% в обох; площа волокон +32% і +33%; p > 0,05.'}})
];

export const practiceIds=practiceClaims.map(c=>c.id);
export const proteinIds=['CLM-000009','CLM-000010','CLM-000053','CLM-000054','CLM-000055'];
export const practiceLabels={'CLM-000105':'Обсяг','CLM-000106':'Відмова','CLM-000107':'Легка чи важка вага','CLM-000108':'Кардіо + силові','CLM-000109':'Вуглеводи','CLM-000110':'Сон','CLM-000111':'Від 60 років','CLM-000112':'Нервова адаптація','CLM-000113':'Веганська дієта'};

// One drawer base for the guide: the nine Claims above plus the five protein Claims already published on the protein card.
export const practiceBase=createEvidenceBase({
 claims:[...practiceClaims,...proteinBase.claims.filter(c=>proteinIds.includes(c.id))],
 sources:[...practiceSources,...proteinBase.sources],
 records:[...practiceRecords,...proteinBase.records.filter(r=>proteinIds.includes(r.claimId))],
 presentation:{labels:{...practiceLabels,...proteinBase.presentation.labels},confidenceNote:'Числа — середні по дослідженнях. Вони не прогнозують результат конкретної людини.'}
});
