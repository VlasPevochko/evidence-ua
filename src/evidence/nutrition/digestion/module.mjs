// «Шлях їжі»: approved educational wording, not a completed scientific confidence assessment.
// Generated from reviewed drafts (PubMed abstracts, 2026-10-18). Confidence is intentionally not assessed.
import {createEvidenceBase} from '../../core/registry.mjs';
import {nutritionBase} from '../module.mjs';

// CLM-000022 (SGLT1) is reused from the nutrition module with its own records; new records only add provenance.
const reusedClaimIds = ['CLM-000022'];
const reusedClaims = nutritionBase.claims.filter(c => reusedClaimIds.includes(c.id));
const reusedRecords = nutritionBase.records.filter(r => reusedClaimIds.includes(r.claimId));
const reusedSources = nutritionBase.sources.filter(s => reusedRecords.some(r => r.sourceId === s.id));

export const digestionAcceptance = {
  "kind": "user_wording_approval",
  "at": "2026-10-18T10:28:00+03:00",
  "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
  "confidenceAssessed": false,
  "formalScientificReview": false
};

export const digestionModule = {
  id: 'MOD-NUTRITION-002',
  title: 'Шлях їжі',
  status: 'educational',
  version: '1.0',
  scientificApproval: null,
  publicationApproved: true,
  publicationAcceptance: digestionAcceptance,
  page: 'nutrition-digestion.html',
  claimIds: ['CLM-000049', 'CLM-000050', 'CLM-000051', 'CLM-000022', 'CLM-000052'],
  model: {
    file: 'models/digestive.glb',
    attribution: 'Z-Anatomy (на основі BodyParts3D), веб-адаптація Vanatome 1.4.0, спрощено Evidence UA',
    license: 'CC BY-SA 4.0',
    missing: ['ротова порожнина', 'глотка', 'сліпа кишка', 'пряма кишка'],
    note: 'Порожня й клубова кишка в моделі — один об’єкт.'
  }
};

