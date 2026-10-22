// Омега-3: формулювання погоджено власником 21.10.2026 («Ок»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Abdelhamid 2020 (Cochrane), Gencer 2021, Yan 2022, Wang 2023.
// CLM-000011, SRC-000014, EVR-000018 продовжують чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-21';
export const omegaAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-21T06:08:00+03:00',
  scope: 'Омега-3: чотири твердження й докази до них (погоджено власником у робочому чаті 21.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: omegaAcceptance};

export const omegaModule = {
  id: 'MOD-SUPPLEMENTS-OMEGA-001', title: 'Омега-3', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-omega', replacesDossier: 'DOS-OMEGA',
  claimIds: ['CLM-000011', 'CLM-000062', 'CLM-000063', 'CLM-000064'],
  notClaimed: [
    {topic: 'Рецептурний EPA — те саме, що добавка', reason: 'В огляді Yan 2022 (15 РКД) невелике зниження великих серцевих подій було пов’язане переважно з рецептурним препаратом EPA (етиловий ефір). Добавка з магазину — інший продукт, і цей результат на неї не переносимо.'},
    {topic: 'Допомагає мозку, від депресії чи для суглобів', reason: 'Ці питання тут не розбирали; висновків про них не робимо.'}
  ],
  commonLimits: ['Пошук огляду Cochrane завершено в лютому 2019 року; новіші дослідження частково враховані в оглядах Gencer 2021 і Yan 2022.', 'Більшість досліджень — капсули EPA/DHA у дорослих із різним серцево-судинним ризиком, переважно в країнах з високим доходом.', 'Рівні впевненості — попередня оцінка Evidence UA (22.10.2026), що спирається на оцінки певності авторів оглядів.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['omega-3'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Довголанцюгові омега-3 (EPA, DHA), переважно капсули'}, comparator: {description: 'Плацебо або звичайне харчування'}, ...o});
const adults = {description: 'Дорослі з різним серцево-судинним ризиком у РКД тривалістю щонайменше рік.'};

const claims = [
  claim('CLM-000011', {
    statement: 'Довголанцюгові омега-3 майже не змінюють ризик серцево-судинних подій і загальну смертність; можливе невелике зниження подій ішемічної хвороби серця має низьку певність.',
    shortStatement: 'На серце й смертність майже не впливає.',
    outcome: {name: 'Серцево-судинні події, загальна смертність, події ІХС'}, population: adults,
    evidenceSummary: 'В огляді Cochrane 2020 (86 РКД) відношення ризиків для серцево-судинних подій становило 0,96, для загальної смертності — 0,97; обидва інтервали включають 1. Події ішемічної хвороби серця траплялися трохи рідше (0,91): щоб уникнути однієї такої події, добавку мають приймати близько 167 людей. Автори оцінюють певність цього результату як низьку.',
    limitations: ['Новіші дослідження після 2019 року в цей огляд не ввійшли.', 'Результат не переносимо на рецептурні препарати EPA.']
  }),
  claim('CLM-000062', {
    statement: 'Довголанцюгові омега-3 знижують тригліцериди приблизно на 15%, і що більша доза, то сильніше.',
    shortStatement: 'Знижує тригліцериди — приблизно на 15%.',
    outcome: {name: 'Тригліцериди крові'}, population: adults,
    evidenceSummary: 'В огляді Cochrane зниження тригліцеридів приблизно на 15% мало високу певність за оцінкою авторів і залежало від дози. Дозозалежний метааналіз Wang 2023 (90 РКД) також показав майже лінійне зниження тригліцеридів зі збільшенням дози.',
    limitations: ['Зниження тригліцеридів саме по собі не довело зменшення серцевих подій (див. попереднє твердження).']
  }),
  claim('CLM-000063', {
    claimType: 'safety',
    statement: 'У великих дослідженнях добавки омега-3 підвищували ризик фібриляції передсердь, сильніше — у дозах понад 1 г на добу.',
    shortStatement: 'Підвищує ризик фібриляції передсердь, особливо понад 1 г/добу.',
    outcome: {name: 'Фібриляція передсердь'},
    population: {description: 'Дорослі (середній вік 65 років) у 7 великих РКД серцево-судинних наслідків.'},
    evidenceSummary: 'У метааналізі Gencer 2021 (81 210 учасників, у середньому 4,9 року) відношення ризиків фібриляції передсердь становило 1,25. У дослідженнях із дозою понад 1 г на добу — 1,49, до 1 г — 1,12. Кожен додатковий грам на добу підвищував ризик приблизно на 11%.',
    limitations: ['Фібриляцію передсердь не завжди визначали як головний результат: частину випадків брали з побічних ефектів і госпіталізацій.', 'Дані — з досліджень серцевих наслідків, а не про людей, які вже мають фібриляцію.']
  }),
  claim('CLM-000064', {
    statement: 'Рослинна омега-3 (альфа-ліноленова кислота, ALA) — інша речовина: на загальну смертність вона майже не впливає, і висновки про EPA та DHA на неї не переносяться.',
    shortStatement: 'Рослинна ALA — інша речовина з окремими даними.',
    outcome: {name: 'Загальна смертність, серцево-судинні події'},
    population: {description: 'Дорослі в 5 РКД зі збільшенням споживання ALA.'},
    intervention: {name: 'Збільшення споживання ALA'},
    evidenceSummary: 'В огляді Cochrane відношення ризиків загальної смертності для ALA становило 1,01, серцево-судинних подій — 0,95; обидва інтервали широкі й включають 1.',
    limitations: ['Лише 5 досліджень, приблизно 19 тисяч учасників.']
  })
];


