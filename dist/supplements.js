// Каталог добавок: короткі висновки з розділу «Бібліотека доказів» на головній (тексти не змінено)
// і посилання на наявні докладні розбори. Жодних сторонніх запитів.
export const supplements=[
  {id:'creatine',name:'Креатин',group:'sport',tag:'Сила · безжирова маса',summary:'Силові тренування та повторні інтенсивні зусилля — найкраще вивчені напрями.',limit:'Безжирова маса включає воду; результат не гарантований.',x:0,y:0},
  {id:'supplement-protein',name:'Протеїн',group:'sport',tag:'Білок · гіпертрофія',summary:'У розборі — роль білка в адаптації до силових тренувань.',limit:'Важливий загальний білок у раціоні, а не лише добавка.',x:25,y:0},
  {id:'supplement-caffeine',name:'Кофеїн',group:'sport',tag:'Працездатність · сон',summary:'Може покращувати окремі показники спортивної працездатності.',limit:'Враховуй індивідуальну реакцію та вплив на сон.',x:50,y:0},
  {id:'supplement-omega',name:'Омега-3',group:'health',tag:'EPA · DHA',summary:'Розглядаємо серцево-судинні результати окремо для різних показань.',limit:'Ефект залежить від складу, дози та досліджуваної групи.',x:75,y:0},
  {id:'supplement-vitd',name:'Вітамін D',group:'health',tag:'Кістки · дефіцит',summary:'У розборі — кісткове здоров’я та межі користі додаткового прийому.',limit:'Не переносимо висновки для дефіциту на всіх людей.',x:100,y:0},
  {id:'supplement-magnesium',name:'Магній',group:'health',tag:'Мінерал · дефіцит',summary:'Необхідний для нервової та м’язової функції; важливе достатнє споживання.',limit:'Фізіологічна роль не доводить користь додаткової дози для кожного.',x:0,y:100},
  {id:'supplement-collagen',name:'Колаген',group:'sport',tag:'Сухожилля · навантаження',summary:'Досліджують як доповнення до тренувань для опорно-рухового апарату.',limit:'Для багатьох результатів певність доказів низька або дуже низька.',x:25,y:100},
  {id:'supplement-beta-alanine',name:'Бета-аланін',group:'sport',tag:'Карнозин · інтенсивність',summary:'Може допомагати в окремих видах інтенсивної роботи після регулярного прийому.',limit:'Ефект залежить від тривалості та типу зусилля.',x:50,y:100},
  {id:'supplement-citrulline',name:'Цитрулін',group:'sport',tag:'Зусилля · відновлення',summary:'Досліджують вплив на сприйняття навантаження та біль після тренування.',limit:'Зміна самопочуття не означає доведений приріст м’язів.',x:75,y:100},
  {id:'supplement-electrolytes',name:'Електроліти',group:'sport',tag:'Гідратація · потовиділення',summary:'Відновлення рідини й натрію залежить від тривалості, спеки та втрат із потом.',limit:'Спортивний напій не усуває ризик надмірного пиття.',x:100,y:100},
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
