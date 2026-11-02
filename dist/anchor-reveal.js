// Посилання на розділ приводить саме до розділу (рішення власника 2026-11-02: пошук знаходить розділи всередині сторінок).
//
// Що робить цей модуль на кожній сторінці:
// 1) Якщо ціль посилання (#якір) лежить у згорнутому блоці <details>, відкриває його (і всі зовнішні), щоб розділ було видно.
// 2) Браузер прокручує до якоря раніше, ніж шапка й малюнки встигли змінити висоту сторінки, тому розділ потрапляв на 20–40 px вище за край вікна.
//    Коли сторінка дозавантажилась, модуль кілька разів (до ~3 с) доводить ціль до верху вікна. Якщо користувач уже сам прокрутив, нічого не чіпає.
// 3) Посилання з пошуку може нести назву розділу: ?section=Вагітність (і ?n=2, якщо така назва в блоці не одна). Тоді шукається заголовок
//    з цією назвою всередині цілі (#якір, а без якоря на всій сторінці), відкриваються згорнуті блоки, заголовок підсвічується на мить.
//    Це потрібно для карток тверджень і заголовків, у яких немає власного id; розмітку наукових текстів ми для цього не чіпаємо.
// Нічого не надсилає в мережу й нічого не зберігає.

// Порівняння назв: однакове в генераторі (scripts/build-sections.mjs) і тут. Прибирає службові символи на краях і різницю регістру.
export function normalizeTitle(text){
  return String(text||'').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').replace(/^[\s↑↓→←↗↘＋+•·▸▾\-–—]+/,'').replace(/[\s↑↓→←↗↘＋+•·▸▾]+$/,'').replace(/\.+$/,'').trim().toLocaleLowerCase('uk');
}

// Обирає заголовок за назвою: n-й (з 1) серед тих, чия назва збігається. Чиста функція, щоб її можна було перевірити без браузера.
export function pickByTitle(items,want,n=1){
  const w=normalizeTitle(want);if(!w)return null;
  const same=items.filter(item=>normalizeTitle(item.text)===w);
  return same[Math.max(1,Math.floor(Number(n))||1)-1]||null;
}

const HEADINGS='h2,h3,summary';
const SKIP='dialog,nav,header,footer,[hidden],[aria-hidden="true"]';
const param=(search,name)=>{try{return new URLSearchParams(search).get(name);}catch{return null;}};
const decode=s=>{try{return decodeURIComponent(s);}catch{return s;}};

// Відкриває всі згорнуті <details> навколо елемента (і сам елемент, якщо це <details>). Повертає true, якщо щось відкрито.
export function openAround(el){
  let changed=false;
  for(let d=el.tagName==='DETAILS'?el:el.parentElement?.closest('details');d;d=d.parentElement?.closest('details')){
    if(!d.open){d.open=true;changed=true;}
  }
  return changed;
}

export function findTarget(doc,{hash='',search=''}={}){
  const id=decode(String(hash).replace(/^#/,''));
  const anchor=id?doc.getElementById(id):null;
  if(anchor?.tagName==='DIALOG'||anchor?.closest?.('dialog'))return {el:null,modal:true};
  const want=param(search,'section');
  if(want){
    const scope=anchor||doc.body;
    const items=[...scope.querySelectorAll(HEADINGS)].filter(el=>!el.closest(SKIP)).map(el=>({el,text:el.textContent}));
    const found=pickByTitle(items,want,param(search,'n'));
    if(found)return {el:found.el,byTitle:true};
  }
  return {el:anchor,byTitle:false};
}

const STYLE='.eua-landed{scroll-margin-top:28px;outline:2px solid var(--pine-accent,#ffdc7e);outline-offset:6px;border-radius:2px}@media(prefers-reduced-motion:no-preference){.eua-landed{animation:eua-landed 2.6s ease-out forwards}@keyframes eua-landed{0%,55%{outline-color:var(--pine-accent,#ffdc7e)}100%{outline-color:transparent}}}';

// Де має стояти ціль після переходу: знайдений за назвою заголовок: у верхній частині вікна; якір: у верхніх 60% (так само, як залишає браузер).
export const landingBand=(byTitle,viewportHeight)=>byTitle?[8,Math.min(140,viewportHeight*0.25)]:[0,viewportHeight*0.6];

export function mountAnchorReveal(win=window){
  const doc=win.document;
  let moved=false,styled=false,highlighted=null;
  const mark=()=>{moved=true;};
  for(const type of ['wheel','touchstart','keydown','mousedown'])win.addEventListener(type,mark,{passive:true,once:true});
  function land(force){
    const {el,byTitle,modal}=findTarget(doc,{hash:win.location.hash,search:win.location.search});
    if(modal||!el)return false;
    const opened=openAround(el);
    if(moved&&!force&&!opened)return true;
    const rect=el.getBoundingClientRect();
    if(!rect.width&&!rect.height)return false;
    // Підсвічування додаємо до прокрутки: його відступ зверху (scroll-margin-top) не дає заголовку притиснутись до краю вікна.
    if(byTitle&&highlighted!==el){
      if(!styled){const s=doc.createElement('style');s.textContent=STYLE;doc.head.append(s);styled=true;}
      highlighted=el;el.classList.add('eua-landed');win.setTimeout(()=>el.classList.remove('eua-landed'),2800);
    }
    const [from,to]=landingBand(byTitle,win.innerHeight);
    const top=el.getBoundingClientRect().top;
    if(opened||top<from||top>to)el.scrollIntoView({block:'start',behavior:'instant'});
    return true;
  }
  // Сторінки домальовують зміст, шапку й малюнки вже після завантаження, і висота змінюється: тому кілька спроб (до ~3 с), доки користувач не прокрутив сам.
  function settle(){for(const delay of [60,450,1200,2600])win.setTimeout(()=>{if(!moved)land(false);},delay);}
  win.addEventListener('hashchange',()=>{moved=false;highlighted=null;win.requestAnimationFrame(()=>land(true));});
  if(doc.readyState==='complete')settle();else win.addEventListener('load',settle,{once:true});
  return {land};
}

if(typeof window!=='undefined'&&typeof document!=='undefined'&&!window.__euaAnchorReveal){window.__euaAnchorReveal=true;mountAnchorReveal(window);}
