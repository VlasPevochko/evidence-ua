// Цитрулін: формулювання погоджено власником 22.10.2026 («Так»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Wang 2026, Harnden 2023, Aguiar 2021, Rhim 2020.
// SRC-000019 продовжує чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-22';
export const citrullineAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-22T16:19:00+03:00',
  scope: 'Цитрулін: чотири твердження й докази до них (погоджено власником у робочому чаті 22.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: citrullineAcceptance};

export const citrullineModule = {
  id: 'MOD-SUPPLEMENTS-CITRULLINE-001', title: 'Цитрулін', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-citrulline', replacesDossier: 'DOS-CITRULLINE',
  claimIds: ['CLM-000097', 'CLM-000098', 'CLM-000099', 'CLM-000100'],
  notClaimed: [
    {topic: 'Цитрулін знижує тиск', reason: 'Метааналіз на цю тему (Mahboobi, Journal of Human Hypertension) відкликано в 2021 році, тому висновку не робимо.'},
    {topic: 'Цитрулін «спалює жир»', reason: 'У метааналізі Ashtary-Larky 2025 (21 РКД) загального впливу на склад тіла не виявлено.'}
  ],
  commonLimits: ['Склад добавок цитрулін-малату не завжди перевіряли.', 'Невеликі дослідження, переважно молоді чоловіки.', 'Оцінки певності — авторів оглядів, а не Evidence UA. Прочитано анотації в PubMed, не повні тексти.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['citrulline'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'L-цитрулін або цитрулін-малат перед навантаженням'}, comparator: {description: 'Плацебо'}, ...o});

const claims = [
  claim('CLM-000097', {
    statement: 'Цитрулін-малат дає лише малий загальний ефект на фізичні результати, з низькою або дуже низькою певністю, і не змінює відчуття навантаження.',
    shortStatement: 'Малий ефект, слабкі докази.',
    outcome: {name: 'Фізична працездатність, відчуття навантаження'}, population: {description: '30 РКД, 644 учасники.'},
    intervention: {name: 'Цитрулін-малат'},
    evidenceSummary: 'У метааналізі Wang 2026 загальний ефект g = 0,16 (p = 0,01), але інтервали прогнозу широкі, а статистична потужність обмежена. Вплив на відчуття навантаження не значущий. Певність за GRADE низька або дуже низька; надійних доз, часу прийому й цільових груп не встановлено.',
    limitations: ['Довірчий інтервал в анотації не наведено.']
  }),
  claim('CLM-000098', {
    statement: 'На витривалість цитрулін не впливає: ні на час до виснаження, ні на час проходження дистанції.',
    shortStatement: 'Витривалість не покращує.',
    outcome: {name: 'Час до виснаження, час на дистанції'}, population: {description: 'Здорові молоді дорослі; 9 досліджень, 158 учасників.'},
    evidenceSummary: 'У метааналізі Harnden 2023 час до виснаження змінився на 0,03 (−0,27…0,33), час на дистанції — на −0,07 (−0,50…0,15) стандартизованої різниці; різниці не виявлено, неоднорідність низька.',
    limitations: ['Невелика кількість досліджень; разовий прийом.']
  }),
  claim('CLM-000099', {
    statement: 'У людей, які тренуються з обтяженнями, цитрулін-малат не збільшує силу.',
    shortStatement: 'Сили не додає.',
    outcome: {name: 'М’язова сила'}, population: {description: 'Треновані дорослі; 4 дослідження.'},
    intervention: {name: 'Цитрулін-малат'},
    evidenceSummary: 'У метааналізі Aguiar 2021 ефект на силу — 0,13 (−0,21…0,46); окремо для ніг 0,06 і для рук 0,17, обидва без значущої різниці.',
    limitations: ['Лише 4 дослідження.']
  }),
  claim('CLM-000100', {
    statement: 'Через 24 години після тренування біль у м’язах з цитруліном трохи менший, але через 48–72 години різниці немає.',
    shortStatement: 'Біль менший через 24 год; через 48–72 год — ні.',
    outcome: {name: 'Біль у м’язах, відчуття навантаження, лактат'}, population: {description: 'Здорові люди; 13 досліджень, 206 учасників.'},
    evidenceSummary: 'У метааналізі Rhim 2020 біль через 24 години був меншим (p = 0,04), через 48 годин — p = 0,25, через 72 години — p = 0,62; лактат не змінився. Відчуття навантаження зменшилося (p = 0,03), але новіший і більший метааналіз Wang 2026 цього не підтвердив. В анотації Rhim біль через 48 годин названо «значно меншим», хоча p = 0,25 — це суперечність самої анотації.',
    limitations: ['Величини ефектів в анотації не наведено.', 'Суперечність у тексті анотації щодо 48 годин.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, methodsSummary: 'Прочитано анотацію в PubMed.', ...o});
const sources = [
  source('SRC-000105', {title: 'Effects of Citrulline Malate Supplementation on Exercise Performance: A Systematic Review and Three-Level Meta-Analysis', authors: ['Wang X', 'Fan X', 'Chang J', 'et al.'], year: 2026, journal: 'Nutrients', doi: '10.3390/nu18121881', pmid: '42356270', pmcid: 'PMC13304508', shortCitation: 'Wang X et al. · 2026', populationSummary: '30 РКД, 644 учасники.', keyLimitations: ['Низька або дуже низька певність за GRADE.']}),
  source('SRC-000106', {title: 'Effects of citrulline on endurance performance in young healthy adults: a systematic review and meta-analysis', authors: ['Harnden CS', 'Agu J', 'Gascoyne T'], year: 2023, journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1080/15502783.2023.2209056', pmid: '37155582', pmcid: 'PMC10167868', shortCitation: 'Harnden CS et al. · 2023', populationSummary: '9 досліджень, 158 учасників.', keyLimitations: ['Мало досліджень.']}),
  source('SRC-000107', {title: 'Effects of Citrulline Malate Supplementation on Muscle Strength in Resistance-Trained Adults: A Systematic Review and Meta-Analysis of Randomized Controlled Trials', authors: ['Aguiar AF', 'Casonatto J'], year: 2021, journal: 'Journal of Dietary Supplements', doi: '10.1080/19390211.2021.1939473', pmid: '34176406', shortCitation: 'Aguiar AF, Casonatto J · 2021', populationSummary: '4 дослідження, 138 вимірювань.', keyLimitations: ['Лише 4 дослідження.']}),
  source('SRC-000019', {title: 'Effect of citrulline on post-exercise rating of perceived exertion, muscle soreness, and blood lactate levels: A systematic review and meta-analysis', authors: ['Rhim HC', 'Kim SJ', 'Park J', 'Jang KM'], year: 2020, journal: 'Journal of Sport and Health Science', doi: '10.1016/j.jshs.2020.02.003', pmid: '33308806', pmcid: 'PMC7749242', shortCitation: 'Rhim HC et al. · 2020', populationSummary: '13 досліджень, 206 учасників.', keyLimitations: ['Анотація називає біль через 48 год значно меншим при p = 0,25.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const smd = (estimate, lowerCI, upperCI, effectMeasure = 'Стандартизована різниця середніх') => ({effectMeasure, estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const records = [
  record('EVR-000206', 'SRC-000105', 'CLM-000097', {roleForClaim: 'primary_support', outcome: {name: 'Фізична працездатність загалом'}, result: {effectMeasure: 'Hedges g', estimate: 0.16, lowerCI: null, upperCI: null, significant: true, pValueText: 'p = 0,01', unit: '', confidenceLevel: 95}, populationContext: {description: '30 РКД, 138 оцінок ефекту; низька або дуже низька певність'}}),
  record('EVR-000207', 'SRC-000106', 'CLM-000098', {roleForClaim: 'primary_support', outcome: {name: 'Час до виснаження'}, result: smd(0.03, -0.27, 0.33), populationContext: {description: '5 досліджень; I² = 0%'}}),
  record('EVR-000208', 'SRC-000106', 'CLM-000098', {roleForClaim: 'primary_support', outcome: {name: 'Час на дистанції'}, result: smd(-0.07, -0.50, 0.15), populationContext: {description: '4 дослідження; I² = 0%'}}),
  record('EVR-000209', 'SRC-000107', 'CLM-000099', {roleForClaim: 'primary_support', outcome: {name: 'М’язова сила'}, result: smd(0.13, -0.21, 0.46), populationContext: {description: '4 дослідження'}}),
  record('EVR-000210', 'SRC-000019', 'CLM-000100', {roleForClaim: 'primary_support', outcome: {name: 'Біль у м’язах і відчуття навантаження'}, result: {summary: 'Біль через 24 год: p = 0,04; через 48 год: p = 0,25; через 72 год: p = 0,62. Відчуття навантаження: p = 0,03. Лактат: p = 0,17.'}, populationContext: {description: '13 досліджень, 206 учасників'}})
];

export const citrullineBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000097': 'Загальний ефект', 'CLM-000098': 'Витривалість', 'CLM-000099': 'Сила', 'CLM-000100': 'Біль після тренування'},
  confidenceNote: 'Числа — середні по багатьох дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
