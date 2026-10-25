// «Шлях їжі»: presentation steps for the 3D digestive model.
// focus — model nodes the camera frames and highlights; context — neighbouring organs
// that add secretions but are not on the food route; path — bolus route anchors.
// Scientific wording lives in Claims (digestion/module.mjs); these texts are the
// owner-approved educational narrative around them.
export const foodPathSteps = [
  {
    id: 'overview',
    title: 'Травний тракт',
    lead: 'Їжа проходить трубкою завдовжки кілька метрів. Печінка, жовчний міхур і підшлункова залоза лежать поруч і додають свої секрети, але їжа крізь них не йде.',
    points: [
      'Механічне подрібнення і хімічне розщеплення відбуваються на різних ділянках.',
      'Більшість поживних речовин всмоктується в тонкій кишці.',
      'Товста кишка повертає воду й працює разом із мікробіотою.'
    ],
    focus: ['*'],
    context: [],
    path: null,
    claimId: null
  },
  {
    id: 'oesophagus',
    title: 'Стравохід',
    lead: 'Після ковтання грудка їжі (болюс) потрапляє у стравохід. Хвилі скорочення м’язів — перистальтика — проштовхують її до шлунка.',
    points: [
      'Головну роботу виконують м’язи: ковтати можна й лежачи. Коли людина сидить чи стоїть, гравітація допомагає, особливо твердій їжі.',
      'Нижній стравохідний сфінктер пропускає їжу в шлунок і обмежує зворотний потік кислоти.'
    ],
    focus: ['oesophagus'],
    context: ['stomach'],
    path: ['oesTop', 'oesBottom'],
    claimId: 'CLM-000049'
  },
  {
    id: 'stomach',
    title: 'Шлунок',
    lead: 'Шлунок перемішує їжу з кислим соком і перетворює її на напіврідку масу — хімус.',
    points: [
      'Соляна кислота й пепсин починають розщеплення білків.',
      'Пілорус пропускає хімус у кишку невеликими порціями.',
      'Швидкість спорожнення залежить від складу й об’єму їжі; рідина проходить швидше за тверду їжу.'
    ],
    focus: ['stomach'],
    context: ['oesophagus', 'small-intestine-duodenum'],
    path: ['oesBottom', 'stomach', 'pylorus'],
    claimId: 'CLM-000050'
  },
  {
    id: 'duodenum',
    title: 'Дванадцятипала кишка',
    lead: 'Сюди надходять секрети з трьох органів поруч, і саме тут починається основне хімічне перетравлення.',
    points: [
      'Жовч утворює печінка, а жовчний міхур її накопичує. Ферментів у жовчі немає: солі жовчних кислот допомагають тримати жир дрібними краплями й переносять продукти його розщеплення до клітин кишки.',
      'Сік підшлункової залози нейтралізує кислоту бікарбонатом і містить ферменти для вуглеводів, жирів і білків; жир розщеплює ліпаза разом із коліпазою.'
    ],
    focus: ['small-intestine-duodenum'],
    context: ['liver', 'gallbladder', 'pancreas'],
    path: ['pylorus', 'duodenum'],
    claimId: 'CLM-000051'
  },
  {
    id: 'jejunum',
    title: 'Тонка кишка',
    lead: 'Головне місце всмоктування. Складки, ворсинки й мікроворсинки багаторазово збільшують площу поверхні.',
    points: [
      'Натрієвий градієнт, на якому працює SGLT1, підтримує Na⁺/K⁺-ATPаза, що витрачає ATP.',
      'У моделі тонка кишка після дванадцятипалої — один об’єкт: порожня й клубова кишка не розділені.'
    ],
    focus: ['small-intestine-jejunum'],
    context: ['small-intestine-duodenum'],
    path: ['duodenum', 'jejunum'],
    claimId: 'CLM-000022',
    zoom: {label: 'Зазирнути в ентероцит', href: './nutrition-inside.html?nutrient=glucose#nutrition-lab'}
  },
  {
    id: 'colon',
    title: 'Товста кишка',
    lead: 'Тут повертається вода й електроліти, а мікробіота працює з тим, що не перетравилося вище.',
    points: [
      'Бутират — одне з головних джерел енергії для клітин товстої кишки.',
      'Це найдовший етап шляху, і його тривалість дуже різниться між людьми.'
    ],
    focus: [
      'large-intestine-ascending-colon',
      'large-intestine-transverse-colon',
      'large-intestine-descending-colon',
      'large-intestine-sigmoid-colon'
    ],
    context: ['large-intestine-vermiform-appendix'],
    path: ['jejunum', 'ascending', 'transverse', 'descending', 'sigmoid'],
    claimId: 'CLM-000052'
  }
];

// Organs in the food route (the rest are neighbouring helpers).
export const foodPathTract = [
  'oesophagus', 'stomach', 'small-intestine-duodenum', 'small-intestine-jejunum',
  'large-intestine-ascending-colon', 'large-intestine-transverse-colon',
  'large-intestine-descending-colon', 'large-intestine-sigmoid-colon'
];

export const foodPathModelNodes = [
  ...foodPathTract, 'liver', 'gallbladder', 'pancreas', 'large-intestine-vermiform-appendix'
];

export const organNamesUA = {
  'oesophagus': 'Стравохід',
  'stomach': 'Шлунок',
  'liver': 'Печінка',
  'gallbladder': 'Жовчний міхур',
  'pancreas': 'Підшлункова залоза',
  'small-intestine-duodenum': 'Дванадцятипала кишка',
  'small-intestine-jejunum': 'Порожня + клубова кишка',
  'large-intestine-ascending-colon': 'Висхідна ободова',
  'large-intestine-transverse-colon': 'Поперечна ободова',
  'large-intestine-descending-colon': 'Низхідна ободова',
  'large-intestine-sigmoid-colon': 'Сигмоподібна',
  'large-intestine-vermiform-appendix': 'Апендикс'
};
