import type { Claim } from "./types";

export const creatineClaims: Claim[] = [
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
    evidenceConfidence: "high",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Кілька synthesis-level джерел показують позитивний напрям; 2024 meta-analysis оцінив +1.14 кг LBM.",
      uncertaintyNotes: [
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
    evidenceConfidence: "high",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Два сучасні метааналізи показують невелике підвищення serum creatinine без відповідного переконливого сигналу погіршення GFR.",
      uncertaintyNotes: [
        "Точна величина зміни залежить від досліджень, тривалості, дози та лабораторного методу."
      ]
    },
    evidenceSummary:
      "У meta-analysis 2026 serum creatinine зростав на 0.14 mg/dL (95% CI 0.05–0.22), тоді як Cr-EDTA GFR істотно не змінювався.",
    practicalMeaning:
      "Creatinine-based eGFR може виглядати нижчим після початку креатину через зміну метаболізму креатину/креатиніну.",
    limitations: [
      "Serum creatinine у meta-analysis 2026 мав високу heterogeneity.",
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
    evidenceConfidence: "moderate",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Систематичний огляд виявив мало прямих порівнянь із моногідратом і не встановив послідовної переваги альтернативних форм.",
      downgradeDomains: ["imprecision", "indirectness"],
      uncertaintyNotes: [
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
      "Завантаження прискорює насичення креатином, але не є обов’язковим.",
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
    evidenceConfidence: "high",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Прямі вимірювання в м’язах людини показали швидке насичення при вищій дозі та подібне поступове підвищення при нижчій щоденній дозі.",
      uncertaintyNotes: [
        "Базове дослідження давнє й має невелику чоловічу вибірку; висновок стосується безпосереднього фізіологічного вимірювання."
      ]
    },
    evidenceSummary:
      "20 г/добу протягом 6 днів підвищували загальний креатин у м’язах приблизно на 20%; 3 г/добу протягом 28 днів давали подібне, але поступове підвищення.",
    practicalMeaning:
      "Завантаження — спосіб швидше наситити запаси, а не обов’язкова умова дії креатину.",
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
    evidenceConfidence: "low",
    confidenceFramework: "evidenceua_grade_informed_v1",
    provisional: true,
    confidenceRationale: {
      summary:
        "Пряме дослідження отримало подібні результати, але вибірка надто мала для впевненого висновку про відсутність різниці.",
      downgradeDomains: ["imprecision"],
      uncertaintyNotes: [
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
) as Record<string, Claim>;
