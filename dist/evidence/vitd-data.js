// Generated from src/evidence/supplements/vitd/module.mjs.
// Вітамін D: формулювання погоджено власником 21.10.2026 («Ок»). Рівень впевненості свідомо не оцінено.
// Для переломів головним джерелом став новіший метааналіз Massé 2026 (BMJ); висновок погодженого твердження той самий.
// Витяг: анотації PubMed. CLM-000012, SRC-000015, EVR-000019 продовжують чернетку supplements/scientific-draft.mjs.
import {createEvidenceBase} from './registry.js';

const checked = '2026-10-21';
export const vitdAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-21T06:08:00+03:00',
  scope: 'Вітамін D: чотири твердження й докази до них (погоджено власником у робочому чаті 21.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: vitdAcceptance};

export const vitdModule = {
  id: 'MOD-SUPPLEMENTS-VITD-001', title: 'Вітамін D', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-vitd', replacesDossier: 'DOS-VITD',
  claimIds: ['CLM-000012', 'CLM-000065', 'CLM-000066', 'CLM-000067'],
  notClaimed: [
    {topic: 'Як лікувати дефіцит', reason: 'Підтверджений дефіцит і стани, що його спричиняють, — окрема медична тема: потрібні аналіз крові й лікар. Тут ідеться про прийом без відбору за дефіцитом.'},
    {topic: 'Що більше — то краще', reason: 'Навпаки: дуже великі разові дози в дослідженні Sanders 2010 підвищили ризик падінь і переломів.'}
  ],
  commonLimits: ['Більшість учасників досліджень жили вдома й не мали високого ризику переломів чи дефіциту.', 'Підгрупи (щоденний прийом, вихідний рівень вітаміну D) — менш надійні, ніж головні результати.', 'Оцінки певності — авторів оглядів, а не Evidence UA.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['vitamin-d'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Вітамін D3 або D2'}, comparator: {description: 'Плацебо або без добавки'}, ...o});

