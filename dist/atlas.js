// Дані точок карт болю й тем плеча та коліна лежать в окремому модулі. Завантажуємо його з запасним варіантом: якщо він не завантажиться, плече й коліно покажуть
// лише довідкову частину, а безпековий текст хребта й решта зон (він статичний, див. комент. біля spineContent) працюватимуть, як і раніше.
const {painMaps,shoulderTopics,kneeTopics}=await import('./atlas-points.js?v=1').catch(()=>({painMaps:{},shoulderTopics:[],kneeTopics:[]}));

const zoneMeta={
 brain:{title:'Мозок',summary:'Сон, стрес, когнітивні функції, фізична активність і фактори, що впливають на роботу нервової системи.',state:'Готується',stateKey:'planned'},
 shoulder:{title:'Плечовий комплекс',summary:'Анатомія, найпоширеніші стани, навантаження, реабілітація та спосіб читати наукові дані без спрощення до «працює / не працює».',state:'Повний модуль',stateKey:'full'},
 spine:{title:'Хребет',summary:'Будова хребта за відділами, довідка про те, коли звернутися по медичну допомогу, та пов’язана практика. Без діагнозів і без висновків за точкою болю.',state:'Бета',stateKey:'beta'},
 muscles:{title:'М’язова система',summary:'Сила, гіпертрофія, відновлення, адаптація до навантаження та тренувальні змінні.',state:'Бета',stateKey:'beta'},
 gut:{title:'ШКТ',summary:'Травлення, мікробіом, харчування та взаємодія способу життя з шлунково-кишковою системою.',state:'Готується',stateKey:'planned'},
 knee:{title:'Колінний комплекс',summary:'Навантаження, біль, травми, повернення до активності та силове тренування — з розділенням різних клінічних сценаріїв.',state:'Бета',stateKey:'beta'}
};

const tabLabels={overview:'Огляд',anatomy:'Анатомія',symptoms:'Симптоми',training:'Тренування',rehab:'Реабілітація',research:'Дослідження'};

// Теми, що ще готуються (показуються згорнутою приміткою «Що ще готується» у «Мозку» й «ШКТ»).
const previewTopics={
 brain:[
  {title:'Сон і циркадні ритми',copy:'Як сон пов’язаний із когнітивними функціями, відновленням і поведінкою.',tag:'Сон · Мозок'},
  {title:'Стрес і когнітивне навантаження',copy:'Майбутній модуль про стресову відповідь, увагу та прийняття рішень.',tag:'Стрес · Когніція'},
  {title:'Фізична активність і мозок',copy:'Окремий напрям про рух, тренування та нервову систему.',tag:'Рух · Нервова система'},
  {title:'Кофеїн і увага',copy:'Механізми, продуктивність, сон і межі практичної інтерпретації.',tag:'Кофеїн · Увага'}
 ],
 gut:[
  {title:'Травлення',copy:'Від прийому їжі до засвоєння: базова фізіологія та практичні питання.',tag:'Фізіологія · Харчування'},
  {title:'Мікробіом',copy:'Що реально відомо про мікробіоту, асоціації та межі причинних висновків.',tag:'Мікробіом · Докази'},
  {title:'Клітковина',copy:'Типи харчових волокон, переносимість та контекст раціону.',tag:'Раціон · ШКТ'},
  {title:'Харчові тригери',copy:'Як відрізняти індивідуальну переносимість від універсальних заборон.',tag:'Симптоми · Раціон'}
 ]
};

const esc=text=>String(text).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const arrow='<svg class="atlas-topic-arrow" aria-hidden="true"><use href="#ai-next"/></svg>';
const pointTitle=(zone,id)=>painMaps[zone]?.points.find(point=>point.id===id)?.title||'';


