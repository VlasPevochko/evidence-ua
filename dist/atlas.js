const zoneMeta={
 brain:{title:'Мозок',summary:'Сон, стрес, когнітивні функції, фізична активність і фактори, що впливають на роботу нервової системи.',state:'Готується',stateKey:'planned'},
 shoulder:{title:'Плечовий комплекс',summary:'Анатомія, найпоширеніші стани, навантаження, реабілітація та спосіб читати наукові дані без спрощення до «працює / не працює».',state:'Повний модуль',stateKey:'full'},
 spine:{title:'Хребет',summary:'Будова хребта за відділами, довідка про те, коли звернутися по медичну допомогу, та пов’язана практика. Без діагнозів і без висновків за точкою болю.',state:'Бета',stateKey:'beta'},
 muscles:{title:'М’язова система',summary:'Сила, гіпертрофія, відновлення, адаптація до навантаження та тренувальні змінні.',state:'Бета',stateKey:'beta'},
 gut:{title:'ШКТ',summary:'Травлення, мікробіом, харчування та взаємодія способу життя з шлунково-кишковою системою.',state:'Готується',stateKey:'planned'},
 knee:{title:'Колінний комплекс',summary:'Навантаження, біль, травми, повернення до активності та силове тренування — з розділенням різних клінічних сценаріїв.',state:'Бета',stateKey:'beta'}
};

const tabLabels={overview:'Огляд',anatomy:'Анатомія',symptoms:'Симптоми',training:'Тренування',rehab:'Реабілітація',research:'Дослідження'};

const shoulderTopics=[
 {title:'Ротаторна манжета',copy:'Функції, поширені проблеми, навантаження, реабілітація та доказові підходи.',tag:'Анатомія · Біль · Навантаження'},
 {title:'Субакроміальний біль',copy:'Чому один лише простір під акроміоном не пояснює симптоми та як мислити про навантаження.',tag:'Симптоми · Реабілітація'},
 {title:'Нестабільність плеча',copy:'Типи нестабільності, фактори ризику та логіка повернення до навантаження.',tag:'Стабільність · Травми'},
 {title:'Біцепс',copy:'Довга головка біцепса, сухожилок, провокація симптомів і силове навантаження.',tag:'Анатомія · Сухожилки'},
 {title:'AC-суглоб',copy:'Акроміально-ключичний суглоб: навантаження, біль і контекст травми.',tag:'Біль · Травми'}
];

const kneeTopics=[
 {title:'Пателофеморальний біль',copy:'Біль навколо або позаду надколінка, толерантність до навантаження та роль активної реабілітації.',tag:'Біль · Навантаження'},
 {title:'Меніски',copy:'Травматичні й дегенеративні сценарії, симптоми, функція та різні шляхи ведення.',tag:'Травми · Функція'},
 {title:'ACL',copy:'Передня хрестоподібна зв’язка: травма, стабільність, відновлення функції та повернення до спорту.',tag:'Зв’язки · Спорт'},
 {title:'Сухожилок надколінка',copy:'Навантажувальна толерантність сухожилка, силова робота та поступове повернення до стрибкових задач.',tag:'Сухожилки · Навантаження'},
 {title:'Остеоартроз коліна',copy:'Симптоми, функціональні можливості, фізична активність і місце силового навантаження в довгостроковому веденні.',tag:'Суглоб · Активність'}
];

