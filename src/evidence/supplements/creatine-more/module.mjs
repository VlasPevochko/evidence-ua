// Креатин: вісім додаткових тверджень. Формулювання погоджено власником 21.10.2026 («Погоджую»).
// Джерело тем — документ власника про креатин; кожне число перевірено за анотаціями PubMed (EFSA — за офіційним повідомленням ЄС).
// Рівень впевненості свідомо не оцінено. Основні вісім тверджень креатину (CLM-000001…008) не змінюються.
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-21';
export const creatineMoreAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-21T12:30:00+03:00',
  scope: 'Креатин: вісім додаткових тверджень (витривалість, 60+, пам’ять, Паркінсон, побічні ефекти, жінки, ліпіди, особливі групи), погоджено власником 21.10.2026',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: creatineMoreAcceptance};

export const creatineMoreModule = {
  id: 'MOD-SUPPLEMENTS-CREATINE-MORE-001', title: 'Креатин: додаткові питання', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'creatine',
  claimIds: ['CLM-000068', 'CLM-000069', 'CLM-000070', 'CLM-000071', 'CLM-000072', 'CLM-000073', 'CLM-000074', 'CLM-000075'],
  notClaimed: [
    {topic: 'Покращує мислення в усіх', reason: 'Невелике покращення пам’яті є, але загального покращення мислення метааналіз не показав, і EFSA у 2024 році не визнала такого зв’язку.'},
    {topic: 'Лікує хвороби мозку', reason: 'У великому дослідженні при хворобі Паркінсона креатин не сповільнив прогресування; лікування він не замінює.'},
    {topic: '«Покращені» форми кращі за моногідрат', reason: 'Переваги інших форм над моногідратом не встановлено (див. твердження про форми).'},
    {topic: 'Креатин спалює жир або підвищує витривалість', reason: 'Ефекту на витривалість у тренованих людей не виявлено; прямого «жироспалювання» дослідження не показують.'}
  ],
  commonLimits: ['Більшість досліджень — молоді чоловіки; для жінок, людей похилого віку й підлітків даних менше.', 'Багато результатів — стандартизовані ефекти (SMD, g): вони показують силу ефекту, а не кілограми чи бали.', 'Оцінки певності — авторів оглядів, а не Evidence UA.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['creatine'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Креатин моногідрат'}, comparator: {description: 'Плацебо'}, ...o});

