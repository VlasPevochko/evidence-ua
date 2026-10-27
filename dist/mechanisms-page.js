// «Як це працює»: кроки схем керуються атрибутом data-stage; уся графіка в CSS. Автопрогравання лише коли схему видно й рух не вимкнено.
export const SCENES={
 caffeine:[
  {tab:'Довго неспиш',title:'Довго неспиш: аденозину стає більше',text:'Поки ми не спимо, у корі й базальному передньому мозку накопичується аденозин. Рецептори поки вільні.'},
  {tab:'Аденозин на рецепторі',title:'Аденозин сідає на рецептор',text:'Аденозин зв’язується з рецепторами й працює як гальмо: у щурів через рецептор A1 він знижував вивільнення ацетилхоліну в корі, а це може підвищувати схильність до сну. Сигнал «пора спати» сильний.'},
  {tab:'Кофеїн займає місце',title:'Кофеїн займає місце аденозину',text:'Кофеїн блокує рецептори аденозину. Аденозину не меншає, але сигнал «пора спати» слабшає, а пильність зростає.'}],
 creatine:[
  {tab:'Спокій',title:'Спокій: запас фосфокреатину повний',text:'У м’язі є невеликий запас фосфокреатину. Він готовий швидко відновити АТФ, коли м’яз почне працювати з максимальною силою.'},
  {tab:'Ривок',title:'Ривок: фосфокреатин віддає фосфат',text:'АТФ витрачається, і фосфокреатин передає фосфатну групу, щоб АТФ швидко з’явився знову. Запас тане, потужність висока.'},
  {tab:'Через ~10 с',title:'Приблизно через 10 с запас вичерпується',text:'Потужність помітно падає, і це збігається з вичерпанням фосфокреатину. Далі м’яз покладається на інші, повільніші джерела енергії.'},
  {tab:'Відпочинок',title:'Відпочинок: запас відновлюється',text:'Під час відпочинку фосфокреатин відновлюється, і сила та потужність повертаються разом із ним.'}]
};
export const nextStage=(cur,total)=>cur%total+1;
export const INTERVAL_MS=6000;

export function initScene(stage,steps,win=window){
  const doc=stage.ownerDocument,ctl=stage.querySelector('[data-ctl]'),cap=stage.querySelector('[data-caption]');
  if(!ctl||!cap)return null;
  const reduce=win.matchMedia&&win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const make=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const tabs=make('div','mc-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Кроки схеми');
  const btns=steps.map((s,i)=>{const b=make('button','mc-step');b.type='button';b.dataset.step=String(i+1);b.append(make('span','mc-step-n',String(i+1)),make('span','',s.tab));b.addEventListener('click',()=>{pause();go(i+1);});tabs.append(b);return b;});
  const play=make('button','mc-play');play.type='button';
  ctl.append(tabs);
  let sw=null;
  if(stage.dataset.creatine!==undefined){sw=make('button','mc-switch','З добавкою креатину');sw.type='button';sw.setAttribute('aria-pressed','false');sw.addEventListener('click',()=>{const on=stage.dataset.creatine!=='on';stage.dataset.creatine=on?'on':'off';sw.setAttribute('aria-pressed',String(on));stage.querySelector('.cr-mark').hidden=!on;});}
  const row2=make('div','mc-ctl-row');row2.append(play);if(sw)row2.append(sw);ctl.append(row2);ctl.hidden=false;
  let cur=1,timer=null,playing=false;
  const go=n=>{cur=n;stage.dataset.stage=String(n);btns.forEach((b,i)=>b.setAttribute('aria-pressed',String(i+1===n)));
    const s=steps[n-1];cap.replaceChildren(make('h3','',s.title),make('p','',s.text));};
  const label=()=>{play.textContent=playing?'Пауза':'Грати';play.setAttribute('aria-pressed',String(playing));cap.setAttribute('aria-live',playing?'off':'polite');stage.dataset.playing=playing?'1':'0';};
  function start(){if(playing)return;playing=true;label();timer=win.setInterval(()=>go(nextStage(cur,steps.length)),INTERVAL_MS);}
  function pause(){if(!playing){return;}playing=false;win.clearInterval(timer);label();}
  play.addEventListener('click',()=>playing?pause():start());
  go(1);label();
  // Автопрогравання, коли схему видно; повторно не вмикаємо після того, як читач сам зупинив або вибрав крок.
  let touched=false;ctl.addEventListener('click',()=>{touched=true;},true);
  if(!reduce&&'IntersectionObserver' in win){new win.IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting&&!touched)start();else if(!e.isIntersecting&&playing)pause();}},{threshold:0.55}).observe(stage);}
  return {go,start,pause,get stage(){return cur;},get playing(){return playing;}};
}
if(typeof document!=='undefined')for(const stage of document.querySelectorAll('.mc-stage'))initScene(stage,SCENES[stage.dataset.scene]);
