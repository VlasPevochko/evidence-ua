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
  shoulder_rotation: 'Ротація плеча'
};

export const bodyRegions = {
  shoulder: 'Плече',
  scapula: 'Лопатка',
  upper_back: 'Верхня частина спини',
  elbow: 'Лікоть'
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
    slug: 'tyaha-hanteli-v-nahyli',
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
    id: 'exercise_scapular_control',
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
    id: 'exercise_rotator_cuff_complex',
    slug: 'kompleks-rotatornoyi-manzhety',
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
  }
];
