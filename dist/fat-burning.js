import "./site-header.js?v=20";

export const fatStages = Object.freeze([
  {
    title: "Енергія у запасі",
    body: "Жирова тканина зберігає значну частину енергії у формі тригліцеридів. Це запас, а не речовина, яка просто «тане» від тепла.",
    limit: "Один етап не визначає, чи зменшиться жирова маса за тижні та місяці."
  },
  {
    title: "Мобілізація жирних кислот",
    body: "Під час ліполізу тригліцериди розщеплюються; жирні кислоти можуть виходити у кров та використовуватися різними тканинами. Частина може знову перейти у запас.",
    limit: "Ліполіз не тотожний втраті жиру: вивільнення жирних кислот ще не гарантує їхнього кінцевого окиснення."
  },
  {
    title: "Окиснення всередині клітини",
    body: "Клітини використовують жирні кислоти у складній послідовності реакцій. Бета-окиснення і подальший клітинний метаболізм дають змогу отримувати енергію.",
    limit: "Більша частка жирів як палива під час одного тренування не обов’язково означає більшу втрату жирової маси з часом."
  },
  {
    title: "Куди виходять атоми",
    body: "Під час повного окиснення атоми тригліцеридів потрапляють переважно у вуглекислий газ, який ми видихаємо, а також у воду, що залишає організм різними шляхами.",
    limit: "Частіше дихати за власним бажанням — не спосіб «видихати більше жиру»: утворення CO₂ залежить від метаболічного використання субстратів."
  }
]);
export const energyCases = Object.freeze({
  deficit: {
    title: "Якщо енергії надходить менше",
    body: "За стійкого дефіциту організм має покривати різницю зі своїх запасів. Частка жирової та безжирової маси у зміні ваги залежить від багатьох чинників."
  },
  equal: {
    title: "Якщо надходження і витрати приблизно рівні",
    body: "За тривалого енергетичного балансу значних змін запасів енергії не очікують. Короткочасні коливання маси тіла при цьому можливі."
  },
  surplus: {
    title: "Якщо енергії надходить більше",
    body: "За тривалого надлишку енергії запаси тіла можуть зростати. Це не означає, що щоденні зміни ваги прямо показують приріст жирової тканини."
  }
});
// Схема запасу (без чисел): тонка лінія це вага за днями, вона коливається; товста це запас жиру, тренд.
// Цифри на осях навмисно відсутні: це форма, а не прогноз (docs/FAT_BURNING_LAB.md).
const STORE_DAYS=[0,-14,9,-8,16,-12,6,-18,9,-7,14,-10,6];
const STORE_TREND=Object.freeze({deficit:[44,98],equal:[70,70],surplus:[98,44]});
export function storeShape(mode){
  if(!Object.hasOwn(STORE_TREND,mode))return null;
  const [from,to]=STORE_TREND[mode],n=STORE_DAYS.length,x=i=>+(10+i*(340/(n-1))).toFixed(1);
  const trend=STORE_DAYS.map((_,i)=>[x(i),+(from+(to-from)*i/(n-1)).toFixed(1)]);
  const weight=trend.map(([px,py],i)=>[px,+(py+STORE_DAYS[i]).toFixed(1)]);
  const d=pts=>pts.map(([px,py],i)=>(i?"L":"M")+px+" "+py).join(" ");
  return {fat:d(trend),weight:d(weight)};
}
export function mountFatBurning(root=document) {
  const buttons=[...root.querySelectorAll("[data-fb-step]")];
  const visuals=[...root.querySelectorAll("[data-visual]")];
  const current=root.getElementById("fb-step-count"), title=root.getElementById("fb-step-title"), body=root.getElementById("fb-step-body"), limit=root.getElementById("fb-step-limit");
  const next=root.getElementById("fb-step-next"), balance=root.querySelector(".fb-balance"), flow=root.querySelector(".fb-flow");
  if(!buttons.length||!title||!body||!limit||!next||!current||!balance) return;
  let index=0;
  function setStep(value){
    index=Math.max(0,Math.min(fatStages.length-1,Number(value)));
    const step=fatStages[index];
    current.textContent="ЕТАП "+(index+1)+" З "+fatStages.length;
    title.textContent=step.title; body.textContent=step.body;limit.textContent=step.limit;
    buttons.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===index)));
    visuals.forEach((visual,i)=>visual.classList.toggle("is-active",i===index));
    next.textContent=index===fatStages.length-1?"Повернутись до початку ↺":"Наступний етап →";
    if(flow){flow.style.setProperty("--fb-i",String(index));flow.style.setProperty("--fb-p",String(index/(fatStages.length-1)));flow.dataset.step=String(index);}
  }
  buttons.forEach((b,i)=>b.addEventListener("click",()=>setStep(i)));
  visuals.forEach((v,i)=>v.addEventListener("click",()=>setStep(i)));
  next.addEventListener("click",()=>setStep((index+1)%fatStages.length));
  const balanceButtons=[...root.querySelectorAll("[data-fb-balance]")];
  const balanceTitle=root.getElementById("fb-balance-title"),balanceBody=root.getElementById("fb-balance-body");
  const fatLine=root.getElementById("fb-store-fat"),weightLine=root.getElementById("fb-store-weight");
  function setBalance(mode,animate){
    if(!Object.hasOwn(energyCases,mode))return;
    balance.dataset.balance=mode;
    balanceTitle.textContent=energyCases[mode].title;
    balanceBody.textContent=energyCases[mode].body;
    balanceButtons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.fbBalance===mode)));
    const shape=storeShape(mode);
    if(shape&&fatLine&&weightLine){
      fatLine.setAttribute("d",shape.fat);weightLine.setAttribute("d",shape.weight);
      if(animate){for(const line of [weightLine,fatLine]){line.classList.remove("is-drawing");void line.getBoundingClientRect();line.classList.add("is-drawing");}}
    }
  }
  balanceButtons.forEach(b=>b.addEventListener("click",()=>setBalance(b.dataset.fbBalance,true)));
  setStep(0);setBalance("deficit",false);
  // The sources are folded; links to #sources (or to anything inside) open the fold.
  const fold=root.getElementById("sources-fold");
  if(fold){
    const open=()=>{const id=(root.defaultView?.location?.hash||"").slice(1);if(id==="sources"||(id&&fold.contains(root.getElementById(id))))fold.open=true;};
    open();root.defaultView?.addEventListener("hashchange",open);
    root.addEventListener("click",event=>{const a=event.target.closest?.('a[href="#sources"]');if(a)fold.open=true;});
  }
  mountSectionBar(root);
}
// Смуга розділів прилипає зверху й показує, де читач зараз (aria-current), не покладаючись на колір.
function mountSectionBar(root){
  const links=[...root.querySelectorAll(".fb-jumps a[href^='#']")];
  if(!links.length||typeof IntersectionObserver==="undefined")return;
  const byId=new Map(links.map(a=>[a.getAttribute("href").slice(1),a]));
  const set=id=>{links.forEach(a=>{if(byId.get(id)===a){a.setAttribute("aria-current","location");const box=a.parentElement;if(box&&box.scrollWidth>box.clientWidth){box.scrollTo({left:a.offsetLeft-box.clientWidth/2+a.offsetWidth/2,behavior:"auto"});}}else a.removeAttribute("aria-current");});};
  const seen=new Map();
  const io=new IntersectionObserver(entries=>{
    for(const e of entries)seen.set(e.target.id,e.isIntersecting?e.intersectionRatio:0);
    let best=null,ratio=0;for(const [id,r] of seen)if(r>ratio){best=id;ratio=r;}
    if(best)set(best);
  },{rootMargin:"-56px 0px -45% 0px",threshold:[0,.1,.25,.5]});
  for(const id of byId.keys()){const el=root.getElementById(id);if(el)io.observe(el);}
}
if(typeof document!=="undefined")mountFatBurning(document);
