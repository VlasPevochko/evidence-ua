(() => {
  const data={
    carbs:{label:'ВУГЛЕВОДИ',color:'#e7bd46',molecule:'Крохмаль → прості цукри',stages:[['Початок травлення','Жування подрібнює їжу; амілаза слини починає розщеплювати крохмаль.'],['Змішування їжі','Шлунок перемішує їжу й поступово передає вміст у тонку кишку.'],['Всмоктування','Ферменти завершують розщеплення; прості цукри проходять через клітини кишкової стінки.'],['Кров → печінка','Прості цукри надходять у кров і через ворітну вену — до печінки.'],['Використання або зберігання','Організм використовує засвоєні нутрієнти або зберігає їх; доля залежить від потреб.']]},
    protein:{label:'БІЛКИ',color:'#6bd5ef',molecule:'Білки → пептиди → амінокислоти',stages:[['Подрібнення','У роті їжа механічно подрібнюється й проходить стравоходом.'],['Розщеплення білка','Кисле середовище та пепсин у шлунку допомагають почати розщеплення білків.'],['Всмоктування','Ферменти тонкої кишки продовжують процес. Амінокислоти й короткі пептиди надходять у її клітини.'],['Кров → печінка','З клітин кишки амінокислоти переходять у кров і прямують до печінки.'],['Матеріал для організму','Засвоєні компоненти використовуються для побудови речовин організму й інших потреб; це не автоматичний приріст м’язів.']]},
    fat:{label:'ДОВГОЛАНЦЮГОВІ ЖИРИ',color:'#c3a0ff',molecule:'Жири → продукти розщеплення → хіломікрони',stages:[['Подрібнення їжі','Жування готує їжу до подальшого травлення.'],['Змішування й передача','Їжа перемішується в шлунку; основні наступні кроки відбуваються в тонкій кишці.'],['Всмоктування','Жовч і ферменти допомагають обробці жирів. Продукти розщеплення надходять у клітини кишки.'],['Лімфа → кров','Більшість довголанцюгових жирів транспортується у складі хіломікронів через лімфу до крові.'],['Доставка до тканин','Тканини отримують компоненти жирів для використання або зберігання. На схемі показана лише спрощена послідовність.']]}
  };
  const progress=document.getElementById('progress'),play=document.getElementById('play');
  const dots=[...document.querySelectorAll('#particles circle')];
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let nutrient='carbs',position=0,running=!reduced.matches,last=0,activeStage=-1;
  const food=document.getElementById('food-track'),blood=document.getElementById('blood-track'),lymph=document.getElementById('lymph-track');
  const lengths=new Map([food,blood,lymph].map(p=>[p,p.getTotalLength()]));
  function syncPlay(){play.textContent=running?'Пауза':'Відтворити';play.setAttribute('aria-pressed',String(running));}
  function draw(){
    const d=data[nutrient],stage=Math.min(4,Math.floor(position/20));
    document.documentElement.style.setProperty('--accent',d.color);
    document.getElementById('molecule').textContent=d.molecule;
    document.getElementById('particles').setAttribute('fill',d.color);
    const track=position<60?food:(nutrient==='fat'?lymph:blood);
    const fraction=position<60?position/60:(position-60)/40;
    dots.forEach((dot,i)=>{const p=track.getPointAtLength(Math.max(0,fraction-i*.035)*lengths.get(track));dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);});
    blood.style.strokeOpacity=nutrient==='fat'?'0.15':'0.7';lymph.style.strokeOpacity=nutrient==='fat'?'0.7':'0.15';
    progress.value=Math.round(position);document.getElementById('stage-counter').textContent=(stage+1)+' / 5';
    if(stage!==activeStage){activeStage=stage;document.getElementById('route-label').textContent=d.label;document.getElementById('stage-title').textContent=d.stages[stage][0];document.getElementById('stage-text').textContent=d.stages[stage][1];document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===stage)));}
  }
  document.querySelectorAll('[data-nutrient]').forEach(b=>b.addEventListener('click',()=>{nutrient=b.dataset.nutrient;position=0;activeStage=-1;document.querySelectorAll('[data-nutrient]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();}));
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{position=Number(b.dataset.step)*20+10;running=false;syncPlay();draw();}));
  progress.addEventListener('input',()=>{position=Number(progress.value);running=false;syncPlay();draw();});
  play.addEventListener('click',()=>{if(position>=100)position=0;running=!running;syncPlay();draw();});
  document.getElementById('restart').addEventListener('click',()=>{position=0;activeStage=-1;draw();});
  reduced.addEventListener('change',()=>{if(reduced.matches){running=false;syncPlay();}});
  function animate(time){const dt=Math.min((time-last)/1000,.05);last=time;if(running&&!document.hidden){position=Math.min(100,position+dt*5);draw();if(position===100){running=false;syncPlay();}}requestAnimationFrame(animate);}
  syncPlay();draw();requestAnimationFrame(animate);
})();
