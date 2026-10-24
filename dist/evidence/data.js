// Generated topic registration; scientific content remains in the seed.
import {createEvidenceBase} from './registry.js?v=1.5';
                                     

export const creatineClaims          = [
  {
    id: "CLM-000001",
    slug: "creatine-resistance-training-strength",
    statement:
      "У здорових дорослих, які виконують силові тренування, додавання креатину в середньому забезпечує додатковий приріст сили порівняно із силовими тренуваннями без креатину.",
    shortStatement:
      "Креатин може додатково покращувати приріст сили під час силових тренувань.",
    claimType: "performance",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "strength", "resistance_training"],
    population: {
      description: "Переважно здорові дорослі, які виконують силові тренування.",
      notes: "Популяції та тренувальний досвід відрізнялися між дослідженнями."
    },
    intervention: { name: "Прийом креатину" },
    comparator: { description: "Силові тренування без креатину" },
    outcome: {
      name: "Muscular strength",
      timeframe: "long_term",
      measurementNotes: "Upper- and lower-body strength outcomes across resistance-training trials."
    },
    evidenceConfidence: "high",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Велика сукупність контрольованих досліджень і сучасний метааналіз показують узгоджений додатковий ефект на силові показники.",
      uncertaintyNotes: [
        "Перед фінальним HIGH потрібен outcome-level risk-of-bias review.",
        "Розмір ефекту залежить від тесту, популяції та протоколу тренувань."
      ]
    },
    evidenceSummary:
      "Сучасний трирівневий метааналіз 63 досліджень (n=1489) показав додаткове покращення як верхньої, так і нижньої сили при поєднанні креатину із силовими тренуваннями.",
    practicalMeaning:
      "Креатин не замінює тренування, але може дати додаткову перевагу в розвитку сили.",
    limitations: [
      "Не всі силові тести демонструють однакову величину ефекту.",
      "Тренувальні та харчові протоколи між дослідженнями неоднорідні.",
      "Фінальний confidence потребує формального Evidence UA review."
    ],
    applicability: {
      directFor: ["healthy_adults", "resistance_training"],
      uncertainFor: ["children", "pregnancy", "specific_clinical_populations"]
    },
    explanations: {
      simple:
        "Креатин може допомогти отримати трохи більший приріст сили від силових тренувань.",
      university:
        "Дані контрольованих досліджень у середньому показують додатковий приріст силових показників при поєднанні креатину із resistance training.",
      advanced:
        "Ефект оцінюється на рівні body of evidence; механізм ATP–PCr є біологічно правдоподібним, але не використовується як заміна human-outcome evidence."
    },
    lastReviewed: "2026-10-10",
    nextReview: "2027-10-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000002",
    slug: "creatine-resistance-training-lean-mass",
    statement:
      "У дорослих, які виконують силові тренування, додавання креатину в середньому збільшує оцінювану безжирову масу порівняно із силовими тренуваннями без креатину.",
    shortStatement:
      "Креатин разом із силовими тренуваннями може збільшувати безжирову масу.",
    claimType: "efficacy",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "lean_mass", "body_composition", "resistance_training"],
    population: {
      description: "Дорослі, які виконують силові тренування; одна ключова метааналіза включала осіб молодших 50 років."
    },
    intervention: { name: "Креатин + силові тренування" },
    comparator: { description: "Лише силові тренування / плацебо-контроль" },
    outcome: {
      name: "Lean body mass / lean mass",
      timeframe: "long_term",
      measurementNotes:
        "Lean mass is not equivalent to direct measurement of skeletal-muscle hypertrophy."
    },
    evidenceConfidence: "moderate",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Кілька synthesis-level джерел показують позитивний напрям; 2024 meta-analysis оцінив +1.14 кг LBM.",
      downgradeDomains: ["risk_of_bias"],
      uncertaintyNotes: [
        "Частина досліджень мала some concerns або високий ризик упередженості, тому попередню оцінку знижено до MODERATE.",
        "Lean body mass включає водний компонент і не є прямою мірою контрактильної м'язової тканини."
      ]
    },
    evidenceSummary:
      "Метааналіз 2024 року 12 досліджень показав +1.14 кг LBM (95% CI 0.69–1.59) при додаванні креатину до силових тренувань; сучасний метааналіз 2026 також показав позитивний ефект на lean mass.",
    practicalMeaning:
      "Коректне формулювання — приріст оцінюваної lean/FFM, а не «X кг чистого м'яза».",
    limitations: [
      "Різні методи оцінки складу тіла мають різні обмеження.",
      "Lean mass не тотожна прямій гіпертрофії скелетного м'яза.",
      "Частина досліджень мала some concerns або high risk of bias."
    ],
    applicability: {
      directFor: ["adults", "resistance_training"],
      uncertainFor: ["older_adults_outside_review_scope", "clinical_populations"]
    },
    lastReviewed: "2026-10-10",
    nextReview: "2027-10-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000003",
    slug: "creatine-kidney-function",
    statement:
      "У досліджених режимах креатин не демонструє переконливого погіршення функції нирок за показниками, що менше залежать від сироваткового креатиніну.",
    shortStatement:
      "У досліджених режимах креатин не показує переконливого погіршення функції нирок.",
    claimType: "safety",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "kidney", "safety", "gfr"],
    population: {
      description:
        "Рандомізовані дослідження включали здорових учасників, а в окремих оглядах — також відібраних учасників із хронічною хворобою нирок. Це не всі клінічні популяції."
    },
    intervention: { name: "Прийом креатину" },
    comparator: { description: "Плацебо / контроль" },
    outcome: {
      name: "Kidney function",
      timeframe: "long_term",
      measurementNotes:
        "Interpret creatinine-based eGFR separately from direct/less creatinine-dependent filtration measures."
    },
    evidenceConfidence: "moderate",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Сучасні метааналізи не демонструють переконливого погіршення GFR; найновіший огляд не виявив істотної зміни Cr-EDTA GFR.",
      downgradeDomains: ["imprecision", "long_term_safety"],
      uncertaintyNotes: [
        "Тривалість багатьох RCT недостатня для висновків про дуже рідкісні або багаторічні harms.",
        "Не слід автоматично екстраполювати на будь-яку тяжку ниркову патологію."
      ]
    },
    evidenceSummary:
      "Метааналіз 2026 року 26 досліджень (n=1036) не показав значущої зміни Cr-EDTA GFR, albuminuria чи proteinuria, хоча creatinine-based estimates змінювалися.",
    practicalMeaning:
      "Підвищений креатинін після початку креатину слід інтерпретувати в контексті, а не автоматично трактувати як пошкодження нирок.",
    limitations: [
      "Склад популяцій, дози та тривалість досліджень неоднорідні.",
      "Рідкісні й дуже довгострокові небажані ефекти важко виключити короткими RCT.",
      "Люди з відомою нирковою хворобою потребують окремого клінічного контексту."
    ],
    applicability: {
      directFor: ["healthy_adults_in_studied_doses"],
      uncertainFor: ["advanced_kidney_disease", "complex_clinical_states"]
    },
    lastReviewed: "2026-10-10",
    nextReview: "2027-04-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000004",
    slug: "creatine-serum-creatinine-interpretation",
    statement:
      "Креатин може підвищувати сироватковий креатинін і знижувати creatinine-based eGFR без відповідного погіршення пряміших показників ниркової фільтрації.",
    shortStatement:
      "Креатин може підвищити креатинін без того, щоб це автоматично означало пошкодження нирок.",
    claimType: "physiology",
    evidenceLayer: "mixed",
    domain: "supplements",
    topics: ["creatine", "creatinine", "egfr", "kidney", "lab_interpretation"],
    population: {
      description: "Учасники рандомізованих досліджень прийому креатину."
    },
    intervention: { name: "Прийом креатину" },
    comparator: { description: "Плацебо / контроль" },
    outcome: {
      name: "Serum creatinine and creatinine-based eGFR",
      timeframe: "medium_term"
    },
    evidenceConfidence: "moderate",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Два сучасні метааналізи показують невелике підвищення serum creatinine без відповідного переконливого сигналу погіршення GFR.",
      downgradeDomains: ["inconsistency"],
      uncertaintyNotes: [
        "Напрям зміни креатиніну узгоджений, а величина — ні (I² ≈ 94%), тому попередню оцінку знижено через неузгодженість.",
        "Точна величина зміни залежить від досліджень, тривалості, дози та лабораторного методу."
      ]
    },
    evidenceSummary:
      "У meta-analysis 2026 serum creatinine зростав на 0.14 mg/dL (95% CI 0.05–0.22), тоді як Cr-EDTA GFR істотно не змінювався.",
    practicalMeaning:
      "Creatinine-based eGFR може виглядати нижчим після початку креатину через зміну метаболізму креатину/креатиніну.",
    limitations: [
      "Serum creatinine у meta-analysis 2026 мав дуже високу heterogeneity (I² ≈ 94%).",
      "Лабораторні зміни завжди потрібно інтерпретувати разом із клінічним контекстом."
    ],
    lastReviewed: "2026-10-10",
    nextReview: "2027-04-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000005",
    slug: "creatine-alternative-forms-vs-monohydrate",
    statement:
      "Послідовної переваги альтернативних форм креатину над креатином моногідратом щодо продуктивності або складу тіла не встановлено.",
    shortStatement:
      "Доведеної послідовної переваги альтернативних форм над моногідратом немає.",
    claimType: "efficacy",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "creatine_monohydrate", "alternative_forms"],
    population: { description: "Здорові учасники рандомізованих плацебо-контрольованих досліджень." },
    intervention: { name: "Альтернативні форми креатину" },
    comparator: { description: "Креатин моногідрат та/або плацебо" },
    outcome: { name: "Performance and body composition", timeframe: "medium_term" },
    evidenceConfidence: "low",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Систематичний огляд виявив мало прямих порівнянь із моногідратом і не встановив послідовної переваги альтернативних форм.",
      downgradeDomains: ["imprecision", "indirectness"],
      uncertaintyNotes: [
        "Прямих порівнянь із моногідратом мало, тому попередню оцінку знижено до LOW.",
        "Лише невелика частина досліджень прямо порівнювала альтернативні форми з креатином моногідратом."
      ]
    },
    evidenceSummary:
      "Огляд включав 17 рандомізованих плацебо-контрольованих досліджень, але лише 3 прямо порівнювали альтернативну форму з моногідратом.",
    practicalMeaning:
      "Теза «дорожча/нова форма краща» потребує прямого доказу; наявна база цього послідовно не показує.",
    limitations: [
      "Невелика кількість прямих head-to-head comparisons.",
      "Різні альтернативні форми не можна вважати однорідною категорією."
    ],
    lastReviewed: "2026-10-10",
    nextReview: "2027-10-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000006",
    slug: "creatine-loading-not-required",
    statement:
      "Фаза завантаження прискорює підвищення м’язових запасів креатину, але не є необхідною для їх підвищення при регулярному прийомі.",
    shortStatement:
      "Завантаження прискорює насичення м’язів креатином, але не є обов’язковим для його підвищення.",
    claimType: "physiology",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "loading", "dose", "muscle_creatine"],
    population: { description: "Здорові дорослі чоловіки в базовому дослідженні насичення м’язів креатином." },
    intervention: {
      name: "Прийом креатину",
      dose: "20 г/добу протягом 6 днів проти 3 г/добу протягом 28 днів"
    },
    outcome: { name: "Концентрація загального креатину в м’язах", timeframe: "medium_term" },
    evidenceConfidence: "moderate",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Прямі вимірювання в м’язах людини показали швидке насичення при вищій дозі та подібне поступове підвищення при нижчій щоденній дозі.",
      downgradeDomains: ["imprecision"],
      uncertaintyNotes: [
        "Оцінка спирається на одне давнє дослідження 31 чоловіка без незалежного підтвердження в цьому наборі джерел, тому попередню оцінку знижено до MODERATE.",
        "Базове дослідження давнє й має невелику чоловічу вибірку; висновок стосується безпосереднього фізіологічного вимірювання."
      ]
    },
    evidenceSummary:
      "20 г/добу протягом 6 днів підвищували загальний креатин у м’язах приблизно на 20%; 3 г/добу протягом 28 днів давали подібне, але поступове підвищення.",
    practicalMeaning:
      "Завантаження — спосіб швидше наситити м’язові запаси. Чи впливає воно на результати тренувань, цей Claim не оцінює.",
    limitations: [
      "Базове дослідження включало 31 чоловіка.",
      "Цей Claim стосується насичення м’язів креатином, а не всіх подальших результатів продуктивності."
    ],
    lastReviewed: "2026-10-10",
    nextReview: "2028-10-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000007",
    slug: "creatine-pre-vs-post-timing",
    statement:
      "Переконливої переваги прийому креатину безпосередньо до або безпосередньо після силового тренування не встановлено.",
    shortStatement:
      "Немає переконливих доказів, що креатин обов'язково треба приймати саме до або саме після тренування.",
    claimType: "performance",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "timing", "pre_workout", "post_workout"],
    population: { description: "Молоді фізично активні дорослі в прямому дослідженні прийому до або після тренування." },
    intervention: { name: "Креатин безпосередньо до тренування" },
    comparator: { description: "Креатин безпосередньо після тренування" },
    outcome: { name: "Сила й товщина м’язів", timeframe: "long_term" },
    evidenceConfidence: "very_low",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Пряме дослідження отримало подібні результати, але вибірка надто мала для впевненого висновку про відсутність різниці.",
      downgradeDomains: ["imprecision"],
      uncertaintyNotes: [
        "Відсутність виявленої різниці в одному дослідженні на 10 осіб не доводить відсутності різниці.",
        "Ключове дослідження з порівнянням умов у тих самих учасників включало лише 10 людей."
      ]
    },
    evidenceSummary:
      "У 8-тижневому дослідженні не виявлено різниці в прирості сили чи товщини м’язів між прийомом безпосередньо до та після тренування.",
    practicalMeaning:
      "Регулярність прийому має кращу практичну основу, ніж жорстке правило «тільки до» або «тільки після».",
    limitations: [
      "Дуже мала база прямих порівнянь.",
      "Невиявлена різниця не доводить, що всі стратегії часу прийому еквівалентні."
    ],
    lastReviewed: "2026-10-10",
    nextReview: "2027-04-10",
    version: "1.0",
    status: "evidence_review"
  },

  {
    id: "CLM-000008",
    slug: "creatine-caffeine-interaction",
    statement:
      "Поточна доказова база недостатня, щоб стверджувати, що кофеїн систематично нейтралізує ергогенні ефекти креатину.",
    shortStatement:
      "Правило «кава скасовує креатин» не підтримується достатньо узгодженими доказами.",
    claimType: "performance",
    evidenceLayer: "human_outcome",
    domain: "supplements",
    topics: ["creatine", "caffeine", "interaction", "coffee"],
    population: { description: "Здорові учасники досліджень сумісного прийому креатину та кофеїну." },
    intervention: { name: "Креатин + кофеїн" },
    comparator: { description: "Креатин та/або кофеїн за різних протоколів" },
    outcome: { name: "Ergogenic performance outcomes", timeframe: "medium_term" },
    evidenceConfidence: "low",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Систематичний огляд виявив суперечливі результати різних протоколів, особливо за тривалого сумісного прийому.",
      downgradeDomains: ["inconsistency", "imprecision"],
      uncertaintyNotes: [
        "Разовий кофеїн після завантаження креатином і тривалий сумісний прийом — різні питання.",
        "Кава не тотожна стандартизованій дозі кофеїну в дослідженні."
      ]
    },
    evidenceSummary:
      "Огляд 2022 року включав 10 досліджень: за тривалого сумісного прийому зустрічалися як сигнали послаблення ефекту, так і відсутність взаємодії або синергія.",
    practicalMeaning:
      "Не варто перетворювати неоднорідні дані на категоричну заборону кави з креатином.",
    limitations: [
      "Протоколи, дози кофеїну й час прийому суттєво різняться.",
      "Дані неоднорідні й недостатні для універсального правила взаємодії."
    ],
    lastReviewed: "2026-10-10",
    nextReview: "2027-04-10",
    version: "1.0",
    status: "evidence_review"
  }
];

