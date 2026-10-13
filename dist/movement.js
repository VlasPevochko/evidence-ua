(() => {
  const canvas = document.getElementById('model'), ctx = canvas.getContext('2d');
  const play = document.getElementById('play'), angle = document.getElementById('angle');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let mode = 'walk';
  const poses = {'1':{shoulder:0,elbow:0,hip:0,knee:0},'-1':{shoulder:0,elbow:0,hip:0,knee:0}};
  let selectedSide = '1';
  const lesson = document.createElement('section'); lesson.className = 'axes-lesson';
  lesson.innerHTML = `<div class="kicker">БІОМЕХАНІКА / ПЕРШИЙ КРОК</div><h2>Координати руху</h2><p>Площина — де відбувається рух.<br>Вісь — навколо чого відбувається обертання.</p><div class="mode-buttons" role="group" aria-label="Обрати приклад"><button data-mode="walk" aria-pressed="true">Крокування</button><button data-mode="all" aria-pressed="false">Усі площини</button><button data-mode="sagittal" aria-pressed="false">Сагітальна</button><button data-mode="frontal" aria-pressed="false">Фронтальна</button><button data-mode="transverse" aria-pressed="false">Поперечна</button></div><p id="axis-description" aria-live="polite">Обери площину: приклад з’явиться на моделі вище.</p><a href="#model">↑ До моделі</a><p class="note">Схема в анатомічній системі координат. Осі на загальному огляді — просторові орієнтири; у прикладах вісь показана біля відповідного суглоба. Реальні рухи можуть бути багатоплощинними; модель навмисно спрощена.</p><div class="sources"><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology" target="_blank" rel="noopener">Площини · OpenStax ↗</a><a href="https://pressbooks.bccampus.ca/humanbiomechanics/chapter/9-5-types-of-body-movements/" target="_blank" rel="noopener">Рухи й осі · Навчальний посібник ↗</a></div>`;
  document.querySelector('main').append(lesson);
  const descriptions = {
    walk:'Крокування — стилізована анімація. Для навчальних прикладів обери одну площину.',
    all:'Три площини: блакитна — сагітальна, золота — фронтальна, фіолетова — поперечна. Три осі перпендикулярні відповідним площинам.',
    sagittal:'Сагітальна площина · поперечна вісь (зліва направо). Приклад: згинання та розгинання ліктя.',
    frontal:'Фронтальна площина · сагітальна вісь (спереду назад). Приклад: відведення та приведення руки.',
    transverse:'Поперечна площина · поздовжня вісь (вгору–вниз). Приклад: поворот голови.'
  };
  lesson.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.mode; phase=0;
    lesson.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.getElementById('axis-description').textContent=descriptions[mode];
    canvas.setAttribute('aria-label',descriptions[mode]);
    angle.value=mode==='sagittal'?'90':'155';
  }));
  const views=document.createElement('div');views.className='view-buttons';
  [['Перед',180],['Спина',0],['Профіль',90]].forEach(([text,value])=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>{angle.value=value;});views.append(b);});
  document.querySelector('.controls').after(views);angle.value=155;
  const modeButtons = lesson.querySelector('.mode-buttons');
  const puppetButton = document.createElement('button');puppetButton.dataset.mode='puppet';puppetButton.textContent='Лялька';puppetButton.setAttribute('aria-pressed','false');modeButtons.append(puppetButton);
  descriptions.puppet='Лялька: зміни положення руки й ноги повзунками. Кути задають позу спрощеної моделі, а не норму рухливості чи вимірювання людини.';
  const jointPanel=document.createElement('section');jointPanel.className='joint-panel';jointPanel.hidden=true;
  jointPanel.innerHTML='<h3>Положення суглобів</h3><label>Бік моделі<select aria-label="Бік моделі"><option value="1">Лівий</option><option value="-1">Правий</option></select></label>';
  [['shoulder','Плече · підйом руки',150],['elbow','Лікоть · згинання',140],['hip','Кульшовий · підйом ноги',100],['knee','Коліно · згинання',130]].forEach(([key,title,max])=>{
    const label=document.createElement('label');label.className='joint-control';
    const name=document.createElement('span');name.textContent=title;
    const output=document.createElement('output');output.textContent='0°';
    const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=max;slider.step=1;slider.value=0;slider.dataset.joint=key;slider.setAttribute('aria-label',title+' — кут моделі');
    slider.addEventListener('input',()=>{poses[selectedSide][key]=Number(slider.value);output.textContent=slider.value+'°';});
    label.append(name,output,slider);jointPanel.append(label);
  });
  function syncSliders(){jointPanel.querySelectorAll('input').forEach(s=>{s.value=poses[selectedSide][s.dataset.joint];s.previousElementSibling.textContent=s.value+'°';});}
  jointPanel.querySelector('select').addEventListener('change',e=>{selectedSide=e.target.value;syncSliders();});
  const reset=document.createElement('button');reset.textContent='Скинути позу';reset.type='button';reset.addEventListener('click',()=>{Object.values(poses).forEach(p=>Object.keys(p).forEach(k=>p[k]=0));syncSliders();});jointPanel.append(reset);
  function updateModeUI(){jointPanel.hidden=mode!=='puppet';play.disabled=mode==='puppet'||mode==='all';}
  puppetButton.addEventListener('click',()=>{mode='puppet';modeButtons.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===puppetButton)));document.getElementById('axis-description').textContent=descriptions.puppet;canvas.setAttribute('aria-label',descriptions.puppet);angle.value=90;updateModeUI();});
  modeButtons.querySelectorAll('button:not([data-mode="puppet"])').forEach(b=>b.addEventListener('click',()=>{puppetButton.setAttribute('aria-pressed','false');updateModeUI();}));
  const workspace=document.createElement('section');workspace.className='model-workspace';workspace.setAttribute('aria-label','Модель і керування');
  const stage=document.querySelector('.stage');stage.before(workspace);
  const panel=document.createElement('div');panel.className='model-panel';
  workspace.append(stage,panel);panel.append(modeButtons,document.querySelector('.controls'),views,jointPanel,document.getElementById('axis-description'));
  const returnLink=lesson.querySelector('a[href="#model"]');returnLink.remove();
  let running = !reduced.matches, phase = 0, last = 0, width = 0, height = 0;
  function syncButton() { play.textContent = running ? 'Пауза' : 'Відтворити'; play.setAttribute('aria-pressed', String(running)); }
  syncButton();
  play.addEventListener('click', () => { running = !running; syncButton(); });
  reduced.addEventListener('change', () => { if (reduced.matches) { running = false; syncButton(); } });
  function resize() { const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); width = rect.width; height = rect.height; canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
  new ResizeObserver(resize).observe(canvas); resize();
  function render(time) {
    const dt = Math.min((time-last)/1000, .04); last=time;
    if (running && !document.hidden) phase += dt*2.5;
    ctx.clearRect(0,0,width,height);
    const yaw = Number(angle.value)*Math.PI/180, scale = Math.min(height/235,width/175);
    function project(p) { const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw), z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw); const perspective=600/(600+z); return [width/2+x*scale*perspective,height*.84-p[1]*scale*perspective,z]; }
    function line(a,b,color,lineWidth) { const p=project(a),q=project(b);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.strokeStyle=color;ctx.lineWidth=lineWidth*scale;ctx.lineCap='round';ctx.stroke(); }
    ctx.strokeStyle='#b0bcc015';ctx.lineWidth=1;
    for(let i=-3;i<=3;i++){line([i*25,0,-80],[i*25,0,80],'#b0bcc015',.5);line([-75,0,i*25],[75,0,i*25],'#b0bcc015',.5);}
    ctx.beginPath();ctx.ellipse(width/2,height*.85,40*scale,8*scale,0,0,Math.PI*2);ctx.fillStyle='#00000055';ctx.fill();
    function plane(points,color){ctx.beginPath();points.map(project).forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=color+'20';ctx.fill();ctx.strokeStyle=color+'90';ctx.lineWidth=1;ctx.stroke();}
    const colors={sagittal:'#6bd5ef',frontal:'#e7bd46',transverse:'#c3a0ff'};
    if(mode==='all'||mode==='sagittal')plane([[0,0,-45],[0,190,-45],[0,190,45],[0,0,45]],colors.sagittal);
    if(mode==='all'||mode==='frontal')plane([[-55,0,0],[-55,190,0],[55,190,0],[55,0,0]],colors.frontal);
    if(mode==='all'||mode==='transverse')plane([[-55,100,-45],[-55,100,45],[55,100,45],[55,100,-45]],colors.transverse);
    const bob = mode==='walk'?Math.cos(phase*2)*1.5:0;
    const hip=[0,91+bob,0], chest=[0,135+bob,0], neck=[0,154+bob,0];
    const segments=[];
    function add(a,b,r){segments.push({a,b,r,z:(project(a)[2]+project(b)[2])/2});}
    add(hip,[0,108+bob,0],29);add([0,108+bob,0],[0,124+bob,0],25);add([0,124+bob,0],chest,38);add([-18,138+bob,0],[18,138+bob,0],17);add(chest,neck,9);
    add([-8,94+bob,-7],[8,94+bob,-7],18);
    for(const side of [-1,1]){
      const stride = mode==='walk'?Math.sin(phase+(side===1?Math.PI:0)):0;
      const h=[side*13,91+bob,0];let knee=[side*14,48+bob+Math.max(0,stride)*5,stride*19], ankle=[side*14,9+Math.max(0,stride)*12,stride*31];
      if(mode==='puppet'){const p=poses[String(side)],a=p.hip*Math.PI/180,b=a-p.knee*Math.PI/180;knee=[h[0],h[1]-42*Math.cos(a),42*Math.sin(a)];ankle=[h[0],knee[1]-42*Math.cos(b),knee[2]+42*Math.sin(b)];}
      add(h,knee,16);add(knee,ankle,10);add([ankle[0],ankle[1]-3,ankle[2]-3],[ankle[0],ankle[1]-4,ankle[2]+12],6);
      const shoulder=[side*23,139+bob,0];let elbow=[side*28,109+bob,-stride*16], wrist=[side*28,81+bob,-stride*25+7];
      const t=(Math.sin(phase)+1)/2;
      if(side===1&&mode==='sagittal'){elbow=[23,109,0];const a=t*2.1;wrist=[23,109-28*Math.cos(a),28*Math.sin(a)];}
      if(side===1&&mode==='frontal'){const a=t*1.45;elbow=[23+30*Math.sin(a),139-30*Math.cos(a),0];wrist=[23+58*Math.sin(a),139-58*Math.cos(a),0];}
      if(mode==='puppet'){const p=poses[String(side)],a=p.shoulder*Math.PI/180,b=a+p.elbow*Math.PI/180;elbow=[shoulder[0],shoulder[1]-30*Math.cos(a),30*Math.sin(a)];wrist=[shoulder[0],elbow[1]-28*Math.cos(b),elbow[2]+28*Math.sin(b)];}
      add(shoulder,elbow,11);add(elbow,wrist,8);
      add(wrist,[wrist[0],wrist[1]-5,wrist[2]+1],6);
      if(mode==='puppet'){[h,knee,shoulder,elbow].forEach(j=>add(j,[j[0],j[1]+.1,j[2]],6));}
    }
    segments.sort((a,b)=>b.z-a.z).forEach(s=>{const p=project(s.a),q=project(s.b);const gradient=ctx.createLinearGradient(p[0]-s.r*scale/2,p[1],p[0]+s.r*scale/2,p[1]);gradient.addColorStop(0,'#526273');gradient.addColorStop(.45,'#c4ced6');gradient.addColorStop(1,'#718294');ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.lineCap='round';ctx.lineWidth=s.r*scale;ctx.strokeStyle=gradient;ctx.stroke();});
    const head=project([0,170+bob,0]), radius=12*scale;const g=ctx.createRadialGradient(head[0]-radius*.35,head[1]-radius*.35,1,head[0],head[1],radius);g.addColorStop(0,'#e1e6ea');g.addColorStop(1,'#627587');ctx.beginPath();ctx.ellipse(head[0],head[1],radius*.8,radius*1.15,0,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    const headTurn=mode==='transverse'?Math.sin(phase)*.85:0;
    const nose=[Math.sin(headTurn)*14,170+bob,Math.cos(headTurn)*14];
    if(Math.cos(yaw-headTurn)<.25){line([nose[0],nose[1]+2,nose[2]-3],nose,'#d9e1e8',5);}
    if(Math.cos(yaw-headTurn)<-.3){for(const side of [-1,1]){const eye=project([side*4*Math.cos(headTurn)+12*Math.sin(headTurn),174+bob,12*Math.cos(headTurn)-side*4*Math.sin(headTurn)]);ctx.beginPath();ctx.arc(eye[0],eye[1],1.3*scale,0,Math.PI*2);ctx.fillStyle='#283641';ctx.fill();}}
    if(Math.cos(yaw)<0){line([-12,138+bob,10],[12,138+bob,10],'#e7bd4699',1.2);line([0,144+bob,12],[0,120+bob,12],'#e7bd4699',1);}
    else{line([0,145+bob,-15],[0,108+bob,-15],'#7eaccb',1.5);}
    function axis(a,b,color,label){line(a,b,color,1.5);const p=project(b);ctx.fillStyle=color;ctx.font='11px Arial';ctx.fillText(label,p[0]+5,p[1]-5);}
    if(mode==='all'){axis([-65,100,0],[65,100,0],colors.sagittal,'Зліва–направо');axis([0,100,-60],[0,100,60],colors.frontal,'Перед–спина');axis([0,0,0],[0,198,0],colors.transverse,'Вгору–вниз');}
    if(mode==='sagittal')axis([-10,109,0],[55,109,0],colors.sagittal,'Вісь ліктя');
    if(mode==='frontal')axis([23,139,-40],[23,139,40],colors.frontal,'Вісь плеча');
    if(mode==='transverse')axis([0,150,0],[0,200,0],colors.transverse,'Вісь повороту');
    ctx.font='12px Arial';ctx.fillStyle='#d4dce5';ctx.fillText(Math.cos(yaw)<0?'ПЕРЕД':'СПИНА',18,28);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