const previewTopics={
 brain:[
  {title:'Сон і циркадні ритми',copy:'Як сон пов’язаний із когнітивними функціями, відновленням і поведінкою.',tag:'Сон · Мозок'},
  {title:'Стрес і когнітивне навантаження',copy:'Майбутній модуль про стресову відповідь, увагу та прийняття рішень.',tag:'Стрес · Когніція'},
  {title:'Фізична активність і мозок',copy:'Окремий напрям про рух, тренування та нервову систему.',tag:'Рух · Нервова система'},
  {title:'Кофеїн і увага',copy:'Механізми, продуктивність, сон і межі практичної інтерпретації.',tag:'Кофеїн · Увага'}
 ],
 spine:[
  {title:'Неспецифічний біль у попереку',copy:'Біль, функція, навантаження та роль контексту без пошуку однієї універсальної причини.',tag:'Поперек · Біль'},
  {title:'Грижі та протрузії',copy:'Як читати структурні знахідки разом із симптомами та клінічною картиною.',tag:'МРТ · Контекст'},
  {title:'Силове тренування',copy:'Прогресія навантаження, техніка, толерантність і повернення до силових задач.',tag:'Сила · Навантаження'},
  {title:'Рух і навантаження',copy:'Майбутня карта рухових стратегій, адаптації та функції.',tag:'Рух · Адаптація'}
 ],
 muscles:[
  {title:'Гіпертрофія',copy:'Обсяг, інтенсивність, близькість до відмови та інші тренувальні змінні.',tag:'М’язи · Ріст'},
  {title:'Сила',copy:'Нейром’язова адаптація, специфічність і програмування навантаження.',tag:'Сила · Адаптація'},
  {title:'DOMS і відновлення',copy:'Що означає післятренувальна болючість і чого вона не вимірює напряму.',tag:'Відновлення · DOMS'},
  {title:'Обсяг та інтенсивність',copy:'Як різні змінні тренування взаємодіють із цілями та переносимістю.',tag:'Програмування'}
 ],
 gut:[
  {title:'Травлення',copy:'Від прийому їжі до засвоєння: базова фізіологія та практичні питання.',tag:'Фізіологія · Харчування'},
  {title:'Мікробіом',copy:'Що реально відомо про мікробіоту, асоціації та межі причинних висновків.',tag:'Мікробіом · Докази'},
  {title:'Клітковина',copy:'Типи харчових волокон, переносимість та контекст раціону.',tag:'Раціон · ШКТ'},
  {title:'Харчові тригери',copy:'Як відрізняти індивідуальну переносимість від універсальних заборон.',tag:'Симптоми · Раціон'}
 ]
};

function topicCards(topics){return topics.map((topic,index)=>`<article class="atlas-topic"><div class="atlas-topic-icon" aria-hidden="true">${String(index+1).padStart(2,'0')}</div><div><h3>${topic.title}</h3><p>${topic.copy}</p></div><span class="atlas-topic-tag">${topic.tag}</span></article>`).join('');}

const shoulderContent={
 overview:()=>`<div class="atlas-copy-card"><h3>Як читати цей модуль</h3><p>Плече — перша повністю розгорнута область Атласу. Тут ми не намагаємося поставити діагноз за точкою болю. Мета — показати структуру знань: що це за область, які питання виникають найчастіше, що варто перевіряти і де закінчується впевненість доказів.</p></div>${topicCards(shoulderTopics)}`,
 anatomy:()=>`<div class="atlas-copy-card"><h3>Анатомія як карта, а не діагноз</h3><p>Плечовий комплекс включає гленогумеральний, акроміально-ключичний і грудино-ключичний суглоби, лопатково-грудну взаємодію, ротаторну манжету та велику кількість м’язів і сухожиль.</p><ul><li>Структура допомагає зрозуміти функцію.</li><li>Зміни на візуалізації не завжди пояснюють біль.</li><li>Оцінка руху й навантаження потребує контексту.</li></ul></div>`,
 symptoms:()=>`<div class="atlas-copy-card"><h3>Симптоми — це початок питання</h3><p>Локалізація болю, провокуючі рухи, травматичний механізм, слабкість, нічний біль та зміни функції можуть спрямувати оцінку, але не замінюють клінічного обстеження.</p><ul><li>Гостра травма з вираженою втратою функції потребує окремої оцінки.</li><li>Одна провокативна проба рідко дає надійний діагноз сама по собі.</li><li>Навантажувальна толерантність змінюється з часом.</li></ul></div>`,
 training:()=>`<div class="atlas-copy-card"><h3>Тренування плеча</h3><p>Evidence UA розглядає тренування через кероване навантаження, доступний діапазон руху, прогресію обсягу та інтенсивності, а не через універсальний список «безпечних» і «небезпечних» вправ.</p><ul><li>Силові вправи можуть бути частиною профілактики й відновлення.</li><li>Біль під час руху оцінюється разом із реакцією після навантаження.</li><li>Прогресія залежить від задачі людини та попереднього рівня.</li></ul><p><a href="./exercises.html?region=shoulder">Вправи для плеча в Бібліотеці вправ →</a></p></div>`,
 rehab:()=>`<div class="atlas-copy-card"><h3>Реабілітація</h3><p>Базова логіка — повернути функцію й толерантність до необхідних навантажень. Конкретний план залежить від стану, тяжкості, часу після травми, вимог спорту чи роботи та супутніх факторів.</p><ul><li>Освіта та керування навантаженням.</li><li>Поступова силова робота.</li><li>Відновлення специфічних для задачі рухів.</li></ul></div>`,
 research:()=>`<div class="atlas-copy-card"><h3>Як тут з’являються докази</h3><p>Кожен завершений матеріал Atlas має розділяти висновок, рівень впевненості, практичну інтерпретацію та першоджерела. Ми не використовуємо декоративний «відсоток ефективності».</p><ul><li>Систематичні огляди та клінічні рекомендації — для широкої картини.</li><li>RCT та спостережні роботи — для конкретних питань.</li><li>Обмеження й невизначеність показуються поруч із висновком.</li></ul></div>`
};

