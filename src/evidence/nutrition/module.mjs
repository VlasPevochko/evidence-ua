// Approved educational wording, not a completed scientific confidence assessment.
import {createEvidenceBase} from '../core/registry.mjs';
import {scientificEntities} from '../core/entities.mjs';
export const nutritionModule = {
  "id": "MOD-NUTRITION-001",
  "title": "Від їжі до клітини",
  "status": "educational",
  "version": "1.0",
  "scientificApproval": null,
  "publicationApproved": true,
  "claimIds": [
    "CLM-000021",
    "CLM-000022",
    "CLM-000023",
    "CLM-000024",
    "CLM-000025",
    "CLM-000026",
    "CLM-000027",
    "CLM-000028"
  ],
  "preservePages": [
    "nutrition.html",
    "nutrition-digestion.html"
  ],
  "candidateEntities": [
    {
      "id": "MOL-PROTON",
      "type": "molecule",
      "label": "H⁺",
      "status": "draft",
      "version": "0.1",
      "claimIds": []
    },
    {
      "id": "MOL-DI-TRIPEPTIDE",
      "type": "entity_group",
      "label": "Ди- й трипептиди",
      "status": "draft",
      "version": "0.1",
      "claimIds": []
    },
    {
      "id": "MOL-MONOACYLGLYCEROL",
      "type": "entity_group",
      "label": "Моноацилгліцероли",
      "status": "draft",
      "version": "0.1",
      "claimIds": []
    },
    {
      "id": "STRUCT-MIXED-MICELLE",
      "type": "structure",
      "label": "Змішана міцела",
      "status": "draft",
      "version": "0.1",
      "claimIds": []
    },
    {
      "id": "STRUCT-CHYLOMICRON",
      "type": "structure",
      "label": "Хіломікрон",
      "status": "draft",
      "version": "0.1",
      "claimIds": []
    }
  ],
  "sections": [
    "Огляд маршруту",
    "Наявна модель травлення",
    "Ентероцит: три маршрути",
    "Чому ми так пояснюємо",
    "Джерела й межі моделі",
    "Наявна графіка харчування"
  ],
  "routes": [
    {
      "id": "glucose",
      "label": "Вуглеводи · глюкоза",
      "pathwayId": "PTH-GLUCOSE-ABSORPTION",
      "claimIds": [
        "CLM-000022",
        "CLM-000023",
        "CLM-000024"
      ],
      "steps": [
        {
          "id": "lumen",
          "label": "Глюкоза в просвіті",
          "claimIds": []
        },
        {
          "id": "sglt1",
          "label": "Вхід через SGLT1",
          "claimIds": [
            "CLM-000022",
            "CLM-000024"
          ]
        },
        {
          "id": "glut2",
          "label": "Вихід через GLUT2",
          "claimIds": [
            "CLM-000023"
          ]
        },
        {
          "id": "blood",
          "label": "Кров · ворітний маршрут",
          "claimIds": [],
          "contextSourceId": "SRC-000021",
          "contextLocator": "Absorption; Table 23.10"
        }
      ]
    },
    {
      "id": "protein",
      "label": "Білки · амінокислоти й пептиди",
      "pathwayId": "PTH-PROTEIN-ABSORPTION",
      "claimIds": [
        "CLM-000025",
        "CLM-000026"
      ],
      "steps": [
        {
          "id": "lumen",
          "label": "Продукти перетравлення білка",
          "claimIds": [],
          "contextSourceId": "SRC-000021",
          "contextLocator": "Protein Absorption"
        },
        {
          "id": "entry",
          "label": "Окремі переносники амінокислот і PEPT1",
          "claimIds": [
            "CLM-000025"
          ],
          "contextSourceId": "SRC-000021",
          "contextLocator": "Protein Absorption"
        },
        {
          "id": "hydrolysis",
          "label": "Гідроліз коротких пептидів",
          "claimIds": [
            "CLM-000026"
          ]
        },
        {
          "id": "blood",
          "label": "Амінокислоти до крові",
          "claimIds": [
            "CLM-000026"
          ]
        }
      ]
    },
    {
      "id": "lipids",
      "label": "Жири · довголанцюговий маршрут",
      "pathwayId": "PTH-LIPID-ABSORPTION",
      "claimIds": [
        "CLM-000027",
        "CLM-000028"
      ],
      "steps": [
        {
          "id": "micelle",
          "label": "Міцела біля поверхні клітини",
          "claimIds": [
            "CLM-000027"
          ]
        },
        {
          "id": "entry",
          "label": "Ліпідні складники входять у клітину",
          "claimIds": [
            "CLM-000027"
          ]
        },
        {
          "id": "assembly",
          "label": "Ресинтез і утворення хіломікрона",
          "claimIds": [
            "CLM-000028"
          ]
        },
        {
          "id": "lymph",
          "label": "Хіломікрон: лімфа → кров",
          "claimIds": [
            "CLM-000028"
          ]
        }
      ]
    }
  ],
  "visualization": {
    "id": "VIS-NUTRITION-ENTEROCYTE-001",
    "title": "Ентероцит: усмоктування нутрієнтів",
    "type": "interactive_svg_stepper",
    "claimIds": [
      "CLM-000021",
      "CLM-000022",
      "CLM-000023",
      "CLM-000024",
      "CLM-000025",
      "CLM-000026",
      "CLM-000027",
      "CLM-000028"
    ],
    "entityIds": [
      "CELL-ENTEROCYTE",
      "TRN-SGLT1",
      "TRN-GLUT2",
      "TRN-PEPT1",
      "PRT-NAK-ATPASE"
    ],
    "simplified": true,
    "simplificationNote": "Навчальна схема шляхів перенесення. Не відтворює реальні концентрації, швидкості, частки всмоктування чи індивідуальну відповідь.",
    "version": "1.0",
    "lastReviewed": null,
    "status": "educational"
  },
  "interaction": {
    "controls": [
      "Назад",
      "Відтворити",
      "Пауза",
      "Далі",
      "Спочатку"
    ],
    "autoplay": false,
    "reducedMotion": "manual_steps",
    "mobile": "model_then_adjacent_controls_then_current_step",
    "desktop": "model_with_adjacent_controls_and_explanation",
    "polarityLabels": [
      "Просвіт кишки",
      "Апікальна мембрана",
      "Ентероцит",
      "Базолатеральна мембрана",
      "Кров",
      "Лімфа"
    ]
  },
  "approvalQuestions": [
    "Погодити структуру та вісім конкретних формулювань.",
    "Завершити неповну перевірку джерел перед публікацією.",
    "Рівні впевненості зараз не призначати; вони не виводяться з типу публікації."
  ],
  "publicationAcceptance": {
    "kind": "user_wording_approval",
    "at": "2026-10-11T11:49:52+03:00",
    "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
    "confidenceAssessed": false,
    "formalScientificReview": false
  }
};
export const nutritionBase = createEvidenceBase({
  "claims": [
    {
      "id": "CLM-000021",
      "statement": "Перетравлення розщеплює складники їжі; усмоктування переносить продукти цього процесу через кишковий епітелій.",
      "shortStatement": "Перетравити й усмоктати — різні процеси.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Оглядова схема не охоплює всі класи нутрієнтів і механізми перенесення."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Перетравити й усмоктати — різні процеси."
      }
    },
    {
      "id": "CLM-000022",
      "statement": "SGLT1 переносить глюкозу разом із Na⁺ з просвіту кишки в ентероцит.",
      "shortStatement": "Вхід глюкози: SGLT1 + Na⁺.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Маршрут першої версії стосується глюкози; він не є універсальним для всіх цукрів."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE",
        "MOL-GLUCOSE",
        "MOL-SODIUM",
        "TRN-SGLT1"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Вхід глюкози: SGLT1 + Na⁺."
      }
    },
    {
      "id": "CLM-000023",
      "statement": "GLUT2 забезпечує вихід глюкози через базолатеральну мембрану ентероцита.",
      "shortStatement": "Вихід глюкози: GLUT2.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Показано базову модель. Регуляцію локалізації GLUT2 за різних умов не змодельовано; це не твердження, що він завжди є лише на цій мембрані."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE",
        "MOL-GLUCOSE",
        "TRN-GLUT2"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Вихід глюкози: GLUT2."
      }
    },
    {
      "id": "CLM-000024",
      "statement": "Na⁺/K⁺-ATPаза використовує ATP для підтримання натрієвого градієнта; SGLT1 використовує цей градієнт і не гідролізує ATP безпосередньо.",
      "shortStatement": "Насос витрачає ATP; SGLT1 використовує градієнт.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Не показано виміряних концентрацій, мембранного потенціалу або швидкості транспорту."
      ],
      "entityIds": [
        "MOL-ATP",
        "MOL-SODIUM",
        "MOL-POTASSIUM",
        "TRN-SGLT1",
        "PRT-NAK-ATPASE"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Насос витрачає ATP; SGLT1 використовує градієнт."
      }
    },
    {
      "id": "CLM-000025",
      "statement": "PEPT1 переносить ди- й трипептиди в ентероцит разом із H⁺.",
      "shortStatement": "Короткі пептиди входять через PEPT1.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "PEPT1 не є універсальним переносником цілих білків чи всіх пептидів. Функціональне дослідження людського переносника в клітинах і ооцитах не визначає швидкість усмоктування їжі в людини."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE",
        "TRN-PEPT1"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Короткі пептиди входять через PEPT1."
      }
    },
    {
      "id": "CLM-000026",
      "statement": "Усередині ентероцита ди- й трипептиди розщеплюються до амінокислот, які надходять із клітини до крові.",
      "shortStatement": "З ентероцита до крові — амінокислоти.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Не показано окремо всі амінокислотні переносники й можливі винятки для біоактивних пептидів."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE",
        "MOL-AMINO-ACID",
        "PTH-PROTEIN-ABSORPTION"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "З ентероцита до крові — амінокислоти."
      }
    },
    {
      "id": "CLM-000027",
      "statement": "Змішані міцели підводять продукти перетравлення ліпідів до поверхні ентероцита; у клітину переходять їхні складники, а не ціла міцела.",
      "shortStatement": "Міцела залишається зовні клітини.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Схема не зводить всі механізми перенесення ліпідів до одного способу."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE",
        "MOL-FATTY-ACID",
        "PTH-LIPID-ABSORPTION"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Міцела залишається зовні клітини."
      }
    },
    {
      "id": "CLM-000028",
      "statement": "В ентероциті з продуктів перетравлення довголанцюгових жирів відновлюються триацилгліцероли, які експортуються у складі хіломікронів через лімфу до крові.",
      "shortStatement": "Хіломікрон: ентероцит → лімфа → кров.",
      "claimType": "physiology",
      "evidenceLayer": "mechanistic",
      "domain": "nutrition",
      "topics": [
        "digestion",
        "absorption"
      ],
      "population": {
        "description": "Навчальна модель усмоктування в тонкій кишці; конкретна експериментальна система зазначена в записі."
      },
      "evidenceConfidence": null,
      "confidenceFramework": "not_assessed",
      "confidenceRationale": {
        "summary": "Рівень впевненості Evidence UA для цього механізму не оцінено. Погодження навчального формулювання не є завершеним науковим переглядом."
      },
      "evidenceSummary": null,
      "limitations": [
        "Показано основний маршрут довголанцюгових жирів. Коротколанцюгові жирні кислоти не слід показувати як обов’язковий вантаж хіломікронів."
      ],
      "entityIds": [
        "CELL-ENTEROCYTE",
        "MOL-TRIGLYCERIDE",
        "PTH-LIPID-ABSORPTION"
      ],
      "status": "educational",
      "version": "1.0",
      "lastReviewed": null,
      "nextReview": null,
      "scientificApproval": null,
      "publicationApproved": true,
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      },
      "outcome": {
        "name": "Хіломікрон: ентероцит → лімфа → кров."
      }
    }
  ],
  "sources": [
    {
      "id": "SRC-000021",
      "title": "Chemical Digestion and Absorption: A Closer Look",
      "authors": [
        "J. Gordon Betts et al."
      ],
      "year": 2022,
      "publicationType": "textbook_chapter",
      "journal": null,
      "book": "Anatomy and Physiology 2e",
      "publisher": "OpenStax",
      "doi": null,
      "pmid": null,
      "pmcid": null,
      "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look",
      "accessLevel": "publisher_text",
      "metadataStatus": "checked",
      "lastChecked": "2026-10-11",
      "funding": null,
      "conflicts": null,
      "publicationStatus": null,
      "publicationStatusCheck": "pending",
      "shortCitation": "J. Gordon Betts et al. · 2022",
      "identifiers": {
        "doi": null,
        "pmid": null,
        "pmcid": null
      },
      "pubmedUrl": null,
      "sourceStatus": "not_checked",
      "methodsSummary": "Прочитано відповідний текст видавця.",
      "keyLimitations": [
        "Навчальний розділ; не оцінка ефекту втручання."
      ]
    },
    {
      "id": "SRC-000022",
      "title": "Glucose transporters in the small intestine in health and disease",
      "authors": [
        "Hermann Koepsell"
      ],
      "year": 2020,
      "publicationType": "narrative_review",
      "journal": "Pflügers Archiv - European Journal of Physiology",
      "doi": "10.1007/s00424-020-02439-5",
      "pmid": "32829466",
      "pmcid": "PMC7462918",
      "url": "https://link.springer.com/article/10.1007/s00424-020-02439-5",
      "accessLevel": "publisher_text",
      "metadataStatus": "checked",
      "lastChecked": "2026-10-11",
      "funding": null,
      "conflicts": null,
      "publicationStatus": null,
      "publicationStatusCheck": "pending",
      "shortCitation": "Hermann Koepsell · 2020",
      "identifiers": {
        "doi": "10.1007/s00424-020-02439-5",
        "pmid": "32829466",
        "pmcid": "PMC7462918"
      },
      "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/32829466/",
      "sourceStatus": "not_checked",
      "methodsSummary": "Прочитано відповідний текст видавця.",
      "keyLimitations": [
        "Огляд механізмів; конкретні експериментальні системи та деталі регуляції потребують окремого розгляду."
      ]
    },
    {
      "id": "SRC-000023",
      "title": "Physiology of Intestinal Absorption and Secretion",
      "authors": [
        "Pawel R Kiela",
        "Fayez K Ghishan"
      ],
      "year": 2016,
      "publicationType": "narrative_review",
      "journal": "Best Practice & Research Clinical Gastroenterology",
      "doi": "10.1016/j.bpg.2016.02.007",
      "pmid": "27086882",
      "pmcid": "PMC4956471",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4956471/",
      "accessLevel": "partial_full_text_and_indexed_excerpt",
      "metadataStatus": "checked",
      "lastChecked": "2026-10-11",
      "accessNote": "Metadata, abstract and introductory sections opened; later full-text requests met a browser check. PEPT1 section confirmed in indexed excerpt. Full-section extraction remains pending.",
      "funding": null,
      "conflicts": null,
      "publicationStatus": null,
      "publicationStatusCheck": "pending",
      "shortCitation": "Pawel R Kiela, Fayez K Ghishan · 2016",
      "identifiers": {
        "doi": "10.1016/j.bpg.2016.02.007",
        "pmid": "27086882",
        "pmcid": "PMC4956471"
      },
      "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/27086882/",
      "sourceStatus": "not_checked",
      "methodsSummary": "Прочитано метадані, анотацію та початкові розділи; уривок PEPT1 перевірено в індексі. Повна секція ще потребує перевірки.",
      "keyLimitations": [
        "Огляд механізмів; конкретні експериментальні системи та деталі регуляції потребують окремого розгляду."
      ]
    },
    {
      "id": "SRC-000024",
      "title": "Human intestinal H+/peptide cotransporter. Cloning, functional expression, and chromosomal localization",
      "authors": [
        "R Liang",
        "Y J Fei",
        "P D Prasad",
        "S Ramamoorthy",
        "H Han",
        "T L Yang-Feng",
        "M A Hediger",
        "V Ganapathy",
        "F H Leibach"
      ],
      "year": 1995,
      "publicationType": "original_research",
      "studyDesign": "cloning_and_heterologous_expression",
      "journal": "Journal of Biological Chemistry",
      "doi": "10.1074/jbc.270.12.6456",
      "pmid": "7896779",
      "pmcid": null,
      "url": "https://pubmed.ncbi.nlm.nih.gov/7896779/",
      "accessLevel": "indexed_abstract",
      "metadataStatus": "checked_from_indexed_pubmed",
      "lastChecked": "2026-10-11",
      "accessNote": "Metadata and abstract retrieved from PubMed search index. Direct PubMed/publisher opens were blocked; full text not reviewed. Not a human feeding trial.",
      "funding": null,
      "conflicts": null,
      "publicationStatus": null,
      "publicationStatusCheck": "pending",
      "shortCitation": "R Liang, Y J Fei, P D Prasad, S Ramamoorthy, H Han, T L Yang-Feng, M A Hediger, V Ganapathy, F H Leibach · 1995",
      "identifiers": {
        "doi": "10.1074/jbc.270.12.6456",
        "pmid": "7896779",
        "pmcid": null
      },
      "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/7896779/",
      "sourceStatus": "not_checked",
      "methodsSummary": "Метадані й анотацію перевірено через індекс PubMed; повний текст не прочитано.",
      "keyLimitations": [
        "Функціональна експресія переносника в клітинах та ооцитах; не випробування усмоктування їжі в людей."
      ]
    }
  ],
  "records": [
    {
      "id": "EVR-000030",
      "sourceId": "SRC-000021",
      "claimId": "CLM-000021",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Розділ розрізняє розщеплення їжі та перенесення продуктів через епітелій."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Chemical Digestion; Absorption",
      "populationContext": {
        "description": "Навчальний опис фізіології."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000031",
      "sourceId": "SRC-000022",
      "claimId": "CLM-000022",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Описано апікальний Na⁺-залежний перенос глюкози SGLT1."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Introduction; Na+-D-glucose cotransporter SGLT1",
      "populationContext": {
        "description": "Огляд людських та експериментальних систем."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000032",
      "sourceId": "SRC-000022",
      "claimId": "CLM-000023",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Описано базолатеральний GLUT2 та залежні від умов зміни локалізації."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Introduction; Glucose facilitator GLUT2; Fig. 1",
      "populationContext": {
        "description": "Людські й тваринні дані; моделі регуляції не тотожні для всіх систем."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000033",
      "sourceId": "SRC-000022",
      "claimId": "CLM-000024",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "SGLT1 — вторинно активний переносник; градієнт підтримує Na⁺/K⁺-ATPаза."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Introduction; Na+-D-glucose cotransporter SGLT1; Fig. 1",
      "populationContext": {
        "description": "Механізм транспорту, не клінічний ефект."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000034",
      "sourceId": "SRC-000023",
      "claimId": "CLM-000025",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "У розділі описано кишковий переносник пептидів PEPT1."
      },
      "direction": "unclear",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "context_only",
      "extractionLocator": "Amino acids and peptide absorption — indexed PEPT1 excerpt",
      "populationContext": {
        "description": "Огляд; повна повторна екстракція секції ще потрібна."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000035",
      "sourceId": "SRC-000024",
      "claimId": "CLM-000025",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Експресія людського кишкового переносника в HeLa та ооцитах Xenopus спричиняла H⁺-залежний перенос пептидів."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "PubMed indexed Abstract — functional expression",
      "populationContext": {
        "description": "Функціональна експресія в моделях; не випробування харчування в людей."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000036",
      "sourceId": "SRC-000021",
      "claimId": "CLM-000026",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Описано внутрішньоклітинний гідроліз коротких пептидів і вихід амінокислот до крові."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Protein Absorption",
      "populationContext": {
        "description": "Навчальний опис; конкретні базолатеральні переносники потребують деталізації."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000037",
      "sourceId": "SRC-000021",
      "claimId": "CLM-000027",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Текст описує вихід ліпідних складників із міцели перед надходженням у клітину."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Lipid Absorption — paragraph before Fig. 23.33",
      "populationContext": {
        "description": "Не використовувати суперечливий альтернативний підпис зображення як опис механізму."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    },
    {
      "id": "EVR-000038",
      "sourceId": "SRC-000021",
      "claimId": "CLM-000028",
      "evidenceLayer": "mechanistic",
      "outcome": {
        "name": "Опис конкретного механізму"
      },
      "result": {
        "summary": "Описано ресинтез триацилгліцеролів, хіломікрони, лімфу та надходження в кров."
      },
      "direction": "supports_claim",
      "relevance": "candidate_mechanistic_provenance",
      "roleForClaim": "mechanistic_support",
      "extractionLocator": "Lipid Absorption; Table 23.10",
      "populationContext": {
        "description": "Маршрут довголанцюгових ліпідів; окремо зазначено інший маршрут коротколанцюгових."
      },
      "riskOfBias": {
        "status": "not_assessed"
      },
      "reviewStatus": "pending",
      "publicationApproved": true,
      "lastChecked": "2026-10-11",
      "publicationAcceptance": {
        "kind": "user_wording_approval",
        "at": "2026-10-11T11:49:52+03:00",
        "scope": "Nutrition Lab structure and eight statements from docs/NUTRITION-LAB-PROPOSAL.md",
        "confidenceAssessed": false,
        "formalScientificReview": false
      }
    }
  ],
  "presentation": {
    "labels": {"CLM-000021":"Перетравлення й усмоктування","CLM-000022":"SGLT1","CLM-000023":"GLUT2","CLM-000024":"Натрій-калієвий насос","CLM-000025":"PEPT1","CLM-000026":"Амінокислоти до крові","CLM-000027":"Змішані міцели","CLM-000028":"Хіломікрони"},
    "confidenceNote": "Механізм пояснює перенесення речовин, але сам по собі не доводить довгостроковий клінічний або спортивний ефект."
  }
,entities:scientificEntities,visualizations:[nutritionModule.visualization]
});
