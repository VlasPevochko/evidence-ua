// Generated from src/evidence/supplements/collagen/module.mjs.
// Колаген: формулювання погоджено власником 22.10.2026 («Так»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Bischof 2024, Simental-Mendía 2024, Pu 2023.
// SRC-000017 продовжує чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from './registry.js';

const checked = '2026-10-22';
export const collagenAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-22T16:19:00+03:00',
  scope: 'Колаген: чотири твердження й докази до них (погоджено власником у робочому чаті 22.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: collagenAcceptance};

export const collagenModule = {
  id: 'MOD-SUPPLEMENTS-COLLAGEN-001', title: 'Колаген', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-collagen', replacesDossier: 'DOS-COLLAGEN',
  claimIds: ['CLM-000089', 'CLM-000090', 'CLM-000091', 'CLM-000092'],
  notClaimed: [
    {topic: 'Колаген лікує травми сухожиль чи зв’язок', reason: 'Дані про будову сухожиль мають дуже низьку певність і стосуються здорових людей, які тренуються.'},
    {topic: 'Колаген від болю в суглобах у всіх', reason: 'Дані про біль — у людей з остеоартритом колін, з дуже різними результатами між дослідженнями.'}
  ],
  commonLimits: ['Дослідження використовують різні види колагену (гідролізовані пептиди, неденатурований тип II) і різні дози.', 'Частина досліджень фінансувалася виробниками; автори оглядів відзначають упередження.', 'Оцінки певності — авторів оглядів, а не Evidence UA. Прочитано анотації в PubMed, не повні тексти.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['collagen'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Колагенові пептиди щодня'}, comparator: {description: 'Плацебо'}, ...o});
const trained = {description: 'Здорові дорослі, які тренуються щонайменше 8 тижнів; 19 РКД, 768 учасників.'};