// Картка теми карти болю: уся картка натискна (розтягнута кнопка), чип каже, до якої точки вона веде.
function pointCard(zone,topic,{className='',attrs='',icon=''}={}){
 const target=topic.point?pointTitle(zone,topic.point):'';
 const name=topic.point?`<button type="button" data-goto-point="${zone}:${topic.point}" aria-label="${esc(topic.title)}: показати на карті болю">${topic.title}</button>`:topic.title;
 const chip=topic.point?`<span class="atlas-topic-tag atlas-topic-goes">На карті: ${target}</span>${arrow}`:'<span class="atlas-topic-tag atlas-topic-goes atlas-topic-goes--none">Окремої точки на карті немає</span>';
 return `<article class="atlas-topic ${className} ${topic.point?'atlas-topic--link':'atlas-topic--plain'}"${attrs}>${icon}<div><h3>${name}</h3><p>${topic.copy}</p></div>${chip}</article>`;
}
function shoulderTopicCards(){return shoulderTopics.map((topic,index)=>pointCard('shoulder',topic,{className:'atlas-shoulder-topic',attrs:` data-shoulder-art="${index+1}"`,icon:'<div class="atlas-topic-icon" aria-hidden="true"></div>'})).join('');}
function kneeTopicCards(){return kneeTopics.map(topic=>pointCard('knee',topic)).join('');}

const shoulderContent={
 overview:()=>`${shoulderTopicCards()}<details class="atlas-copy-card atlas-reading-note"><summary>Як читати цей модуль</summary><p>Плече — перша повністю розгорнута область Атласу. Тут ми не намагаємося поставити діагноз за точкою болю. Мета — показати структуру знань: що це за область, які питання виникають найчастіше, що варто перевіряти і де закінчується впевненість доказів.</p></details>`,
 anatomy:()=>`<div class="atlas-copy-card"><h3>Анатомія як карта, а не діагноз</h3><p>Плечовий комплекс включає гленогумеральний, акроміально-ключичний і грудино-ключичний суглоби, лопатково-грудну взаємодію, ротаторну манжету та велику кількість м’язів і сухожиль.</p><ul><li>Структура допомагає зрозуміти функцію.</li><li>Зміни на візуалізації не завжди пояснюють біль.</li><li>Оцінка руху й навантаження потребує контексту.</li></ul></div>`,
 symptoms:()=>`<div class="atlas-copy-card"><h3>Симптоми — це початок питання</h3><p>Локалізація болю, провокуючі рухи, травматичний механізм, слабкість, нічний біль та зміни функції можуть спрямувати оцінку, але не замінюють клінічного обстеження.</p><ul><li>Гостра травма з вираженою втратою функції потребує окремої оцінки.</li><li>Одна провокативна проба рідко дає надійний діагноз сама по собі.</li><li>Навантажувальна толерантність змінюється з часом.</li></ul></div>`,
 training:()=>`<div class="atlas-copy-card"><h3>Тренування плеча</h3><p>Evidence UA розглядає тренування через кероване навантаження, доступний діапазон руху, прогресію обсягу та інтенсивності, а не через універсальний список «безпечних» і «небезпечних» вправ.</p><ul><li>Силові вправи можуть бути частиною профілактики й відновлення.</li><li>Біль під час руху оцінюється разом із реакцією після навантаження.</li><li>Прогресія залежить від задачі людини та попереднього рівня.</li></ul><p><a href="./exercises.html?region=shoulder">Вправи для плеча в Бібліотеці вправ →</a></p></div>`,
 rehab:()=>`<div class="atlas-copy-card"><h3>Реабілітація</h3><p>Базова логіка — повернути функцію й толерантність до необхідних навантажень. Конкретний план залежить від стану, тяжкості, часу після травми, вимог спорту чи роботи та супутніх факторів.</p><ul><li>Освіта та керування навантаженням.</li><li>Поступова силова робота.</li><li>Відновлення специфічних для задачі рухів.</li></ul></div>`,
 research:()=>`<div class="atlas-copy-card"><h3>Як тут з’являються докази</h3><p>Кожен завершений матеріал Atlas має розділяти висновок, рівень впевненості, практичну інтерпретацію та першоджерела. Ми не використовуємо декоративний «відсоток ефективності».</p><ul><li>Систематичні огляди та клінічні рекомендації — для широкої картини.</li><li>RCT та спостережні роботи — для конкретних питань.</li><li>Обмеження й невизначеність показуються поруч із висновком.</li></ul></div>`
};

