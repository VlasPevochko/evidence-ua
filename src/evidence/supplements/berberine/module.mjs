// Берберин: формулювання погоджено власником 21.10.2026. Рівень впевненості свідомо не оцінено.
// Витяг: Liu 2025 — повний текст PMC12307485; Zhao 2023, Elahi Vahed 2025, Guo 2012, Chan 1993 — анотації PubMed.
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-21';
export const berberineAcceptance = {
  kind: 'user_wording_approval',
  at: '2026-10-21T02:15:00+03:00',
  scope: 'Берберин: шість тверджень і докази до них (погоджено власником у робочому чаті 21.10.2026)',
  confidenceAssessed: false,
  formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: berberineAcceptance};

export const berberineModule = {
  id: 'MOD-SUPPLEMENTS-BERBERINE-001',
  title: 'Берберин',
  status: 'educational',
  version: '1.0',
  scientificApproval: null,
  ...accepted,
  route: 'supplement-berberine',
  claimIds: ['CLM-000056', 'CLM-000057', 'CLM-000058', 'CLM-000059', 'CLM-000060', 'CLM-000061'],
  notClaimed: [
    {topic: 'Замінює метформін', reason: 'Прямі порівняння з цукрознижувальними ліками є лише в дослідженнях низької якості (Lan 2015, PMID 25498346). Ліки не замінюють добавкою без лікаря.'},
    {topic: 'Захищає від інфарктів і ускладнень діабету', reason: 'Такі результати не досліджували: усі дані — про аналізи крові за 3–5 місяців.'},
    {topic: 'Допомагає здоровим людям і спортсменам', reason: 'У людей з нормальною глюкозою ефект майже відсутній; досліджень на спортсменах немає.'}
  ],
  commonLimits: ['Більшість досліджень з Китаю, малі й короткі (до 140 днів).', 'Дози в дослідженнях — 0,9–1,5 г на добу, поділені на 2–3 прийоми.', 'Чистоту й склад продукту в дослідженнях часто не вказують; склад добавок у магазині може відрізнятися.']
};

const notAssessed = {
  evidenceConfidence: null,
  confidenceFramework: 'not_assessed',
  confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}
};
const claim = (id, o) => ({
  id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['berberine'],
  ...notAssessed, entityIds: [], status: 'educational', version: '1.0',
  lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Берберин, переважно 0,9–1,5 г/добу, 3–5 місяців'},
  comparator: {description: 'Плацебо'},
  ...o
});
const metabolic = {description: 'Дорослі з діабетом 2 типу, предіабетом, дисліпідемією або метаболічним синдромом.'};

