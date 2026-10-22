// Магній: формулювання погоджено власником 22.10.2026 («Так»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Garrison 2020 (Cochrane), Zhang 2016, Mah 2021, Costello 2023.
// Сторінка NIH ODS із цього середовища не відкрилася; межа 350 мг узята з анотації Costello 2023.
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-22';
export const magnesiumAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-22T16:19:00+03:00',
  scope: 'Магній: п’ять тверджень і докази до них (погоджено власником у робочому чаті 22.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: magnesiumAcceptance};

export const magnesiumModule = {
  id: 'MOD-SUPPLEMENTS-MAGNESIUM-001', title: 'Магній', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-magnesium', replacesDossier: 'DOS-MAGNESIUM',
  claimIds: ['CLM-000084', 'CLM-000085', 'CLM-000086', 'CLM-000087', 'CLM-000088'],
  notClaimed: [
    {topic: 'Магній допомагає від судом під час тренувань', reason: 'Рандомізованих досліджень про судоми, пов’язані з навантаженням, в огляді Cochrane не знайшли.'},
    {topic: 'Магній покращує спортивні результати', reason: 'Ми це питання не розбирали; висновків не робимо.'}
  ],
  commonLimits: ['Дослідження тиску об’єднують людей з нормальним і підвищеним тиском, з різними дозами й формами магнію.', 'Про сон — лише три невеликі дослідження в літніх людей з безсонням.', 'Оцінки певності — авторів оглядів, а не Evidence UA. Прочитано анотації в PubMed, не повні тексти.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['magnesium'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Магній у добавках, переважно всередину'}, comparator: {description: 'Плацебо'}, ...o});