const kneeContent={
 overview:()=>`<div class="atlas-copy-card"><h3>Коліно — другий модуль Атласу</h3><p>Колінний біль не є однією нозологією. У бета-модулі ми розділяємо пателофеморальний біль, меніски, зв’язки, сухожилки та остеоартроз, щоб не змішувати різні механізми, прогнози й задачі реабілітації.</p></div>${kneeTopicCards()}`,
 anatomy:()=>`<div class="atlas-copy-card"><h3>Анатомія коліна</h3><p>Колінний комплекс поєднує тибіофеморальний і пателофеморальний суглоби, меніски, зв’язки, сухожилки та м’язові групи, що керують навантаженням.</p><ul><li>Меніски беруть участь у розподілі навантаження та стабільності.</li><li>ACL є важливим елементом пасивної стабільності коліна.</li><li>Квадрицепс і м’язи задньої поверхні стегна суттєво впливають на функцію.</li></ul></div>`,
 symptoms:()=>`<div class="atlas-copy-card"><h3>Симптоми потребують контексту</h3><p>Передній, медіальний або латеральний біль, набряк, нестабільність і обмеження руху мають різне значення залежно від механізму появи, тривалості та функціональних вимог.</p><ul><li>Локалізація болю сама по собі не встановлює діагноз.</li><li>Після гострої травми важливі механізм, набряк, функція та стабільність.</li><li>Структурні зміни на зображеннях інтерпретують разом із симптомами.</li></ul></div>`,
 training:()=>`<div class="atlas-copy-card"><h3>Тренування коліна</h3><p>Основна ідея — не уникати руху як категорії, а керувати дозою навантаження відповідно до конкретної задачі та реакції тканин і симптомів.</p><ul><li>Прогресія може включати силу, контроль, швидкість і специфічні спортивні задачі.</li><li>Глибина руху та зовнішнє навантаження змінюються поступово.</li><li>Оцінюється не лише відчуття під час вправи, а й реакція після неї.</li></ul></div>`,
 rehab:()=>`<div class="atlas-copy-card"><h3>Реабілітація коліна</h3><p>План залежить від конкретного стану: пателофеморальний біль, травма ACL, меніск, тендинопатія та остеоартроз не повинні мати одну універсальну програму.</p><ul><li>Цілі формують від побутової функції до бігу, стрибків або спорту.</li><li>Силову роботу й функціональні задачі прогресують за переносимістю.</li><li>Повернення до активності оцінюють за функцією, а не лише календарем.</li></ul></div>`,
 research:()=>`<div class="atlas-copy-card"><h3>Докази для коліна</h3><p>Бета-модуль уже розділяє клінічні сценарії, але кожна тема отримає власний набір джерел, рівень впевненості й окремі практичні висновки.</p><ul><li>Для пателофеморального болю окремо розглядаємо активну реабілітацію та освіту.</li><li>Для менісків і ACL розділяємо травматичні сценарії, хірургічні та нехірургічні шляхи.</li><li>Для остеоартрозу оцінюємо функцію, фізичну активність, симптоми й довгострокове ведення.</li></ul></div>`
};

function topicLinks(items){return items.map(item=>`<article class="atlas-topic atlas-topic--link"><div><h3><a href="${item.href}">${item.title}</a></h3><p>${item.copy}</p></div><span class="atlas-topic-tag">${item.tag}</span>${arrow}</article>`).join('');}