const claims = [
  claim('CLM-000056', {
    statement: 'У людей з діабетом 2 типу чи предіабетом берберин порівняно з плацебо помірно знижує глюкозу натще й HbA1c; у людей з нормальною глюкозою ефект майже відсутній.',
    shortStatement: 'Помірно знижує цукор у людей з діабетом чи предіабетом.',
    outcome: {name: 'Глюкоза натще, HbA1c'},
    population: {description: 'Дорослі в РКД проти плацебо, переважно з діабетом 2 типу або предіабетом.'},
    evidenceSummary: 'У метааналізі Zhao 2023 (лише плацебо-контрольовані РКД) берберин знизив глюкозу натще на 0,52 ммоль/л (18 РКД, 1522 учасники) і HbA1c на 4,5 ммоль/моль — це приблизно 0,4 процентного пункту (7 РКД, 756 учасників). Огляд Liu 2025, куди включали лише очищений берберин, дав близьку оцінку для глюкози натще.',
    limitations: ['Переведення HbA1c у відсотки (≈ −0,4 п.п.) — наш перерахунок із ммоль/моль.', 'Результати досліджень сильно різняться між собою (I² до 90% у Liu 2025).']
  }),
  claim('CLM-000057', {
    statement: 'Берберин порівняно з плацебо знижує тригліцериди й «поганий» холестерин (ЛПНЩ), але не змінює «хороший» холестерин (ЛПВЩ) і артеріальний тиск.',
    shortStatement: 'Знижує тригліцериди й ЛПНЩ. На ЛПВЩ і тиск не впливає.',
    outcome: {name: 'Тригліцериди, ЛПНЩ, ЛПВЩ, артеріальний тиск'}, population: metabolic,
    evidenceSummary: 'У Liu 2025 (12 плацебо-контрольованих РКД, 889 учасників) берберин знизив тригліцериди на 0,37 ммоль/л і ЛПНЩ на 0,50 ммоль/л. Різниця для ЛПВЩ (+0,02 ммоль/л) і систолічного тиску (−0,9 мм рт. ст.) мала, а інтервали включають нуль.',
    limitations: ['Дуже велика неоднорідність: I² 81% для тригліцеридів, 89% для ЛПНЩ.', 'Для тиску лише 3 дослідження (214 учасників).']
  }),
  claim('CLM-000058', {
    statement: 'Ефект берберину на масу тіла малий: у середньому менше кілограма за кілька місяців.',
    shortStatement: 'Вага знижується мінімально — менше ніж на 1 кг.',
    outcome: {name: 'Маса тіла, ІМТ'},
    population: {description: 'Дорослі в РКД з різними метаболічними станами.'},
    comparator: {description: 'Контрольні групи (плацебо або без берберину)'},
    evidenceSummary: 'У метааналізі Elahi Vahed 2025 (23 РКД) берберин знизив масу тіла в середньому на 0,88 кг. У Liu 2025 після виключення двох досліджень низької якості зниження ІМТ перестало бути статистично значущим.',
    limitations: ['Автори огляду маси тіла вказують на часту відсутність засліплення й опису рандомізації.', 'Склад і чистоту берберину в дослідженнях часто не повідомляли.']
  }),
  claim('CLM-000059', {
    claimType: 'safety',
    statement: 'У дослідженнях тривалістю до 3–5 місяців побічні ефекти берберину траплялися статистично не частіше, ніж на плацебо; найчастіше — нудота, закреп і дискомфорт у животі. Довших даних немає.',
    shortStatement: 'Короткочасно переноситься близько до плацебо. Найчастіше — шлунок.',
    outcome: {name: 'Побічні ефекти'}, population: metabolic,
    evidenceSummary: 'У Liu 2025 відносний ризик будь-якого шлунково-кишкового побічного ефекту становив 1,44, а будь-якого побічного ефекту — 1,07; обидва інтервали широкі й включають 1. Повідомляли переважно нудоту, закреп, діарею й біль у животі легкого чи помірного ступеня.',
    limitations: ['Два з дванадцяти досліджень не повідомили даних про безпеку.', 'Тривалість — 84–140 днів; про довгий прийом даних немає.']
  }),
  claim('CLM-000060', {
    claimType: 'safety',
    statement: 'Берберин пригнічує ферменти печінки CYP2D6, CYP2C9 і CYP3A4, які розщеплюють багато ліків, тому може змінювати їхню дію; разом із цукрознижувальними ліками є ризик гіпоглікемії.',
    shortStatement: 'Може змінювати дію інших ліків.',
    outcome: {name: 'Активність ферментів CYP (фармакокінетика)'},
    population: {description: 'Здорові чоловіки в рандомізованому перехресному дослідженні.'},
    intervention: {name: 'Берберин 300 мг тричі на добу, 2 тижні'},
    evidenceSummary: 'У дослідженні Guo 2012 після двох тижнів берберину показник активності CYP2D6 змінився приблизно в 9 разів, CYP2C9 — у 2 рази, а рівень мідазоламу (маркер CYP3A4) у крові зріс приблизно на 40%.',
    limitations: ['Дослідження фармакокінетики, а не клінічних наслідків взаємодії.', 'Лише здорові чоловіки; інші популяції не вивчено. Ризик гіпоглікемії з ліками випливає з механізму й показників глюкози, окремо не досліджений.']
  }),
  claim('CLM-000061', {
    claimType: 'safety', evidenceLayer: 'mechanistic',
    statement: 'Даних про безпеку берберину під час вагітності, годування груддю та в немовлят немає; у пробірці й на щурах він витісняє білірубін з альбуміну, що для новонароджених з жовтяницею є сигналом ризику.',
    shortStatement: 'Вагітним, під час годування й немовлятам — не варто.',
    outcome: {name: 'Зв’язування білірубіну з альбуміном'},
    population: {description: 'Лабораторні дані: плазма in vitro та дорослі щури.'},
    intervention: {name: 'Берберин in vitro і внутрішньоочеревинно щурам'},
    comparator: {description: 'Без берберину; інші витіснювачі білірубіну'},
    evidenceSummary: 'У дослідженні Chan 1993 берберин витісняв білірубін з альбуміну приблизно вдесятеро сильніше за фенілбутазон, а в щурів підвищував рівень вільного білірубіну. Вільний білірубін у новонароджених може пошкодити мозок (ядерна жовтяниця). Автори радили уникати берберину в новонароджених з жовтяницею та вагітних.',
    limitations: ['Це механістичний сигнал ризику, а не доведена шкода в людей.', 'Досліджень безпеки у вагітних і дітей немає.']
  })
];