const claims = [
  claim('CLM-000068', {
    statement: 'У тренованих людей креатин не покращує результати на витривалість.',
    shortStatement: 'Витривалість не покращує.',
    outcome: {name: 'Результати тестів на витривалість'}, population: {description: 'Треновані люди в 13 плацебо-контрольованих дослідженнях.'},
    evidenceSummary: 'У метааналізі Fernández-Landa 2023 стандартизований ефект становив −0,07 з інтервалом по обидва боки від нуля; після виключення асиметричних досліджень результат не змінився. Користь креатину стосується коротких повторних зусиль, а не тривалої аеробної роботи.',
    limitations: ['Лише 13 досліджень; різні тести витривалості.', 'Не стосується видів спорту з повторними прискореннями.']
  }),
  claim('CLM-000069', {
    statement: 'У людей від 60 років креатин разом із силовими тренуваннями дає невеликий додатковий приріст сили; ефект на м’язову масу й рухові функції статистично не підтверджений.',
    shortStatement: 'Від 60 років — трохи більше сили разом із тренуваннями.',
    outcome: {name: 'Сила, м’язова маса, рухові функції'}, population: {description: 'Загалом здорові люди від 60 років у 11 РКД.'},
    intervention: {name: 'Креатин + силові тренування'}, comparator: {description: 'Силові тренування з плацебо або без добавки'},
    evidenceSummary: 'У трирівневому метааналізі Yao 2026 ефект на силу становив g = 0,31 (певність помірна за авторами). Для м’язової маси (0,35) і рухових функцій (0,47) інтервали включають нуль, певність низька й дуже низька.',
    limitations: ['Не переносимо на ослаблених людей, людей із саркопенією чи обмеженою рухливістю.', 'Лише 11 досліджень.']
  }),
  claim('CLM-000070', {
    statement: 'Креатин дає невелике покращення пам’яті, але не покращує загальне мислення й виконавчі функції; EFSA у 2024 році не визнала зв’язку креатину з покращенням когнітивних функцій.',
    shortStatement: 'Пам’ять — трохи краще. Загальне мислення — ні.',
    outcome: {name: 'Пам’ять, загальна когнітивна функція, виконавчі функції'}, population: {description: 'Дорослі 20–76 років у 16 РКД, здорові й з окремими захворюваннями.'},
    evidenceSummary: 'У метааналізі Xu 2024 (16 РКД, 492 учасники) стандартизований ефект для пам’яті становив 0,31 з помірною певністю за авторами; для загальної когнітивної функції й виконавчих функцій значущого ефекту не було. В огляді Prokopidis 2022 ефект для пам’яті був помітним у людей 66–76 років і майже нульовим у молодших. EFSA у 2024 році дійшла висновку, що причинно-наслідковий зв’язок встановити не можна; ЄС відхилив відповідну заяву для упаковок.',
    limitations: ['Невеликі дослідження, різні когнітивні тести.', 'Підгрупи за віком нестабільні.']
  }),
  claim('CLM-000071', {
    statement: 'У великому дослідженні при хворобі Паркінсона креатин не сповільнив прогресування хвороби.',
    shortStatement: 'Хворобу Паркінсона не сповільнює.',
    outcome: {name: 'Клінічне прогресування хвороби Паркінсона'}, population: {description: '1741 пацієнт з ранньою лікованою хворобою Паркінсона.'},
    intervention: {name: 'Креатин моногідрат 10 г/добу щонайменше 5 років'},
    evidenceSummary: 'Дослідження LS-1 зупинили достроково через марність: за проміжним аналізом 955 учасників різниці в клінічному погіршенні між креатином і плацебо не було (p = 0,45).',
    limitations: ['Стосується саме хвороби Паркінсона й цієї дози; інші хвороби мозку тут не розглядаємо.']
  }),
  claim('CLM-000072', {
    claimType: 'safety',
    statement: 'У клінічних дослідженнях побічні ефекти креатину траплялися в середньому не частіше, ніж на плацебо.',
    shortStatement: 'Побічних ефектів у середньому не більше, ніж на плацебо.',
    outcome: {name: 'Частота побічних ефектів'}, population: {description: 'Учасники 685 клінічних досліджень креатину.'},
    evidenceSummary: 'В аналізі Kreider 2025 побічні ефекти мали 4,60% учасників на креатині та 4,21% на плацебо — без значущої різниці. За часткою досліджень скарги на шлунок (4,9% проти 4,3%) і судоми чи біль у м’язах (2,9% проти 0,9%) траплялися трохи частіше, але серед усіх учасників ця різниця не була значущою. Аналізували 49 видів побічних ефектів.',
    limitations: ['Це зведення звітів досліджень, а не класичний метааналіз; способи реєстрації побічних ефектів різнилися.', 'Середня доза в дослідженнях — близько 12,5 г/добу, середня тривалість — близько 65 днів.']
  }),
  claim('CLM-000073', {
    claimType: 'safety',
    statement: 'У жінок креатин не підвищував частоту побічних ефектів і не погіршував показники нирок і печінки.',
    shortStatement: 'У жінок побічних ефектів не більше.',
    outcome: {name: 'Побічні ефекти, показники нирок і печінки'}, population: {description: '951 жінка у 29 дослідженнях.'},
    evidenceSummary: 'В огляді de Guingand 2020 не було смертей і серйозних побічних ефектів; відносний ризик будь-яких побічних ефектів становив 1,24, шлунково-кишкових — 1,09, обидва інтервали включають 1. Показники нирок і печінки значуще не змінювалися.',
    limitations: ['Лише 9% досліджень креатину проводили тільки на жінках.', 'Широкі інтервали: малі відмінності не можна виключити.']
  }),
  claim('CLM-000074', {
    statement: 'Креатин не впливає на холестерин і тригліцериди.',
    shortStatement: 'Холестерин і тригліцериди не змінює.',
    outcome: {name: 'Загальний холестерин, ЛПНЩ, ЛПВЩ, тригліцериди'}, population: {description: 'Дорослі у 8 плацебо-контрольованих РКД.'},
    evidenceSummary: 'У метааналізі Gimenez 2026 жоден показник ліпідів значуще не змінився; певність за авторами низька (ЛПНЩ, ЛПВЩ) або дуже низька (загальний холестерин, тригліцериди).',
    limitations: ['Лише 8 досліджень із методологічними недоліками рандомізації та звітності.']
  }),
  claim('CLM-000075', {
    claimType: 'safety', evidenceLayer: 'mixed',
    statement: 'Для підлітків, вагітних і жінок, які годують груддю, даних про безпеку креатину мало, тому самостійно приймати його не варто.',
    shortStatement: 'Підліткам, вагітним і під час годування — не самостійно.',
    outcome: {name: 'Безпека в особливих групах'}, population: {description: 'Підлітки; вагітні; жінки, що годують груддю.'},
    intervention: {name: 'Креатин моногідрат'}, comparator: {description: 'Без креатину'},
    evidenceSummary: 'Систематичний огляд Rubinchuk 2026 знайшов лише 5 досліджень на підлітках: короткочасних сигналів шкоди для нирок, печінки чи обміну речовин не виявили, але даних мало й спостереження були короткими. Для вагітності є переважно експериментальні дані на тваринах; огляд Dickinson 2014 прямо зазначає, що застосування у вагітних людей ще не оцінено.',
    limitations: ['Відсутність сигналу шкоди в малих дослідженнях — не доказ безпеки.', 'Дані про годування груддю ми не змогли перевірити за першоджерелом.']
  })
];