const claims = [
  claim('CLM-000089', {
    statement: 'Колаген разом із тренуваннями дає трохи більше безжирової маси й сили, ніж тренування з плацебо.',
    shortStatement: 'Трохи більше безжирової маси й сили.',
    outcome: {name: 'Безжирова маса, максимальна сила'}, population: trained, intervention: {name: 'Колагенові пептиди щодня разом із тренуваннями'},
    evidenceSummary: 'У метааналізі Bischof 2024 безжирова маса зросла на 0,48 стандартизованої різниці, максимальна сила — на 0,19 (обидва p < 0,01). Певність доказів автори оцінюють як помірну для складу тіла й низьку для сили.',
    limitations: ['Довірчі інтервали в анотації не наведено.', 'Порівняння з плацебо, а не з тим самим обсягом звичайного білка.']
  }),
  claim('CLM-000090', {
    statement: 'Колаген разом із тренуваннями змінював будову сухожиль, але певність цього результату дуже низька.',
    shortStatement: 'Будова сухожиль змінюється; певність дуже низька.',
    outcome: {name: 'Морфологія сухожиль'}, population: trained, intervention: {name: 'Колагенові пептиди щодня разом із тренуваннями'},
    evidenceSummary: 'У метааналізі Bischof 2024 показники будови сухожиль змінилися на 0,67 стандартизованої різниці (p < 0,01); певність за GRADE дуже низька. Механічні властивості сухожиль автори оцінюють як недостатньо досліджені.',
    limitations: ['Невелика кількість досліджень; різні методи вимірювання.']
  }),
  claim('CLM-000091', {
    statement: 'При остеоартриті колін колаген зменшує біль і покращує функцію, але результати досліджень дуже різняться.',
    shortStatement: 'Остеоартрит колін: менше болю; дуже різні результати.',
    outcome: {name: 'Біль і функція колін'}, population: {description: 'Люди з остеоартритом колін; 11 РКД, 870 учасників.'},
    intervention: {name: 'Добавки на основі колагену'},
    evidenceSummary: 'У метааналізі Simental-Mendía 2024 біль зменшився на 13,63 бала (6,58…20,67), функція покращилася на 6,46 бала (3,40…9,52) за шкалами досліджень. Неоднорідність висока: I² = 88% для болю і 75% для функції.',
    limitations: ['Анотація не називає шкал, тому бали не можна перевести у відсотки.', 'Дослідження використовували різні види колагену.']
  }),
  claim('CLM-000092', {
    statement: 'Гідролізований колаген покращує зволоженість і пружність шкіри, але в дослідженнях автори огляду знайшли упередження.',
    shortStatement: 'Шкіра зволоженіша й пружніша; є упередження.',
    outcome: {name: 'Зволоженість і пружність шкіри'}, population: {description: '26 РКД, 1721 учасник.'},
    intervention: {name: 'Гідролізований колаген'},
    evidenceSummary: 'У метааналізі Pu 2023 гідролізований колаген покращив зволоженість (Z = 4,94) і пружність шкіри (Z = 4,49; обидва p < 0,00001) порівняно з плацебо. Ефект на зволоженість залежав від джерела колагену й тривалості прийому. Автори виявили низку упереджень у дослідженнях і закликають до великих незалежних РКД.',
    limitations: ['Величину ефекту в анотації не наведено.', 'Частина досліджень мала ризики упередженості.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, methodsSummary: 'Прочитано анотацію в PubMed.', ...o});
const sources = [
  source('SRC-000017', {title: 'Impact of Collagen Peptide Supplementation in Combination with Long-Term Physical Training on Strength, Musculotendinous Remodeling, Functional Recovery, and Body Composition in Healthy Adults: A Systematic Review with Meta-analysis', authors: ['Bischof K', 'Moitzi AM', 'Stafilidis S', 'König D'], year: 2024, journal: 'Sports Medicine', doi: '10.1007/s40279-024-02079-0', pmid: '39060741', pmcid: 'PMC11561013', shortCitation: 'Bischof K et al. · 2024', populationSummary: '19 РКД, 768 учасників.', keyLimitations: ['Певність від дуже низької до помірної.']}),
  source('SRC-000099', {title: 'Effect of collagen supplementation on knee osteoarthritis: an updated systematic review and meta-analysis of randomised controlled trials', authors: ['Simental-Mendía M', 'Ortega-Mata D', 'Acosta-Olivo CA', 'et al.'], year: 2024, journal: 'Clinical and Experimental Rheumatology', doi: '10.55563/clinexprheumatol/kflfr5', pmid: '39212129', shortCitation: 'Simental-Mendía M et al. · 2024', populationSummary: '11 РКД, 870 учасників.', keyLimitations: ['Висока неоднорідність (I² 75–88%).']}),
  source('SRC-000100', {title: 'Effects of Oral Collagen for Skin Anti-Aging: A Systematic Review and Meta-Analysis', authors: ['Pu SY', 'Huang YL', 'Pu CM', 'et al.'], year: 2023, journal: 'Nutrients', doi: '10.3390/nu15092080', pmid: '37432180', pmcid: 'PMC10180699', shortCitation: 'Pu SY et al. · 2023', populationSummary: '26 РКД, 1721 учасник.', keyLimitations: ['Автори відзначають упередження в дослідженнях.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const smdNoCI = (estimate, pValueText) => ({effectMeasure: 'Стандартизована різниця середніх', estimate, lowerCI: null, upperCI: null, significant: true, pValueText, unit: '', confidenceLevel: 95});
const md = (estimate, lowerCI, upperCI) => ({effectMeasure: 'Різниця середніх', estimate, lowerCI, upperCI, unit: 'points', confidenceLevel: 95});
const records = [
  record('EVR-000191', 'SRC-000017', 'CLM-000089', {roleForClaim: 'primary_support', outcome: {name: 'Безжирова маса'}, result: smdNoCI(0.48, 'p < 0,01'), populationContext: {description: 'Помірна певність за авторами'}}),
  record('EVR-000192', 'SRC-000017', 'CLM-000089', {roleForClaim: 'primary_support', outcome: {name: 'Максимальна сила'}, result: smdNoCI(0.19, 'p < 0,01'), populationContext: {description: 'Низька певність за авторами'}}),
  record('EVR-000193', 'SRC-000017', 'CLM-000090', {roleForClaim: 'primary_support', outcome: {name: 'Будова сухожиль'}, result: smdNoCI(0.67, 'p < 0,01'), populationContext: {description: 'Дуже низька певність за авторами'}}),
  record('EVR-000194', 'SRC-000099', 'CLM-000091', {roleForClaim: 'primary_support', outcome: {name: 'Біль у колінах (менше — краще)'}, result: md(-13.63, -20.67, -6.58), populationContext: {description: '11 РКД; I² = 88%; шкала в анотації не названа'}}),
  record('EVR-000195', 'SRC-000099', 'CLM-000091', {outcome: {name: 'Функція колін (менше — краще)'}, result: md(-6.46, -9.52, -3.40), populationContext: {description: 'I² = 75%; шкала в анотації не названа'}}),
  record('EVR-000196', 'SRC-000100', 'CLM-000092', {roleForClaim: 'primary_support', outcome: {name: 'Зволоженість і пружність шкіри'}, result: {summary: 'Зволоженість: Z = 4,94, p < 0,00001; пружність: Z = 4,49, p < 0,00001 порівняно з плацебо. Величину ефекту в анотації не наведено.'}, populationContext: {description: '26 РКД, 1721 учасник'}})
];

export const collagenBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000089': 'Маса й сила', 'CLM-000090': 'Сухожилля', 'CLM-000091': 'Остеоартрит колін', 'CLM-000092': 'Шкіра'},
  confidenceNote: 'Числа — середні по багатьох дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