// Рівні впевненості погоджено власником 22.10.2026 («Погоджую»): GRADE-informed v1, попередні (лише анотації),
// формального наукового перегляду не було. Твердження поза мапою (нормативи) лишаються «не оцінено».
export const confidenceAcceptance = {kind: 'user_confidence_approval', at: '2026-10-22T18:04:00+03:00', framework: 'evidenceua_grade_informed_v1', provisional: true, formalScientificReview: false};
const approvedLevels = {'CLM-000011': ['high', 'Огляд Cochrane: висока певність за авторами для серцево-судинних подій і смертності.'], 'CLM-000062': ['high', 'Огляд Cochrane: висока певність за авторами; підтверджено дозозалежним метааналізом.'], 'CLM-000063': ['moderate', 'Великі РКД, але фібриляцію не завжди оцінювали як головний результат.'], 'CLM-000064': ['low', 'Лише 5 РКД; для серцево-судинних подій певність за авторами низька.']};
for (const c of claims) if (approvedLevels[c.id]) Object.assign(c, {evidenceConfidence: approvedLevels[c.id][0], confidenceFramework: 'evidenceua_grade_informed_v1', provisional: true, confidenceAcceptance,
  confidenceRationale: {summary: approvedLevels[c.id][1], uncertaintyNotes: ['Попередня оцінка за анотаціями оглядів; формального наукового перегляду Evidence UA не було.']}});

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, ...o});
const sources = [
  source('SRC-000014', {title: 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease', authors: ['Abdelhamid AS', 'Brown TJ', 'Brainard JS', 'et al.'], year: 2020, journal: 'Cochrane Database of Systematic Reviews', doi: '10.1002/14651858.CD003177.pub5', pmid: '32114706', pmcid: 'PMC7049091', shortCitation: 'Abdelhamid AS et al. · 2020 (Cochrane)', populationSummary: '86 РКД, 162 796 учасників; 12–88 місяців.', methodsSummary: 'Прочитано анотацію в PubMed. Окремі метааналізи для LCn3 і ALA, метарегресія дози.', keyLimitations: ['Пошук завершено в лютому 2019 року.']}),
  source('SRC-000062', {title: 'Effect of Long-Term Marine ɷ-3 Fatty Acids Supplementation on the Risk of Atrial Fibrillation in Randomized Controlled Trials of Cardiovascular Outcomes: A Systematic Review and Meta-Analysis', authors: ['Gencer B', 'Djousse L', 'Al-Ramady OT', 'et al.'], year: 2021, journal: 'Circulation', doi: '10.1161/CIRCULATIONAHA.121.055654', pmid: '34612056', pmcid: 'PMC9109217', shortCitation: 'Gencer B et al. · 2021', populationSummary: '7 РКД, 81 210 учасників, у середньому 4,9 року.', methodsSummary: 'Прочитано анотацію в PubMed. Модель випадкових ефектів з поправкою Knapp-Hartung, метарегресія дози.', keyLimitations: ['Лише 7 досліджень; різне визначення фібриляції передсердь.']}),
  source('SRC-000063', {title: 'Efficacy and Safety of Omega-3 Fatty Acids in the Prevention of Cardiovascular Disease: A Systematic Review and Meta-analysis', authors: ['Yan J', 'Liu M', 'Yang D', 'et al.'], year: 2022, journal: 'Cardiovascular Drugs and Therapy', doi: '10.1007/s10557-022-07379-z', pmid: '36103100', shortCitation: 'Yan J et al. · 2022', populationSummary: '15 РКД, включно з рецептурними препаратами EPA.', methodsSummary: 'Прочитано анотацію в PubMed. Модель випадкових ефектів, підгрупи за типом препарату.', keyLimitations: ['Об’єднує добавки й рецептурні препарати.']}),
  source('SRC-000070', {title: 'Association Between Omega-3 Fatty Acid Intake and Dyslipidemia: A Continuous Dose-Response Meta-Analysis of Randomized Controlled Trials', authors: ['Wang T', 'Zhang X', 'Zhou N', 'et al.'], year: 2023, journal: 'Journal of the American Heart Association', doi: '10.1161/JAHA.123.029512', pmid: '37264945', pmcid: 'PMC10381976', shortCitation: 'Wang T et al. · 2023', populationSummary: '90 РКД, 72 598 учасників.', methodsSummary: 'Прочитано анотацію в PubMed. Одноетапна сплайн-регресія доза–відповідь.', keyLimitations: ['Числову величину зниження в анотації не наведено.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const ratio = (effectMeasure, estimate, lowerCI, upperCI) => ({effectMeasure, estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const RR = 'Відношення ризиків', HR = 'Відношення ризиків (HR)';
const records = [
  record('EVR-000018', 'SRC-000014', 'CLM-000011', {roleForClaim: 'primary_support', outcome: {name: 'Серцево-судинні події'}, result: ratio(RR, 0.96, 0.92, 1.01), populationContext: {description: '43 РКД, 140 482 учасники; висока певність за авторами'}}),
  record('EVR-000125', 'SRC-000014', 'CLM-000011', {roleForClaim: 'primary_support', outcome: {name: 'Загальна смертність'}, result: ratio(RR, 0.97, 0.93, 1.01), populationContext: {description: '45 РКД, 143 693 учасники; висока певність за авторами'}}),
  record('EVR-000126', 'SRC-000014', 'CLM-000011', {outcome: {name: 'Події ішемічної хвороби серця'}, result: ratio(RR, 0.91, 0.85, 0.97), populationContext: {description: '32 РКД, 134 116 учасників; NNTB 167; низька певність за авторами'}}),
  record('EVR-000127', 'SRC-000063', 'CLM-000011', {roleForClaim: 'context_only', direction: 'mixed', outcome: {name: 'Великі серцево-судинні події, включно з рецептурним EPA'}, result: ratio(RR, 0.95, 0.91, 0.99), populationContext: {description: '15 РКД; за авторами, користь переважно від рецептурного EPA етилового ефіру'}}),
  record('EVR-000128', 'SRC-000014', 'CLM-000062', {roleForClaim: 'primary_support', outcome: {name: 'Тригліцериди'}, result: {summary: 'Збільшення споживання LCn3 знижувало тригліцериди приблизно на 15% залежно від дози; висока певність за авторами.'}, populationContext: {description: 'РКД огляду Cochrane'}}),
  record('EVR-000129', 'SRC-000070', 'CLM-000062', {outcome: {name: 'Тригліцериди: доза–відповідь'}, result: {summary: 'Майже лінійне зниження тригліцеридів і не-ЛПВЩ холестерину зі збільшенням дози EPA+DHA, помітніше при дозах понад 2 г/добу в людей з гіперліпідемією чи надмірною вагою.'}, populationContext: {description: '90 РКД, 72 598 учасників'}}),
  record('EVR-000130', 'SRC-000062', 'CLM-000063', {roleForClaim: 'primary_support', outcome: {name: 'Фібриляція передсердь'}, result: ratio(HR, 1.25, 1.07, 1.46), populationContext: {description: '7 РКД, 81 210 учасників, 2905 випадків'}}),
  record('EVR-000131', 'SRC-000062', 'CLM-000063', {outcome: {name: 'Фібриляція передсердь, доза понад 1 г/добу'}, result: ratio(HR, 1.49, 1.04, 2.15), populationContext: {description: 'Дослідження з дозою >1 г/добу, 22 271 учасник'}}),
  record('EVR-000132', 'SRC-000062', 'CLM-000063', {outcome: {name: 'Фібриляція передсердь, доза до 1 г/добу'}, result: ratio(HR, 1.12, 1.03, 1.22), populationContext: {description: 'Дослідження з дозою ≤1 г/добу, 58 939 учасників'}}),
  record('EVR-000133', 'SRC-000062', 'CLM-000063', {outcome: {name: 'Фібриляція передсердь на кожен додатковий 1 г/добу'}, result: ratio(HR, 1.11, 1.06, 1.15), populationContext: {description: 'Метарегресія дози'}}),
  record('EVR-000134', 'SRC-000014', 'CLM-000064', {roleForClaim: 'primary_support', outcome: {name: 'Загальна смертність, ALA'}, result: ratio(RR, 1.01, 0.84, 1.20), populationContext: {description: '5 РКД, 19 327 учасників; помірна певність за авторами'}}),
  record('EVR-000135', 'SRC-000014', 'CLM-000064', {outcome: {name: 'Серцево-судинні події, ALA'}, result: ratio(RR, 0.95, 0.83, 1.07), populationContext: {description: '5 РКД, 19 327 учасників; низька певність за авторами'}})
];

export const omegaBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000011': 'Серце й смертність', 'CLM-000062': 'Тригліцериди', 'CLM-000063': 'Фібриляція передсердь', 'CLM-000064': 'Рослинна омега-3 (ALA)'},
  confidenceNote: 'Числа — середні по великих дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