// Рівні впевненості погоджено власником 22.10.2026 («Погоджую»): GRADE-informed v1, попередні (лише анотації),
// формального наукового перегляду не було. Твердження поза мапою (нормативи) лишаються «не оцінено».
export const confidenceAcceptance = {kind: 'user_confidence_approval', at: '2026-10-22T18:04:00+03:00', framework: 'evidenceua_grade_informed_v1', provisional: true, formalScientificReview: false};
const approvedLevels = {'CLM-000056': ['low', 'Результати досліджень дуже різняться (I² до ≈ 90%).'], 'CLM-000057': ['low', 'Висока неоднорідність досліджень (I² 81–89%).'], 'CLM-000058': ['low', 'Ефект малий і зникає після виключення досліджень низької якості.'], 'CLM-000059': ['low', 'Короткі дослідження; широкі інтервали для побічних ефектів.'], 'CLM-000060': ['low', 'Одне невелике фармакокінетичне дослідження на здорових чоловіках.'], 'CLM-000061': ['very_low', 'Дані лише з пробірки й досліджень на щурах.']};
for (const c of claims) if (approvedLevels[c.id]) Object.assign(c, {evidenceConfidence: approvedLevels[c.id][0], confidenceFramework: 'evidenceua_grade_informed_v1', provisional: true, confidenceAcceptance,
  confidenceRationale: {summary: approvedLevels[c.id][1], uncertaintyNotes: ['Попередня оцінка за анотаціями оглядів; формального наукового перегляду Evidence UA не було.']}});

const source = (id, o) => ({
  id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked,
  publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null},
  url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/',
  funding: null, conflicts: null, ...o
});
const sources = [
  source('SRC-000057', {
    title: 'Overall and Sex-Specific Effect of Berberine on Glycemic and Insulin-Related Traits: a Systematic Review and Meta-Analysis of Randomized Controlled Trials',
    authors: ['Zhao JV', 'Huang X', 'Zhang J', 'et al.'], year: 2023, journal: 'Journal of Nutrition',
    doi: '10.1016/j.tjnut.2023.08.016', pmid: '37598753', accessLevel: 'abstract', shortCitation: 'Zhao JV et al. · 2023',
    populationSummary: '20 плацебо-контрольованих РКД, 1761 учасник.',
    methodsSummary: 'Прочитано анотацію в PubMed. Протокол PROSPERO CRD42022345172; модель випадкових ефектів.',
    keyLimitations: ['Підгрупи за статтю й етнічністю засновані на невеликій кількості досліджень.']
  }),
  source('SRC-000058', {
    title: 'Efficacy and safety of berberine on the components of metabolic syndrome: a systematic review and meta-analysis of randomized placebo-controlled trials',
    authors: ['Liu D', 'Zhao H', 'Zhang Y', 'Hu J', 'Xu H'], year: 2025, journal: 'Frontiers in Pharmacology',
    doi: '10.3389/fphar.2025.1572197', pmid: '40740996', pmcid: 'PMC12307485', accessLevel: 'full_text', shortCitation: 'Liu D et al. · 2025',
    populationSummary: '12 плацебо-контрольованих РКД очищеного берберину, 889 учасників; Китай, Мексика, Індія; 84–140 днів.',
    methodsSummary: 'Повний текст прочитано в PubMed Central. PROSPERO CRD42024588614; RoB 2: 2 дослідження низького ризику, 2 високого, решта — «є застереження».',
    keyLimitations: ['Велика неоднорідність для більшості показників.', 'Автори — з університетів традиційної китайської медицини.']
  }),
  source('SRC-000059', {
    title: 'The effect of berberine on obesity indices: a systematic review and meta-analysis',
    authors: ['Elahi Vahed I', 'Shahir-Roudi E', 'et al.'], year: 2025, journal: 'International Journal of Obesity',
    doi: '10.1038/s41366-025-01943-x', pmid: '41310257', accessLevel: 'abstract', shortCitation: 'Elahi Vahed I et al. · 2025',
    populationSummary: '23 РКД з дорослими.',
    methodsSummary: 'Прочитано анотацію в PubMed. RoB 2; модель випадкових ефектів.',
    keyLimitations: ['Контрольні групи не завжди плацебо; автори вказують на брак засліплення й рандомізації.']
  }),
  source('SRC-000060', {
    title: 'Repeated administration of berberine inhibits cytochromes P450 in humans',
    authors: ['Guo Y', 'Chen Y', 'Tan ZR', 'Klaassen CD', 'Zhou HH'], year: 2012, journal: 'European Journal of Clinical Pharmacology',
    publicationType: 'original_research',
    doi: '10.1007/s00228-011-1108-2', pmid: '21870106', pmcid: 'PMC4898966', accessLevel: 'abstract', shortCitation: 'Guo Y et al. · 2012',
    populationSummary: 'Здорові чоловіки; двофазне рандомізоване перехресне дослідження.',
    methodsSummary: 'Прочитано анотацію в PubMed. Пробні ліки: мідазолам, омепразол, декстрометорфан, лозартан, кофеїн.',
    keyLimitations: ['Мала вибірка здорових чоловіків; клінічні наслідки не вимірювали.']
  }),
  source('SRC-000061', {
    title: 'Displacement of bilirubin from albumin by berberine',
    authors: ['Chan E'], year: 1993, journal: 'Biology of the Neonate',
    publicationType: 'original_research',
    doi: '10.1159/000243932', pmid: '8513024', accessLevel: 'abstract', shortCitation: 'Chan E · 1993',
    populationSummary: 'Плазма in vitro; дорослі щури.',
    methodsSummary: 'Прочитано анотацію в PubMed. Пероксидазний кінетичний метод.',
    keyLimitations: ['Лабораторні дані й тварини; у людей не перевірено.']
  })
];

