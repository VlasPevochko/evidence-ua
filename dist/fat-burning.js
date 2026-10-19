import "./site-header.js?v=2";

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
export function mountFatBurning(root=document) {
  const buttons=[...root.querySelectorAll("[data-fb-step]")];
  const visuals=[...root.querySelectorAll("[data-visual]")];
  const current=root.getElementById("fb-step-count"), title=root.getElementById("fb-step-title"), body=root.getElementById("fb-step-body"), limit=root.getElementById("fb-step-limit");
  const next=root.getElementById("fb-step-next"), balance=root.querySelector(".fb-balance");
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
  }
  buttons.forEach((b,i)=>b.addEventListener("click",()=>setStep(i)));
  next.addEventListener("click",()=>setStep((index+1)%fatStages.length));
  const balanceButtons=[...root.querySelectorAll("[data-fb-balance]")];
  const balanceTitle=root.getElementById("fb-balance-title"),balanceBody=root.getElementById("fb-balance-body");
  function setBalance(mode){
    if(!Object.hasOwn(energyCases,mode))return;
    balance.dataset.balance=mode;
    balanceTitle.textContent=energyCases[mode].title;
    balanceBody.textContent=energyCases[mode].body;
    balanceButtons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.fbBalance===mode)));
  }
  balanceButtons.forEach(b=>b.addEventListener("click",()=>setBalance(b.dataset.fbBalance)));
  setStep(0);setBalance("deficit");
}
if(typeof document!=="undefined")mountFatBurning(document);