const kneeContent={
 overview:()=>`<div class="atlas-copy-card"><h3>Коліно — другий модуль Атласу</h3><p>Колінний біль не є однією нозологією. У бета-модулі ми розділяємо пателофеморальний біль, меніски, зв’язки, сухожилки та остеоартроз, щоб не змішувати різні механізми, прогнози й задачі реабілітації.</p></div>${topicCards(kneeTopics)}`,
 anatomy:()=>`<div class="atlas-copy-card"><h3>Анатомія коліна</h3><p>Колінний комплекс поєднує тибіофеморальний і пателофеморальний суглоби, меніски, зв’язки, сухожилки та м’язові групи, що керують навантаженням.</p><ul><li>Меніски беруть участь у розподілі навантаження та стабільності.</li><li>ACL є важливим елементом пасивної стабільності коліна.</li><li>Квадрицепс і м’язи задньої поверхні стегна суттєво впливають на функцію.</li></ul></div>`,
 symptoms:()=>`<div class="atlas-copy-card"><h3>Симптоми потребують контексту</h3><p>Передній, медіальний або латеральний біль, набряк, нестабільність і обмеження руху мають різне значення залежно від механізму появи, тривалості та функціональних вимог.</p><ul><li>Локалізація болю сама по собі не встановлює діагноз.</li><li>Після гострої травми важливі механізм, набряк, функція та стабільність.</li><li>Структурні зміни на зображеннях інтерпретують разом із симптомами.</li></ul></div>`,
 training:()=>`<div class="atlas-copy-card"><h3>Тренування коліна</h3><p>Основна ідея — не уникати руху як категорії, а керувати дозою навантаження відповідно до конкретної задачі та реакції тканин і симптомів.</p><ul><li>Прогресія може включати силу, контроль, швидкість і специфічні спортивні задачі.</li><li>Глибина руху та зовнішнє навантаження змінюються поступово.</li><li>Оцінюється не лише відчуття під час вправи, а й реакція після неї.</li></ul></div>`,
 rehab:()=>`<div class="atlas-copy-card"><h3>Реабілітація коліна</h3><p>План залежить від конкретного стану: пателофеморальний біль, травма ACL, меніск, тендинопатія та остеоартроз не повинні мати одну універсальну програму.</p><ul><li>Цілі формують від побутової функції до бігу, стрибків або спорту.</li><li>Силову роботу й функціональні задачі прогресують за переносимістю.</li><li>Повернення до активності оцінюють за функцією, а не лише календарем.</li></ul></div>`,
 research:()=>`<div class="atlas-copy-card"><h3>Докази для коліна</h3><p>Бета-модуль уже розділяє клінічні сценарії, але кожна тема отримає власний набір джерел, рівень впевненості й окремі практичні висновки.</p><ul><li>Для пателофеморального болю окремо розглядаємо активну реабілітацію та освіту.</li><li>Для менісків і ACL розділяємо травматичні сценарії, хірургічні та нехірургічні шляхи.</li><li>Для остеоартрозу оцінюємо функцію, фізичну активність, симптоми й довгострокове ведення.</li></ul></div>`
};