// «М’язи» is a navigation beta: it links existing Evidence UA materials and the exercise library and adds no new scientific claims.
const musclesContent={
 overview:()=>`<div class="atlas-copy-card"><h3>Як читати цей модуль</h3><p>«М’язова система» — навігаційна зона Атласу. Вона не ставить діагнозів і не дає персональних порад: збирає в одному місці навчальні матеріали Evidence UA про будову м’яза, його роботу в русі та практику. Науковий перегляд цих матеріалів ще не завершено.</p></div>${topicLinks([
  {title:'Muscle Lab: від м’яза до молекул',copy:'Будова м’яза, скорочення, ріст і атрофія.',href:'./muscle-lab.html#explorer',tag:'Будова'},
  {title:'Ролі м’язів у русі',copy:'Як м’язи працюють разом: агоністи, синергісти й антагоністи.',href:'./movement.html#muscle-team',tag:'Рух'},
  {title:'Бібліотека вправ',copy:'Практика, пов’язана з анатомією та Атласом. Поради поки що редакційна чернетка.',href:'./exercises.html',tag:'Практика'}
 ])}`,
 anatomy:()=>`<div class="atlas-copy-card"><h3>Від м’яза до молекул</h3><p>Muscle Lab показує рівні організації: від тканини й пучка до волокна, міофібрили та саркомера. Оберіть рівень:</p></div>${topicLinks([
  {title:'Від м’яза до молекул',copy:'Інтерактивна будова скелетного м’яза.',href:'./muscle-lab.html#explorer',tag:'Будова'},
  {title:'М’язове волокно',copy:'Клітина м’яза та її складові.',href:'./muscle-lab.html?structure=CELL-MUSCLE#explorer',tag:'Волокно'},
  {title:'Скорочення м’яза',copy:'Як працює скорочення на рівні білків.',href:'./muscle-lab.html#contraction',tag:'Скорочення'},
  {title:'Ролі м’язів: агоністи, синергісти, антагоністи',copy:'Спільна робота м’язів у русі.',href:'./movement.html#muscle-team',tag:'Рух'}
 ])}`,
 training:()=>`<div class="atlas-copy-card"><h3>Тренування та практика</h3><p>Evidence UA розділяє три шари: опис руху й анатомію, редакційні поради та наукові твердження про результат. Вправи нижче — редакційна чернетка: вони не обіцяють результату й не замінюють оцінку фахівця.</p><ul><li>Ріст м’яза як процес: <a href="./muscle-lab.html#growth">Muscle Lab · Ріст м’яза</a>.</li></ul></div><div class="atlas-practice" data-related-practice="muscles"><p class="atlas-practice-status">Завантаження списку вправ…</p></div>`,
 research:()=>`<div class="atlas-copy-card"><h3>Джерела й межі</h3><p>Для цієї зони рівні впевненості ще не оцінено: науковий перегляд матеріалів Muscle Lab і Movement Lab не завершено. Джерела та межі пояснень — у самих модулях:</p><ul><li><a href="./muscle-lab.html#sources">Muscle Lab · Джерела та межі пояснень</a></li><li><a href="./movement.html#sources">Movement Lab · Джерела та межі моделі</a></li></ul></div>`
};

function topicTabs(items){return items.map(item=>`<article class="atlas-topic atlas-topic--link"><div><h3><button type="button" class="atlas-link-button" data-goto-tab="${item.tab}">${item.title}</button></h3><p>${item.copy}</p></div><span class="atlas-topic-tag">${item.tag}</span>${arrow}</article>`).join('');}

