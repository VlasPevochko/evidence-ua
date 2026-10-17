// Exercise Library data — first runtime slice (three entries).
// Content layers are kept separate: description/anatomy (facts), coaching (editorial), Claims (science).
// Nothing here is a scientific outcome Claim. relatedClaimIds stays empty until Claims are reviewed.
// Coaching text is an editorial DRAFT written without access to the videos; verify it against each video.

export const contentTypes = {
  strength: 'Силова',
  mobility: 'Мобільність',
  movement_control: 'Контроль руху',
  coordination: 'Координація',
  rehab_practice: 'Реабілітаційна практика',
  screen_or_test: 'Тест або скринінг'
};

export const movementPatterns = {
  horizontal_pull: 'Горизонтальна тяга',
  scapular_control: 'Контроль лопатки',
  shoulder_rotation: 'Ротація плеча',
  multiplanar_mobility: 'Мобільність у кількох площинах',
  coordination_balance: 'Координація та баланс'
};

export const bodyRegions = {
  shoulder: 'Плече',
  scapula: 'Лопатка',
  upper_back: 'Верхня частина спини',
  elbow: 'Лікоть',
  chest: 'Груди',
  spine: 'Хребет і тулуб',
  full_body: 'Усе тіло'
};

export const equipmentLabels = {
  dumbbell: 'Гантель'
};

export const reviewStatusLabels = {
  draft: 'Чернетка: редакційний перегляд не завершено'
};

export const claimsPendingNote = 'Пов’язані наукові твердження ще проходять перевірку.';

