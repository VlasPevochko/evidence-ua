// Бета-аланін: формулювання погоджено власником 22.10.2026 («Так»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Saunders 2017, Georgiou 2024, Ashtary-Larky 2022, Dolan 2019; ISSN 2015 (Trexler).
// SRC-000018 продовжує чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-22';
export const betaAlanineAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-22T16:19:00+03:00',
  scope: 'Бета-аланін: чотири твердження й докази до них (погоджено власником у робочому чаті 22.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: betaAlanineAcceptance};

export const betaAlanineModule = {
  id: 'MOD-SUPPLEMENTS-BETA-ALANINE-001', title: 'Бета-аланін', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-beta-alanine', replacesDossier: 'DOS-BETA-ALANINE',
  claimIds: ['CLM-000093', 'CLM-000094', 'CLM-000095', 'CLM-000096'],
  notClaimed: [
    {topic: 'Бета-аланін знижує цукор у крові', reason: 'Ці дослідження стосуються людей з діабетом і переддіабетом (часто разом із карнозином), а не спортсменів.'},
    {topic: 'Разом із креатином діє сильніше', reason: 'У мережевому метааналізі Bai 2026 поєднання не дало додаткової користі порівняно з самим креатином.'}
  ],
  commonLimits: ['Ефект накопичується тижнями: дослідження — це щоденний прийом, а не разова доза.', 'Більшість досліджень — молоді треновані чоловіки.', 'Оцінки певності — авторів оглядів, а не Evidence UA. Прочитано анотації в PubMed, не повні тексти.'],
  guidance: {title: 'Практичний орієнтир — з позиційного документа ISSN 2015, не окреме твердження', dose: '4–6 г на добу щонайменше 2–4 тижні', note: 'Поколювання менше, якщо ділити дозу на прийоми по 1,6 г або брати форму з повільним вивільненням.'}
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['beta-alanine'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Бета-аланін щодня протягом тижнів'}, comparator: {description: 'Плацебо'}, ...o});

const claims = [
  claim('CLM-000093', {
    statement: 'Бета-аланін дає малий загальний ефект; найбільший — у виснажливих зусиллях тривалістю від 30 секунд до 10 хвилин, а в тестах на час різниці не виявлено.',
    shortStatement: 'Малий ефект; найкраще — зусилля 0,5–10 хв.',
    outcome: {name: 'Фізична працездатність'}, population: {description: '40 подвійно сліпих досліджень, 1461 учасник.'},
    evidenceSummary: 'У метааналізі Saunders 2017 загальний ефект — 0,18 (0,08…0,28). Тривалість зусилля впливала на ефект: для зусиль 0,5–10 хв до виснаження — 0,50 (0,25…0,75), для тестів на час — 0,11 (−0,20…0,42), тобто різниці не виявлено. Найбільший ефект — разом із бікарбонатом натрію: 0,43 (0,22…0,64).',
    limitations: ['Об’єднано різні види навантаження й популяції.']
  }),
  claim('CLM-000094', {
    statement: 'У тренованих молодих чоловіків бета-аланін покращує максимальні зусилля тривалістю 0,5–10 хвилин; ефект помітний після 4 тижнів прийому.',
    shortStatement: 'Треновані чоловіки: краще в зусиллях 0,5–10 хв.',
    outcome: {name: 'Максимальні зусилля 0,5–10 хв'}, population: {description: 'Треновані чоловіки 18–40 років; 18 досліджень, 331 учасник.'},
    evidenceSummary: 'У метааналізі Georgiou 2024 загальний ефект — 0,39 (0,09…0,69). Після 4 тижнів — 0,34 (0,02…0,67); для зусиль 4–10 хв — 0,55 (0,07…1,04); при дозі 5,6–6,4 г/добу — 0,35 (0,09…0,62).',
    limitations: ['Лише чоловіки; широкі інтервали.']
  }),
  claim('CLM-000095', {
    statement: 'Бета-аланін не змінює склад тіла: ні безжирову масу, ні жир.',
    shortStatement: 'Склад тіла не змінює.',
    outcome: {name: 'Безжирова маса, жирова маса'}, population: {description: '20 РКД, 492 учасники.'},
    evidenceSummary: 'У метааналізі Ashtary-Larky 2022 безжирова маса змінилася на +0,05 кг (−0,71…0,82), жирова — на −0,24 кг (−1,16…0,68); різниці не виявлено незалежно від дози, тривалості й виду тренувань. Певність від низької до помірної.',
    limitations: ['Досліджень із дієтою й тренуваннями одночасно немає.']
  }),
  claim('CLM-000096', {
    claimType: 'safety',
    statement: 'Єдиний підтверджений побічний ефект бета-аланіну — поколювання шкіри (парестезія); з досліджень через нього вибувають не частіше, ніж на плацебо.',
    shortStatement: 'Поколювання шкіри — єдиний побічний ефект.',
    outcome: {name: 'Побічні ефекти, показники крові'}, population: {description: '101 дослідження на людях і 50 на тваринах.'},
    evidenceSummary: 'В оцінці ризиків Dolan 2019 шанси парестезії були в 8,9 раза вищими, ніж на плацебо (95% інтервал вірогідності 2,2…32,6). Вибування з досліджень — як на плацебо. АЛТ у крові трохи зросла, але лишалася в межах норми. ISSN радить ділити дозу на прийоми по 1,6 г, щоб зменшити поколювання.',
    limitations: ['Байєсівські інтервали вірогідності, а не довірчі інтервали.', 'Безпеку оцінено в межах доз із досліджень.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, methodsSummary: 'Прочитано анотацію в PubMed.', ...o});
const sources = [
  source('SRC-000018', {title: 'β-alanine supplementation to improve exercise capacity and performance: a systematic review and meta-analysis', authors: ['Saunders B', 'Elliott-Sale K', 'Artioli GG', 'et al.'], year: 2017, journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2016-096396', pmid: '27797728', shortCitation: 'Saunders B et al. · 2017', populationSummary: '40 досліджень, 1461 учасник.', keyLimitations: ['Трирівнева модель; різні протоколи.']}),
  source('SRC-000101', {title: 'Effect of Beta-Alanine Supplementation on Maximal Intensity Exercise in Trained Young Male Individuals: A Systematic Review and Meta-Analysis', authors: ['Georgiou GD', 'Antoniou K', 'Antoniou S', 'et al.'], year: 2024, journal: 'International Journal of Sport Nutrition and Exercise Metabolism', doi: '10.1123/ijsnem.2024-0027', pmid: '39032921', shortCitation: 'Georgiou GD et al. · 2024', populationSummary: '18 досліджень, 331 тренований чоловік.', keyLimitations: ['Лише чоловіки.']}),
  source('SRC-000102', {title: 'Effects of beta-alanine supplementation on body composition: a GRADE-assessed systematic review and meta-analysis', authors: ['Ashtary-Larky D', 'Bagheri R', 'Ghanavati M', 'et al.'], year: 2022, journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1080/15502783.2022.2079384', pmid: '35813845', pmcid: 'PMC9261744', shortCitation: 'Ashtary-Larky D et al. · 2022', populationSummary: '20 РКД, 492 учасники.', keyLimitations: ['Певність від низької до помірної.']}),
  source('SRC-000103', {title: 'A Systematic Risk Assessment and Meta-Analysis on the Use of Oral β-Alanine Supplementation', authors: ['Dolan E', 'Swinton PA', 'Painelli VS', 'et al.'], year: 2019, journal: 'Advances in Nutrition', doi: '10.1093/advances/nmy115', pmid: '30980076', pmcid: 'PMC6520041', shortCitation: 'Dolan E et al. · 2019', populationSummary: '101 дослідження на людях, 50 на тваринах.', keyLimitations: ['Байєсівські моделі; дози в межах досліджень.']}),
  source('SRC-000104', {title: 'International society of sports nutrition position stand: Beta-Alanine', authors: ['Trexler ET', 'Smith-Ryan AE', 'Stout JR', 'et al.'], year: 2015, journal: 'Journal of the International Society of Sports Nutrition', publicationType: 'position_statement', doi: '10.1186/s12970-015-0090-y', pmid: '26175657', pmcid: 'PMC4501114', shortCitation: 'Trexler ET et al. · 2015 (ISSN)', populationSummary: 'Позиційний документ.', keyLimitations: ['Не окреме дослідження.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const es = (estimate, lowerCI, upperCI) => ({effectMeasure: 'Розмір ефекту', estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const md = (estimate, lowerCI, upperCI) => ({effectMeasure: 'Різниця середніх', estimate, lowerCI, upperCI, unit: 'kg', confidenceLevel: 95});
const records = [
  record('EVR-000197', 'SRC-000018', 'CLM-000093', {roleForClaim: 'primary_support', outcome: {name: 'Загальний ефект'}, result: es(0.18, 0.08, 0.28), populationContext: {description: '70 вимірювань'}}),
  record('EVR-000198', 'SRC-000018', 'CLM-000093', {outcome: {name: 'Зусилля 0,5–10 хв до виснаження'}, result: es(0.50, 0.25, 0.75), populationContext: {description: 'Підгрупа: exercise capacity'}}),
  record('EVR-000199', 'SRC-000018', 'CLM-000093', {direction: 'mixed', outcome: {name: 'Тести на час 0,5–10 хв'}, result: es(0.11, -0.20, 0.42), populationContext: {description: 'Підгрупа: performance; різниці не виявлено'}}),
  record('EVR-000200', 'SRC-000101', 'CLM-000094', {roleForClaim: 'primary_support', outcome: {name: 'Максимальні зусилля, треновані чоловіки'}, result: es(0.39, 0.09, 0.69), populationContext: {description: '18 досліджень, 331 учасник'}}),
  record('EVR-000201', 'SRC-000101', 'CLM-000094', {outcome: {name: 'Після 4 тижнів'}, result: es(0.34, 0.02, 0.67), populationContext: {description: 'Підгрупа'}}),
  record('EVR-000202', 'SRC-000102', 'CLM-000095', {roleForClaim: 'primary_support', outcome: {name: 'Безжирова маса'}, result: md(0.05, -0.71, 0.82), populationContext: {description: '20 РКД; I² = 0%'}}),
  record('EVR-000203', 'SRC-000102', 'CLM-000095', {roleForClaim: 'primary_support', outcome: {name: 'Жирова маса'}, result: md(-0.24, -1.16, 0.68), populationContext: {description: 'I² = 0%'}}),
  record('EVR-000204', 'SRC-000103', 'CLM-000096', {roleForClaim: 'primary_support', outcome: {name: 'Парестезія'}, result: {effectMeasure: 'Відношення шансів', estimate: 8.9, lowerCI: 2.2, upperCI: 32.6, unit: '', confidenceLevel: 95, intervalType: 'Байєсівський інтервал вірогідності'}, populationContext: {description: 'Порівняно з плацебо'}}),
  record('EVR-000205', 'SRC-000104', 'CLM-000096', {roleForClaim: 'context_only', extractionLocator: 'Анотація PubMed: пункти 1–4', outcome: {name: 'Доза й поколювання'}, result: {summary: '4–6 г на добу щонайменше 2–4 тижні; поколювання можна зменшити меншими дозами по 1,6 г або формою з повільним вивільненням.'}, populationContext: {description: 'Позиційний документ ISSN'}})
];

export const betaAlanineBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000093': 'Працездатність', 'CLM-000094': 'Треновані чоловіки', 'CLM-000095': 'Склад тіла', 'CLM-000096': 'Поколювання'},
  confidenceNote: 'Числа — середні по багатьох дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