// «Хребет» is a Beta navigation zone (Stage 0 in docs/SPINE_AND_PERSONAL_GUIDANCE_BACKLOG.md). Safety text is static on purpose:
// it must never depend on a lazy module. No pain map, no causes by location, no exercises chosen from a pointed spot.
const spineContent={
 overview:()=>`<div class="atlas-copy-card"><h3>Як читати цей модуль</h3><p>«Хребет» — навігаційна зона Атласу. Вона пояснює будову за відділами й підказує, коли слід звернутися по медичну допомогу. Вона не ставить діагнозів і не пов’язує біль у певній точці з конкретною причиною: місце болю не завжди збігається з його джерелом.</p><p class="atlas-muted">Тексти — редакційна чернетка: їх ще не переглянув лікар чи фізіотерапевт.</p></div><div class="atlas-alert"><strong>Спершу про безпеку.</strong><p>Є ознаки, за яких не слід чекати чи займатися самостійно. Перегляньте розділ <button type="button" class="atlas-link-button" data-goto-tab="symptoms">«Коли звернутися по медичну допомогу»</button>.</p></div>${topicTabs([
  {title:'Будова за відділами',copy:'Шийний, грудний, поперековий відділи, крижі та куприк: коротка довідка й схематична 3D-модель.',tab:'anatomy',tag:'Анатомія'},
  {title:'Коли звернутися по медичну допомогу',copy:'Ознаки, за яких потрібна оцінка лікаря, і як обрати фахівця.',tab:'symptoms',tag:'Безпека'},
  {title:'Пов’язана практика',copy:'Вправи з Бібліотеки вправ як освітні приклади, не як призначення.',tab:'training',tag:'Практика'}
 ])}`,
 anatomy:()=>`<div data-spine-hub class="atlas-practice"><p class="atlas-practice-status">Завантаження розділу…</p></div>`,
 symptoms:()=>`<div class="atlas-alert"><h3>Коли звернутися по медичну допомогу</h3><p>Більшість епізодів болю в спині не пов’язані з небезпечними станами, але є ознаки, за яких не слід чекати чи займатися самостійно. Зверніться до лікаря, а за вираженого погіршення викличте швидку допомогу:</p><ul><li>нове оніміння або слабкість у ногах чи руках, що наростає;</li><li>оніміння в ділянці промежини, нетримання або утруднення сечовипускання чи дефекації;</li><li>сильний біль після травми (падіння, удару, аварії);</li><li>біль разом із підвищеною температурою або іншими ознаками інфекції;</li><li>незрозуміла втрата ваги або онкологічне захворювання в минулому;</li><li>сильний біль, який не вщухає в спокої, посилюється вночі або швидко наростає;</li><li>біль у грудях чи утруднене дихання разом із болем у спині.</li></ul><p class="atlas-muted">Це не повний перелік і не діагностика. Матеріал — редакційна чернетка для перегляду фахівцем.</p></div><div class="atlas-copy-card"><h3>Точка болю не дорівнює джерелу болю</h3><p>Біль у спині може відчуватися не там, де його причина, а схожий біль можуть давати різні стани. Тому ця зона не пропонує вибрати точку болю й не підказує діагноз.</p></div><div class="atlas-copy-card"><h3>Як обрати фахівця</h3><p>За потреби зверніться до лікаря (сімейного, невролога, ортопеда) або до ліцензованого фізіотерапевта. Перевірте ліцензію та досвід у вашій ситуації.</p></div>`,
 training:()=>`<div class="atlas-alert"><strong>Спершу про безпеку.</strong><p>Перед будь-якими вправами перегляньте <button type="button" class="atlas-link-button" data-goto-tab="symptoms">«Коли звернутися по медичну допомогу»</button>.</p></div><div class="atlas-copy-card"><h3>Практика</h3><p>Нижче — вправи з Бібліотеки вправ як освітні приклади для цієї зони. Це не персональні призначення: вони не підбираються за місцем болю, не обіцяють результату й не замінюють оцінку фахівця. Поради до вправ — редакційна чернетка.</p></div><div class="atlas-practice" data-related-practice="spine"><p class="atlas-practice-status">Завантаження списку вправ…</p></div>`
};

// Для зон без власного модуля («Готується») заглушок на кожну вкладку більше немає (рішення власника 2026-11-10, п. 3): одна вкладка «Огляд» з посиланнями
// на наші справжні матеріали на близькі теми. Описи взято з метаопису самих сторінок, нових тверджень тут немає.
const relatedMaterials={
 brain:[
  {title:'Сон і відновлення',copy:'Як влаштований сон, що відомо про недосипання й фізичну працездатність та які звички допомагають створити умови для сну.',href:'./sleep.html',tag:'Сон'},
  {title:'Кофеїн: як це працює',copy:'Коротка анімована схема «Чому кава бадьорить: кофеїн і аденозин». Це схема, а не вимірювання.',href:'./mechanisms.html#caffeine',tag:'Схема'},
  {title:'Кофеїн: розбір',copy:'Наукові пояснення, джерела, практичні орієнтири та обмеження.',href:'./index.html#supplement-caffeine',tag:'Добавки'}
 ],
 gut:[
  {title:'Шлях їжі: травлення у 3D',copy:'3D-модель травного тракту: як їжа проходить від стравоходу до товстої кишки, з джерелами для кожного твердження.',href:'./nutrition-digestion.html',tag:'3D-модель'},
  {title:'Харчування зсередини',copy:'Від їжі до клітини: інтерактивний шлях нутрієнтів — перетравлення, всмоктування та подальший транспорт.',href:'./nutrition-inside.html',tag:'Фізіологія'}
 ]
};

function plannedOverview(zone){
 const meta=zoneMeta[zone],planned=previewTopics[zone]||[];
 return `<div class="atlas-copy-card"><h3>${meta.title}: власного модуля ще немає</h3><p>Ми не підміняємо відсутній розбір короткими універсальними порадами. Поки що тут лише посилання на наші матеріали на близькі теми: вони не є частиною Атласу й мають власні статуси перегляду.</p></div><h3 class="atlas-group-title">Уже є на сайті</h3>${topicLinks(relatedMaterials[zone]||[])}<details class="atlas-copy-card atlas-reading-note"><summary>Що ще готується</summary><ul class="atlas-planned-list">${planned.map(topic=>`<li><strong>${topic.title}</strong>: ${topic.copy}</li>`).join('')}</ul></details>`;
}