const claims = [
  claim('CLM-000012', {
    statement: 'Сам вітамін D не зменшує переломів у дорослих, яких не відбирали за дефіцитом; разом із кальцієм щодня зниження невелике.',
    shortStatement: 'Переломів не зменшує. З кальцієм — невеликий ефект.',
    outcome: {name: 'Будь-які переломи'},
    population: {description: 'Дорослі, переважно без високого ризику переломів і без лікування остеопорозу.'},
    evidenceSummary: 'У найновішому метааналізі Massé 2026 (69 РКД, 153 902 учасники) сам вітамін D не змінив ризику переломів (відношення ризиків 1,00; висока певність за авторами), а разом із кальцієм дав 0,91. Автори вважають обидва результати клінічно малими. У дослідженні VITAL 2000 МО на добу протягом 5 років також не зменшили переломів (0,98). Старіший огляд Yao 2019 дає ту саму картину.',
    limitations: ['Для людей з високим ризиком і тих, хто живе в закладах догляду, даних менше.', 'Не стосується лікування підтвердженого дефіциту чи остеопорозу.']
  }),
  claim('CLM-000065', {
    claimType: 'safety',
    statement: 'Дуже великі разові дози шкодять: 500 000 МО раз на рік у жінок від 70 років підвищили частоту падінь і переломів.',
    shortStatement: 'Великі разові дози підвищують ризик падінь і переломів.',
    outcome: {name: 'Падіння, переломи'},
    population: {description: 'Жінки від 70 років з високим ризиком переломів, що жили вдома.'},
    intervention: {name: 'Холекальциферол 500 000 МО перорально раз на рік, 3–5 років'},
    evidenceSummary: 'У рандомізованому дослідженні Sanders 2010 (2256 жінок) падінь було на 15% більше, переломів — на 26%. Найбільше падінь припадало на перші 3 місяці після дози.',
    limitations: ['Одне дослідження з дуже специфічною схемою; не переносимо на щоденний прийом звичайних доз.']
  }),
  claim('CLM-000066', {
    statement: 'Вітамін D трохи зменшує ризик інфекцій дихальних шляхів, помітніше — за щоденного прийому.',
    shortStatement: 'Застуд і подібних інфекцій трохи менше.',
    outcome: {name: 'Щонайменше одна гостра інфекція дихальних шляхів'},
    population: {description: 'Учасники РКД віком від 0 до 95 років.'},
    evidenceSummary: 'У метааналізі Jolliffe 2021 (37 РКД з даними, понад 46 тисяч учасників) хоча б одну інфекцію мали 61,3% тих, хто приймав вітамін D, і 62,3% на плацебо (відношення шансів 0,92). За щоденного прийому ефект був помітніший (0,78).',
    limitations: ['Абсолютна різниця — близько 1 процентного пункту.', 'Зв’язку з вихідним рівнем вітаміну D у цьому огляді не виявили; дані про COVID-19 не оцінювали.']
  }),
  claim('CLM-000067', {
    statement: 'Вітамін D не змінює загальну смертність; дані про смертність від раку суперечливі.',
    shortStatement: 'На загальну смертність не впливає.',
    outcome: {name: 'Загальна смертність, смертність від раку'},
    population: {description: 'Дорослі в РКД проти плацебо або без добавки.'},
    evidenceSummary: 'В огляді Zhang 2019 (52 РКД, 75 454 учасники) відношення ризиків загальної смертності становило 0,98, смертності від раку — 0,84. Новіший аналіз Kuznia 2023 з індивідуальними даними дав для смертності від раку 0,94 без статистичної значущості; лише в підгрупі щоденного прийому — 0,88.',
    limitations: ['Результат для смертності від раку залежить від набору досліджень і схеми прийому.', 'Підгрупа щоденного прийому — не головний аналіз.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, ...o});
const sources = [
  source('SRC-000064', {title: 'Calcium, vitamin D, or combined supplementation to prevent fractures and falls: systematic review and meta-analysis', authors: ['Massé O', 'Mercurio CM', 'Dupuis S', 'et al.'], year: 2026, journal: 'BMJ', doi: '10.1136/bmj-2025-088050', pmid: '42161415', pmcid: 'PMC13188451', shortCitation: 'Massé O et al. · 2026', populationSummary: '69 РКД, 153 902 дорослі без лікування остеопорозу; 87% жили вдома.', methodsSummary: 'Прочитано анотацію в PubMed. RoB 2, GRADE, пороги клінічно важливого абсолютного ефекту.', keyLimitations: ['Мало даних для людей високого ризику та в закладах догляду.']}),
  source('SRC-000015', {title: 'Supplemental Vitamin D and Incident Fractures in Midlife and Older Adults', authors: ['LeBoff MS', 'et al.'], year: 2022, journal: 'New England Journal of Medicine', publicationType: 'original_research', doi: '10.1056/NEJMoa2202106', pmid: '35939577', pmcid: 'PMC9716639', shortCitation: 'LeBoff MS et al. · 2022 (VITAL)', populationSummary: '25 871 учасник: чоловіки від 50, жінки від 55 років у США; без відбору за дефіцитом.', methodsSummary: 'Прочитано анотацію в PubMed. Факторне РКД 2×2, медіана спостереження 5,3 року.', keyLimitations: ['Одне дослідження; популяція без дефіциту й остеопорозу.']}),
  source('SRC-000065', {title: 'Vitamin D and Calcium for the Prevention of Fracture: A Systematic Review and Meta-analysis', authors: ['Yao P', 'Bennett D', 'Mafham M', 'et al.'], year: 2019, journal: 'JAMA Network Open', doi: '10.1001/jamanetworkopen.2019.17789', pmid: '31860103', pmcid: 'PMC6991219', shortCitation: 'Yao P et al. · 2019', populationSummary: '11 РКД вітаміну D (34 243) і 6 РКД вітаміну D з кальцієм (49 282).', methodsSummary: 'Прочитано анотацію в PubMed. Модель фіксованих ефектів.', keyLimitations: ['Старіший і менший огляд, ніж Massé 2026.']}),
  source('SRC-000066', {title: 'Annual high-dose oral vitamin D and falls and fractures in older women: a randomized controlled trial', authors: ['Sanders KM', 'Stuart AL', 'Williamson EJ', 'et al.'], year: 2010, journal: 'JAMA', publicationType: 'original_research', doi: '10.1001/jama.2010.594', pmid: '20460620', shortCitation: 'Sanders KM et al. · 2010', populationSummary: '2256 жінок від 70 років з високим ризиком переломів.', methodsSummary: 'Прочитано анотацію в PubMed. Подвійне сліпе плацебо-контрольоване РКД, 3–5 років.', keyLimitations: ['Одна схема дозування.']}),
  source('SRC-000067', {title: 'Vitamin D supplementation to prevent acute respiratory infections: a systematic review and meta-analysis of aggregate data from randomised controlled trials', authors: ['Jolliffe DA', 'Camargo CA', 'Sluyter JD', 'et al.'], year: 2021, journal: 'Lancet Diabetes & Endocrinology', doi: '10.1016/S2213-8587(21)00051-6', pmid: '33798465', shortCitation: 'Jolliffe DA et al. · 2021', populationSummary: '46 РКД (75 541 учасник); дані головного результату для 48 488 учасників у 43 дослідженнях.', methodsSummary: 'Прочитано анотацію в PubMed. Модель випадкових ефектів, підгрупи за дозою, частотою, віком.', keyLimitations: ['Помітна неоднорідність (I² 35,6%).']}),
  source('SRC-000068', {title: 'Association between vitamin D supplementation and mortality: systematic review and meta-analysis', authors: ['Zhang Y', 'Fang F', 'Tang J', 'et al.'], year: 2019, journal: 'BMJ', doi: '10.1136/bmj.l4673', pmid: '31405892', pmcid: 'PMC6689821', shortCitation: 'Zhang Y et al. · 2019', populationSummary: '52 РКД, 75 454 учасники.', methodsSummary: 'Прочитано анотацію в PubMed. PROSPERO CRD42018117823.', keyLimitations: ['Новіший аналіз смертності від раку дав слабший результат.']}),
  source('SRC-000069', {title: 'Efficacy of vitamin D3 supplementation on cancer mortality: Systematic review and individual patient data meta-analysis of randomised controlled trials', authors: ['Kuznia S', 'Zhu A', 'Akutsu T', 'et al.'], year: 2023, journal: 'Ageing Research Reviews', doi: '10.1016/j.arr.2023.101923', pmid: '37004841', pmcid: 'PMC10214278', shortCitation: 'Kuznia S et al. · 2023', populationSummary: '14 плацебо-контрольованих РКД, 104 727 учасників; індивідуальні дані для 94 068.', methodsSummary: 'Прочитано анотацію в PubMed. Метааналіз агрегованих та індивідуальних даних.', keyLimitations: ['Перевага щоденного прийому — з аналізу підгруп.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const ratio = (effectMeasure, estimate, lowerCI, upperCI) => ({effectMeasure, estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const RR = 'Відношення ризиків', HR = 'Відношення ризиків (HR)', OR = 'Відношення шансів', IRR = 'Відношення частот';
const records = [
  record('EVR-000136', 'SRC-000064', 'CLM-000012', {roleForClaim: 'primary_support', outcome: {name: 'Будь-які переломи, лише вітамін D'}, result: ratio(RR, 1.00, 0.95, 1.06), populationContext: {description: '36 РКД, 92 045 учасників; висока певність за авторами'}}),
  record('EVR-000137', 'SRC-000064', 'CLM-000012', {roleForClaim: 'primary_support', outcome: {name: 'Будь-які переломи, вітамін D з кальцієм'}, result: ratio(RR, 0.91, 0.84, 0.99), populationContext: {description: '15 РКД, 51 126 учасників; висока певність; за авторами — клінічно малий ефект'}}),
  record('EVR-000019', 'SRC-000015', 'CLM-000012', {outcome: {name: 'Усі переломи, VITAL'}, result: ratio(HR, 0.98, 0.89, 1.08), populationContext: {description: '25 871 учасник, 2000 МО/добу, медіана 5,3 року'}}),
  record('EVR-000138', 'SRC-000065', 'CLM-000012', {outcome: {name: 'Будь-які переломи, лише вітамін D (Yao 2019)'}, result: ratio(RR, 1.06, 0.98, 1.14), populationContext: {description: '11 РКД, 34 243 учасники'}}),
  record('EVR-000139', 'SRC-000065', 'CLM-000012', {outcome: {name: 'Будь-які переломи, вітамін D з кальцієм (Yao 2019)'}, result: ratio(RR, 0.94, 0.89, 0.99), populationContext: {description: '6 РКД, 49 282 учасники; 400–800 МО + 1000–1200 мг кальцію щодня'}}),
  record('EVR-000140', 'SRC-000065', 'CLM-000012', {outcome: {name: 'Перелом стегна, вітамін D з кальцієм (Yao 2019)'}, result: ratio(RR, 0.84, 0.72, 0.97), populationContext: {description: '6 РКД, 49 282 учасники'}}),
  record('EVR-000141', 'SRC-000066', 'CLM-000065', {roleForClaim: 'primary_support', outcome: {name: 'Падіння'}, result: ratio(IRR, 1.15, 1.02, 1.30), populationContext: {description: '2256 жінок від 70 років; 83,4 проти 72,7 падіння на 100 людино-років'}}),
  record('EVR-000142', 'SRC-000066', 'CLM-000065', {roleForClaim: 'primary_support', outcome: {name: 'Переломи'}, result: {...ratio(IRR, 1.26, 1.00, 1.59), pValue: 0.047}, populationContext: {description: '171 проти 135 переломів; p = 0,047 (нижня межа ДІ округлена до 1,00)'}}),
  record('EVR-000143', 'SRC-000067', 'CLM-000066', {roleForClaim: 'primary_support', outcome: {name: 'Щонайменше одна інфекція дихальних шляхів'}, result: ratio(OR, 0.92, 0.86, 0.99), populationContext: {description: '37 РКД; 61,3% проти 62,3%'}}),
  record('EVR-000144', 'SRC-000067', 'CLM-000066', {outcome: {name: 'Те саме, щоденний прийом'}, result: ratio(OR, 0.78, 0.65, 0.94), populationContext: {description: '19 РКД; підгрупа'}}),
  record('EVR-000145', 'SRC-000068', 'CLM-000067', {roleForClaim: 'primary_support', outcome: {name: 'Загальна смертність'}, result: ratio(RR, 0.98, 0.95, 1.02), populationContext: {description: '52 РКД, 75 454 учасники; I² = 0%'}}),
  record('EVR-000146', 'SRC-000068', 'CLM-000067', {outcome: {name: 'Смертність від раку (Zhang 2019)'}, result: ratio(RR, 0.84, 0.74, 0.95), populationContext: {description: '52 РКД'}}),
  record('EVR-000147', 'SRC-000069', 'CLM-000067', {direction: 'mixed', outcome: {name: 'Смертність від раку (Kuznia 2023)'}, result: ratio(RR, 0.94, 0.86, 1.02), populationContext: {description: '14 РКД, 104 727 учасників, 2015 смертей від раку'}}),
  record('EVR-000148', 'SRC-000069', 'CLM-000067', {roleForClaim: 'context_only', direction: 'mixed', outcome: {name: 'Смертність від раку, щоденний прийом (Kuznia 2023)'}, result: ratio(RR, 0.88, 0.78, 0.98), populationContext: {description: '10 РКД; підгрупа'}})
];

export const vitdBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000012': 'Переломи', 'CLM-000065': 'Великі разові дози', 'CLM-000066': 'Інфекції дихальних шляхів', 'CLM-000067': 'Смертність'},
  confidenceNote: 'Числа — середні по великих дослідженнях людей без відбору за дефіцитом. Вони не прогнозують результат конкретної людини.'
}});
