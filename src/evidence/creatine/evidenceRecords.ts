import type { EvidenceRecord } from "./types";

export const creatineEvidenceRecords: EvidenceRecord[] = [
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

export const evidenceRecordsByClaimId = creatineEvidenceRecords.reduce<
  Record<string, EvidenceRecord[]>
>((acc, record) => {
  (acc[record.claimId] ??= []).push(record);
  return acc;
}, {});