// Які вкладки має кожна зона. Вкладки без змісту не показуємо (раніше було 14 однакових заглушок із 36 екранів).
const zoneContent={
 shoulder:shoulderContent,
 knee:kneeContent,
 spine:spineContent,
 muscles:musclesContent,
 brain:{overview:()=>plannedOverview('brain')},
 gut:{overview:()=>plannedOverview('gut')}
};
const TAB_ORDER=['overview','anatomy','symptoms','training','rehab','research'];
const MAP_ZONES=new Set(['shoulder','knee']);
const tabsOf=zone=>TAB_ORDER.filter(tab=>typeof zoneContent[zone]?.[tab]==='function');

const zoneButtons=[...document.querySelectorAll('[data-zone]')];
const tabs=[...document.querySelectorAll('[data-atlas-tab]')];
const viewButtons=[...document.querySelectorAll('[data-atlas-view]')];
const figurePanel=document.querySelector('.atlas-figure-panel');
const detail=document.getElementById('atlas-detail');
const title=document.getElementById('atlas-zone-title');
const summary=document.getElementById('atlas-zone-summary');
const status=document.getElementById('atlas-zone-status');
const content=document.getElementById('atlas-content');
const tablist=document.getElementById('atlas-tablist');
const statusLine=document.getElementById('atlas-status');
const breadcrumbZone=document.getElementById('atlas-breadcrumb-zone');
const breadcrumbTab=document.getElementById('atlas-breadcrumb-tab');
const DEFAULT_ZONE='shoulder';
const hasZone=zone=>typeof zone==='string'&&Object.prototype.hasOwnProperty.call(zoneMeta,zone);
let selectedZone=DEFAULT_ZONE;
let selectedTab='overview';
let currentPoint=null;

// Стан у адресі: ?zone=knee&tab=symptoms&point=medial-joint-line. Перехід до іншої зони додає запис в історію («Назад» повертає до попередньої зони),
// вкладки й точки лише оновлюють адресу. Чужі параметри (наприклад, utm) не чіпаємо.
function readLocation(){
 const params=new URLSearchParams(location.search);
 const zone=hasZone(params.get('zone'))?params.get('zone'):DEFAULT_ZONE;
 const tab=tabsOf(zone).includes(params.get('tab'))?params.get('tab'):'overview';
 return {zone,tab,point:params.get('point')||null};
}
function writeLocation(mode){
 const next=new URL(location.href);
 next.searchParams.set('zone',selectedZone);
 if(selectedTab!=='overview')next.searchParams.set('tab',selectedTab);else next.searchParams.delete('tab');
 if(currentPoint)next.searchParams.set('point',currentPoint);else next.searchParams.delete('point');
 if(next.href===location.href)return;
 try{history[mode==='push'?'pushState':'replaceState'](null,'',next);}catch{}
}
{const initial=readLocation();selectedZone=initial.zone;selectedTab=initial.tab;currentPoint=initial.point;}

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const stacked=matchMedia('(max-width: 900px)');
function say(text){if(!statusLine)return;statusLine.textContent='';requestAnimationFrame(()=>{statusLine.textContent=text;});}
// На вузьких екранах панель зони стоїть під фігурою: після дотику до піна чи точки болю прокручуємо до результату,
// інакше змінюється те, чого людина не бачить (виміряно в аудиті 2026-11-10: на 390 і 360 px 0 px результату в кадрі).
function revealDetail(){
 if(!stacked.matches||!detail)return;
 const top=detail.getBoundingClientRect().top;
 if(top>=0&&top<innerHeight*.55)return;
 detail.scrollIntoView({block:'start',behavior:reduceMotion.matches?'auto':'smooth'});
}
function backToFigure(){
 if(!figurePanel)return;
 figurePanel.scrollIntoView({block:'start',behavior:reduceMotion.matches?'auto':'smooth'});
 const target=figurePanel.querySelector('.atlas-zone.is-selected:not([hidden])')||figurePanel.querySelector('[data-shoulder-return]:not([hidden]),[data-knee-return]:not([hidden])');
 target?.focus({preventScroll:true});
}

