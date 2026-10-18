// Протеїн: формулювання погоджено власником 18.10.2026. Рівень впевненості свідомо не оцінено.
// Витяг: Morton 2018 — повний текст PMC5867436; Nunes 2022, Tagawa 2022 — анотації PubMed.
// CLM-000009/CLM-000010, SRC-000012, EVR-000016/017 продовжують чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-18';
export const proteinAcceptance = {
  kind: 'user_wording_approval',
  at: '2026-10-18T11:33:00+03:00',
  scope: 'Протеїн: п’ять тверджень і докази до них (погоджено власником у робочому чаті 18.10.2026)',
  confidenceAssessed: false,
  formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: proteinAcceptance};

export const proteinModule = {
  id: 'MOD-SUPPLEMENTS-PROTEIN-001',
  title: 'Протеїн',
  status: 'educational',
  version: '1.0',
  scientificApproval: null,
  ...accepted,
  claimIds: ['CLM-000009', 'CLM-000010', 'CLM-000053', 'CLM-000054', 'CLM-000055'],
  notClaimed: [
    {topic: 'Час прийому', reason: 'Прийом до чи після тренування не змінював приросту безжирової маси (Casuso 2025, PMID 40647175); у Morton доза після тренування не впливала на ефект.'},
    {topic: 'Найкращий вид білка', reason: 'Мережеві метааналізи (Zhou 2023, PMID 38039960; Drummond 2026, PMID 41635649) дають рейтинги з широкою невизначеністю; переможця за рейтингом не оголошуємо.'}
  ]
};

const notAssessed = {
  evidenceConfidence: null,
  confidenceFramework: 'not_assessed',
  confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}
};
const claim = (id, o) => ({
  id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['protein'],
  ...notAssessed, entityIds: [], status: 'educational', version: '1.0',
  lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Додатковий білок (добавка або їжа) + силові тренування'},
  comparator: {description: 'Ті самі тренування без додаткового білка або з плацебо'},
  ...o
});
const RT = {description: 'Здорові дорослі без обмеження калорій, силові тренування щонайменше 6 тижнів, 2+ рази на тиждень.'};

