// Educational references and descriptive anatomy, not clinical-outcome claims.
// Design approved 2026-11-14; independent scientific review remains pending.
import {createEvidenceBase} from './evidence/registry.js?v=55';
import {digestionBase} from './digestion-data.js?v=1';
const borrowedIds=['CLM-000049','CLM-000050','CLM-000051','CLM-000052'];
const claims=digestionBase.claims.filter(c=>borrowedIds.includes(c.id));
const records=digestionBase.records.filter(r=>borrowedIds.includes(r.claimId));
const usedSourceIds=new Set(records.map(r=>r.sourceId));
const references=[
  {
    "id": "SRC-000121",
    "title": "Brain Basics: Know Your Brain",
    "shortCitation": "NINDS · Основи будови мозку",
    "organization": "National Institute of Neurological Disorders and Stroke",
    "url": "https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-know-your-brain",
    "year": null,
    "publicationType": "educational_reference",
    "readingScope": "full_page",
    "sourceStatus": "checked",
    "lastChecked": "2026-11-14",
    "reviewStatus": "pending"
  },
  {
    "id": "SRC-000122",
    "title": "Your Digestive System & How It Works",
    "shortCitation": "NIDDK · Як працює травна система",
    "organization": "National Institute of Diabetes and Digestive and Kidney Diseases",
    "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works",
    "year": null,
    "publicationType": "educational_reference",
    "readingScope": "full_page",
    "sourceStatus": "checked",
    "lastChecked": "2026-11-14",
    "reviewStatus": "pending"
  },
  {
    "id": "SRC-000123",
    "title": "Definition & Facts for Lactose Intolerance",
    "shortCitation": "NIDDK · Непереносимість лактози",
    "organization": "National Institute of Diabetes and Digestive and Kidney Diseases",
    "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance/definition-facts",
    "year": null,
    "publicationType": "educational_reference",
    "readingScope": "full_page",
    "sourceStatus": "checked",
    "lastChecked": "2026-11-14",
    "reviewStatus": "pending"
  }
];
export const atlasFoundationBase=createEvidenceBase({
 claims,records,sources:[...digestionBase.sources.filter(s=>usedSourceIds.has(s.id)),...references],
 presentation:{confidenceNote:'Навчальний опис будови й механізмів. Незалежний науковий перегляд не завершено; рівні впевненості тут не присвоєно.'}
});
export const foundationTabs=['overview','anatomy','research'];
export const foundationModules={
  "brain": {
    "title": "Мозок",
    "status": "beta",
    "scientificReview": "pending",
    "summary": "Від нейрона до відділів мозку: як передаються сигнали, узгоджуються рухи й регулюється стан організму.",
    "diagramNote": "Умовна схема збоку й розташування глибокої структури. Розміри та межі спрощено; це не карта діагностики.",
    "sourceIds": [
      "SRC-000121"
    ],
    "lessons": [
      {
        "id": "neuron",
        "title": "З чого починається сигнал",
        "body": "Нейрон — одна з основних клітин нервової системи. Дендрити приймають сигнали, тіло клітини підтримує її роботу, а аксон передає сигнал до інших клітин.",
        "sourceIds": [
          "SRC-000121"
        ]
      },
      {
        "id": "synapse",
        "title": "Як клітини спілкуються",
        "body": "У хімічному синапсі закінчення аксона вивільняє нейромедіатори. Вони діють на рецептори сусідньої клітини. Тому передавання сигналу — це взаємодія клітин, а не просто дріт між двома точками.",
        "sourceIds": [
          "SRC-000121"
        ]
      },
      {
        "id": "movement",
        "title": "Хто узгоджує рух",
        "body": "Моторна кора бере участь у довільних рухах, а мозочок — у їх координації та засвоєних рухових діях. Рух залежить від взаємодії різних частин нервової системи.",
        "sourceIds": [
          "SRC-000121"
        ]
      },
      {
        "id": "networks",
        "title": "Чому немає однієї кнопки для всього",
        "body": "Різні відділи мають свої функції, але працюють разом. Схема допомагає зорієнтуватися в будові; складну поведінку не слід зводити до однієї виділеної ділянки.",
        "sourceIds": [
          "SRC-000121"
        ]
      }
    ],
    "parts": [
      {
        "id": "cerebrum",
        "title": "Великі півкулі та кора",
        "body": "Великі півкулі беруть участь у свідомих діях, пам’яті та мисленні. Ділянки кори обробляють сенсорну інформацію й беруть участь у керуванні довільними рухами.",
        "sourceIds": [
          "SRC-000121"
        ],
        "boundary": "На схемі півкулі показано одним контуром: це не означає, що всі їхні ділянки виконують однакову роботу."
      },
      {
        "id": "cerebellum",
        "title": "Мозочок",
        "body": "Мозочок бере участь у координації рухів і засвоєних рухових діях. Він працює у взаємодії з іншими відділами нервової системи.",
        "sourceIds": [
          "SRC-000121"
        ],
        "boundary": "Вибір ділянки показує її роль, а не вимірює координацію чи стан здоров’я."
      },
      {
        "id": "brainstem",
        "title": "Стовбур мозку",
        "body": "Стовбур пов’язаний зі спинним мозком. Його структури беруть участь у життєво важливих функціях, зокрема регуляції дихання та частоти серцевих скорочень.",
        "sourceIds": [
          "SRC-000121"
        ],
        "boundary": "Межі відділів спрощено. Схема не призначена для пояснення причин симптомів."
      },
      {
        "id": "hypothalamus",
        "title": "Гіпоталамус",
        "body": "Гіпоталамус — глибока структура мозку, яка бере участь у регуляції стану неспання та реакцій організму. На схемі його умовно показано всередині великих півкуль.",
        "sourceIds": [
          "SRC-000121"
        ],
        "boundary": "Невеликий розмір структури не означає просту або ізольовану функцію."
      }
    ],
    "related": [
      {"title":"Кофеїн: наявний розбір","copy":"Відкрити окремий розбір кофеїну з його джерелами та обмеженнями.","href":"./index.html#supplement-caffeine"},
      {
        "title": "Сон і відновлення",
        "copy": "Стадії сну, ритм ночі й межі практичних порад.",
        "href": "./sleep.html"
      },
      {
        "title": "Кофеїн і аденозин",
        "copy": "Побачити механізм у наявній анімованій схемі.",
        "href": "./mechanisms.html#caffeine"
      },
      {
        "title": "Рух і біомеханіка",
        "copy": "Перейти від загальної будови до пояснень руху.",
        "href": "./movement.html"
      }
    ]
  },
  "gut": {
    "title": "ШКТ",
    "status": "beta",
    "scientificReview": "pending",
    "summary": "Шлях їжі, перетравлення, всмоктування та роль допоміжних органів. Мікробіота й переносимість без універсальних заборон.",
    "diagramNote": "Умовний шлях їжі, а не точний масштаб органів. Печінка, жовчний міхур і підшлункова допомагають травленню, але їжа крізь них не проходить.",
    "sourceIds": [
      "SRC-000122",
      "SRC-000123"
    ],
    "lessons": [
      {
        "id": "digestion",
        "title": "Рух їжі — не те саме, що перетравлення",
        "body": "Перистальтика переміщує та перемішує вміст. Механічна обробка й травні соки розщеплюють їжу на менші складові. Ці процеси пов’язані, але не тотожні.",
        "sourceIds": [
          "SRC-000122"
        ]
      },
      {
        "id": "absorption",
        "title": "Де поживні речовини переходять у тіло",
        "body": "Після розщеплення поживні речовини всмоктуються крізь стінку кишки й далі транспортуються організмом. Тонка кишка відіграє основну роль у цьому етапі; товста кишка також всмоктує воду.",
        "sourceIds": [
          "SRC-000122"
        ]
      },
      {
        "id": "fermentation",
        "title": "Бактерії та клітковина",
        "body": "",
        "sourceIds": [],
        "borrowedClaimId": "CLM-000052",
        "boundary": "Це опис фізіологічного механізму. Він сам по собі не доводить ефективність певної дієти, пробіотика чи лікування."
      },
      {
        "id": "lactose",
        "title": "Переносимість: приклад лактози",
        "body": "Мальабсорбція лактози означає, що тонка кишка не перетравлює всю спожиту лактозу. Симптоми виникають не в усіх людей із мальабсорбцією. Непереносимість лактози й алергія на молоко — різні стани.",
        "sourceIds": [
          "SRC-000123"
        ],
        "boundary": "Тут пояснено терміни, а не перевірено ваші симптоми. Цей приклад не є порадою виключати продукти."
      }
    ],
    "parts": [
      {
        "id": "mouth",
        "title": "Рот",
        "body": "Жування подрібнює їжу, а слина змочує її. Фермент слини починає розщеплення крохмалю; ковтання спрямовує їжу до стравоходу.",
        "sourceIds": [
          "SRC-000122"
        ]
      },
      {
        "id": "esophagus",
        "title": "Стравохід",
        "body": "М’язова стінка стравоходу проштовхує їжу до шлунка перистальтичними рухами. Цей відділ передусім забезпечує транспорт.",
        "sourceIds": [
          "SRC-000122"
        ],
        "claimId": "CLM-000049"
      },
      {
        "id": "stomach",
        "title": "Шлунок",
        "body": "Шлунок перемішує їжу з кислотою й ферментами та поступово передає вміст у тонку кишку. Це не єдине місце, де відбувається перетравлення.",
        "sourceIds": [
          "SRC-000122"
        ],
        "claimId": "CLM-000050"
      },
      {
        "id": "small-intestine",
        "title": "Тонка кишка",
        "body": "Тут травні соки кишки, підшлункової залози та жовч беруть участь у подальшій обробці їжі. Більшість перетравлених поживних речовин всмоктується крізь стінку тонкої кишки.",
        "sourceIds": [
          "SRC-000122"
        ]
      },
      {
        "id": "large-intestine",
        "title": "Товста кишка",
        "body": "Товста кишка всмоктує воду та бере участь у формуванні випорожнень. Її бактерії переробляють частину речовин, що залишилися неперетравленими.",
        "sourceIds": [
          "SRC-000122"
        ],
        "claimId": "CLM-000052"
      },
      {
        "id": "rectum",
        "title": "Пряма кишка",
        "body": "Нижня частина товстої кишки тимчасово зберігає випорожнення до їх виведення. Це завершальний етап показаного шляху.",
        "sourceIds": [
          "SRC-000122"
        ]
      }
    ],
    "helpers": [
      {
        "id": "liver",
        "title": "Печінка",
        "body": "Утворює жовч, яка допомагає в перетравленні жирів. Їжа не надходить у печінку як у частину травної трубки.",
        "sourceIds": [
          "SRC-000122"
        ],
        "claimId": "CLM-000051"
      },
      {
        "id": "gallbladder",
        "title": "Жовчний міхур",
        "body": "Зберігає жовч між прийомами їжі та виділяє її в напрямку тонкої кишки.",
        "sourceIds": [
          "SRC-000122"
        ]
      },
      {
        "id": "pancreas",
        "title": "Підшлункова залоза",
        "body": "Постачає в тонку кишку сік із ферментами для розщеплення вуглеводів, жирів і білків.",
        "sourceIds": [
          "SRC-000122"
        ]
      }
    ],
    "related": [
      {
        "title": "Шлях їжі у 3D",
        "copy": "Дослідити травний тракт і почитати чинні фізіологічні твердження з джерелами.",
        "href": "./nutrition-digestion.html"
      },
      {
        "title": "Харчування зсередини",
        "copy": "Простежити шлях нутрієнтів від їжі до клітини.",
        "href": "./nutrition-inside.html"
      },
      {
        "title": "Розбори дієт",
        "copy": "Перейти до окремих розборів ефективності та обмежень восьми дієт.",
        "href": "./nutrition.html#nutrition-diets"
      }
    ]
  }
};
// Borrow the approved wording and provenance by reference; never summarize it into a new conclusion.
for(const module of Object.values(foundationModules))for(const lesson of module.lessons){
 if(!lesson.borrowedClaimId)continue;
 const claim=claims.find(c=>c.id===lesson.borrowedClaimId);
 if(!claim)throw Error('Unresolved Atlas physiology: '+lesson.borrowedClaimId);
 lesson.body=claim.statement;lesson.claimId=claim.id;
 lesson.sourceIds=[...new Set(records.filter(r=>r.claimId===claim.id).map(r=>r.sourceId))];
}