const pub = pmid => 'https://pubmed.ncbi.nlm.nih.gov/' + pmid + '/';
const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid || null, pmcid: o.pmcid || null}, url: o.pmid ? pub(o.pmid) : o.url, pubmedUrl: o.pmid ? pub(o.pmid) : null, accessLevel: 'abstract', funding: null, conflicts: null, ...o});
const sources = [
  source('SRC-000071', {title: 'Effects of Creatine Monohydrate on Endurance Performance in a Trained Population: A Systematic Review and Meta-analysis', authors: ['Fernández-Landa J', 'Santibañez-Gutierrez A', 'Todorovic N', 'Stajer V', 'Ostojic SM'], year: 2023, journal: 'Sports Medicine', doi: '10.1007/s40279-023-01823-2', pmid: '36877404', shortCitation: 'Fernández-Landa J et al. · 2023', populationSummary: '13 плацебо-контрольованих досліджень тренованих людей.', methodsSummary: 'Прочитано анотацію в PubMed. PROSPERO CRD42022327368; якість за шкалою PEDro.', keyLimitations: ['Мала кількість досліджень.']}),
  source('SRC-000072', {title: 'Effects of resistance training combined with creatine supplementation on muscle strength, physical function, and muscle mass in older adults: a systematic review and three-level meta-analysis', authors: ['Yao L', 'Yang D', 'Gao J'], year: 2026, journal: 'Frontiers in Nutrition', doi: '10.3389/fnut.2026.1919884', pmid: '42712402', pmcid: 'PMC13549873', shortCitation: 'Yao L et al. · 2026', populationSummary: '11 РКД, люди від 60 років.', methodsSummary: 'Прочитано анотацію в PubMed. Трирівневий метааналіз, ROBUST-RCT, GRADE.', keyLimitations: ['Не стосується ослаблених людей і людей із саркопенією.']}),
  source('SRC-000073', {title: 'The effects of creatine supplementation on cognitive function in adults: a systematic review and meta-analysis', authors: ['Xu C', 'Bi S', 'Zhang W', 'Luo L'], year: 2024, journal: 'Frontiers in Nutrition', doi: '10.3389/fnut.2024.1424972', pmid: '39070254', pmcid: 'PMC11275561', shortCitation: 'Xu C et al. · 2024', populationSummary: '16 РКД, 492 учасники 20–76 років.', methodsSummary: 'Прочитано анотацію в PubMed. PROSPERO CRD42024533557; GRADE.', keyLimitations: ['Змішані популяції: здорові й люди з хворобами.']}),
  source('SRC-000074', {title: 'Effects of creatine supplementation on memory in healthy individuals: a systematic review and meta-analysis of randomized controlled trials', authors: ['Prokopidis K', 'Giannos P', 'Triantafyllidis KK', 'et al.'], year: 2022, journal: 'Nutrition Reviews', doi: '10.1093/nutrit/nuac064', pmid: '35984306', pmcid: 'PMC9999677', shortCitation: 'Prokopidis K et al. · 2022', populationSummary: '8 РКД у метааналізі, здорові люди.', methodsSummary: 'Прочитано анотацію в PubMed. PROSPERO 42021281027.', keyLimitations: ['Велика неоднорідність (I² 66%).']}),
  source('SRC-000075', {title: 'Effect of creatine monohydrate on clinical progression in patients with Parkinson disease: a randomized clinical trial (LS-1)', authors: ['NINDS NET-PD Investigators'], year: 2015, journal: 'JAMA', publicationType: 'original_research', doi: '10.1001/jama.2015.120', pmid: '25668262', pmcid: 'PMC4349346', shortCitation: 'NET-PD LS-1 · 2015', populationSummary: '1741 пацієнт, 45 центрів у США й Канаді.', methodsSummary: 'Прочитано анотацію в PubMed. Подвійне сліпе плацебо-контрольоване РКД, зупинене через марність.', keyLimitations: ['Проміжний аналіз 955 учасників.']}),
  source('SRC-000076', {title: 'Safety of creatine supplementation: analysis of the prevalence of reported side effects in clinical trials and adverse event reports', authors: ['Kreider RB', 'Gonzalez DE', 'Hines K', 'Gil A', 'Bonilla DA'], year: 2025, journal: 'Journal of the International Society of Sports Nutrition', publicationType: 'original_research', doi: '10.1080/15502783.2025.2488937', pmid: '40198156', pmcid: 'PMC11983583', shortCitation: 'Kreider RB et al. · 2025', populationSummary: '685 досліджень: 12 839 учасників на креатині, 13 452 на плацебо.', methodsSummary: 'Прочитано анотацію в PubMed. Зведення звітів про побічні ефекти, бази повідомлень і аналіз соцмереж.', keyLimitations: ['Не класичний метааналіз; різна реєстрація побічних ефектів у дослідженнях.']}),
  source('SRC-000077', {title: 'Risk of Adverse Outcomes in Females Taking Oral Creatine Monohydrate: A Systematic Review and Meta-Analysis', authors: ['de Guingand DL', 'Palmer KR', 'Snow RJ', 'Davies-Tuck ML', 'Ellery SJ'], year: 2020, journal: 'Nutrients', doi: '10.3390/nu12061780', pmid: '32549301', pmcid: 'PMC7353222', shortCitation: 'de Guingand DL et al. · 2020', populationSummary: '29 досліджень, 951 жінка.', methodsSummary: 'Прочитано анотацію в PubMed.', keyLimitations: ['Мало досліджень лише на жінках.']}),
  source('SRC-000078', {title: 'Does creatine affect lipid profile? a systematic review and meta-analysis of randomized placebo-controlled trials', authors: ['Gimenez FVM', 'Pasternak N', 'Santesso L', 'et al.'], year: 2026, journal: 'Frontiers in Nutrition', doi: '10.3389/fnut.2026.1787009', pmid: '42180567', pmcid: 'PMC13194357', shortCitation: 'Gimenez FVM et al. · 2026', populationSummary: '8 плацебо-контрольованих РКД, дорослі.', methodsSummary: 'Прочитано анотацію в PubMed. RoB 2, GRADE.', keyLimitations: ['Низька та дуже низька певність.']}),
  source('SRC-000079', {title: 'Evaluating the Safety of Creatine Monohydrate in Adolescents: A Systematic Review of Renal, Hepatic, and Cardiometabolic Outcomes', authors: ['Rubinchuk A', 'Dulkoski Z', 'Persaud NA', 'Wallen M'], year: 2026, journal: 'Cureus', publicationType: 'systematic_review', doi: '10.7759/cureus.106808', pmid: '42124755', pmcid: 'PMC13158627', shortCitation: 'Rubinchuk A et al. · 2026', populationSummary: '5 досліджень на підлітках і фізично активній молоді.', methodsSummary: 'Прочитано анотацію в PubMed. Пошук лише в PubMed, 2015–2025.', keyLimitations: ['Мало досліджень, короткі спостереження.']}),
  source('SRC-000080', {title: 'Creatine supplementation during pregnancy: summary of experimental studies suggesting a treatment to improve fetal and neonatal morbidity and reduce mortality in high-risk human pregnancy', authors: ['Dickinson H', 'Ellery S', 'Ireland Z', 'et al.'], year: 2014, journal: 'BMC Pregnancy and Childbirth', publicationType: 'narrative_review', doi: '10.1186/1471-2393-14-150', pmid: '24766646', pmcid: 'PMC4007139', shortCitation: 'Dickinson H et al. · 2014', populationSummary: 'Огляд експериментальних (переважно тваринних) досліджень.', methodsSummary: 'Прочитано анотацію в PubMed. Оглядова стаття, не систематичний огляд.', keyLimitations: ['Не дані про безпеку у вагітних людей.']}),
  source('SRC-000081', {title: 'Creatine and improvement in cognitive function: evaluation of a health claim pursuant to Article 13(5) of Regulation (EC) No 1924/2006', authors: ['EFSA NDA Panel'], year: 2024, journal: 'EFSA Journal', publicationType: 'regulatory_opinion', doi: '10.2903/j.efsa.2024.9100', pmid: null, url: 'https://doi.org/10.2903/j.efsa.2024.9100', shortCitation: 'EFSA · 2024', populationSummary: 'Оцінка заявки на заяву про здоров’я для загальної дорослої популяції.', methodsSummary: 'Висновок перевірено за офіційним повідомленням ЄС (AGRINFO) про відхилення заяви; повний текст висновку EFSA не відкривали.', keyLimitations: ['Регуляторний висновок, а не метааналіз.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const smd = (estimate, lowerCI, upperCI, effectMeasure = 'Стандартизована різниця середніх') => ({effectMeasure, estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const md = (estimate, lowerCI, upperCI, unit) => ({effectMeasure: 'Різниця середніх', estimate, lowerCI, upperCI, unit, confidenceLevel: 95});
const rr = (estimate, lowerCI, upperCI) => ({effectMeasure: 'Відношення ризиків', estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const records = [
  record('EVR-000149', 'SRC-000071', 'CLM-000068', {roleForClaim: 'primary_support', outcome: {name: 'Результати на витривалість'}, result: smd(-0.07, -0.32, 0.18), populationContext: {description: '13 досліджень; I² = 34,75%'}}),
  record('EVR-000150', 'SRC-000072', 'CLM-000069', {roleForClaim: 'primary_support', outcome: {name: 'Сила, від 60 років'}, result: smd(0.31, 0.18, 0.45, 'Hedges g'), populationContext: {description: '11 РКД; помірна певність за авторами'}}),
  record('EVR-000151', 'SRC-000072', 'CLM-000069', {outcome: {name: 'М’язова маса, від 60 років'}, result: smd(0.35, -0.09, 0.78, 'Hedges g'), populationContext: {description: 'Низька певність за авторами'}}),
  record('EVR-000152', 'SRC-000072', 'CLM-000069', {outcome: {name: 'Рухові функції, від 60 років'}, result: smd(0.47, -0.08, 1.03, 'Hedges g'), populationContext: {description: 'Дуже низька певність за авторами'}}),
  record('EVR-000153', 'SRC-000073', 'CLM-000070', {roleForClaim: 'primary_support', outcome: {name: 'Пам’ять'}, result: smd(0.31, 0.18, 0.44), populationContext: {description: '16 РКД, 492 учасники; помірна певність за авторами'}}),
  record('EVR-000154', 'SRC-000073', 'CLM-000070', {outcome: {name: 'Загальна когнітивна функція й виконавчі функції'}, result: {summary: 'Значущого покращення не виявлено; певність низька за авторами.'}, populationContext: {description: '16 РКД'}}),
  record('EVR-000155', 'SRC-000074', 'CLM-000070', {outcome: {name: 'Пам’ять, здорові люди'}, result: smd(0.29, 0.04, 0.53), populationContext: {description: '8 РКД; 66–76 років: 0,88 (0,22–1,55); 11–31 рік: 0,03 (−0,14–0,20)'}}),
  record('EVR-000156', 'SRC-000081', 'CLM-000070', {evidenceLayer: 'mixed', relevance: 'partially_direct', outcome: {name: 'Регуляторна оцінка заяви про когнітивні функції'}, result: {summary: 'EFSA: причинно-наслідковий зв’язок між креатином і покращенням когнітивної функції встановити не можна; ЄС відхилив заяву.'}, populationContext: {description: 'Загальна доросла популяція'}, extractionLocator: 'Повідомлення ЄС (AGRINFO) про висновок EFSA 2024'}),
  record('EVR-000157', 'SRC-000075', 'CLM-000071', {roleForClaim: 'primary_support', outcome: {name: 'Клінічне погіршення за 5 років'}, result: {summary: 'Сума рангів: плацебо 2360 (95% ДІ 2249–2470), креатин 2414 (2304–2524); p = 0,45. Дослідження зупинено через марність.'}, populationContext: {description: '955 учасників у проміжному аналізі'}}),
  record('EVR-000158', 'SRC-000076', 'CLM-000072', {roleForClaim: 'primary_support', outcome: {name: 'Частка учасників із побічними ефектами'}, result: {summary: 'Креатин 4,60%, плацебо 4,21% (p = 0,828); частка досліджень із побічними ефектами 13,7% проти 13,2%.'}, populationContext: {description: '685 досліджень, понад 26 тисяч учасників'}}),
  record('EVR-000159', 'SRC-000077', 'CLM-000073', {roleForClaim: 'primary_support', outcome: {name: 'Будь-які побічні ефекти, жінки'}, result: rr(1.24, 0.51, 2.98), populationContext: {description: '29 досліджень, 951 жінка'}}),
  record('EVR-000160', 'SRC-000077', 'CLM-000073', {outcome: {name: 'Шлунково-кишкові побічні ефекти, жінки'}, result: rr(1.09, 0.53, 2.24), populationContext: {description: 'Дослідження з даними про шлунково-кишкові ефекти'}}),
  record('EVR-000161', 'SRC-000078', 'CLM-000074', {roleForClaim: 'primary_support', outcome: {name: 'ЛПНЩ'}, result: md(4.08, -2.55, 10.70, 'мг/дл'), populationContext: {description: '8 РКД; низька певність'}}),
  record('EVR-000162', 'SRC-000078', 'CLM-000074', {outcome: {name: 'Тригліцериди'}, result: md(7.95, -13.73, 29.63, 'мг/дл'), populationContext: {description: '8 РКД; дуже низька певність'}}),
  record('EVR-000163', 'SRC-000079', 'CLM-000075', {roleForClaim: 'primary_support', outcome: {name: 'Безпека в підлітків'}, result: {summary: 'У 5 дослідженнях не виявлено послідовних короткочасних сигналів шкоди для нирок, печінки чи обміну речовин; серйозних побічних ефектів не приписали креатину.'}, populationContext: {description: '5 досліджень'}}),
  record('EVR-000164', 'SRC-000080', 'CLM-000075', {evidenceLayer: 'mechanistic', relevance: 'indirect', roleForClaim: 'context_only', outcome: {name: 'Вагітність'}, result: {summary: 'Огляд експериментальних досліджень; застосування креатину у вагітних людей ще не оцінено.'}, populationContext: {description: 'Переважно тваринні моделі'}})
];

export const creatineMoreBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000068': 'Витривалість', 'CLM-000069': 'Від 60 років', 'CLM-000070': 'Пам’ять і мислення', 'CLM-000071': 'Хвороба Паркінсона', 'CLM-000072': 'Побічні ефекти', 'CLM-000073': 'Жінки', 'CLM-000074': 'Холестерин', 'CLM-000075': 'Підлітки, вагітність'},
  confidenceNote: 'Числа — середні по дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