const newClaims = [
  {
    "id": "CLM-000049",
    "statement": "Перистальтика стравоходу здатна доставити ковток у шлунок без допомоги сили тяжіння; коли людина сидить чи стоїть, гравітація прискорює проходження, особливо твердої їжі.",
    "shortStatement": "Їжу стравоходом рухає перистальтика; гравітація лише допомагає.",
    "claimType": "physiology",
    "evidenceLayer": "mechanistic",
    "domain": "nutrition",
    "topics": [
      "digestion",
      "food-path"
    ],
    "population": {
      "description": "Здорові дорослі.",
      "notes": "Здорові дорослі. Не стосується людей з порушеннями моторики стравоходу."
    },
    "evidenceConfidence": null,
    "confidenceFramework": "not_assessed",
    "confidenceRationale": {
      "summary": "Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
    },
    "evidenceSummary": "Рідина повністю проходить стравохід за один ковток і лежачи, тобто перистальтика працює без гравітації. Водночас у вертикальному положенні болюс рухається швидше, а шматок хліба лежачи часто не проходить навіть після кількох ковтків. У тривалій невагомості ковтання не порушувалося.",
    "limitations": [
      "Дослідження малі (8–10 осіб).",
      "Положення вниз головою вивчали для глотки, а не всього стравоходу.",
      "Дані Skylab — спостереження без кількісних вимірювань.",
      "Витяг з анотацій, без повних текстів."
    ],
    "entityIds": [],
    "status": "educational",
    "version": "1.0",
    "lastReviewed": null,
    "nextReview": null,
    "scientificApproval": null,
    "publicationApproved": true,
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    },
    "outcome": {
      "name": "Проходження болюсу стравоходом і глоткою"
    }
  },
  {
    "id": "CLM-000050",
    "statement": "Склад і енергетична цінність їжі змінюють швидкість спорожнення шлунка в людини: рідина виходить швидше за тверду їжу, а більше енергії чи жиру в прийомі їжі сповільнює спорожнення.",
    "shortStatement": "Склад їжі змінює швидкість спорожнення шлунка.",
    "claimType": "physiology",
    "evidenceLayer": "human_outcome",
    "domain": "nutrition",
    "topics": [
      "digestion",
      "food-path"
    ],
    "population": {
      "description": "Здорові дорослі.",
      "notes": "Здорові дорослі. Не переносити на гастропарез, діабет чи вагітність без окремих даних."
    },
    "evidenceConfidence": null,
    "confidenceFramework": "not_assessed",
    "confidenceRationale": {
      "summary": "Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
    },
    "evidenceSummary": "Шлунок дозує надходження енергії в кишку. У дослідженнях на людях більші енергетичні навантаження й жирніший сніданок сповільнювали спорожнення, рідина виходила приблизно вдвічі швидше за тверду їжу, а напої з однаковою калорійністю, але різним складом, спорожнювалися з різною швидкістю.",
    "limitations": [
      "Усі дослідження малі (8–21 особа), різні методи вимірювання.",
      "Ефект жиру в одному дослідженні невеликий (102 проти 96 хв).",
      "При однаковій загальній енергії щільність їжі не змінила швидкість.",
      "Пошук не систематичний; витяг з анотацій."
    ],
    "entityIds": [],
    "status": "educational",
    "version": "1.0",
    "lastReviewed": null,
    "nextReview": null,
    "scientificApproval": null,
    "publicationApproved": true,
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    },
    "outcome": {
      "name": "Швидкість спорожнення шлунка (сцинтиграфія, дихальні тести, аспірація, УЗД)"
    },
    "intervention": {
      "name": "їжа з різним складом, об'ємом і енергетичною цінністю"
    },
    "comparator": {
      "description": "інша їжа (контрольний склад)"
    }
  },
  {
    "id": "CLM-000051",
    "statement": "Жовч не містить травних ферментів і сама жири не розщеплює: тригліцериди розщеплює панкреатична ліпаза разом із коліпазою, а солі жовчних кислот допомагають емульгувати жир і переносять продукти розщеплення в міцелах.",
    "shortStatement": "Жовч не розщеплює жири сама — це робить ліпаза.",
    "claimType": "physiology",
    "evidenceLayer": "mechanistic",
    "domain": "nutrition",
    "topics": [
      "digestion",
      "food-path"
    ],
    "population": {
      "description": "Людина (тонка кишка).",
      "notes": "Загальна фізіологія травлення. Не стосується кількісних висновків про засвоєння жиру при захворюваннях печінки чи жовчних шляхів."
    },
    "evidenceConfidence": null,
    "confidenceFramework": "not_assessed",
    "confidenceRationale": {
      "summary": "Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
    },
    "evidenceSummary": "Жир розщеплює ферментна пара ліпаза–коліпаза підшлункової залози. Солі жовчних кислот у міцелярних концентраціях навіть гальмують саму ліпазу, і коліпаза потрібна, щоб цю дію зняти. Головна роль жовчі — фізична: допомогти тримати жир дрібними краплями й перенести продукти розщеплення в міцелах до клітин кишки.",
    "limitations": [
      "Знайдені дані переважно in vitro та огляди; дослідження людського вмісту кишки — без доступної анотації.",
      "Частина досліджень на тваринах.",
      "Витяг з анотацій."
    ],
    "entityIds": [],
    "status": "educational",
    "version": "1.0",
    "lastReviewed": null,
    "nextReview": null,
    "scientificApproval": null,
    "publicationApproved": true,
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    },
    "outcome": {
      "name": "Розщеплення й солюбілізація жирів"
    }
  },
  {
    "id": "CLM-000052",
    "statement": "Бактерії товстої кишки людини ферментують неперетравлені вуглеводи — клітковину й резистентний крохмаль — до коротколанцюгових жирних кислот, головно ацетату, пропіонату й бутирату.",
    "shortStatement": "Мікробіота ферментує клітковину до коротколанцюгових жирних кислот.",
    "claimType": "physiology",
    "evidenceLayer": "mechanistic",
    "domain": "nutrition",
    "topics": [
      "digestion",
      "food-path"
    ],
    "population": {
      "description": "Люди (товста кишка).",
      "notes": "Здорові люди. Не стосується кількісних висновків щодо конкретної клітковини чи пробіотиків."
    },
    "evidenceConfidence": null,
    "confidenceFramework": "not_assessed",
    "confidenceRationale": {
      "summary": "Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
    },
    "evidenceSummary": "У вмісті товстої кишки людей КЖК у кілька разів більше, ніж у клубовій, і найбільше в сліпій та висхідній кишці. Їхній склад змінюється по дорозі в кров: бутират поглинає слизова, пропіонат — печінка. Огляди описують, які бактерії й метаболічні шляхи утворюють ці кислоти з клітковини й резистентного крохмалю.",
    "limitations": [
      "Пряме вимірювання ферментації в людини складне: дані автопсії, кал, ізольовані клітини.",
      "Частина знань — з тварин.",
      "Витяг з анотацій."
    ],
    "entityIds": [],
    "status": "educational",
    "version": "1.0",
    "lastReviewed": null,
    "nextReview": null,
    "scientificApproval": null,
    "publicationApproved": true,
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    },
    "outcome": {
      "name": "Концентрація КЖК у вмісті кишки й крові"
    }
  }
];
const newSources = [
  {
    "id": "SRC-000029",
    "title": "Expression cloning and cDNA sequencing of the Na+/glucose co-transporter.",
    "authors": [
      "Hediger MA",
      "Coady MJ",
      "Ikeda TS",
      "Wright EM"
    ],
    "year": 1987,
    "publicationType": "original_research",
    "journal": "Nature",
    "doi": "10.1038/330379a0",
    "pmid": "2446136",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/2446136/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Hediger MA et al. · 1987",
    "identifiers": {
      "doi": "10.1038/330379a0",
      "pmid": "2446136",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/2446136/",
    "sourceStatus": "not_checked",
    "populationSummary": "тканина кишки кролика; ооцити Xenopus",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000030",
    "title": "Glucose/galactose malabsorption caused by a defect in the Na+/glucose cotransporter.",
    "authors": [
      "Turk E",
      "Zabel B",
      "Mundlos S",
      "Dyer J",
      "Wright EM"
    ],
    "year": 1991,
    "publicationType": "original_research",
    "journal": "Nature",
    "doi": "10.1038/350354a0",
    "pmid": "2008213",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/2008213/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Turk E et al. · 1991",
    "identifiers": {
      "doi": "10.1038/350354a0",
      "pmid": "2008213",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/2008213/",
    "sourceStatus": "not_checked",
    "populationSummary": "одна родина з GGM; ооцити Xenopus",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000031",
    "title": "Molecular basis for glucose-galactose malabsorption.",
    "authors": [
      "Wright EM",
      "Turk E",
      "Martin MG"
    ],
    "year": 2002,
    "publicationType": "narrative_review",
    "journal": "Cell Biochem Biophys",
    "doi": "10.1385/CBB:36:2-3:115",
    "pmid": "12139397",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/12139397/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Wright EM et al. · 2002",
    "identifiers": {
      "doi": "10.1385/CBB:36:2-3:115",
      "pmid": "12139397",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/12139397/",
    "sourceStatus": "not_checked",
    "populationSummary": "46 пацієнтів з GGM",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000032",
    "title": "Na(+)-D-glucose cotransporter SGLT1 is pivotal for intestinal glucose absorption and glucose-dependent incretin secretion.",
    "authors": [
      "Gorboulev V",
      "Schürmann A",
      "Vallon V",
      "Koepsell H"
    ],
    "year": 2012,
    "publicationType": "original_research",
    "journal": "Diabetes",
    "doi": "10.2337/db11-1029",
    "pmid": "22124465",
    "pmcid": "PMC3237647",
    "url": "https://pubmed.ncbi.nlm.nih.gov/22124465/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Gorboulev V et al. · 2012",
    "identifiers": {
      "doi": "10.2337/db11-1029",
      "pmid": "22124465",
      "pmcid": "PMC3237647"
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/22124465/",
    "sourceStatus": "not_checked",
    "populationSummary": "миші C57BL/6, Sglt1-/- vs wild type",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000033",
    "title": "The role of SGLT1 and GLUT2 in intestinal glucose transport and sensing.",
    "authors": [
      "Röder PV",
      "Geillinger KE",
      "Zietek TS",
      "Thorens B",
      "Koepsell H",
      "Daniel H"
    ],
    "year": 2014,
    "publicationType": "original_research",
    "journal": "PLoS One",
    "doi": "10.1371/journal.pone.0089977",
    "pmid": "24587162",
    "pmcid": "PMC3935955",
    "url": "https://pubmed.ncbi.nlm.nih.gov/24587162/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Röder PV et al. · 2014",
    "identifiers": {
      "doi": "10.1371/journal.pone.0089977",
      "pmid": "24587162",
      "pmcid": "PMC3935955"
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/24587162/",
    "sourceStatus": "not_checked",
    "populationSummary": "миші Sglt1-/-, Glut2-/- vs wild type",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000034",
    "title": "Apical GLUT2: a major pathway of intestinal sugar absorption.",
    "authors": [
      "Kellett GL",
      "Brot-Laroche E"
    ],
    "year": 2005,
    "publicationType": "narrative_review",
    "journal": "Diabetes",
    "doi": "10.2337/diabetes.54.10.3056",
    "pmid": "16186415",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/16186415/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Kellett GL et al. · 2005",
    "identifiers": {
      "doi": "10.2337/diabetes.54.10.3056",
      "pmid": "16186415",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/16186415/",
    "sourceStatus": "not_checked",
    "populationSummary": "переважно щури; огляд",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000035",
    "title": "Biology of human sodium glucose transporters.",
    "authors": [
      "Wright EM",
      "Loo DD",
      "Hirayama BA"
    ],
    "year": 2011,
    "publicationType": "narrative_review",
    "journal": "Physiol Rev",
    "doi": "10.1152/physrev.00055.2009",
    "pmid": "21527736",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/21527736/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Wright EM et al. · 2011",
    "identifiers": {
      "doi": "10.1152/physrev.00055.2009",
      "pmid": "21527736",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/21527736/",
    "sourceStatus": "not_checked",
    "populationSummary": "огляд, людина й моделі",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000036",
    "title": "Dynamics of esophageal bolus transport in healthy subjects studied using multiple intraluminal impedancometry.",
    "authors": [
      "Nguyen HN"
    ],
    "year": 1997,
    "publicationType": "original_research",
    "journal": "Am J Physiol",
    "doi": "10.1152/ajpgi.1997.273.4.G958",
    "pmid": "9357841",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/9357841/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Nguyen HN et al. · 1997",
    "identifiers": {
      "doi": "10.1152/ajpgi.1997.273.4.G958",
      "pmid": "9357841",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/9357841/",
    "sourceStatus": "not_checked",
    "populationSummary": "10 здорових",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000037",
    "title": "Esophageal solid bolus transit: studies using concurrent videofluoroscopy and manometry.",
    "authors": [
      "Pouderoux P",
      "Shi G",
      "Tatum RP",
      "Kahrilas PJ"
    ],
    "year": 1999,
    "publicationType": "original_research",
    "journal": "Am J Gastroenterol",
    "doi": "10.1111/j.1572-0241.1999.01126.x",
    "pmid": "10364007",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/10364007/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Pouderoux P et al. · 1999",
    "identifiers": {
      "doi": "10.1111/j.1572-0241.1999.01126.x",
      "pmid": "10364007",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/10364007/",
    "sourceStatus": "not_checked",
    "populationSummary": "8 здорових",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000038",
    "title": "Influence of gravity and body position on normal oropharyngeal swallowing.",
    "authors": [
      "Johnsson F",
      "Cook I"
    ],
    "year": 1995,
    "publicationType": "original_research",
    "journal": "Am J Physiol",
    "doi": "10.1152/ajpgi.1995.269.5.G653",
    "pmid": "7491955",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/7491955/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Johnsson F et al. · 1995",
    "identifiers": {
      "doi": "10.1152/ajpgi.1995.269.5.G653",
      "pmid": "7491955",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/7491955/",
    "sourceStatus": "not_checked",
    "populationSummary": "8 здорових чоловіків",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000039",
    "title": "Skylab nutritional studies.",
    "authors": [
      "Smith MC",
      "Rambaut PC",
      "Stadler CR"
    ],
    "year": 1977,
    "publicationType": "original_research",
    "journal": "Life Sci Space Res",
    "doi": null,
    "pmid": "11958215",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/11958215/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Smith MC et al. · 1977",
    "identifiers": {
      "doi": null,
      "pmid": "11958215",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/11958215/",
    "sourceStatus": "not_checked",
    "populationSummary": "екіпажі Skylab",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000040",
    "title": "The four phases of esophageal bolus transit defined by high-resolution impedance manometry and fluoroscopy.",
    "authors": [
      "Lin Z",
      "Pandolfino JE"
    ],
    "year": 2014,
    "publicationType": "original_research",
    "journal": "Am J Physiol Gastrointest Liver Physiol",
    "doi": "10.1152/ajpgi.00148.2014",
    "pmid": "24970774",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/24970774/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Lin Z et al. · 2014",
    "identifiers": {
      "doi": "10.1152/ajpgi.00148.2014",
      "pmid": "24970774",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/24970774/",
    "sourceStatus": "not_checked",
    "populationSummary": "10 здорових",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000041",
    "title": "Effect of meal volume and energy density on the gastric emptying of carbohydrates.",
    "authors": [
      "Hunt JN",
      "Smith JL",
      "Jiang CL"
    ],
    "year": 1985,
    "publicationType": "original_research",
    "journal": "Gastroenterology",
    "doi": "10.1016/0016-5085(85)90650-x",
    "pmid": "4054524",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/4054524/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Hunt JN et al. · 1985",
    "identifiers": {
      "doi": "10.1016/0016-5085(85)90650-x",
      "pmid": "4054524",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/4054524/",
    "sourceStatus": "not_checked",
    "populationSummary": "21 чоловік, 1134 тестові прийоми",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000042",
    "title": "Effect of the energy density of a solid-liquid meal on gastric emptying and satiety.",
    "authors": [
      "Carbonnel F",
      "Jian R"
    ],
    "year": 1994,
    "publicationType": "original_research",
    "journal": "Am J Clin Nutr",
    "doi": "10.1093/ajcn/60.3.307",
    "pmid": "8074058",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/8074058/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Carbonnel F et al. · 1994",
    "identifiers": {
      "doi": "10.1093/ajcn/60.3.307",
      "pmid": "8074058",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/8074058/",
    "sourceStatus": "not_checked",
    "populationSummary": "9 добровольців",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000043",
    "title": "Energy and macronutrient composition of breakfast affect gastric emptying of lunch and subsequent food intake, satiety and satiation.",
    "authors": [
      "Clegg M",
      "Shafat A"
    ],
    "year": 2010,
    "publicationType": "original_research",
    "journal": "Appetite",
    "doi": "10.1016/j.appet.2010.02.005",
    "pmid": "20167238",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/20167238/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Clegg M et al. · 2010",
    "identifiers": {
      "doi": "10.1016/j.appet.2010.02.005",
      "pmid": "20167238",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/20167238/",
    "sourceStatus": "not_checked",
    "populationSummary": "9 чоловіків",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000044",
    "title": "Gastric emptying and release of incretin hormones after glucose ingestion in humans.",
    "authors": [
      "Schirra J",
      "Göke B"
    ],
    "year": 1996,
    "publicationType": "original_research",
    "journal": "J Clin Invest",
    "doi": "10.1172/JCI118411",
    "pmid": "8550855",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/8550855/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Schirra J et al. · 1996",
    "identifiers": {
      "doi": "10.1172/JCI118411",
      "pmid": "8550855",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/8550855/",
    "sourceStatus": "not_checked",
    "populationSummary": "8 здорових чоловіків",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000045",
    "title": "Assessment of gastric emptying of maltodextrin, coffee with milk and orange juice during labour at term using point of care ultrasound: a non-inferiority randomised clinical trial.",
    "authors": [
      "Nascimento AC"
    ],
    "year": 2019,
    "publicationType": "original_research",
    "journal": "Anaesthesia",
    "doi": "10.1111/anae.14671",
    "pmid": "30973182",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/30973182/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Nascimento AC et al. · 2019",
    "identifiers": {
      "doi": "10.1111/anae.14671",
      "pmid": "30973182",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/30973182/",
    "sourceStatus": "not_checked",
    "populationSummary": "54 жінки під час пологів",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000046",
    "title": "Studies on the effect of bile salt and colipase on enzymatic lipolysis. Improved method for the determination of pancreatic lipase and colipase.",
    "authors": [
      "Rathelot J",
      "Sarda L"
    ],
    "year": 1975,
    "publicationType": "original_research",
    "journal": "Biochimie",
    "doi": "10.1016/s0300-9084(76)80572-x",
    "pmid": "1222120",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/1222120/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Rathelot J et al. · 1975",
    "identifiers": {
      "doi": "10.1016/s0300-9084(76)80572-x",
      "pmid": "1222120",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/1222120/",
    "sourceStatus": "not_checked",
    "populationSummary": "ферменти тварин in vitro",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000047",
    "title": "Inhibition of human pancreatic lipase-colipase activity by mixed bile salt-phospholipid micelles.",
    "authors": [
      "Patton JS",
      "Carey MC"
    ],
    "year": 1981,
    "publicationType": "original_research",
    "journal": "Am J Physiol",
    "doi": "10.1152/ajpgi.1981.241.4.G328",
    "pmid": "7315970",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/7315970/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Patton JS et al. · 1981",
    "identifiers": {
      "doi": "10.1152/ajpgi.1981.241.4.G328",
      "pmid": "7315970",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/7315970/",
    "sourceStatus": "not_checked",
    "populationSummary": "людські ферменти in vitro",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000048",
    "title": "Bile acids: chemistry, pathochemistry, biology, pathobiology, and therapeutics.",
    "authors": [
      "Hofmann AF",
      "Hagey LR"
    ],
    "year": 2008,
    "publicationType": "narrative_review",
    "journal": "Cell Mol Life Sci",
    "doi": "10.1007/s00018-008-7568-6",
    "pmid": "18488143",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/18488143/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Hofmann AF et al. · 2008",
    "identifiers": {
      "doi": "10.1007/s00018-008-7568-6",
      "pmid": "18488143",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/18488143/",
    "sourceStatus": "not_checked",
    "populationSummary": "огляд",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000049",
    "title": "The role of gastric lipolysis on fat absorption and bile acid metabolism in the rat.",
    "authors": [
      "Roy CC"
    ],
    "year": 1979,
    "publicationType": "original_research",
    "journal": "Lipids",
    "doi": "10.1007/BF02533520",
    "pmid": "491866",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/491866/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Roy CC et al. · 1979",
    "identifiers": {
      "doi": "10.1007/BF02533520",
      "pmid": "491866",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/491866/",
    "sourceStatus": "not_checked",
    "populationSummary": "щури",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000050",
    "title": "Short chain fatty acids in human large intestine, portal, hepatic and venous blood.",
    "authors": [
      "Cummings JH",
      "Macfarlane GT"
    ],
    "year": 1987,
    "publicationType": "original_research",
    "journal": "Gut",
    "doi": "10.1136/gut.28.10.1221",
    "pmid": "3678950",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/3678950/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Cummings JH et al. · 1987",
    "identifiers": {
      "doi": "10.1136/gut.28.10.1221",
      "pmid": "3678950",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/3678950/",
    "sourceStatus": "not_checked",
    "populationSummary": "раптово померлі, автопсія ≤4 год",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000051",
    "title": "Short-chain fatty acids and human colonic function: roles of resistant starch and nonstarch polysaccharides.",
    "authors": [
      "Topping DL",
      "Clifton PM"
    ],
    "year": 2001,
    "publicationType": "narrative_review",
    "journal": "Physiol Rev",
    "doi": "10.1152/physrev.2001.81.3.1031",
    "pmid": "11427691",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/11427691/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Topping DL et al. · 2001",
    "identifiers": {
      "doi": "10.1152/physrev.2001.81.3.1031",
      "pmid": "11427691",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/11427691/",
    "sourceStatus": "not_checked",
    "populationSummary": "огляд",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000052",
    "title": "Formation of propionate and butyrate by the human colonic microbiota.",
    "authors": [
      "Louis P",
      "Flint HJ"
    ],
    "year": 2016,
    "publicationType": "narrative_review",
    "journal": "Environ Microbiol",
    "doi": "10.1111/1462-2920.13589",
    "pmid": "27928878",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/27928878/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Louis P et al. · 2016",
    "identifiers": {
      "doi": "10.1111/1462-2920.13589",
      "pmid": "27928878",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/27928878/",
    "sourceStatus": "not_checked",
    "populationSummary": "огляд",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000053",
    "title": "Role of anaerobic bacteria in the metabolic welfare of the colonic mucosa in man.",
    "authors": [
      "Roediger WE"
    ],
    "year": 1980,
    "publicationType": "original_research",
    "journal": "Gut",
    "doi": "10.1136/gut.21.9.793",
    "pmid": "7429343",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/7429343/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Roediger WE · 1980",
    "identifiers": {
      "doi": "10.1136/gut.21.9.793",
      "pmid": "7429343",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/7429343/",
    "sourceStatus": "not_checked",
    "populationSummary": "клітини з 14 операційних зразків",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  },
  {
    "id": "SRC-000054",
    "title": "Colonic health: fermentation and short chain fatty acids.",
    "authors": [
      "Wong JM",
      "Jenkins DJ"
    ],
    "year": 2006,
    "publicationType": "narrative_review",
    "journal": "J Clin Gastroenterol",
    "doi": "10.1097/00004836-200603000-00015",
    "pmid": "16633129",
    "pmcid": null,
    "url": "https://pubmed.ncbi.nlm.nih.gov/16633129/",
    "accessLevel": "abstract",
    "metadataStatus": "checked",
    "lastChecked": "2026-10-18",
    "funding": null,
    "conflicts": null,
    "publicationStatus": null,
    "publicationStatusCheck": "pending",
    "shortCitation": "Wong JM et al. · 2006",
    "identifiers": {
      "doi": "10.1097/00004836-200603000-00015",
      "pmid": "16633129",
      "pmcid": null
    },
    "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/16633129/",
    "sourceStatus": "not_checked",
    "populationSummary": "огляд",
    "methodsSummary": "Прочитано анотацію в PubMed; повний текст не перевірено.",
    "keyLimitations": [
      "Витяг зроблено з анотації; ризик упередженості й деталі методів не оцінено."
    ]
  }
];
const newRecords = [
  {
    "id": "EVR-000073",
    "sourceId": "SRC-000029",
    "claimId": "CLM-000022",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Na+-залежний транспорт глюкози клонованим білком"
    },
    "result": {
      "summary": "Клонований з кишки кролика транспортер переносить глюкозу Na+-залежно при експресії в ооцитах."
    },
    "interpretation": "Клонований з кишки кролика транспортер переносить глюкозу Na+-залежно при експресії в ооцитах.",
    "direction": "supports_claim",
    "relevance": "indirect",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "тканина кишки кролика; ооцити Xenopus"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000074",
    "sourceId": "SRC-000030",
    "claimId": "CLM-000022",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Селективна мальабсорбція глюкози й галактози"
    },
    "result": {
      "summary": "Місенс-мутація SGLT1 косегрегує з GGM у родині й повністю знімає Na+-залежний транспорт глюкози в ооцитах; у біоптатах пацієнтів — дефект Na+-залежного всмоктування в щітковій облямівці."
    },
    "interpretation": "Місенс-мутація SGLT1 косегрегує з GGM у родині й повністю знімає Na+-залежний транспорт глюкози в ооцитах; у біоптатах пацієнтів — дефект Na+-залежного всмоктування в щітковій облямівці.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "одна родина з GGM; ооцити Xenopus"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000075",
    "sourceId": "SRC-000031",
    "claimId": "CLM-000022",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Генотип–фенотип GGM"
    },
    "result": {
      "summary": "У 46 пацієнтів знайдено мутації SGLT1; діарея зникає після вилучення глюкози, галактози й лактози з раціону і повертається при їх поверненні."
    },
    "interpretation": "У 46 пацієнтів знайдено мутації SGLT1; діарея зникає після вилучення глюкози, галактози й лактози з раціону і повертається при їх поверненні.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "46 пацієнтів з GGM"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000076",
    "sourceId": "SRC-000032",
    "claimId": "CLM-000022",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Всмоктування глюкози після гаважу"
    },
    "result": {
      "summary": "Sglt1-/- миші розвивають синдром мальабсорбції глюкози-галактози; у wild type вхід глюкози через щіткову облямівку переважно через SGLT1 незалежно від навантаження."
    },
    "interpretation": "Sglt1-/- миші розвивають синдром мальабсорбції глюкози-галактози; у wild type вхід глюкози через щіткову облямівку переважно через SGLT1 незалежно від навантаження.",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "миші C57BL/6, Sglt1-/- vs wild type"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000077",
    "sourceId": "SRC-000033",
    "claimId": "CLM-000022",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Затримка міченої глюкози в тканині кишки; апікальний GLUT2"
    },
    "result": {
      "summary": "Без SGLT1 затримка міченої глюкози різко падає по всій тонкій кишці; ознак ролі GLUT2 в апікальному вході не знайдено."
    },
    "interpretation": "Без SGLT1 затримка міченої глюкози різко падає по всій тонкій кишці; ознак ролі GLUT2 в апікальному вході не знайдено.",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "миші Sglt1-/-, Glut2-/- vs wild type"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000078",
    "sourceId": "SRC-000034",
    "claimId": "CLM-000022",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Внесок апікального GLUT2 при високій концентрації глюкози"
    },
    "result": {
      "summary": "Огляд пропонує модель, у якій апікальний GLUT2 при високій концентрації глюкози дає до трьох разів більше всмоктування, ніж SGLT1; дані переважно на щурах."
    },
    "interpretation": "Огляд пропонує модель, у якій апікальний GLUT2 при високій концентрації глюкози дає до трьох разів більше всмоктування, ніж SGLT1; дані переважно на щурах.",
    "direction": "conflicts_with_claim",
    "relevance": "partially_direct",
    "roleForClaim": "conflicting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "переважно щури; огляд"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000079",
    "sourceId": "SRC-000035",
    "claimId": "CLM-000022",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Механізм Na+/глюкоза котранспорту"
    },
    "result": {
      "summary": "Огляд узагальнює генетику, структуру й фізіологію SGLT1; енергію для транспорту дає натрієвий градієнт."
    },
    "interpretation": "Огляд узагальнює генетику, структуру й фізіологію SGLT1; енергію для транспорту дає натрієвий градієнт.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "огляд, людина й моделі"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000080",
    "sourceId": "SRC-000036",
    "claimId": "CLM-000049",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Швидкість проходження болюсу"
    },
    "result": {
      "summary": "Болюс рухається стравоходом і лежачи, і сидячи; у вертикальному положенні транспорт значно швидший, а в'язкий болюс рухається повільніше."
    },
    "interpretation": "Болюс рухається стравоходом і лежачи, і сидячи; у вертикальному положенні транспорт значно швидший, а в'язкий болюс рухається повільніше.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "10 здорових"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000081",
    "sourceId": "SRC-000037",
    "claimId": "CLM-000049",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Кліренс рідини й хліба"
    },
    "result": {
      "summary": "Рідкий барій очищується за перший ковток і лежачи, і стоячи. Нежований хліб після чотирьох ковтків пройшов у 100% спроб стоячи і лише в 52,9% лежачи."
    },
    "interpretation": "Рідкий барій очищується за перший ковток і лежачи, і стоячи. Нежований хліб після чотирьох ковтків пройшов у 100% спроб стоячи і лише в 52,9% лежачи.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "8 здорових"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000082",
    "sourceId": "SRC-000038",
    "claimId": "CLM-000049",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Транспорт болюсу глоткою"
    },
    "result": {
      "summary": "Вертикально, горизонтально й під кутом 30° вниз головою час проходження глоткою та перистальтика не змінювалися; автори роблять висновок, що гравітація не впливає на транспорт болюсу глоткою."
    },
    "interpretation": "Вертикально, горизонтально й під кутом 30° вниз головою час проходження глоткою та перистальтика не змінювалися; автори роблять висновок, що гравітація не впливає на транспорт болюсу глоткою.",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "8 здорових чоловіків"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000083",
    "sourceId": "SRC-000039",
    "claimId": "CLM-000049",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Здатність ковтати"
    },
    "result": {
      "summary": "Здатність ковтати й перетравлювати їжу не порушувалася під час тривалої невагомості."
    },
    "interpretation": "Здатність ковтати й перетравлювати їжу не порушувалася під час тривалої невагомості.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "екіпажі Skylab"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000084",
    "sourceId": "SRC-000040",
    "claimId": "CLM-000049",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Механізм просування болюсу"
    },
    "result": {
      "summary": "Описано фази транзиту: пасивне наповнення, а далі просування перистальтичним скороченням і спорожнення під тиском у дистальному відділі; дані зібрано і лежачи, і сидячи."
    },
    "interpretation": "Описано фази транзиту: пасивне наповнення, а далі просування перистальтичним скороченням і спорожнення під тиском у дистальному відділі; дані зібрано і лежачи, і сидячи.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "mechanistic_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "10 здорових"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000085",
    "sourceId": "SRC-000041",
    "claimId": "CLM-000050",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Швидкість доставки енергії в дванадцятипалу"
    },
    "result": {
      "summary": "Збільшення об'єму чи енергетичної щільності підвищувало швидкість доставки енергії в дванадцятипалу (p<0,001); середня швидкість — близько 2,5 ккал/хв."
    },
    "interpretation": "Збільшення об'єму чи енергетичної щільності підвищувало швидкість доставки енергії в дванадцятипалу (p<0,001); середня швидкість — близько 2,5 ккал/хв.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "21 чоловік, 1134 тестові прийоми"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000086",
    "sourceId": "SRC-000042",
    "claimId": "CLM-000050",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Час напівспорожнення твердої й рідкої частини"
    },
    "result": {
      "summary": "При однаковій енергії розведена й концентрована їжа спорожнювалися однаково; тверда частина — за 145–156 хв, рідка — за 76–84 хв."
    },
    "interpretation": "При однаковій енергії розведена й концентрована їжа спорожнювалися однаково; тверда частина — за 145–156 хв, рідка — за 76–84 хв.",
    "direction": "mixed",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "9 добровольців"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000087",
    "sourceId": "SRC-000043",
    "claimId": "CLM-000050",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Час напівспорожнення (дихальний тест)"
    },
    "result": {
      "summary": "Після жирного сніданку спорожнення сповільнилося порівняно з нежирним тієї ж енергії (102 ± 11 проти 96 ± 13 хв)."
    },
    "interpretation": "Після жирного сніданку спорожнення сповільнилося порівняно з нежирним тієї ж енергії (102 ± 11 проти 96 ± 13 хв).",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "9 чоловіків"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000088",
    "sourceId": "SRC-000044",
    "claimId": "CLM-000050",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Швидкість спорожнення"
    },
    "result": {
      "summary": "Подвоєння навантаження глюкозою знизило швидкість спорожнення на 27,5% (p<0,05)."
    },
    "interpretation": "Подвоєння навантаження глюкозою знизило швидкість спорожнення на 27,5% (p<0,05).",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "8 здорових чоловіків"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000089",
    "sourceId": "SRC-000045",
    "claimId": "CLM-000050",
    "evidenceLayer": "human_outcome",
    "outcome": {
      "name": "Площа антрума (УЗД)"
    },
    "result": {
      "summary": "Мальтодекстрин спорожнювався швидше за каву з молоком і апельсиновий сік однакової калорійності (p<0,001)."
    },
    "interpretation": "Мальтодекстрин спорожнювався швидше за каву з молоком і апельсиновий сік однакової калорійності (p<0,001).",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "54 жінки під час пологів"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000090",
    "sourceId": "SRC-000046",
    "claimId": "CLM-000051",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Активність ліпази"
    },
    "result": {
      "summary": "Ліпаза без кофактора сильно гальмується солями жовчі вище критичної концентрації міцелоутворення; додавання коліпази відновлює активність."
    },
    "interpretation": "Ліпаза без кофактора сильно гальмується солями жовчі вище критичної концентрації міцелоутворення; додавання коліпази відновлює активність.",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "ферменти тварин in vitro"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000091",
    "sourceId": "SRC-000047",
    "claimId": "CLM-000051",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Розщеплення тригліцеридів"
    },
    "result": {
      "summary": "Змішані міцели солей жовчі з фосфоліпідами гальмують гідроліз жиру людською ліпазою–коліпазою, витісняючи ферменти з поверхні крапель."
    },
    "interpretation": "Змішані міцели солей жовчі з фосфоліпідами гальмують гідроліз жиру людською ліпазою–коліпазою, витісняючи ферменти з поверхні крапель.",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "людські ферменти in vitro"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000092",
    "sourceId": "SRC-000048",
    "claimId": "CLM-000051",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Роль солей жовчі в засвоєнні ліпідів"
    },
    "result": {
      "summary": "Солі жовчних кислот сприяють всмоктуванню ліпідів і циркулюють між печінкою й кишкою."
    },
    "interpretation": "Солі жовчних кислот сприяють всмоктуванню ліпідів і циркулюють між печінкою й кишкою.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "огляд"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000093",
    "sourceId": "SRC-000049",
    "claimId": "CLM-000051",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Засвоєння жиру"
    },
    "result": {
      "summary": "Продукти шлункового ліполізу полегшують емульгування жиру й доступ панкреатичної ліпази, тобто емульгує не лише жовч."
    },
    "interpretation": "Продукти шлункового ліполізу полегшують емульгування жиру й доступ панкреатичної ліпази, тобто емульгує не лише жовч.",
    "direction": "supports_claim",
    "relevance": "indirect",
    "roleForClaim": "context_only",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "щури"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000094",
    "sourceId": "SRC-000050",
    "claimId": "CLM-000052",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Концентрація КЖК"
    },
    "result": {
      "summary": "КЖК у клубовій кишці 13 ммоль/кг, у сліпій 131 ммоль/кг; у крові ворітної вени 375, печінкової 148, периферичної 79 мкмоль/л. Автори роблять висновок про значну ферментацію вуглеводів у товстій кишці."
    },
    "interpretation": "КЖК у клубовій кишці 13 ммоль/кг, у сліпій 131 ммоль/кг; у крові ворітної вени 375, печінкової 148, периферичної 79 мкмоль/л. Автори роблять висновок про значну ферментацію вуглеводів у товстій кишці.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "primary_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "раптово померлі, автопсія ≤4 год"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000095",
    "sourceId": "SRC-000051",
    "claimId": "CLM-000052",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Ферментація до КЖК"
    },
    "result": {
      "summary": "Бактерії товстої кишки ферментують резистентний крохмаль і некрохмальні полісахариди до КЖК, головно ацетату, пропіонату й бутирату."
    },
    "interpretation": "Бактерії товстої кишки ферментують резистентний крохмаль і некрохмальні полісахариди до КЖК, головно ацетату, пропіонату й бутирату.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "огляд"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000096",
    "sourceId": "SRC-000052",
    "claimId": "CLM-000052",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Метаболічні шляхи бактерій"
    },
    "result": {
      "summary": "Описано шляхи, якими мікробіота утворює пропіонат і бутират з вуглеводів і амінокислот, зокрема перехресне живлення між бактеріями."
    },
    "interpretation": "Описано шляхи, якими мікробіота утворює пропіонат і бутират з вуглеводів і амінокислот, зокрема перехресне живлення між бактеріями.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "mechanistic_support",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "огляд"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000097",
    "sourceId": "SRC-000053",
    "claimId": "CLM-000052",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Частка споживання кисню"
    },
    "result": {
      "summary": "Коли бутират був єдиним субстратом, на нього припадало 73–75% споживання кисню ізольованими колоноцитами людини."
    },
    "interpretation": "Коли бутират був єдиним субстратом, на нього припадало 73–75% споживання кисню ізольованими колоноцитами людини.",
    "direction": "supports_claim",
    "relevance": "partially_direct",
    "roleForClaim": "context_only",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "клітини з 14 операційних зразків"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  },
  {
    "id": "EVR-000098",
    "sourceId": "SRC-000054",
    "claimId": "CLM-000052",
    "evidenceLayer": "mechanistic",
    "outcome": {
      "name": "Ферментація до КЖК"
    },
    "result": {
      "summary": "Резистентний крохмаль і клітковина — субстрати для ферментації до ацетату, пропіонату й бутирату; швидкість залежить від мікробіоти, субстрату й часу транзиту."
    },
    "interpretation": "Резистентний крохмаль і клітковина — субстрати для ферментації до ацетату, пропіонату й бутирату; швидкість залежить від мікробіоти, субстрату й часу транзиту.",
    "direction": "supports_claim",
    "relevance": "direct",
    "roleForClaim": "supporting",
    "extractionLocator": "Анотація PubMed",
    "populationContext": {
      "description": "огляд"
    },
    "riskOfBias": {
      "status": "not_assessed"
    },
    "reviewStatus": "pending",
    "publicationApproved": true,
    "lastChecked": "2026-10-18",
    "publicationAcceptance": {
      "kind": "user_wording_approval",
      "at": "2026-10-18T10:28:00+03:00",
      "scope": "Шлях їжі: чотири нові навчальні твердження та докази для CLM-000022 (погоджено власником у робочому чаті 18.10.2026)",
      "confidenceAssessed": false,
      "formalScientificReview": false
    }
  }
];

export const digestionBase = createEvidenceBase({
  claims: [...reusedClaims, ...newClaims],
  sources: [...reusedSources, ...newSources],
  records: [...reusedRecords, ...newRecords],
  presentation: {
    labels: {...nutritionBase.presentation.labels, ...{
  "CLM-000049": "Стравохід",
  "CLM-000050": "Спорожнення шлунка",
  "CLM-000051": "Жовч і ліпаза",
  "CLM-000052": "Ферментація в товстій кишці"
}},
    confidenceNote: 'Пояснення описує механізм або фізіологію. Воно не доводить довгостроковий клінічний чи спортивний ефект.'
  }
});