function markupFor(zone,tab){return zoneContent[zone][tab]();}

let spineHub=null;
async function hydrateSpineHub(){
 const box=content.querySelector('[data-spine-hub]');
 if(!box)return;
 try{
  const module=await import('./atlas-spine.js?v=2');
  if(!box.isConnected||selectedZone!=='spine')return;
  spineHub=module.mountSpineHub(box);
 }catch{
  if(!box.isConnected)return;
  const note=document.createElement('p');
  note.textContent='Не вдалося завантажити інтерактивний розділ. Відділи хребта: шийний (C1–C7), грудний (T1–T12), поперековий (L1–L5), крижі та куприк.';
  box.replaceChildren(note);
 }
}

async function hydrateRelatedPractice(){
 const box=content.querySelector('[data-related-practice]');
 if(!box)return;
 const zone=box.dataset.relatedPractice;
 const library=()=>{const p=document.createElement('p');p.className='atlas-practice-more';const a=document.createElement('a');a.href='./exercises.html';a.textContent='Відкрити всю бібліотеку вправ →';p.append(a);return p;};
 try{
  const {exercises,contentTypes}=await import('./exercises-data.js?v=4');
  if(!box.isConnected||selectedZone!==zone)return;
  const related=exercises.filter(item=>item.atlasZones.includes(zone));
  const heading=document.createElement('h3');heading.textContent='Пов’язані вправи';
  const list=document.createElement('ul');list.className='atlas-practice-list';
  for(const item of related){
   const li=document.createElement('li');
   const link=document.createElement('a');link.href=`./exercises.html?e=${encodeURIComponent(item.slug)}`;link.textContent=item.titleUk;
   const kind=document.createElement('span');kind.textContent=` · ${contentTypes[item.contentType]||item.contentType}`;
   li.append(link,kind);list.append(li);
  }
  box.replaceChildren(heading,list,library());
 }catch{
  if(box.isConnected)box.replaceChildren(library());
 }
}

// «Стан атласу» збирається з тих самих даних, що статуси зон (zoneMeta) і підписи пінів.
function renderState(){
 const list=document.querySelector('#atlas-state .atlas-state-list');
 if(!list)return;
 const names=Object.fromEntries(zoneButtons.map(button=>[button.dataset.zone,button.getAttribute('aria-label')]));
 const groups=[['full','Повний модуль'],['beta','Бета'],['planned','Готується']];
 list.innerHTML=groups.map(([key,label])=>{
  const zones=Object.keys(zoneMeta).filter(zone=>zoneMeta[zone].stateKey===key&&zoneMeta[zone].state===label);
  return zones.length?`<div data-state="${key}"><dt>${label}</dt><dd>${zones.map(zone=>names[zone]||zoneMeta[zone].title).join(' · ')}</dd></div>`:'';
 }).join('');
}