const claims = [
  claim('CLM-000009', {
    statement: 'Додатковий білок під час силових тренувань у середньому трохи збільшує приріст сили в тесті одного повторного максимуму; головний внесок дають самі тренування.',
    shortStatement: 'З тренуваннями білок трохи додає сили. Головне — самі тренування.',
    outcome: {name: 'Сила: один повторний максимум (1ПМ)'}, population: RT,
    evidenceSummary: 'У метааналізі Morton (49 РКД) білок додав у середньому 2,49 кг до приросту 1ПМ, тоді як самі тренування дали близько 27 кг. У тренованих людей ефект був помітний, у новачків — статистично не підтверджений. Огляди Nunes 2022 і Tagawa 2022 показують такий самий напрям: невеликий ефект і лише разом із тренуваннями.',
    limitations: ['Ефект невеликий порівняно з ефектом тренувань; це середнє по дослідженнях, а не прогноз для конкретної людини.', 'Різні вправи й тести 1ПМ; частину авторів оглядів Nunes і Tagawa пов’язано з виробниками харчових продуктів.']
  }),
  claim('CLM-000010', {
    statement: 'Додатковий білок під час силових тренувань у середньому трохи збільшує приріст безжирової маси.',
    shortStatement: 'З тренуваннями білок трохи збільшує приріст безжирової маси.',
    outcome: {name: 'Безжирова маса (DXA, гідроденситометрія, BodPod)'}, population: RT,
    evidenceSummary: 'У Morton білок додав у середньому 0,30 кг безжирової маси до 1,1 кг, які дали самі тренування; результати досліджень мало відрізнялися між собою. Nunes 2022 (62 дослідження) отримав такий самий невеликий ефект.',
    limitations: ['Безжирова маса — це все, крім жиру (вода, органи, кістки), а не лише нові м’язи.', 'Ефект менший у старших і нетренованих людей.']
  }),
  claim('CLM-000053', {
    claimType: 'efficacy',
    statement: 'Після загального споживання білка близько 1,6 г на кг маси тіла на добу додаткового приросту безжирової маси в середньому вже не спостерігали; точна межа невизначена.',
    shortStatement: 'Орієнтир — близько 1,6 г білка на кг на добу. Це не точна норма.',
    outcome: {name: 'Залежність приросту безжирової маси від загального білка на добу'}, population: RT,
    intervention: {name: 'Загальне споживання білка з їжею і добавками'},
    comparator: {description: 'Нижче загальне споживання білка'},
    evidenceSummary: 'У Morton за даними 42 груп досліджень (723 учасники) приріст безжирової маси переставав зростати близько 1,62 г/кг/добу, але інтервал широкий (1,03–2,20 г/кг/добу), а сам злам не досяг статистичної значущості. Tagawa 2022 для сили отримав схоже плато — близько 1,5 г/кг/добу.',
    limitations: ['Межа визначена за групами досліджень, а не за окремими людьми; p = 0,079.', 'Автори Morton через широкий інтервал радять до 2,2 г/кг/добу тим, хто хоче максимуму; це їхня порада, не висновок Evidence UA.']
  }),
  claim('CLM-000054', {
    statement: 'Без силових тренувань додатковий білок не показав збільшення сили.',
    shortStatement: 'Без тренувань білок силу не збільшує.',
    outcome: {name: 'Приріст сили, %'},
    population: {description: 'Здорові дорослі в РКД без програми силових тренувань.'},
    intervention: {name: 'Додатковий білок без силових тренувань'},
    comparator: {description: 'Без додаткового білка'},
    evidenceSummary: 'У дозозалежному метааналізі Tagawa 2022 (82 статті) білок збільшував приріст сили лише разом із силовими тренуваннями (+2,01%). Без тренувань різниця становила 0,13% з інтервалом по обидва боки від нуля.',
    limitations: ['Відсутність ефекту в метааналізі не доводить точно нульового ефекту.', 'П’ятеро з семи авторів працюють у Meiji — виробника харчових продуктів.']
  }),
  claim('CLM-000055', {
    claimType: 'efficacy',
    statement: 'Чи допомагає додатковий білок людям старшого віку під час силових тренувань, поки однозначно не встановлено: у Morton ефект на безжирову масу з віком зменшувався, але старшим давали мало білка.',
    shortStatement: 'Для старших людей даних мало й вони неоднозначні.',
    outcome: {name: 'Безжирова маса залежно від віку'},
    population: {description: 'Здорові дорослі старше 45 (Morton) або від 65 років (Nunes) із силовими тренуваннями.'},
    evidenceSummary: 'У Morton в учасників, старших за 45 років, ефекту на безжирову масу не виявили (0,06 кг), у молодших він був 0,55 кг. Проте старші отримували в середньому лише 20 г додаткового білка на добу проти 42 г у молодших. У Nunes 2022 ефект у людей від 65 років був значущим при 1,2–1,59 г/кг/добу.',
    limitations: ['У Morton лише 13 досліджень зі старшими учасниками.', 'Окремі огляди про людей похилого віку й саркопенію ще не витягнуто й не оцінено.']
  })
];