const record = (id, sourceId, claimId, o) => ({
  id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct',
  roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, ...accepted, ...o
});
const md = (estimate, lowerCI, upperCI, unit, effectMeasure = 'Різниця середніх') => ({effectMeasure, estimate, lowerCI, upperCI, unit, confidenceLevel: 95});
const rr = (estimate, lowerCI, upperCI) => ({effectMeasure: 'Відносний ризик', estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const records = [
  record('EVR-000111', 'SRC-000057', 'CLM-000056', {roleForClaim: 'primary_support', outcome: {name: 'Глюкоза натще'}, result: md(-0.52, -0.72, -0.33, 'ммоль/л'), populationContext: {description: '18 РКД, 1522 учасники'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000112', 'SRC-000057', 'CLM-000056', {roleForClaim: 'primary_support', outcome: {name: 'HbA1c'}, result: md(-4.48, -6.53, -2.44, 'ммоль/моль'), populationContext: {description: '7 РКД, 756 учасників; ≈ −0,4 процентного пункту (перерахунок Evidence UA)'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000113', 'SRC-000058', 'CLM-000056', {outcome: {name: 'Глюкоза натще, очищений берберин'}, result: md(-0.515, -0.847, -0.183, 'ммоль/л'), populationContext: {description: '6 РКД, 578 учасників; I² = 89,8%'}, extractionLocator: 'PMC12307485, Results 3.4'}),
  record('EVR-000114', 'SRC-000058', 'CLM-000056', {roleForClaim: 'context_only', direction: 'neutral', outcome: {name: 'Глюкоза натще, учасники з дисліпідемією без діабету'}, result: md(0, -0.162, 0.162, 'ммоль/л'), populationContext: {description: '1 РКД; підгрупа за популяцією'}, extractionLocator: 'PMC12307485, Table 3'}),
  record('EVR-000115', 'SRC-000058', 'CLM-000057', {roleForClaim: 'primary_support', outcome: {name: 'Тригліцериди'}, result: md(-0.367, -0.560, -0.175, 'ммоль/л'), populationContext: {description: '9 РКД, 666 учасників; I² = 81,2%'}, extractionLocator: 'PMC12307485, Results 3.4'}),
  record('EVR-000116', 'SRC-000058', 'CLM-000057', {roleForClaim: 'primary_support', outcome: {name: 'ЛПНЩ'}, result: md(-0.495, -0.714, -0.276, 'ммоль/л'), populationContext: {description: '8 РКД, 750 учасників; I² = 89,1%'}, extractionLocator: 'PMC12307485, Results 3.4'}),
  record('EVR-000117', 'SRC-000058', 'CLM-000057', {outcome: {name: 'ЛПВЩ'}, result: md(0.016, -0.045, 0.078, 'ммоль/л'), populationContext: {description: '9 РКД, 774 учасники; I² = 83,3%'}, extractionLocator: 'PMC12307485, Results 3.4'}),
  record('EVR-000118', 'SRC-000058', 'CLM-000057', {outcome: {name: 'Систолічний тиск'}, result: md(-0.879, -7.223, 5.464, 'мм рт. ст.'), populationContext: {description: '3 РКД, 214 учасників; I² = 68,8%'}, extractionLocator: 'PMC12307485, Results 3.4'}),
  record('EVR-000119', 'SRC-000059', 'CLM-000058', {roleForClaim: 'primary_support', outcome: {name: 'Маса тіла'}, result: md(-0.88, -1.36, -0.39, 'кг'), populationContext: {description: '23 РКД'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000120', 'SRC-000058', 'CLM-000058', {outcome: {name: 'ІМТ без досліджень низької якості'}, result: md(-0.302, -0.736, 0.132, 'кг/м²'), populationContext: {description: 'Плацебо-контрольовані РКД після виключення 2 досліджень високого ризику упередженості'}, extractionLocator: 'PMC12307485, Results 3.4'}),
  record('EVR-000121', 'SRC-000058', 'CLM-000059', {roleForClaim: 'primary_support', outcome: {name: 'Будь-який шлунково-кишковий побічний ефект'}, result: rr(1.44, 0.85, 2.42), populationContext: {description: 'Дослідження, що повідомили побічні ефекти (щонайменше 6)'}, extractionLocator: 'PMC12307485, Results 3.2'}),
  record('EVR-000122', 'SRC-000058', 'CLM-000059', {outcome: {name: 'Будь-який побічний ефект'}, result: rr(1.07, 0.15, 6.76), populationContext: {description: 'Дослідження, що повідомили побічні ефекти (щонайменше 6)'}, extractionLocator: 'PMC12307485, Results 3.2'}),
  record('EVR-000123', 'SRC-000060', 'CLM-000060', {roleForClaim: 'primary_support', outcome: {name: 'Активність CYP2D6, CYP2C9, CYP3A4'}, result: {summary: 'Співвідношення декстрометорфан/декстрорфан (CYP2D6) зросло приблизно в 9 разів, лозартан/E-3174 (CYP2C9) — у 2 рази; AUC мідазоламу (CYP3A4) зросла на 40%, кліренс знизився на 27%.'}, populationContext: {description: 'Здорові чоловіки, берберин 300 мг 3 рази на добу 2 тижні'}, extractionLocator: 'Анотація PubMed'}),
  record('EVR-000124', 'SRC-000061', 'CLM-000061', {evidenceLayer: 'mechanistic', roleForClaim: 'mechanistic_support', relevance: 'indirect', outcome: {name: 'Витіснення білірубіну з альбуміну'}, result: {summary: 'In vitro берберин витісняв білірубін приблизно в 10 разів сильніше за фенілбутазон; у щурів знижувалося зв’язування білірубіну й зростав рівень вільного та загального білірубіну.'}, populationContext: {description: 'Плазма in vitro; дорослі щури, 1 тиждень'}, extractionLocator: 'Анотація PubMed'})
];

export const berberineBase = createEvidenceBase({
  claims, sources, records,
  presentation: {
    labels: {
      'CLM-000056': 'Цукор крові',
      'CLM-000057': 'Ліпіди й тиск',
      'CLM-000058': 'Вага',
      'CLM-000059': 'Переносимість',
      'CLM-000060': 'Взаємодія з ліками',
      'CLM-000061': 'Вагітність і немовлята'
    },
    confidenceNote: 'Числа — середні по дослідженнях на людях з порушеним обміном речовин. Вони не прогнозують результат конкретної людини.'
  }
});
