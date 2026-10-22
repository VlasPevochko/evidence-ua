// Каталог добавок: короткі висновки за погодженими твердженнями карток (оновлено 22.10.2026 за рішенням власника)
// і посилання на наявні докладні розбори. Жодних сторонніх запитів.
export const supplements=[
  {id:'creatine',name:'Креатин',group:'sport',tag:'Сила · безжирова маса',summary:'Разом із силовими тренуваннями — більше сили й безжирової маси. Витривалість не покращує.',limit:'Креатинін у крові може трохи зрости без шкоди ниркам — скажи лікарю перед аналізами.',x:0,y:0},
  {id:'supplement-protein',name:'Протеїн',group:'sport',tag:'Білок · гіпертрофія',summary:'З тренуваннями білок трохи додає сили й безжирової маси. Без тренувань силу не збільшує.',limit:'Орієнтир близько 1,6 г на кг на добу — не точна норма; головне — самі тренування.',x:25,y:0},
  {id:'supplement-caffeine',name:'Кофеїн',group:'sport',tag:'Працездатність · сон',summary:'Допомагає швидше пройти дистанцію й трохи додає сили.',limit:'Увечері скорочує сон; енергетики підвищують тиск. Дорослим — до 400 мг на добу.',x:50,y:0},
  {id:'supplement-omega',name:'Омега-3',group:'health',tag:'EPA · DHA',summary:'Знижує тригліцериди приблизно на 15%. На серце й смертність майже не впливає.',limit:'Підвищує ризик фібриляції передсердь, особливо понад 1 г на добу.',x:75,y:0},
  {id:'supplement-vitd',name:'Вітамін D',group:'health',tag:'Кістки · дефіцит',summary:'Без дефіциту переломів не зменшує; застуд і подібних інфекцій трохи менше.',limit:'Великі разові дози підвищують ризик падінь і переломів.',x:100,y:0},
  {id:'supplement-magnesium',name:'Магній',group:'health',tag:'Тиск · сон · судоми',summary:'Трохи знижує тиск. Нічних судом у літніх людей не зменшує.',limit:'Найчастіший побічний ефект — діарея; з добавок не більше 350 мг на добу.',x:0,y:100},
  {id:'supplement-collagen',name:'Колаген',group:'sport',tag:'Сухожилля · суглоби',summary:'Разом із тренуваннями — трохи більше безжирової маси й сили.',limit:'Певність доказів здебільшого низька; дослідження дуже різні, частина — упереджена.',x:25,y:100},
  {id:'supplement-beta-alanine',name:'Бета-аланін',group:'sport',tag:'Карнозин · інтенсивність',summary:'Малий ефект у виснажливих зусиллях на 0,5–10 хв після тижнів щоденного прийому.',limit:'Склад тіла не змінює; єдиний побічний ефект — поколювання шкіри.',x:50,y:100},
  {id:'supplement-citrulline',name:'Цитрулін',group:'sport',tag:'Зусилля · відновлення',summary:'Ефект малий або відсутній: витривалість і силу не покращує.',limit:'Певність доказів низька або дуже низька; надійної дози не встановлено.',x:75,y:100},
  {id:'supplement-electrolytes',name:'Електроліти',group:'sport',tag:'Гідратація · потовиділення',summary:'Після зневоднення спортивний напій відновлює рідину краще за воду.',limit:'Користь — для довгих навантажень і спеки; пити забагато небезпечно.',x:100,y:100},
  {id:'supplement-berberine',name:'Берберин',group:'health',tag:'Цукор · ліпіди',summary:'Помірно знижує цукор, тригліцериди й ЛПНЩ у людей з порушеним обміном речовин.',limit:'Може змінювати дію ліків; маса тіла майже не змінюється.',photo:'./supplement-berberine-v1.webp'}
];

export const groups={all:'Усі',sport:'Спорт',health:'Здоров’я'};

export function filterSupplements(items,{group='all',query=''}={}){
  const q=String(query).trim().toLowerCase();
  return items.filter(i=>(group==='all'||i.group===group)&&(!q||i.name.toLowerCase().includes(q)));
}

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);

export function renderRow(i){
  return `<li class="sp-row" data-sp-id="${esc(i.id)}"><div class="sp-photo" role="img" aria-label="Ілюстрація: ${esc(i.name)}" style="${i.photo?`background-image:url(${esc(i.photo)});background-size:cover;background-position:center`:`background-position:${i.x}% ${i.y}%`}"></div><div class="sp-body"><p class="sp-tags"><b>Наукове досьє</b> · ${esc(i.tag)}</p><h2>${esc(i.name)}</h2><p class="sp-sum">${esc(i.summary)}</p><details class="sp-limit"><summary>Межі висновку</summary><p>${esc(i.limit)}</p></details><a class="sp-go" href="./index.html#${esc(i.id)}">Читати розбір →</a></div></li>`;
}

export function mountSupplements(root=document){
  const list=root.getElementById('sp-list'),count=root.getElementById('sp-count'),empty=root.getElementById('sp-empty'),input=root.getElementById('sp-q');
  if(!list)return null;
  let group='all';
  const draw=()=>{
    const shown=filterSupplements(supplements,{group,query:input.value});
    list.innerHTML=shown.map(renderRow).join('');
    count.textContent=`${shown.length} з ${supplements.length}`;
    empty.hidden=shown.length>0;
  };
  root.querySelectorAll('[data-sp-filter]').forEach(button=>button.addEventListener('click',()=>{
    group=button.dataset.spFilter;
    root.querySelectorAll('[data-sp-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    draw();
  }));
  input.addEventListener('input',draw);
  draw();
  return {draw,state:()=>({group,query:input.value})};
}

if(typeof document!=='undefined'&&document.getElementById&&document.getElementById('sp-list'))mountSupplements(document);