const source = (id, o) => ({
  id,
  publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked,
  publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null},
  url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/',
  ...o
});
const sources = [
  source('SRC-000012', {
    title: 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults',
    authors: ['Morton RW', 'Murphy KT', 'McKellar SR', 'et al.'], year: 2018, journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2017-097608', pmid: '28698222', pmcid: 'PMC5867436', accessLevel: 'full_text',
    shortCitation: 'Morton RW et al. · 2018',
    populationSummary: '49 РКД, 1863 учасники (35 ± 20 років); силові тренування 6–52 тижні.',
    methodsSummary: 'Повний текст прочитано в PubMed Central. Метааналіз випадкових ефектів, метарегресія, аналіз точки зламу.',
    keyLimitations: ['Дослідження з високим ризиком упередженості виключено до аналізу; аналіз чутливості не змінив висновків для 1ПМ і безжирової маси.', 'Виправлення 2020 року (PMID 32943392) додає декларацію конфлікту інтересів автора; числові результати не змінено.'],
    funding: null, conflicts: null
  }),
  source('SRC-000055', {
    title: 'Systematic review and meta-analysis of protein intake to support muscle mass and function in healthy adults',
    authors: ['Nunes EA', 'Colenso-Semple L', 'McKellar SR', 'et al.'], year: 2022, journal: 'Journal of Cachexia, Sarcopenia and Muscle',
    doi: '10.1002/jcsm.12922', pmid: '35187864', pmcid: 'PMC8978023', accessLevel: 'abstract',
    shortCitation: 'Nunes EA et al. · 2022',
    populationSummary: '74 РКД, здорові дорослі без ожиріння; більшість — із силовими тренуваннями.',
    methodsSummary: 'Прочитано анотацію в PubMed. Протокол PROSPERO CRD42020159001; трирівневий метааналіз.',
    keyLimitations: ['Для сили ніг надрукований інтервал (0,09–0,35) не містить оцінки 0,40 — це число не використовуємо до перевірки повного тексту.', 'Серед авторів — співробітники Abbott Nutrition, Givaudan та IFF.'],
    funding: null, conflicts: null
  }),
  source('SRC-000056', {
    title: 'Synergistic Effect of Increased Total Protein Intake and Strength Training on Muscle Strength: A Dose-Response Meta-analysis of Randomized Controlled Trials',
    authors: ['Tagawa R', 'Watanabe D', 'Ito K', 'et al.'], year: 2022, journal: 'Sports Medicine — Open',
    doi: '10.1186/s40798-022-00508-w', pmid: '36057893', pmcid: 'PMC9441410', accessLevel: 'abstract',
    shortCitation: 'Tagawa R et al. · 2022',
    populationSummary: '82 статті РКД; 69 — для дозозалежних кривих.',
    methodsSummary: 'Прочитано анотацію в PubMed. Пошук лише в PubMed та Ichushi-Web; модель випадкових ефектів і сплайн.',
    keyLimitations: ['Пошук лише у двох базах.', 'П’ятеро з семи авторів — співробітники Meiji Co., Ltd.'],
    funding: null, conflicts: null
  })
];