export const creatineClaimsById = Object.fromEntries(
  creatineClaims.map((claim) => [claim.id, claim])
)                         ;

                                      

export const creatineSources           = [
  {
    id: "SRC-000001",
    title:
      "Resistance training combined with creatine supplementation: a three-level meta-analysis of multidimensional outcomes from strength enhancement to body composition remodeling",
    shortCitation: "Wang H, Wang H, Xin X, Yi Z. J Int Soc Sports Nutr. 2026.",
    year: 2026,
    journal: "Journal of the International Society of Sports Nutrition",
    publicationType: "systematic_review_meta_analysis",
    studyDesign: "three-level random-effects meta-analysis",
    identifiers: {
      doi: "10.1080/15502783.2026.2718316",
      pmid: "42765482"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/42765482/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary:
      "63 дослідження, 1489 учасників; силові тренування з креатином порівняно з тренуваннями без креатину.",
    methodsSummary:
      "Пошук до 21.04.2025; Hedges’ g; трирівневий метааналіз із випадковими ефектами.",
    keyLimitations: [
      "Харчування й тренувальні протоколи неоднорідні та описані не повністю.",
      "Аналізи модераторів мали пошуковий характер."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000002",
    title:
      "The Effect of Creatine Supplementation on Resistance Training-Based Changes to Body Composition: A Systematic Review and Meta-analysis",
    shortCitation: "Desai I et al. J Strength Cond Res. 2024.",
    year: 2024,
    journal: "Journal of Strength and Conditioning Research",
    publicationType: "systematic_review_meta_analysis",
    studyDesign: "random-effects meta-analysis",
    identifiers: {
      doi: "10.1519/JSC.0000000000004862",
      pmid: "39074168"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/39074168/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary:
      "12 досліджень у дорослих молодших 50 років, які виконували силові тренування.",
    methodsSummary:
      "Попередньо зареєстрований систематичний огляд; основний outcome — безжирова маса (lean body mass).",
    keyLimitations: [
      "52% досліджень мали низький ризик упередженості, 41% — певні застереження, 7% — високий ризик.",
      "Безжирова маса не є прямим вимірюванням скоротливої тканини скелетних м’язів."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000003",
    title:
      "Impact of creatine supplementation on kidney health: a systematic review and meta-analysis",
    shortCitation: "de Souza Almeida A et al. Int Urol Nephrol. 2026.",
    year: 2026,
    journal: "International Urology and Nephrology",
    publicationType: "systematic_review_meta_analysis",
    studyDesign: "random-effects meta-analysis of randomized controlled trials",
    identifiers: {
      doi: "10.1007/s11255-026-05287-x",
      pmid: "42507286"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/42507286/",
    publicationStatus: "online_ahead_of_print",
    sourceStatus: "active",
    populationSummary:
      "26 досліджень, 1036 учасників; здорові люди та відібрані учасники з хронічною хворобою нирок.",
    methodsSummary:
      "Рандомізовані дослідження до березня 2025 року; основний outcome — креатинін крові; включено прямі та креатинін-залежні оцінки фільтрації.",
    keyLimitations: [
      "Аналіз креатиніну мав дуже високу неоднорідність.",
      "Рідкісні довгострокові небажані ефекти складно оцінити за доступними рандомізованими дослідженнями."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000004",
    title:
      "Effect of creatine supplementation on kidney function: a systematic review and meta-analysis",
    shortCitation: "Kabiri Naeini E et al. BMC Nephrol. 2025.",
    year: 2025,
    journal: "BMC Nephrology",
    publicationType: "systematic_review_meta_analysis",
    studyDesign: "random-effects systematic review and meta-analysis",
    identifiers: {
      doi: "10.1186/s12882-025-04558-6",
      pmid: "41199218",
      pmcid: "PMC12590749"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/41199218/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary:
      "21 дослідження в огляді; лише частина придатна для кількісного об’єднання.",
    methodsSummary:
      "Основні outcomes — креатинін крові та ШКФ; пошук до березня 2025 року.",
    keyLimitations: [
      "Різна тривалість спостереження та різні дизайни.",
      "Для ШКФ і креатиніну об’єднано різні підгрупи досліджень."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000005",
    title:
      "The Effect of Creatine Supplementation on Kidney Function: A Systematic Review and Meta-Analysis of Randomized Controlled Trials",
    shortCitation: "Tsiaras A et al. J Ren Nutr. 2026.",
    year: 2026,
    journal: "Journal of Renal Nutrition",
    publicationType: "systematic_review_meta_analysis",
    studyDesign: "random-effects meta-analysis of randomized controlled trials",
    identifiers: {
      doi: "10.1053/j.jrn.2026.04.010",
      pmid: "42035842"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/42035842/",
    publicationStatus: "online_ahead_of_print",
    sourceStatus: "active",
    populationSummary:
      "19 рандомізованих досліджень і одне подвійне сліпе рандомізоване перехресне дослідження.",
    methodsSummary:
      "Основні outcomes — креатинін крові, сечовина та розрахована ШКФ.",
    keyLimitations: [
      "Автори прямо вказують на потребу в дослідженнях тривалістю понад рік."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000006",
    title:
      "Efficacy of Alternative Forms of Creatine Supplementation on Improving Performance and Body Composition in Healthy Subjects: A Systematic Review",
    shortCitation: "Fazio C, Elder CL, Harris MM. J Strength Cond Res. 2022.",
    year: 2022,
    journal: "Journal of Strength and Conditioning Research",
    publicationType: "systematic_review",
    studyDesign: "systematic review of randomized placebo-controlled trials",
    identifiers: {
      doi: "10.1519/JSC.0000000000003873",
      pmid: "36000773"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/36000773/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary:
      "17 плацебо-контрольованих рандомізованих досліджень у здорових учасників; лише 3 прямі порівняння з моногідратом.",
    methodsSummary:
      "Систематичний огляд за PICOS: продуктивність і склад тіла.",
    keyLimitations: [
      "Дуже мало прямих порівнянь із креатином моногідратом."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000007",
    title: "Muscle creatine loading in men",
    shortCitation: "Hultman E et al. J Appl Physiol. 1996.",
    year: 1996,
    journal: "Journal of Applied Physiology",
    publicationType: "original_research",
    studyDesign: "clinical trial with direct muscle creatine measurements",
    identifiers: {
      doi: "10.1152/jappl.1996.81.1.232",
      pmid: "8828669"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/8828669/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary: "31 чоловік.",
    methodsSummary:
      "Порівняння режимів прийому з прямим вимірюванням загального креатину в м’язах.",
    keyLimitations: [
      "Невелика вибірка, лише чоловіки.",
      "Базове фізіологічне дослідження, не сучасна оцінка всіх ефектів продуктивності."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000008",
    title:
      "Timing of creatine supplementation does not influence gains in unilateral muscle hypertrophy or strength from resistance training in young adults: a within-subject design",
    shortCitation: "Forbes SC, Krentz JR, Candow DG. J Sports Med Phys Fitness. 2021.",
    year: 2021,
    journal: "Journal of Sports Medicine and Physical Fitness",
    publicationType: "original_research",
    studyDesign: "counter-balanced double-blind repeated-measures within-subject trial",
    identifiers: {
      doi: "10.23736/S0022-4707.20.11668-2",
      pmid: "34610729"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/34610729/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary:
      "10 фізично активних учасників (7 чоловіків, 3 жінки), вік 23±5 років.",
    methodsSummary:
      "8 тижнів; 0,1 г/кг креатину безпосередньо до або після одностороннього силового тренування.",
    keyLimitations: [
      "Дуже мала вибірка.",
      "Специфічний односторонній дизайн обмежує узагальнення на всі стратегії часу прийому."
    ],
    lastChecked: "2026-10-10"
  },

  {
    id: "SRC-000009",
    title:
      "Interaction Between Caffeine and Creatine When Used as Concurrent Ergogenic Supplements: A Systematic Review",
    shortCitation: "Elosegui S et al. Int J Sport Nutr Exerc Metab. 2022.",
    year: 2022,
    journal: "International Journal of Sport Nutrition and Exercise Metabolism",
    publicationType: "systematic_review",
    studyDesign: "systematic review",
    identifiers: {
      doi: "10.1123/ijsnem.2021-0262",
      pmid: "35016154"
    },
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/35016154/",
    publicationStatus: "published",
    sourceStatus: "active",
    populationSummary: "10 досліджень сумісного прийому креатину та кофеїну.",
    methodsSummary:
      "Систематичний пошук до листопада 2021 року; разові й тривалі протоколи.",
    keyLimitations: [
      "Суттєва неоднорідність протоколів.",
      "Разовий і тривалий прийом кофеїну не є взаємозамінними питаннями."
    ],
    lastChecked: "2026-10-10"
  }
];

export const creatineSourcesById = Object.fromEntries(
  creatineSources.map((source) => [source.id, source])
)                          ;

                                              

export const creatineEvidenceRecords                   = [
  {
    id: "EVR-000001",
    sourceId: "SRC-000001",
    claimId: "CLM-000001",
    evidenceLayer: "human_outcome",
    outcome: { name: "Сила верхньої частини тіла" },
    result: {
      effectMeasure: "Hedges_g",
      estimate: 0.54,
      summary: "Креатин із силовими тренуваннями давав більший приріст сили верху тіла, ніж лише тренування."
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "primary_support",
    extractionNotes: [
      "Огляд включав загалом 63 дослідження; кількість учасників саме цього outcome потрібно уточнити за повним текстом до фінального наукового схвалення."
    ],
    reviewStatus: "pending"
  },

  {
    id: "EVR-000002",
    sourceId: "SRC-000001",
    claimId: "CLM-000001",
    evidenceLayer: "human_outcome",
    outcome: { name: "Сила нижньої частини тіла" },
    result: {
      effectMeasure: "Hedges_g",
      estimate: 0.55,
      summary: "Креатин із силовими тренуваннями давав більший приріст сили низу тіла, ніж лише тренування."
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "primary_support",
    extractionNotes: [
      "Оцінку ризику упередженості для цього outcome ще не завершено."
    ],
    reviewStatus: "pending"
  },

  {
    id: "EVR-000003",
    sourceId: "SRC-000001",
    claimId: "CLM-000002",
    evidenceLayer: "human_outcome",
    outcome: { name: "Безжирова маса (lean mass)" },
    result: {
      effectMeasure: "Hedges_g",
      estimate: 0.30,
      summary: "Креатин із силовими тренуваннями збільшував оцінювану безжирову масу більше, ніж лише тренування."
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "supporting",
    interpretation:
      "Безжирова маса не тотожна безпосередньо виміряній гіпертрофії скелетних м’язів.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000004",
    sourceId: "SRC-000002",
    claimId: "CLM-000002",
    evidenceLayer: "human_outcome",
    outcome: { name: "Безжирова маса (lean body mass)" },
    result: {
      effectMeasure: "mean_difference",
      estimate: 1.14,
      lowerCI: 0.69,
      upperCI: 1.59,
      confidenceLevel: 95,
      unit: "kg"
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "Оцінка стосується LBM за методами включених досліджень складу тіла; її не можна представляти як 1,14 кг нової м’язової тканини.",
    extractionNotes: [
      "В огляді: 52% досліджень із низьким ризиком упередженості, 41% із певними застереженнями, 7% із високим ризиком."
    ],
    reviewStatus: "pending"
  },

  {
    id: "EVR-000005",
    sourceId: "SRC-000003",
    claimId: "CLM-000004",
    evidenceLayer: "human_outcome",
    outcome: { name: "Креатинін крові" },
    result: {
      effectMeasure: "mean_difference",
      estimate: 0.14,
      lowerCI: 0.05,
      upperCI: 0.22,
      confidenceLevel: 95,
      pValue: 0.002,
      unit: "mg/dL",
      heterogeneityI2: 93.9
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "Креатинін крові підвищувався; зміну маркера слід оцінювати разом із показниками фільтрації.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000006",
    sourceId: "SRC-000003",
    claimId: "CLM-000004",
    evidenceLayer: "human_outcome",
    outcome: { name: "ШКФ, розрахована за креатиніном" },
    result: {
      effectMeasure: "mean_difference",
      estimate: -10.75,
      lowerCI: -17.48,
      upperCI: -4.02,
      confidenceLevel: 95,
      pValue: 0.002,
      unit: "mL/min",
      heterogeneityI2: 0
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "supporting",
    interpretation:
      "Креатинін-залежна оцінка знижується при підвищенні креатиніну; сама ця зміна не доводить ушкодження нирок.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000007",
    sourceId: "SRC-000003",
    claimId: "CLM-000003",
    evidenceLayer: "human_outcome",
    outcome: { name: "ШКФ, виміряна методом Cr-EDTA" },
    result: {
      effectMeasure: "mean_difference",
      estimate: 5.89,
      lowerCI: -0.30,
      upperCI: 12.08,
      confidenceLevel: 95,
      pValue: 0.06,
      unit: "mL/min",
      heterogeneityI2: 6.3
    },
    direction: "neutral",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "Метод Cr-EDTA не виявив статистично значущого погіршення. Це підтримує висновок про невиявлену шкоду, але не доводить нульового ниркового ризику.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000008",
    sourceId: "SRC-000003",
    claimId: "CLM-000003",
    evidenceLayer: "human_outcome",
    outcome: { name: "Альбумінурія / протеїнурія" },
    result: {
      summary:
        "Значущої загальної різниці в альбумінурії чи протеїнурії не виявлено."
    },
    direction: "neutral",
    relevance: "direct",
    roleForClaim: "supporting",
    interpretation:
      "Невиявлений небажаний сигнал не є доказом абсолютної безпеки.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000009",
    sourceId: "SRC-000004",
    claimId: "CLM-000003",
    evidenceLayer: "human_outcome",
    outcome: { name: "Швидкість клубочкової фільтрації (ШКФ)" },
    result: {
      summary:
        "Метааналіз не виявив статистично значущої різниці ШКФ між креатином і контролем."
    },
    direction: "neutral",
    relevance: "direct",
    roleForClaim: "supporting",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000010",
    sourceId: "SRC-000005",
    claimId: "CLM-000004",
    evidenceLayer: "human_outcome",
    outcome: { name: "Креатинін крові" },
    result: {
      effectMeasure: "mean_difference",
      estimate: 0.13,
      lowerCI: 0.07,
      upperCI: 0.18,
      confidenceLevel: 95,
      unit: "mg/dL"
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "supporting",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000011",
    sourceId: "SRC-000005",
    claimId: "CLM-000003",
    evidenceLayer: "human_outcome",
    outcome: { name: "Розрахована ШКФ" },
    result: {
      effectMeasure: "mean_difference",
      estimate: -5.20,
      lowerCI: -15.00,
      upperCI: 4.60,
      confidenceLevel: 95,
      unit: "mL/min/1.73m²"
    },
    direction: "neutral",
    relevance: "direct",
    roleForClaim: "supporting",
    interpretation:
      "Статистично значущої міжгрупової різниці розрахованої ШКФ не виявлено; автори наголошують на потребі досліджень понад рік.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000012",
    sourceId: "SRC-000006",
    claimId: "CLM-000005",
    evidenceLayer: "human_outcome",
    outcome: { name: "Перевага альтернативної форми над моногідратом" },
    result: {
      summary:
        "Включено 17 плацебо-контрольованих досліджень, лише 3 — прямі порівняння з моногідратом; послідовної переваги не встановлено."
    },
    direction: "neutral",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "Підтримує висновок «переваги не встановлено», а не «всі альтернативні форми неефективні».",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000013",
    sourceId: "SRC-000007",
    claimId: "CLM-000006",
    evidenceLayer: "human_outcome",
    outcome: { name: "Концентрація загального креатину в м’язах" },
    result: {
      summary:
        "20 г/добу протягом 6 днів збільшували загальний креатин м’язів приблизно на 20%; 3 г/добу протягом 28 днів давали подібне, але поступове підвищення."
    },
    direction: "supports_claim",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "Завантаження змінює швидкість насичення; воно не є необхідним для поступового підвищення запасів креатину.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000014",
    sourceId: "SRC-000008",
    claimId: "CLM-000007",
    evidenceLayer: "human_outcome",
    outcome: {
      name: "Сила й товщина м’язів",
      timepoint: "8 weeks"
    },
    result: {
      summary:
        "Сила й товщина м’язів зростали; різниці між прийомом безпосередньо до та після тренування не виявлено."
    },
    direction: "neutral",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "У цьому протоколі великої різниці не виявлено, але дослідження надто мале для впевненого висновку про еквівалентність.",
    reviewStatus: "pending"
  },

  {
    id: "EVR-000015",
    sourceId: "SRC-000009",
    claimId: "CLM-000008",
    evidenceLayer: "human_outcome",
    outcome: { name: "Взаємодія креатину та кофеїну щодо продуктивності" },
    result: {
      summary:
        "За тривалого сумісного прийому: 2 дослідження повідомили можливе послаблення ефекту, 3 — відсутність взаємодії, 1 — синергію; разові протоколи також різнилися."
    },
    direction: "mixed",
    relevance: "direct",
    roleForClaim: "primary_support",
    interpretation:
      "Дані не підтримують універсального твердження, що кофеїн скасовує ефект креатину.",
    reviewStatus: "pending"
  }
];

export const evidenceRecordsByClaimId = creatineEvidenceRecords.reduce 
                                  
 ((acc, record) => {
  (acc[record.claimId] ??= []).push(record);
  return acc;
}, {});

                                              

export const creatineModule                 = {
  id: "MOD-CREATINE-001",
  slug: "creatine",
  title: "Креатин",
  subtitle:
    "Одна з найбільш досліджених спортивних добавок — без маркетингових перебільшень.",
  status: "ready_for_implementation",
  version: "1.0",
  lastReviewed: "2026-10-10",
  evidenceStatus: "reviewing",
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Креатин"
    },
    {
      id: "short-answer",
      type: "short_answer",
      title: "Коротко",
      claimIds: ["CLM-000001", "CLM-000002", "CLM-000006", "CLM-000007", "CLM-000004"]
    },
    {
      id: "evidence-grid",
      type: "evidence_grid",
      title: "Що показують дані",
      claimIds: [
        "CLM-000001",
        "CLM-000002",
        "CLM-000003",
        "CLM-000004",
        "CLM-000005",
        "CLM-000006",
        "CLM-000007",
        "CLM-000008"
      ]
    },
    {
      id: "dosing",
      type: "dosing",
      title: "Як приймати",
      claimIds: ["CLM-000006", "CLM-000007"]
    },
    {
      id: "kidney",
      type: "kidney",
      title: "Креатин, креатинін і нирки",
      claimIds: ["CLM-000003", "CLM-000004"]
    },
    {
      id: "mechanism",
      type: "mechanism",
      title: "Як працює система креатин — фосфокреатин — ATP"
    },
    {
      id: "myths",
      type: "myths",
      title: "Міфи",
      claimIds: ["CLM-000003", "CLM-000005", "CLM-000006", "CLM-000007", "CLM-000008"]
    },
    {
      id: "sources",
      type: "sources",
      sourceIds: ["SRC-000001", "SRC-000002", "SRC-000003", "SRC-000004", "SRC-000005", "SRC-000006", "SRC-000007", "SRC-000008", "SRC-000009", "SRC-000010", "SRC-000011"],
      title: "Джерела"
    },
    {
      id: "last-reviewed",
      type: "last_reviewed",
      title: "Актуальність"
    }
  ]
};

// UI configuration is separate from scientific claims; only stable IDs link them.
export const muscleVisual = {
  id: 'VIS-MUSCLE-ENERGY-001', version: '1.0', lastReviewed: '2026-10-10',
  type: 'interactive_illustration', simplified: true, claimIds: [],
  entityIds: ['MOL-ATP','MOL-PHOSPHOCREATINE','PRT-CREATINE-KINASE'],
  sourceIds: ['SRC-000010','SRC-000011'],
  image: './evidence/muscle-fiber-v1.webp',
  simplificationNote: 'Художня навчальна ілюстрація. Масштаб, кількість і розташування структур умовні. Позначки ATP, PCr та ферменту — точки пояснення, а не видимі молекули або виміряні концентрації.',
  structures: [
    {id:'pcr',label:'Фосфокреатин',x:27,y:42,summary:'Допомагає швидко ресинтезувати ATP з ADP.',detail:'Фосфокреатин передає фосфатну групу ADP у реакції креатинкінази. Це буфер ресинтезу ATP, а не створення енергії з нічого. Під час роботи запас PCr може зменшуватися; у відновленні він поповнюється.'},
    {id:'atp',label:'ATP',x:48,y:72,summary:'Гідроліз ATP забезпечує енергетичне спряження процесів, зокрема скорочення м’яза.',detail:'ATP → ADP + неорганічний фосфат. Запас ATP обмежений, тому він безперервно ресинтезується через систему PCr, гліколіз і окисне фосфорилювання. Усі системи працюють разом, а не вмикаються по черзі.'},
    {id:'ck',label:'Креатинкіназа',x:43,y:53,summary:'Фермент, що каталізує оборотну реакцію між PCr, ADP, креатином та ATP.',detail:'PCr + ADP + H⁺ ⇄ креатин + ATP. Напрям і швидкість залежать від умов клітини. Під час швидкого ресинтезу ATP реакція споживає H⁺, але сама не описує всю регуляцію pH.'},
    {id:'mito',label:'Мітохондрія',x:77,y:44,summary:'Окисне фосфорилювання допомагає підтримувати ресинтез ATP.',detail:'Енергія окиснення субстратів підтримує електрохімічний градієнт, який використовується ATP-синтазою. Ресинтезований ATP також підтримує відновлення PCr. Креатин не замінює доставку кисню чи інші енергетичні шляхи.'}
  ]
};
export const presentation = {
  labels: { "CLM-000001": "Сила", "CLM-000002": "Безжирова маса", "CLM-000003": "Функція нирок", "CLM-000004": "Креатинін у крові", "CLM-000005": "Альтернативні форми", "CLM-000006": "Завантаження", "CLM-000007": "Час прийому", "CLM-000008": "Кофеїн" },
  shortAnswerClaimIds: ["CLM-000001", "CLM-000002", "CLM-000006", "CLM-000007", "CLM-000004"],
  myths: [
    { title: "«Креатин шкодить ниркам»", claimIds: ["CLM-000003", "CLM-000004"] },
    { title: "«Без завантаження він не працює»", claimIds: ["CLM-000006"] },
    { title: "«Приймати потрібно тільки після тренування»", claimIds: ["CLM-000007"] },
    { title: "«Кава нейтралізує креатин»", claimIds: ["CLM-000008"] },
    { title: "«Дорожчі форми кращі»", claimIds: ["CLM-000005"] }
  ],
  guidance: {
    title: "Практичний орієнтир для здорових дорослих",
    simple: "3–5 г креатину моногідрату щодня.",
    loading: "Опціонально: приблизно 0,3 г/кг/добу сумарно, розділені на кілька прийомів, протягом 5–7 днів; потім 3–5 г/добу.",
    note: "Це guidance з позиційного документа ISSN, а не окремий efficacy Claim і не персональне призначення. За хвороб нирок, вагітності або складного лікування потрібна індивідуальна оцінка лікаря.",
    sourceIds: ["SRC-000010"], claimIds: ["CLM-000006", "CLM-000007"]
  },
  notes: {
    lean: "Безжирова маса (lean body mass) — показник складу тіла, а не пряме вимірювання нової скелетної м’язової тканини. Зміни води також можуть впливати на нього.",
    mechanism: "Механізм пояснює процес, але сам по собі не доводить довгостроковий ефект у людей. Гостра відповідь не дорівнює хронічній адаптації.",
    confidence: "Confidence — впевненість у конкретному висновку, не відсоток істини й не розмір ефекту. Оцінки GRADE-informed; це не завершений формальний GRADE assessment.",
    kidney: "Зміна креатиніну не доводить автоматично ушкодження нирок — але й не дозволяє ігнорувати патологічний аналіз. Повідом лікарю про прийом креатину; результати оцінюють разом із клінічним контекстом."
  },
  kidneyFlow: ["Прийом креатину", "Креатинін у крові може ↑", "Розрахована за креатиніном ШКФ може виглядати ↓", "≠ автоматично ушкодження нирок"],
  mechanism: {
    id: "VIS-ATP-PCR-001", title: "Швидке відновлення ATP", type: "stepper", claimIds: [],
    entityIds: ["MOL-ATP", "MOL-ADP", "MOL-CREATINE", "MOL-PHOSPHOCREATINE", "PRT-CREATINE-KINASE"],
    simplified: true, simplificationNote: "Навчальна якісна модель. Три стани, інші шляхи ресинтезу ATP та роль H⁺/pH пояснено, але концентрації, швидкості й pH чисельно не обчислюються. Криві та розміри символів умовні: це не вимірювання людини й не прогноз приросту сили.",
    sourceIds: ["SRC-000010", "SRC-000011"], version: "1.1", lastReviewed: "2026-10-10",
    phases: [
      { id: "rest", label: "Спокій", title: "Запас готовий до роботи", description: "ATP постійно витрачається й ресинтезується. Фосфокреатин — швидкий буфер для змін потреби в ATP.",
        pcr: "Запас підтримується", atp: "Баланс витрачання й ресинтезу", demand: "Базові потреби клітини", oxphos: "Працює вже у спокої", glycolysis: "Також бере участь у метаболізмі", ph: "Кислотно-основний баланс підтримується.",
        detail: "Спокій не означає, що клітина перестає використовувати ATP. Креатинкіназа каталізує оборотну реакцію; напрям залежить від умов, а не лише від натискання кнопки." },
      { id: "exercise", label: "Навантаження", title: "Потреба в ATP зростає", description: "При переході до інтенсивної роботи PCr може швидко витрачатися на ресинтез ATP. Гліколіз і окисне фосфорилювання теж працюють — не вмикаються по черзі як окремі перемикачі.",
        pcr: "Запас може зменшуватися", atp: "Ресинтез допомагає підтримувати ATP", demand: "Потреба зростає", oxphos: "Окисний ресинтез адаптується до потреб", glycolysis: "Доповнює ресинтез ATP", ph: "pH не обов’язково відразу падає: реакція PCr → ATP споживає H⁺. За тривалого інтенсивного навантаження можливе закислення.",
        detail: "Тут немає розрахунку часток енергетичних шляхів. Вони залежать від інтенсивності, тривалості й фізіологічного стану. Не варто зводити закислення до правила «лактат = кислота»." },
      { id: "recovery", label: "Відновлення", title: "Фосфокреатин поповнюється", description: "Після припинення роботи потреба в ATP для скорочення зменшується. Окисний ресинтез ATP допомагає відновити PCr через оборотну реакцію креатинкінази.",
        pcr: "Запас поступово відновлюється", atp: "ATP підтримує поповнення PCr", demand: "Потреба для скорочення зменшується", oxphos: "Підтримує відновлення запасу", glycolysis: "Його внесок також змінюється", ph: "Відновлення pH не зобов’язане точно повторювати відновлення PCr.",
        detail: "Тривалість відновлення тут не задана. Відповідь залежить від умов навантаження, кислотно-основного стану та окисного метаболізму. Ми не показуємо універсальний таймер для всіх людей." }
    ],
    steps: [
      { title: "ATP використовується", text: "Гідроліз ATP до ADP і неорганічного фосфату (Pi) спряжений із роботою клітини. Креатин не створює енергію з нічого.", active: "use" },
      { title: "Фосфокреатин передає фосфат", text: "Креатинкіназа каталізує перенесення фосфатної групи з фосфокреатину на ADP. Фосфокреатин допомагає швидко ресинтезувати ATP.", active: "transfer" },
      { title: "ATP знову доступний", text: "Результат реакції: креатин і ATP. Це швидкий буфер, а не безмежне джерело енергії чи гарантія приросту сили.", active: "restore" },
      { title: "Відновлення запасу PCr", text: "Реакція оборотна: під час відновлення ATP, який ресинтезують інші енергетичні шляхи, може використовуватися для утворення фосфокреатину.", active: "recover" }
    ]
  }
};

export const guidanceSource = {
  id: "SRC-000010", title: "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine",
  shortCitation: "Kreider RB et al. J Int Soc Sports Nutr. 2017.", authors: ["Kreider RB", "Kalman DS", "Antonio J", "et al."],
  year: 2017, journal: "Journal of the International Society of Sports Nutrition", publicationType: "position_statement", studyDesign: "Позиційний документ / огляд",
  identifiers: { doi: "10.1186/s12970-017-0173-z", pmid: "28615996", pmcid: "PMC5469049" }, pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/28615996/",
  publicationStatus: "published", sourceStatus: "active", populationSummary: "Різні спортивні та клінічні популяції; guidance тут обмежено здоровими дорослими.",
  methodsSummary: "Огляд механізму ATP–PCr і практичних режимів. Не використовується як заміна outcome-level оцінки.",
  keyLimitations: ["Позиційний документ 2017 року; не є новим систематичним пошуком на дату сторінки.", "Автори декларують зв’язки зі спортивною та нутрицевтичною індустрією."],
  funding: "Повну декларацію див. у джерелі.", conflicts: "Задекларовані індустріальні зв’язки; це не автоматичне спростування результатів.", lastChecked: "2026-10-10"
};

export const physiologyModelSource = {
  id: "SRC-000011", title: "Each-step activation of oxidative phosphorylation is necessary to explain muscle metabolic kinetic responses to exercise and recovery in humans",
  shortCitation: "Korzeniewski B, Rossiter HB. J Physiol. 2015.", authors: ["Korzeniewski B", "Rossiter HB"], year: 2015,
  journal: "The Journal of Physiology", publicationType: "original_research", studyDesign: "Математичне моделювання зі зіставленням з експериментальними даними людини",
  identifiers: {doi: "10.1113/JP271299", pmid: "26503399", pmcid: "PMC4704516"}, pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/26503399/",
  publicationStatus: "published", sourceStatus: "active",
  populationSummary: "Експериментальні дані переходів спокій–робота–відновлення при двобічному розгинанні колін у людей.",
  methodsSummary: "Динаміку PCr, pH і шляхів ресинтезу ATP використано для зіставлення математичної моделі з дослідом. Наш інтерактив лише якісно пояснює процеси: код і числові параметри цієї моделі тут не відтворені.",
  keyLimitations: ["Результати залежать від припущень моделі та конкретного протоколу. Не є доказом ефективності добавки й не персональний прогноз."], lastChecked: "2026-10-10"
};

creatineSources.push(guidanceSource, physiologyModelSource);
// Imported provisional assessments, NOT completed GRADE or scientific approvals.
export function seedReviewRecords(claims,records){
 const assessments=claims.map(c=>({
  id:c.id.replace('CLM-','ASM-'),claimId:c.id,claimVersion:c.version,
  framework:c.confidenceFramework,status:'draft',proposedConfidence:c.evidenceConfidence,
  evidenceRecordIds:records.filter(r=>r.claimId===c.id).map(r=>r.id),
  rationale:c.confidenceRationale.summary,
  domains:Object.fromEntries(['risk_of_bias','inconsistency','indirectness','imprecision','publication_bias'].map(d=>[d,{status:'not_assessed',rationale:'Outcome-level оцінка ще не завершена; це не означає відсутність проблем.'}])),
  createdAt:'2026-10-10',origin:'provisional_seed'
 }));
 const reviews=assessments.map(a=>({id:a.id.replace('ASM-','REV-'),claimId:a.claimId,assessmentId:a.id,status:'pending',approverId:null,approvedAt:null,reason:null,
  history:[{at:'2026-10-10',event:'seed_import',actorRole:'technical_migration',note:'Попередню оцінку перенесено без зміни висновку. Наукове схвалення не виконане.'}]}));
 return {assessments,reviews};
}

const reviewSeed=seedReviewRecords(creatineClaims,creatineEvidenceRecords); export const evidenceBase=createEvidenceBase({claims:creatineClaims,sources:creatineSources,records:creatineEvidenceRecords,...reviewSeed,presentation:{labels:presentation.labels,confidenceNote:presentation.notes.confidence}});
export const legacySources = [
  {
    "url": "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/",
    "title": "Джерело базових пояснень ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/39519498/",
    "title": "PUBMED · PMID 39519498 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/?term=creatine+supplementation+systematic+review+resistance+training",
    "title": "↗ Систематичні огляди: креатин і силові тренування",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/?term=creatine+supplementation+safety+systematic+review",
    "title": "↗ Огляди безпеки креатину",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/?term=creatine+cognition+meta-analysis",
    "title": "↗ Креатин і когнітивні функції",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/39074168/",
    "title": "Першоджерело · PMID 39074168 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/41199218/",
    "title": "PUBMED · PMID 41199218 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/42507286/",
    "title": "Огляд 2026 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/40944139/",
    "title": "Контрольне джерело · PMID 40944139 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/39070254/",
    "title": "PUBMED · PMID 39070254 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  },
  {
    "url": "https://pubmed.ncbi.nlm.nih.gov/38582412/",
    "title": "PUBMED · PMID 38582412 ↗",
    "reviewStatus": "Потребує outcome-level перевірки"
  }
];