export const exercises = [
  {
    id: 'exercise_dumbbell_row_bent_over',
    slug: 'tyaha-hanteli-v-nahili',
    legacySlugs: ['tyaha-hanteli-v-nahyli'],
    titleUk: 'Тяга гантелі в нахилі',
    titleEn: 'Bent-over dumbbell row',
    aliases: ['тяга гантелі однією рукою', 'тяга гантелі'],
    media: {
      provider: 'youtube',
      videoId: 'qrL6N-35QrE',
      author: 'Vseslav Perekhrestenko'
    },
    contentType: 'strength',
    movementPatterns: ['horizontal_pull'],
    bodyRegions: ['shoulder', 'scapula', 'upper_back', 'elbow'],
    equipment: ['dumbbell'],
    shortDescriptionUk: 'Варіант силового навантаження: гантель підтягується до тулуба, поки положення тулуба утримується стабільним.',
    jointActionsUk: [
      'Плечовий суглоб: розгинання або горизонтальне розгинання — залежно від траєкторії ліктя.',
      'Лопатка: приведення до хребта та контроль положення.',
      'Ліктьовий суглоб: згинання.',
      'Тулуб і таз: утримання положення без зайвого руху.'
    ],
    movementNoteUk: 'Внесок окремих суглобів залежить від траєкторії, хвату, положення тулуба і наміру. Опис вище — орієнтир, а не єдина правильна схема для будь-якої техніки.',
    primaryStructuresUk: [
      'Найширший м’яз спини',
      'Ромбоподібні м’язи',
      'Середня та нижня частини трапецієподібного м’яза',
      'Задня частина дельтоподібного м’яза'
    ],
    secondaryStructuresUk: [
      'Двоголовий м’яз плеча',
      'Плечовий м’яз',
      'Плечопроменевий м’яз',
      'М’язи тулуба і стегон — як стабілізатори положення'
    ],
    techniqueCuesUk: [
      'Оберіть вагу, з якою рух лишається контрольованим.',
      'Тримайте положення тулуба стабільним протягом підходу.',
      'Рухайте гантель плавно, без ривків.'
    ],
    commonErrorsUk: [
      'Ривок вагою замість контрольованого руху.',
      'Розгойдування тулуба, щоб «допомогти» підняти вагу.'
    ],
    regressionsUk: ['Менша вага.', 'Менший діапазон руху, який вдається контролювати.'],
    progressionsUk: ['Повільніший темп за збереження контролю.', 'Більша вага лише за умови, що техніка не погіршується.'],
    variationsUk: ['Зміна хвату або траєкторії ліктя змінює акценти руху.'],
    limitationsUk: [
      'Реакція на вправу індивідуальна.',
      'Якщо виникає гострий, незвичний або наростаючий біль, припиніть вправу та зверніться до фахівця.'
    ],
    atlasZones: ['shoulder', 'muscles', 'spine'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_scapular_activation_control',
    slug: 'kontrol-lopatky',
    titleUk: 'Контроль лопатки (активація лопатки)',
    titleEn: 'Scapular control',
    aliases: ['активація лопатки', 'скапулярна активація', 'рухи лопатки'],
    media: {
      provider: 'youtube',
      videoId: 'NDSyt1Ib89E',
      author: 'Vseslav Perekhrestenko'
    },
    contentType: 'movement_control',
    movementPatterns: ['scapular_control'],
    bodyRegions: ['shoulder', 'scapula'],
    equipment: [],
    shortDescriptionUk: 'Практика контролю руху лопатки: повільні рухи, під час яких можна відчути й відпрацювати положення лопатки відносно грудної клітки.',
    jointActionsUk: [
      'Лопатково-грудний рух: відведення (протракція) та приведення (ретракція) лопатки.',
      'Підйом і опускання лопатки.',
      'Верхнє та нижнє обертання лопатки — коли це доречно для конкретного руху.',
      'Взаємодія лопатки з рухом плечової кістки.'
    ],
    movementNoteUk: 'Лопатка рухається разом із плечовою кісткою та грудною кліткою, тому її рух краще розглядати в зв’язку з рухом руки, а не окремо.',
    primaryStructuresUk: [
      'Передній зубчастий м’яз',
      'Трапецієподібний м’яз (верхня, середня та нижня частини)',
      'Ромбоподібні м’язи'
    ],
    secondaryStructuresUk: ['М’язи грудної клітки та тулуба, що підтримують положення'],
    techniqueCuesUk: [
      'Рухайтеся повільно й у діапазоні, який ви контролюєте.',
      'Не затримуйте дихання.'
    ],
    commonErrorsUk: ['Поспіх замість контролю.', 'Компенсація рухом тулуба замість руху лопатки.'],
    regressionsUk: ['Менший діапазон руху.', 'Повільніший темп.'],
    progressionsUk: ['Додавання зовнішнього опору — лише коли базовий рух контролюється.'],
    variationsUk: [],
    limitationsUk: [
      'Це практика руху, а не діагностика та не лікування.',
      'Реакція на вправу індивідуальна; за болю або незвичних відчуттів зверніться до фахівця.'
    ],
    atlasZones: ['shoulder', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_rotator_cuff_complex',
    slug: 'rotatorna-manzheta-kompleks',
    legacySlugs: ['kompleks-rotatornoyi-manzhety'],
    titleUk: 'Комплекс для ротаторної манжети',
    titleEn: 'Rotator cuff exercise complex',
    aliases: ['ротаторна манжета', 'вправи для ротаторної манжети'],
    media: {
      provider: 'youtube',
      videoId: 'MTdKHhtTRZQ',
      author: 'Vseslav Perekhrestenko'
    },
    contentType: 'rehab_practice',
    movementPatterns: ['shoulder_rotation'],
    bodyRegions: ['shoulder'],
    equipment: [],
    shortDescriptionUk: 'Навантаження на м’язи ротаторної манжети через ротацію в плечовому суглобі. Може використовуватися як практика контролю плеча.',
    jointActionsUk: [
      'Плечовий суглоб: зовнішня та внутрішня ротація.',
      'Утримання голівки плечової кістки у суглобовій западині під час руху.'
    ],
    movementNoteUk: 'Ротаторна манжета працює разом з іншими м’язами плеча і лопатки. Роль окремого м’яза залежить від положення руки та напрямку руху.',
    primaryStructuresUk: [
      'Надостьовий м’яз',
      'Підостьовий м’яз',
      'Малий круглий м’яз',
      'Підлопатковий м’яз'
    ],
    secondaryStructuresUk: ['Дельтоподібний м’яз і м’язи лопатки — як частина спільної роботи плеча'],
    techniqueCuesUk: [
      'Рухайтеся повільно та з контролем.',
      'Оберіть опір, який дозволяє виконувати рух без компенсацій.'
    ],
    commonErrorsUk: ['Занадто великий опір, через який рух виконується ривками.', 'Компенсація рухом тулуба.'],
    regressionsUk: ['Менший опір.', 'Менший діапазон руху.'],
    progressionsUk: ['Поступове збільшення опору чи кількості повторень — за умови контролю й відсутності посилення симптомів.'],
    variationsUk: [],
    limitationsUk: [
      'Матеріал не замінює оцінку фахівця, особливо за наявності болю чи після травми.',
      'Реакція на вправу індивідуальна. Ця сторінка не робить тверджень ні про лікувальний ефект, ні про профілактику травм.',
      'Якщо біль посилюється, виникає слабкість, оніміння чи нічний біль у плечі, зверніться до лікаря.'
    ],
    atlasZones: ['shoulder', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },

  {
    id: 'practice_shoulder_scapula_mobility_complex',
    slug: 'mobilnist-plecha-lopatky',
    titleUk: 'Комплекс мобільності плеча та лопатки',
    titleEn: 'Shoulder and scapula mobility complex',
    aliases: ['мобільність плеча', 'розминка плеча', 'мобільність лопатки'],
    media: { provider: 'youtube', videoId: 'HXc_N5WXAfw', author: 'Vseslav Perekhrestenko' },
    contentType: 'mobility',
    movementPatterns: ['multiplanar_mobility'],
    bodyRegions: ['shoulder', 'scapula', 'spine'],
    equipment: [],
    shortDescriptionUk: 'Практика рухів плеча та лопатки в різних напрямках, яка допомагає відчути й використати доступний діапазон руху.',
    jointActionsUk: [
      'Плечовий суглоб: рухи в кількох напрямках.',
      'Лопатка: рух відносно грудної клітки.',
      'Акроміально-ключичний та груднинно-ключичний суглоби: супутні рухи ключиці й лопатки.',
      'Грудний відділ хребта: участь у русі руки над головою.'
    ],
    movementNoteUk: 'Короткочасне збільшення діапазону руху після вправи не означає, що причину скутості чи болю усунено, і не є доказом профілактики.',
    primaryStructuresUk: ['Плечовий суглоб', 'Лопатка', 'Передній зубчастий м’яз', 'Трапецієподібний м’яз'],
    secondaryStructuresUk: ['Ротаторна манжета — як контроль руху', 'Акроміально-ключичний і груднинно-ключичний суглоби', 'Грудний відділ хребта'],
    techniqueCuesUk: ['Рухайтеся в діапазоні, який ви контролюєте.', 'Не затримуйте дихання.', 'Не форсуйте крайні положення.'],
    commonErrorsUk: ['Поспіх замість плавного руху.', 'Спроба «добрати» діапазон рухом тулуба.'],
    regressionsUk: ['Менший діапазон руху.', 'Повільніший темп.'],
    progressionsUk: ['Поступове збільшення діапазону чи кількості повторень, якщо рух лишається комфортним.'],
    variationsUk: [],
    limitationsUk: ['Це практика руху, а не діагностика чи лікування.', 'Якщо рух викликає біль, оніміння чи інші незвичні відчуття, припиніть і зверніться до фахівця.'],
    atlasZones: ['shoulder', 'spine'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_chest_shoulder_girdle_context',
    slug: 'hrudy-plechovyi-poyas',
    titleUk: 'Груди й плечовий пояс: контекст лопатки та манжети',
    titleEn: 'Chest and shoulder girdle with scapula and cuff context',
    aliases: ['груди', 'вправи на груди', 'плечовий пояс'],
    media: { provider: 'youtube', videoId: 'w2XC6Igeyyo', author: 'Vseslav Perekhrestenko' },
    contentType: 'strength',
    movementPatterns: [],
    bodyRegions: ['shoulder', 'chest', 'scapula'],
    equipment: [],
    shortDescriptionUk: 'Силове навантаження на груди й плечовий пояс, у якому розглядається також роль лопатки та ротаторної манжети.',
    jointActionsUk: [
      'Плечовий суглоб: рух руки в жимовому напрямку.',
      'Лопатка: положення й рух відносно грудної клітки під час жиму.',
      'Ліктьовий суглоб: розгинання, коли в русі є жим.'
    ],
    movementNoteUk: 'Біомеханічне пояснення руху не відповідає на питання, який варіант дає кращий ріст м’язів: для порівняння результатів потрібні окремі дослідження.',
    primaryStructuresUk: ['Великий грудний м’яз', 'Передня частина дельтоподібного м’яза', 'Триголовий м’яз плеча'],
    secondaryStructuresUk: ['Малий грудний м’яз', 'Передній зубчастий м’яз', 'Ротаторна манжета', 'Лопатка'],
    techniqueCuesUk: ['Оберіть навантаження, з яким рух лишається контрольованим.', 'Рухайтеся плавно, без ривків.'],
    commonErrorsUk: ['Ривок замість контрольованого руху.', 'Вага, яка не дає виконувати рух без компенсацій.'],
    regressionsUk: ['Менше навантаження.', 'Менший діапазон руху, який вдається контролювати.'],
    progressionsUk: ['Поступове збільшення навантаження чи обсягу за умови контролю й відсутності болю.'],
    variationsUk: [],
    limitationsUk: ['Реакція на навантаження індивідуальна.', 'Якщо виникає гострий, незвичний або наростаючий біль у плечі чи грудях, припиніть вправу та зверніться до фахівця.'],
    atlasZones: ['shoulder', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_scapular_control_progression',
    slug: 'progresiya-kontrolyu-lopatky',
    titleUk: 'Прогресія контролю лопатки',
    titleEn: 'Advanced scapular control progression',
    aliases: ['складніший контроль лопатки', 'прогресія активації лопатки'],
    media: { provider: 'youtube', videoId: 'P6t_LAZCdqw', author: 'Vseslav Perekhrestenko' },
    contentType: 'movement_control',
    movementPatterns: ['scapular_control'],
    bodyRegions: ['shoulder', 'scapula'],
    equipment: [],
    shortDescriptionUk: 'Складніший варіант практики контролю лопатки: завдання ускладнюється, а положення й рух лопатки лишаються під контролем.',
    jointActionsUk: [
      'Лопатково-грудний рух: відведення, приведення, піднімання, опускання та обертання лопатки — залежно від вправи.',
      'Плечовий суглоб: рух руки разом з лопаткою.'
    ],
    movementNoteUk: 'Прогресія тут — практичний та редакційний підхід. Твердження про вплив на біль чи профілактику травм потребують окремих досліджень.',
    primaryStructuresUk: ['Передній зубчастий м’яз', 'Трапецієподібний м’яз', 'Лопатка'],
    secondaryStructuresUk: ['Ротаторна манжета', 'Плечовий суглоб'],
    techniqueCuesUk: ['Переходьте до складнішого варіанту лише тоді, коли базовий рух контролюється.', 'Рухайтеся повільно та з контролем.'],
    commonErrorsUk: ['Занадто рання прогресія без контролю.', 'Компенсація рухом тулуба.'],
    regressionsUk: ['Повернення до простішого варіанту практики контролю лопатки.', 'Менший діапазон руху.'],
    progressionsUk: ['Подальше ускладнення — за умови стабільного контролю й без посилення симптомів.'],
    variationsUk: [],
    limitationsUk: ['Це практика руху, а не лікування чи профілактика травм.', 'Реакція на вправу індивідуальна; за болю чи слабкості зверніться до фахівця.'],
    atlasZones: ['shoulder', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_back_mobility_complex',
    slug: 'spyna-mobilnist-kompleks',
    titleUk: 'Спина та мобільність: комплекс',
    titleEn: 'Back and mobility complex',
    aliases: ['мобільність спини', 'мобільність грудного відділу', 'розминка спини'],
    media: { provider: 'youtube', videoId: 'fg9Wpawsi9c', author: 'Vseslav Perekhrestenko' },
    contentType: 'mobility',
    movementPatterns: ['multiplanar_mobility'],
    bodyRegions: ['spine', 'upper_back', 'shoulder'],
    equipment: [],
    shortDescriptionUk: 'Комплекс рухів для тулуба й грудного відділу хребта, у якому спина працює разом з лопатками та плечима.',
    jointActionsUk: [
      'Грудний відділ хребта: рухи тулуба в кількох напрямках.',
      'Грудна клітка: участь у русі й диханні.',
      'Лопатка: рух відносно грудної клітки.'
    ],
    movementNoteUk: 'Загальна послідовність вправ на мобільність не є способом лікувати проблеми попереку чи хребта.',
    primaryStructuresUk: ['Грудний відділ хребта', 'Грудна клітка', 'Розгиначі тулуба'],
    secondaryStructuresUk: ['Поперековий відділ хребта — якщо він залучений у вправі', 'Лопатка', 'Найширший м’яз спини — залежно від руху'],
    techniqueCuesUk: ['Рухайтеся плавно, в діапазоні без болю.', 'Дихайте спокійно, не затримуючи дихання.'],
    commonErrorsUk: ['Форсування крайніх положень.', 'Поспіх замість плавного руху.'],
    regressionsUk: ['Менший діапазон руху.', 'Повільніший темп.'],
    progressionsUk: ['Поступове збільшення діапазону, якщо рух комфортний.'],
    variationsUk: [],
    limitationsUk: ['Матеріал не замінює оцінку фахівця, особливо за наявності болю в спині.', 'Зверніться до лікаря, якщо біль іррадіює в ногу чи руку, виникає оніміння або слабкість.'],
    atlasZones: ['spine', 'shoulder', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'exercise_back_strength_cobra_set',
    slug: 'sylovyi-kompleks-spyna',
    titleUk: 'Силовий комплекс для спини',
    titleEn: 'Back strength movement set',
    aliases: ['спина силові', 'кобра для спини', 'вправи на спину'],
    media: { provider: 'youtube', videoId: '6Mxz9Raufy8', author: 'Vseslav Perekhrestenko' },
    contentType: 'strength',
    movementPatterns: [],
    bodyRegions: ['upper_back', 'shoulder', 'spine'],
    equipment: [],
    shortDescriptionUk: 'Силове навантаження на м’язи спини та заднього плечового пояса, у якому тулуб працює як стабілізатор.',
    jointActionsUk: [
      'Плечовий суглоб: рухи, спрямовані назад.',
      'Лопатка: приведення та контроль положення.',
      'Ліктьовий суглоб: згинання, якщо воно є в рухові.',
      'Тулуб: утримання положення.'
    ],
    movementNoteUk: 'Ця сторінка не стверджує, що комплекс «найкращий» для спини: для порівняння вправ потрібні окремі дослідження з визначеним результатом.',
    primaryStructuresUk: ['Найширший м’яз спини', 'Трапецієподібний м’яз', 'Ромбоподібні м’язи', 'Задня частина дельтоподібного м’яза'],
    secondaryStructuresUk: ['Згиначі ліктя — де це доречно', 'М’язи тулуба — як стабілізатори'],
    techniqueCuesUk: ['Рухайтеся плавно, без ривків.', 'Оберіть складність, з якою положення тулуба лишається стабільним.'],
    commonErrorsUk: ['Ривок замість контрольованого руху.', 'Компенсація рухом тулуба замість роботи цільових м’язів.'],
    regressionsUk: ['Менший діапазон руху.', 'Менша кількість повторень.'],
    progressionsUk: ['Поступове збільшення обсягу чи складності за умови контролю й відсутності болю.'],
    variationsUk: [],
    limitationsUk: ['Реакція на навантаження індивідуальна.', 'Якщо виникає біль у попереку, що наростає, або біль, який віддає в ногу, припиніть вправу та зверніться до фахівця.'],
    atlasZones: ['muscles', 'shoulder', 'spine'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_animal_flow_mobility',
    slug: 'animal-flow-mobilnist',
    titleUk: 'Animal Flow: мобільність',
    titleEn: 'Animal Flow mobility',
    aliases: ['анімал флоу', 'animal flow'],
    media: { provider: 'youtube', videoId: 'ZAt8wfSPpb4', author: 'Vseslav Perekhrestenko' },
    contentType: 'mobility',
    movementPatterns: ['multiplanar_mobility'],
    bodyRegions: ['full_body', 'shoulder', 'spine'],
    equipment: [],
    shortDescriptionUk: 'Інтегрований рух по підлозі в кількох площинах, у якому по черзі працюють плечі, хребет, таз і кінцівки.',
    jointActionsUk: [
      'Плечовий комплекс: опора на руки й рух у кількох напрямках.',
      'Зап’ястки та кисті: навантаження від опори.',
      'Грудний і поперековий відділи хребта: рухи тулуба.',
      'Кульшовий комплекс, коліна та гомілковостопні суглоби — залежно від переходів.'
    ],
    movementNoteUk: 'Практику можна показувати без тверджень про особливу фізіологічну перевагу чи оздоровчий ефект: такі твердження потребують окремих доказів.',
    primaryStructuresUk: ['Плечовий комплекс', 'Хребет і тулуб', 'Кульшовий комплекс'],
    secondaryStructuresUk: ['Зап’ястки та кисті — як опорна ділянка', 'Коліна й гомілковостопні суглоби — залежно від переходів'],
    techniqueCuesUk: ['Рухайтеся в темпі, який дозволяє контролювати кожен перехід.', 'Не затримуйте дихання.'],
    commonErrorsUk: ['Занадто швидкий темп.', 'Перевантаження зап’ясток без поступового звикання.'],
    regressionsUk: ['Менший діапазон руху.', 'Повільніший темп і коротші послідовності.'],
    progressionsUk: ['Довші послідовності чи швидший темп — за умови контролю.'],
    variationsUk: [],
    limitationsUk: ['Реакція на навантаження індивідуальна; зап’ястки й плечі можуть потребувати поступового звикання.', 'Якщо виникає біль, припиніть і зверніться до фахівця.'],
    atlasZones: ['shoulder', 'spine', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_animal_flow_integrated',
    slug: 'animal-flow-intehrovanyi-rukh',
    titleUk: 'Animal Flow: сила, мобільність і гнучкість',
    titleEn: 'Animal Flow integrated movement',
    aliases: ['animal flow сила', 'інтегрований рух'],
    media: { provider: 'youtube', videoId: 'dAOMp3ITOkw', author: 'Vseslav Perekhrestenko' },
    contentType: 'movement_control',
    movementPatterns: ['multiplanar_mobility'],
    bodyRegions: ['full_body', 'shoulder', 'spine'],
    equipment: [],
    shortDescriptionUk: 'Послідовність рухів, що поєднує елементи сили, мобільності та гнучкості, з акцентом на контроль переходів.',
    jointActionsUk: [
      'Плечовий комплекс, тулуб і кульшовий комплекс: узгоджена робота під час переходів.',
      'Коліна й гомілковостопні суглоби — залежно від послідовності.',
      'Зап’ястки та кисті: опора.'
    ],
    movementNoteUk: 'Описуємо вимоги самого завдання. Твердження про довготривалі результати потребують окремих досліджень.',
    primaryStructuresUk: ['Плечовий комплекс', 'М’язи тулуба', 'Кульшовий комплекс'],
    secondaryStructuresUk: ['Коліна й гомілковостопні суглоби — залежно від послідовності', 'Зап’ястки та кисті'],
    techniqueCuesUk: ['Переходьте до наступного елемента лише після контрольованого виконання попереднього.', 'Не затримуйте дихання.'],
    commonErrorsUk: ['Занадто швидкий темп без контролю.', 'Пропуск простіших етапів.'],
    regressionsUk: ['Коротші послідовності.', 'Повільніший темп.'],
    progressionsUk: ['Довші послідовності чи складніші переходи — за умови контролю.'],
    variationsUk: [],
    limitationsUk: ['Реакція на навантаження індивідуальна.', 'Якщо виникає біль чи запаморочення, припиніть і зверніться до фахівця.'],
    atlasZones: ['shoulder', 'spine', 'muscles'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'practice_general_movement_skills',
    slug: 'rukhovyi-kompleks-navychky',
    titleUk: 'Рухові навички: комплекс',
    titleEn: 'Movement skills complex',
    aliases: ['рухові навички', 'координація рухів'],
    media: { provider: 'youtube', videoId: 'EtyFaqzJ7_o', author: 'Vseslav Perekhrestenko' },
    contentType: 'coordination',
    movementPatterns: ['coordination_balance'],
    bodyRegions: ['full_body', 'spine'],
    equipment: [],
    shortDescriptionUk: 'Набір рухових завдань для розвитку координації, балансу та загальної рухової здатності.',
    jointActionsUk: [
      'Залежать від конкретних вправ у відео: це завдання на узгоджену роботу кількох суглобів.'
    ],
    movementNoteUk: 'Формулювання «розвиває всі рухові навички» — це загальна рамка, а не наукове твердження.',
    primaryStructuresUk: ['Структури визначаються конкретною вправою з відео; без потреби не перераховуємо все тіло'],
    secondaryStructuresUk: [],
    techniqueCuesUk: ['Починайте з простіших завдань.', 'Рухайтеся в темпі, який дозволяє зберігати баланс.'],
    commonErrorsUk: ['Занадто швидкий темп.', 'Складні завдання без достатньої підготовки.'],
    regressionsUk: ['Простіші варіанти завдань.', 'Повільніший темп.'],
    progressionsUk: ['Складніші завдання поступово, коли простіші виконуються впевнено.'],
    variationsUk: [],
    limitationsUk: ['Балансові завдання виконуйте в безпечному просторі.', 'Якщо виникає запаморочення чи біль, припиніть і зверніться до фахівця.'],
    atlasZones: ['muscles', 'spine', 'shoulder', 'knee'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  },
  {
    id: 'screen_coordination_challenge',
    slug: 'test-koordinatsiyi',
    titleUk: 'Виклик на координацію',
    titleEn: 'Coordination challenge',
    aliases: ['тест координації', 'координація', 'баланс'],
    media: { provider: 'youtube', videoId: 'hVHK4ncfr6A', author: 'Vseslav Perekhrestenko' },
    contentType: 'screen_or_test',
    movementPatterns: ['coordination_balance'],
    bodyRegions: ['full_body', 'spine'],
    equipment: [],
    shortDescriptionUk: 'Рухове завдання на координацію та баланс. Це виклик для самоспостереження, а не діагностичний тест.',
    jointActionsUk: [
      'Залежать від конкретного завдання: це узгоджена робота кількох суглобів і баланс.'
    ],
    movementNoteUk: 'Це не валідований клінічний скринінг: за результатом виконання не можна робити висновків про здоров’я чи діагноз.',
    primaryStructuresUk: ['Структури визначаються завданням; окремі м’язи без потреби не призначаємо'],
    secondaryStructuresUk: [],
    techniqueCuesUk: ['Виконуйте завдання в безпечному місці.', 'Починайте з повільного темпу.'],
    commonErrorsUk: ['Порівнювати результат із чужим як ознаку «норми» чи «проблеми».'],
    regressionsUk: ['Спрощене завдання.', 'Опора поруч для страхування.'],
    progressionsUk: ['Складніші варіанти — лише коли базове завдання виконується впевнено.'],
    variationsUk: [],
    limitationsUk: ['Не є медичним тестом і не замінює оцінку фахівця.', 'Якщо виникає запаморочення, слабкість чи інші незвичні відчуття, припиніть і зверніться до лікаря.'],
    atlasZones: ['muscles', 'spine', 'shoulder', 'knee'],
    relatedClaimIds: [],
    relatedSourceIds: [],
    editorial: { reviewStatus: 'draft', claimReviewStatus: 'not_assessed', lastReviewed: null }
  }
];