const claims = [
  claim('CLM-000084', {
    statement: 'У літніх людей із нічними судомами ніг магній не зменшує частоту судом.',
    shortStatement: 'Нічні судоми в літніх не зменшує.',
    outcome: {name: 'Частота судом на тиждень через 4 тижні'}, population: {description: 'Переважно люди 61–69 років з ідіопатичними (нічними) судомами; 11 РКД загалом.'},
    evidenceSummary: 'В огляді Cochrane (Garrison 2020) різниця в кількості судом на тиждень становила −0,18 (−0,84…0,49), у відсотковій зміні — −9,59% (−23,14…3,97); певність помірна. Частка людей, у яких судом стало на чверть менше, не відрізнялася (RR 1,04; висока певність). Для судом під час вагітності дані суперечливі; досліджень про судоми під час тренувань немає.',
    limitations: ['Дослідження судом під час вагітності мали високий ризик упередженості.', 'Результат не переносимо на судоми при хворобах.']
  }),
  claim('CLM-000085', {
    statement: 'Магній трохи знижує артеріальний тиск: систолічний приблизно на 2 мм рт. ст., діастолічний — приблизно на 1,8.',
    shortStatement: 'Тиск трохи нижчий: −2,0 / −1,8 мм рт. ст.',
    outcome: {name: 'Систолічний і діастолічний тиск'}, population: {description: 'Дорослі з нормальним і підвищеним тиском; 34 РКД, 2028 учасників.'},
    evidenceSummary: 'У метааналізі Zhang 2016 (подвійно сліпі РКД) магній у медіанній дозі 368 мг/добу протягом медіани 3 місяців знизив систолічний тиск на 2,00 мм рт. ст. (0,43…3,58) і діастолічний на 1,78 (0,73…2,82). За розрахунком авторів, 300 мг/добу або місяця прийому достатньо для зниження.',
    limitations: ['Залишкова неоднорідність між дослідженнями.', 'Це не заміна лікування гіпертонії.']
  }),
  claim('CLM-000086', {
    statement: 'У літніх людей з безсонням магній може скорочувати час засинання приблизно на 17 хвилин, але якість доказів низька або дуже низька.',
    shortStatement: 'Засинання швидше на ~17 хв; докази слабкі.',
    outcome: {name: 'Час засинання, загальний час сну'}, population: {description: 'Літні люди з безсонням; 3 РКД, 151 учасник.'},
    evidenceSummary: 'У метааналізі Mah 2021 час засинання скоротився на 17,36 хв (7,44…27,27). Загальний час сну зріс на 16,06 хв, але без статистичної значущості. Усі дослідження мали помірний або високий ризик упередженості.',
    limitations: ['Лише три невеликі дослідження.', 'Не переносимо на молодих людей без безсоння.']
  }),
  claim('CLM-000087', {
    claimType: 'safety',
    statement: 'Побічні ефекти магнію переважно шлунково-кишкові, зокрема діарея: у дослідженнях їх мали від 11 до 37% тих, хто приймав магній.',
    shortStatement: 'Найчастіше — діарея та інші скарги на кишківник.',
    outcome: {name: 'Побічні ефекти'}, population: {description: 'Учасники РКД огляду Cochrane про судоми.'},
    evidenceSummary: 'В огляді Garrison 2020 шлунково-кишкові побічні ефекти (зокрема діарея) мали 11% (10% у контролі) — 37% (14% у контролі) учасників. Незначних побічних ефектів було більше, ніж на плацебо (RR 1,51; 0,98…2,33; низька певність); серйозних — однаково.',
    limitations: ['Дані з досліджень про судоми, переважно в літніх людей.']
  }),
  claim('CLM-000088', {
    claimType: 'safety',
    statement: 'Офіційна верхня межа для магнію з добавок — 350 мг на добу (без урахування їжі); її встановили через діарею.',
    shortStatement: 'Межа з добавок — 350 мг/добу.',
    outcome: {name: 'Верхня допустима межа споживання'}, population: {description: 'Дорослі.'},
    intervention: {name: 'Магній з добавок (без магнію з їжі)'}, comparator: {description: 'Не застосовується (норматив)'},
    evidenceSummary: 'Межу 350 мг/добу для магнію лише з добавок встановив Інститут медицини США в 1997 році; обмежувальним ефектом була діарея. Огляд Costello 2023 закликає її переглянути, бо в новіших дослідженнях більші дози часто не давали більше діареї. Автори огляду — з центру, що просуває магній.',
    limitations: ['Межу взято з анотації огляду Costello 2023; сторінку NIH ODS із робочого середовища відкрити не вдалося.', 'Огляд Costello — думка авторів, а не новий норматив.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, methodsSummary: 'Прочитано анотацію в PubMed.', ...o});
const sources = [
  source('SRC-000095', {title: 'Magnesium for skeletal muscle cramps', authors: ['Garrison SR', 'Korownyk CS', 'Kolber MR', 'et al.'], year: 2020, journal: 'Cochrane Database of Systematic Reviews', doi: '10.1002/14651858.CD009402.pub3', pmid: '32956536', pmcid: 'PMC8094171', shortCitation: 'Garrison SR et al. · 2020 (Cochrane)', populationSummary: '11 РКД, 735 учасників.', keyLimitations: ['Дослідження при вагітності — високий ризик упередженості.']}),
  source('SRC-000096', {title: 'Effects of Magnesium Supplementation on Blood Pressure: A Meta-Analysis of Randomized Double-Blind Placebo-Controlled Trials', authors: ['Zhang X', 'Li Y', 'Del Gobbo LC', 'et al.'], year: 2016, journal: 'Hypertension', publicationType: 'meta_analysis', doi: '10.1161/HYPERTENSIONAHA.116.07664', pmid: '27402922', shortCitation: 'Zhang X et al. · 2016', populationSummary: '34 РКД, 2028 учасників.', keyLimitations: ['Залишкова неоднорідність.']}),
  source('SRC-000097', {title: 'Oral magnesium supplementation for insomnia in older adults: a Systematic Review & Meta-Analysis', authors: ['Mah J', 'Pitre T'], year: 2021, journal: 'BMC Complementary Medicine and Therapies', doi: '10.1186/s12906-021-03297-z', pmid: '33865376', pmcid: 'PMC8053283', shortCitation: 'Mah J, Pitre T · 2021', populationSummary: '3 РКД, 151 літня людина.', keyLimitations: ['Низька або дуже низька якість доказів за GRADE.']}),
  source('SRC-000098', {title: 'Perspective: Call for Re-evaluation of the Tolerable Upper Intake Level for Magnesium Supplementation in Adults', authors: ['Costello R', 'Rosanoff A', 'Nielsen F', 'West C'], year: 2023, journal: 'Advances in Nutrition', publicationType: 'narrative_review', doi: '10.1016/j.advnut.2023.06.008', pmid: '37487817', pmcid: 'PMC10509448', shortCitation: 'Costello R et al. · 2023 (позиція авторів)', populationSummary: '10 досліджень про діарею, база CAERS.', keyLimitations: ['Автори — Center for Magnesium Education and Research: можливий конфлікт інтересів.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const md = (estimate, lowerCI, upperCI, unit) => ({effectMeasure: 'Різниця середніх', estimate, lowerCI, upperCI, unit, confidenceLevel: 95});
const records = [
  record('EVR-000184', 'SRC-000095', 'CLM-000084', {roleForClaim: 'primary_support', outcome: {name: 'Судоми на тиждень'}, result: md(-0.18, -0.84, 0.49, 'cramps/week'), populationContext: {description: '5 РКД, 307 учасників; помірна певність'}}),
  record('EVR-000185', 'SRC-000095', 'CLM-000084', {outcome: {name: 'Зміна кількості судом, %'}, result: md(-9.59, -23.14, 3.97, '%'), populationContext: {description: '3 РКД, 177 учасників; помірна певність'}}),
  record('EVR-000186', 'SRC-000096', 'CLM-000085', {roleForClaim: 'primary_support', outcome: {name: 'Систолічний тиск'}, result: md(-2.00, -3.58, -0.43, 'mmHg'), populationContext: {description: '34 РКД; медіана 368 мг/добу, 3 місяці'}}),
  record('EVR-000187', 'SRC-000096', 'CLM-000085', {roleForClaim: 'primary_support', outcome: {name: 'Діастолічний тиск'}, result: md(-1.78, -2.82, -0.73, 'mmHg'), populationContext: {description: '34 РКД'}}),
  record('EVR-000188', 'SRC-000097', 'CLM-000086', {roleForClaim: 'primary_support', outcome: {name: 'Час засинання'}, result: md(-17.36, -27.27, -7.44, 'min'), populationContext: {description: '3 РКД, 151 учасник; низька або дуже низька якість'}}),
  record('EVR-000189', 'SRC-000095', 'CLM-000087', {roleForClaim: 'primary_support', outcome: {name: 'Незначні побічні ефекти'}, result: {effectMeasure: 'Відношення ризиків', estimate: 1.51, lowerCI: 0.98, upperCI: 2.33, unit: '', confidenceLevel: 95}, populationContext: {description: '4 РКД, 254 учасники; низька певність; шлунково-кишкові ефекти в 11–37%'}}),
  record('EVR-000190', 'SRC-000098', 'CLM-000088', {roleForClaim: 'primary_support', outcome: {name: 'Верхня межа для добавок'}, result: {summary: 'IOM (1997): 350 мг/добу магнію лише з добавок для дорослих; обмежувальний ефект — діарея. Автори огляду пропонують межу переглянути.'}, populationContext: {description: 'Дорослі'}})
];

export const magnesiumBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000084': 'Судоми', 'CLM-000085': 'Тиск', 'CLM-000086': 'Сон', 'CLM-000087': 'Побічні ефекти', 'CLM-000088': 'Верхня межа'},
  confidenceNote: 'Числа — середні по багатьох дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