function render({user=false}={}){
 const meta=zoneMeta[selectedZone];
 const available=tabsOf(selectedZone);
 if(!available.includes(selectedTab))selectedTab='overview';
 detail.dataset.zoneArt=selectedZone;
 title.textContent=meta.title;summary.textContent=meta.summary;status.textContent=meta.state;status.dataset.state=meta.stateKey;
 breadcrumbZone.textContent=meta.title;breadcrumbTab.textContent=tabLabels[selectedTab];
 zoneButtons.forEach(button=>{const active=button.dataset.zone===selectedZone;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
 // Вкладка з'являється лише там, де в неї є зміст; одну вкладку «Огляд» окремо не показуємо.
 tabs.forEach(button=>{
  const has=available.includes(button.dataset.atlasTab),on=has&&button.dataset.atlasTab===selectedTab;
  button.hidden=!has;button.disabled=false;
  button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;
 });
 tablist.hidden=available.length<2;tablist.dataset.count=String(available.length);
 if(available.length<2){content.removeAttribute('role');content.removeAttribute('aria-labelledby');}
 else{content.setAttribute('role','tabpanel');content.setAttribute('aria-labelledby',`atlas-tab-${selectedTab}`);}
 content.classList.add('is-changing');
 spineHub?.dispose();spineHub=null;
 content.innerHTML=markupFor(selectedZone,selectedTab);
 requestAnimationFrame(()=>content.classList.remove('is-changing'));
 hydrateRelatedPractice();
 hydrateSpineHub();
 if(user)say(`Обрано: ${meta.title}${available.length>1?` · ${tabLabels[selectedTab]}`:''}`);
}

content.addEventListener('click',event=>{
 const jump=event.target.closest('[data-goto-tab]');
 if(jump){const target=tabs.find(button=>button.dataset.atlasTab===jump.dataset.gotoTab);if(target){target.click();target.focus();}return;}
 const toPoint=event.target.closest('[data-goto-point]');
 if(toPoint){
  const [zone,point]=toPoint.dataset.gotoPoint.split(':');
  if(!hasZone(zone))return;
  selectedZone=zone;selectedTab='overview';currentPoint=point;
  render({user:false});
  document.dispatchEvent(new CustomEvent('atlas:goto-point',{detail:{zone,point}}));
  return;
 }
 const back=event.target.closest('[data-atlas-topics]');
 if(back){
  const zone=selectedZone,last=currentPoint;
  document.dispatchEvent(new CustomEvent('atlas:clear-point',{detail:{zone}}));
  currentPoint=null;selectedTab='overview';render({user:false});writeLocation('replace');
  content.querySelector(`[data-goto-point="${zone}:${last}"]`)?.focus({preventScroll:true});
 }
});
zoneButtons.forEach(button=>button.addEventListener('click',()=>{
 selectedZone=button.dataset.zone;selectedTab='overview';currentPoint=null;
 render({user:true});writeLocation('push');
 if(!MAP_ZONES.has(selectedZone))revealDetail();
}));
tabs.forEach(button=>{
 button.addEventListener('click',()=>{selectedTab=button.dataset.atlasTab;currentPoint=null;render({user:false});writeLocation('replace');});
 button.addEventListener('keydown',event=>{
  const visible=tabs.filter(item=>!item.hidden),index=visible.indexOf(button);
  const target={ArrowRight:visible[(index+1)%visible.length],ArrowLeft:visible[(index-1+visible.length)%visible.length],Home:visible[0],End:visible[visible.length-1]}[event.key];
  if(!target)return;
  event.preventDefault();target.focus();
 });
});
viewButtons.forEach(button=>button.addEventListener('click',()=>{
 figurePanel.dataset.bodyView=button.dataset.atlasView;
 viewButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
}));
document.querySelector('[data-atlas-to-figure]')?.addEventListener('click',backToFigure);

// Карти болю повідомляють про вибір точки (atlas:point), а адреса й історія приходять сюди ж (popstate).
document.addEventListener('atlas:point',event=>{
 const {zone,point,title:pointName,user}=event.detail||{};
 if(zone!==selectedZone)return;
 currentPoint=point||null;
 if(point)selectedTab='overview';
 writeLocation('replace');
 if(user&&point){say(`Обрано точку: ${pointName}`);revealDetail();}
});
window.addEventListener('popstate',()=>{
 const state=readLocation();
 selectedZone=state.zone;selectedTab=state.tab;currentPoint=state.point;
 render({user:false});
 document.dispatchEvent(new CustomEvent('atlas:state',{detail:state}));
});

document.addEventListener('DOMContentLoaded',()=>{
 const actions=document.querySelector('body > .eua-platform-nav');
 if(actions)document.getElementById('atlas-actions').append(actions);
 // The shell also sees the headers in the hidden pain maps. Only the page's navigation belongs here.
 document.querySelectorAll('#knee-pain-map > .eua-platform-nav, #shoulder-pain-map > .eua-platform-nav')
  .forEach(nav=>nav.remove());
},{once:true});
renderState();
render();
// Карти болю (knee-pain-map.js, shoulder-pain-map.js) завантажуються окремими скриптами й можуть завершитись раніше за цей або пізніше. Після першого показу ще раз повідомляємо їм стан з адреси:
// інакше «?zone=knee» не відкривав би карту, а «?point=…» залежав би від порядку завантаження (огляд зони затирав картку точки). Повторне застосування стану нешкідливе.
document.dispatchEvent(new CustomEvent('atlas:state',{detail:{zone:selectedZone,point:currentPoint}}));
