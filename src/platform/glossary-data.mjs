const movements={label:'Типи рухів · OpenStax',href:'https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements'};
const muscles={label:'Взаємодія м’язів · OpenStax',href:'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems'};
const mechanics={label:'Момент сили · OpenStax',href:'https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium'};
const stages={label:'Стадії сну · NIH/NHLBI',href:'https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep'};
const rhythm={label:'Цикл сну й неспання · NIH/NHLBI',href:'https://www.nhlbi.nih.gov/health/sleep/sleep-wake-cycle'};

// Teaching definitions are separate from assessed Claims and scientific review records.
export const glossary={
 movement:[
  {id:'flexion',title:'Згинання',definition:'Для ліктя й коліна — рух, який зменшує кут між кістками.',example:'Коли підносиш долоню до плеча, лікоть згинається.',source:movements},
  {id:'extension',title:'Розгинання',definition:'Для ліктя й коліна — рух, який збільшує кут між кістками, випрямляючи суглоб.',example:'Повернення зі зігнутого ліктя до прямої руки — розгинання.',source:movements},
  {id:'abduction',title:'Відведення',definition:'Для руки чи ноги — рух убік від середньої лінії тіла.',example:'Підняти руку вбік від тулуба — відведення плеча.',source:movements},
  {id:'adduction',title:'Приведення',definition:'Для руки чи ноги — рух до середньої лінії тіла.',example:'Опустити відведену руку назад до тулуба — приведення.',source:movements},
  {id:'lever-arm',title:'Плече сили',definition:'Найкоротша, перпендикулярна відстань від осі обертання до лінії дії сили. Це не завжди довжина кінцівки.',example:'На нашій горизонтальній схемі сила тяжіння спрямована вниз, тому її плече дорівнює горизонтальній відстані від осі до вантажу.',source:mechanics},
  {id:'moment',title:'Момент сили',definition:'Міра обертальної дії сили відносно обраної осі: сила × її перпендикулярне плече. Одиниця — Н·м. Це не сама сила.',example:'Двері легше повернути тією самою перпендикулярною силою, якщо штовхати далі від петель.',source:mechanics},
  {id:'agonist',title:'Агоніст',definition:'М’яз, який виконує основну роль у вибраному русі. Назва стосується дії, а не постійної властивості м’яза.',example:'Згиначі ліктя виступають агоністами при його згинанні.',source:muscles},
  {id:'antagonist',title:'Антагоніст',definition:'М’яз із дією, протилежною вибраному руху. Він також може допомагати контролювати рух і положення.',example:'Триголовий м’яз розгинає лікоть, тому є антагоністом щодо згинання.',source:muscles},
  {id:'synergist',title:'Синергіст',definition:'М’яз, який допомагає основному виконавцю вибраного руху.',example:'Кілька згиначів ліктя можуть спільно виконувати одне завдання.',source:muscles},
  {id:'fixator',title:'Стабілізатор',definition:'У цьому поясненні — м’яз, який утримує ділянку тіла, створюючи опору для дії інших м’язів.',example:'Фіксація ділянки прикріплення допомагає іншому м’язу виконати рух.',source:muscles}
 ],
 sleep:[
  {id:'nrem',title:'NREM',definition:'Сон без швидких рухів очей. Охоплює три стадії: N1, N2 та N3; їх розрізняють за записами активності мозку.',example:'Глибокий сон N3 — одна зі стадій NREM, а не весь NREM.',source:stages},
  {id:'rem',title:'REM',definition:'Фаза сну зі швидкими рухами очей, активною роботою мозку та зниженим тонусом багатьох м’язів.',example:'REM повторюється протягом ночі; зазвичай його більше ближче до ранку.',source:stages},
  {id:'circadian',title:'Циркадний ритм',definition:'Внутрішній ритм із періодом близько 24 годин. Світло й темрява допомагають узгоджувати його з довкіллям.',example:'Час доби впливає на готовність до сну, навіть якщо однаково довго не спати.',source:rhythm},
  {id:'sleep-pressure',title:'Тиск сну',definition:'Потреба у сні, яка зростає під час тривалого неспання. Це інший процес, ніж добовий ритм, хоча вони взаємодіють.',example:'Після довшого неспання потреба у сні зростає; кофеїн може тимчасово змінювати відчуття сонливості.',source:rhythm}
 ]
};