function topicLinks(items){return items.map((item,index)=>`<article class="atlas-topic"><div class="atlas-topic-icon" aria-hidden="true">${String(index+1).padStart(2,'0')}</div><div><h3><a href="${item.href}">${item.title}</a></h3><p>${item.copy}</p></div><span class="atlas-topic-tag">${item.tag}</span></article>`).join('');}

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

function topicTabs(items){return items.map((item,index)=>`<article class="atlas-topic"><div class="atlas-topic-icon" aria-hidden="true">${String(index+1).padStart(2,'0')}</div><div><h3><button type="button" class="atlas-link-button" data-goto-tab="${item.tab}">${item.title}</button></h3><p>${item.copy}</p></div><span class="atlas-topic-tag">${item.tag}</span></article>`).join('');}

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

function previewContent(zone,tab){
 const meta=zoneMeta[zone],topics=previewTopics[zone]||[];
 if(tab==='overview')return `<div class="atlas-copy-card"><h3>${meta.title}: карта майбутнього модуля</h3><p>Ми вже показуємо структуру тем, але не підміняємо відсутній доказовий розбір короткими універсальними порадами. Кожна картка стане окремим матеріалом із джерелами та рівнем впевненості.</p></div>${topicCards(topics)}`;
 return `<div class="atlas-coming"><strong>Готується</strong><h3>${tabLabels[tab]} · ${meta.title}</h3><p>Ця вкладка вже є частиною загальної архітектури Атласу. Наступний крок — наповнити її перевіреними матеріалами й першоджерелами для конкретних тем цієї області.</p></div>`;
}

const zoneButtons=[...document.querySelectorAll('[data-zone]')];
const tabs=[...document.querySelectorAll('[data-atlas-tab]')];
const title=document.getElementById('atlas-zone-title');
const summary=document.getElementById('atlas-zone-summary');
const status=document.getElementById('atlas-zone-status');
const content=document.getElementById('atlas-content');
const breadcrumbZone=document.getElementById('atlas-breadcrumb-zone');
const breadcrumbTab=document.getElementById('atlas-breadcrumb-tab');
let selectedZone='shoulder';
let selectedTab='overview';
const requestedZone=new URLSearchParams(location.search).get('zone');
if(requestedZone&&Object.prototype.hasOwnProperty.call(zoneMeta,requestedZone))selectedZone=requestedZone;

function markupFor(zone,tab){
 if(zone==='shoulder')return shoulderContent[tab]();
 if(zone==='knee')return kneeContent[tab]();
 if(zone==='muscles'&&musclesContent[tab])return musclesContent[tab]();
 if(zone==='spine'&&spineContent[tab])return spineContent[tab]();
 return previewContent(zone,tab);
}

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
  const {exercises,contentTypes}=await import('./exercises-data.js?v=3');
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

function render(){
 const meta=zoneMeta[selectedZone];
 title.textContent=meta.title;summary.textContent=meta.summary;status.textContent=meta.state;status.dataset.state=meta.stateKey;
 breadcrumbZone.textContent=meta.title;breadcrumbTab.textContent=tabLabels[selectedTab];
 zoneButtons.forEach(button=>{const active=button.dataset.zone===selectedZone;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
 tabs.forEach(button=>{button.disabled=false;button.hidden=false;button.setAttribute('aria-selected',String(button.dataset.atlasTab===selectedTab));});
 content.classList.add('is-changing');
 spineHub?.dispose();spineHub=null;
 content.innerHTML=markupFor(selectedZone,selectedTab);
 requestAnimationFrame(()=>content.classList.remove('is-changing'));
 hydrateRelatedPractice();
 hydrateSpineHub();
}

content.addEventListener('click',event=>{const jump=event.target.closest('[data-goto-tab]');if(!jump)return;const target=tabs.find(button=>button.dataset.atlasTab===jump.dataset.gotoTab);if(target){target.click();target.focus();}});
zoneButtons.forEach(button=>button.addEventListener('click',()=>{selectedZone=button.dataset.zone;selectedTab='overview';render();}));
tabs.forEach((button,index)=>{
 button.addEventListener('click',()=>{selectedTab=button.dataset.atlasTab;render();});
 button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const step=event.key==='ArrowRight'?1:-1;tabs[(index+step+tabs.length)%tabs.length].focus();});
});
render();