const record = (id, sourceId, claimId, o) => ({
  id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct',
  roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, ...accepted, ...o
});
const md = (estimate, lowerCI, upperCI, unit, effectMeasure = 'Різниця середніх') => ({effectMeasure, estimate, lowerCI, upperCI, unit, confidenceLevel: 95});
const records = [
  record('EVR-000016', 'SRC-000012', 'CLM-000009', {roleForClaim: 'primary_support', outcome: {name: 'Приріст 1ПМ, усі учасники'}, result: md(2.49, 0.64, 4.33, 'кг'), populationContext: {description: '28 досліджень; I² = 33%'}, extractionLocator: 'PMC5867436, Results / Figure 2 / Table 1'}),
  record('EVR-000099', 'SRC-000012', 'CLM-000009', {outcome: {name: 'Приріст 1ПМ, треновані'}, result: md(4.27, 0.61, 7.94, 'кг'), populationContext: {description: 'Підгрупа тренованих учасників'}, extractionLocator: 'PMC5867436, Figure 2'}),
  record('EVR-000100', 'SRC-000012', 'CLM-000009', {direction: 'neutral', roleForClaim: 'context_only', outcome: {name: 'Приріст 1ПМ, нетреновані'}, result: md(0.99, -0.27, 2.25, 'кг'), populationContext: {description: 'Підгрупа нетренованих учасників'}, extractionLocator: 'PMC5867436, Figure 2'}),
  record('EVR-000101', 'SRC-000055', 'CLM-000009', {outcome: {name: 'Жим лежачи, учасники до 65 років'}, result: md(0.18, 0.03, 0.33, '', 'Стандартизована різниця середніх'), populationContext: {description: '32 дослідження; рівень доказів за авторами — низький'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000102', 'SRC-000056', 'CLM-000009', {outcome: {name: 'Приріст сили з силовими тренуваннями'}, result: md(2.01, 1.09, 2.93, '%'), populationContext: {description: 'РКД із силовими тренуваннями'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000017', 'SRC-000012', 'CLM-000010', {roleForClaim: 'primary_support', outcome: {name: 'Приріст безжирової маси'}, result: md(0.30, 0.09, 0.52, 'кг'), populationContext: {description: '27 досліджень; I² = 7%'}, extractionLocator: 'PMC5867436, Results / Figure 3 / Table 1'}),
  record('EVR-000103', 'SRC-000055', 'CLM-000010', {outcome: {name: 'Приріст безжирової маси з силовими тренуваннями'}, result: md(0.22, 0.14, 0.30, '', 'Стандартизована різниця середніх'), populationContext: {description: '62 дослідження; рівень доказів за авторами — помірний'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000104', 'SRC-000012', 'CLM-000053', {roleForClaim: 'primary_support', outcome: {name: 'Точка зламу: загальний білок і приріст безжирової маси'}, result: md(1.62, 1.03, 2.20, 'г/кг/добу', 'Точка зламу'), populationContext: {description: '42 групи досліджень, 723 учасники; p = 0,079'}, extractionLocator: 'PMC5867436, Break point analysis / Figure 5'}),
  record('EVR-000105', 'SRC-000056', 'CLM-000053', {outcome: {name: 'Дозозалежність приросту сили'}, result: {summary: 'Приріст сили зростав на 0,72% (95% ДІ 0,40–1,04) на кожні 0,1 г/кг/добу загального білка до 1,5 г/кг/добу; далі додаткового приросту не спостерігали.'}, populationContext: {description: '69 статей у сплайн-моделі'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000106', 'SRC-000056', 'CLM-000054', {roleForClaim: 'primary_support', outcome: {name: 'Приріст сили без силових тренувань'}, result: md(0.13, -1.53, 1.79, '%'), populationContext: {description: 'РКД без силових тренувань'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000107', 'SRC-000012', 'CLM-000055', {roleForClaim: 'primary_support', outcome: {name: 'Безжирова маса, старше 45 років'}, result: md(0.06, -0.14, 0.26, 'кг'), populationContext: {description: 'Середній вік 67 ± 7 років; у середньому 20 г додаткового білка на добу'}, extractionLocator: 'PMC5867436, Meta-regression'}),
  record('EVR-000108', 'SRC-000012', 'CLM-000055', {roleForClaim: 'context_only', outcome: {name: 'Безжирова маса, молодше 45 років'}, result: md(0.55, 0.30, 0.81, 'кг'), populationContext: {description: 'Середній вік 24 ± 4 роки; у середньому 42 г додаткового білка на добу'}, extractionLocator: 'PMC5867436, Meta-regression'}),
  record('EVR-000109', 'SRC-000012', 'CLM-000055', {outcome: {name: 'Зміна ефекту на безжирову масу з віком'}, result: md(-0.01, -0.02, 0.00, 'кг на рік віку', 'Коефіцієнт метарегресії'), populationContext: {description: '25 досліджень, 1033 учасники; p = 0,02'}, extractionLocator: 'PMC5867436, Table 1 / Figure 4'}),
  record('EVR-000110', 'SRC-000055', 'CLM-000055', {direction: 'mixed', roleForClaim: 'supporting', outcome: {name: 'Безжирова маса, від 65 років'}, result: {summary: 'Ефект на безжирову масу був значущим у людей від 65 років при 1,2–1,59 г білка/кг/добу із силовими тренуваннями.'}, populationContext: {description: 'Підгрупа від 65 років'}, extractionLocator: 'Анотація PubMed'})
];

export const proteinBase = createEvidenceBase({
  claims, sources, records,
  presentation: {
    labels: {
      'CLM-000009': 'Сила',
      'CLM-000010': 'Безжирова маса',
      'CLM-000053': 'Скільки білка',
      'CLM-000054': 'Без тренувань',
      'CLM-000055': 'Старший вік'
    },
    confidenceNote: 'Числа — середні по дослідженнях. Вони не прогнозують результат конкретної людини.'
  }
});
