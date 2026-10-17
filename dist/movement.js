import {poseFor,walkStateAt} from './movement-model.js?v=83';
import {mountMovementLearning} from './movement-learning.js?v=83';
const lessonModes={elbow:'sagittal',shoulder:'frontal',walk:'walk'};
const cyclePercent=phase=>((phase+Math.PI/2)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)/(Math.PI*2)*100;

export function syncCycleUI(root,progress,mode){
 root.getElementById('phase').value=String(Math.round(progress));
 root.getElementById('phase-value').textContent=Math.round(progress)+'%';
 if(mode!=='walk')return;
 const state=walkStateAt(progress);
 root.querySelectorAll('[data-walk-panel]').forEach(panel=>{const hidden=panel.dataset.walkPanel!==state;if(panel.hidden!==hidden)panel.hidden=hidden;});
 root.querySelectorAll('[data-walk-stop]').forEach(button=>{const pressed=String(walkStateAt(Number(button.dataset.walkStop))===state);if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);});
}

export function revealLessonFromHash(root,selectLesson){
 const key=root.defaultView.location.hash.replace(/^#lesson-/,'');
 if(!Object.hasOwn(lessonModes,key))return;
 selectLesson(key);
 root.getElementById('lesson-'+key)?.scrollIntoView({block:'start'});
}

export function mountMovement(root=document){
 const canvas=root.getElementById('model-canvas'),ctx=canvas?.getContext('2d');if(!ctx)return;
 const view=root.defaultView,play=root.getElementById('play'),phaseSlider=root.getElementById('phase'),phaseValue=root.getElementById('phase-value'),angle=root.getElementById('angle'),jointPanel=root.getElementById('joint-panel');
 const reduced=view.matchMedia('(prefers-reduced-motion:reduce)'),poses={'1':{},'-1':{}},showLabels=root.getElementById('show-labels');
 const titles={sagittal:'ЛІКОТЬ / ЗГИНАННЯ',frontal:'ПЛЕЧЕ / ВІДВЕДЕННЯ',walk:'КРОК / КІЛЬКА СУГЛОБІВ',all:'ТРИ ПЛОЩИНИ',transverse:'ПОВОРОТ ГОЛОВИ',puppet:'ВЛАСНА ПОЗА'};
 const descriptions={all:'Три просторові орієнтири: сагітальна площина — блакитна, фронтальна — золота, поперечна — фіолетова. Осі перпендикулярні відповідним площинам.',transverse:'Поворот голови: поперечна площина та поздовжня вісь. Рух спрощений.',puppet:'Зміни позу лівого або правого боку повзунками. Межі керування задані для схеми, не для оцінювання людини.'};
 let mode='sagittal',phase=-Math.PI/2,running=!reduced.matches,last=0,frame=0,width=0,height=0,side='1';
 const schedule=()=>{if(!frame)frame=view.requestAnimationFrame(render);};
 function sync(){
  const fixed=mode==='all'||mode==='puppet';play.disabled=fixed;phaseSlider.disabled=fixed;
  play.textContent=running&&!fixed?'Пауза':'Відтворити';play.setAttribute('aria-pressed',String(running&&!fixed));
  jointPanel.hidden=mode!=='puppet';root.getElementById('model-label').textContent=titles[mode];
  root.getElementById('walk-stops').hidden=mode!=='walk';
  canvas.setAttribute('aria-label',descriptions[mode]||titles[mode]+' — спрощена навчальна модель');
  root.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-pressed',String(lessonModes[b.dataset.lesson]===mode)));
  root.querySelectorAll('[data-lesson-panel]').forEach(p=>{p.hidden=lessonModes[p.dataset.lessonPanel]!==mode;});
  root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  root.getElementById('axis-description').textContent=descriptions[mode]||'Для окремих просторових орієнтирів обери додатковий режим.';
  syncCycleUI(root,cyclePercent(phase),mode);
  schedule();
 }
 function selectLesson(key,updateURL=false){
  if(!lessonModes[key])return;mode=lessonModes[key];phase=-Math.PI/2;last=0;angle.value=key==='shoulder'?'155':'90';
  if(updateURL){const url=new URL(view.location.href);url.hash='lesson-'+key;view.history.replaceState(view.history.state,'',url);}
  sync();
 }
 root.querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>selectLesson(b.dataset.lesson,true)));
 root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;phase=-Math.PI/2;last=0;sync();}));
 play.addEventListener('click',()=>{running=!running;last=0;sync();});
 phaseSlider.addEventListener('input',()=>{running=false;phase=Number(phaseSlider.value)/100*Math.PI*2-Math.PI/2;sync();});
 root.querySelectorAll('[data-walk-stop]').forEach(button=>button.addEventListener('click',()=>{
  running=false;phase=Number(button.dataset.walkStop)/100*Math.PI*2-Math.PI/2;last=0;sync();
 }));
 root.querySelectorAll('[data-walk-swing]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();running=false;selectLesson('walk',true);phase=.75*Math.PI*2-Math.PI/2;last=0;sync();
  root.getElementById('model').scrollIntoView({block:'start'});
  root.querySelector('[data-walk-stop="75"]').focus();
 }));
 showLabels.addEventListener('change',schedule);
 angle.addEventListener('input',schedule);root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{angle.value=b.dataset.view;schedule();}));
 reduced.addEventListener('change',()=>{if(reduced.matches){running=false;last=0;sync();}});
 const sliders=[...root.querySelectorAll('[data-joint]')];
 function syncSliders(){sliders.forEach(s=>{s.value=poses[side][s.dataset.joint]||0;s.nextElementSibling.textContent=s.value+'°';});}
 sliders.forEach(s=>s.addEventListener('input',()=>{poses[side][s.dataset.joint]=Number(s.value);s.nextElementSibling.textContent=s.value+'°';schedule();}));
 root.getElementById('model-side').addEventListener('change',event=>{side=event.target.value;syncSliders();});
 root.getElementById('reset-pose').addEventListener('click',()=>{poses['1']={};poses['-1']={};syncSliders();schedule();});
 const fromHash=()=>revealLessonFromHash(root,selectLesson);
 view.addEventListener('hashchange',fromHash);root.addEventListener('visibilitychange',()=>{last=0;if(!root.hidden)schedule();});
 const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(view.devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);schedule();};
 new view.ResizeObserver(resize).observe(canvas);
 function render(time){
  frame=0;const animated=running&&mode!=='all'&&mode!=='puppet'&&!root.hidden;
  if(animated&&last)phase+=Math.min((time-last)/1000,.04)*1.6;last=time;
  syncCycleUI(root,cyclePercent(phase),mode);
  ctx.clearRect(0,0,width,height);
  const yaw=Number(angle.value)*Math.PI/180,scale=Math.min(height/235,width/175);
  const project=p=>{const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw),perspective=600/(600+z);return [width/2+x*scale*perspective,height*.84-p[1]*scale*perspective,z];};
  function line(a,b,color,lineWidth=1){const p=project(a),q=project(b);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.strokeStyle=color;ctx.lineWidth=lineWidth*scale;ctx.lineCap='round';ctx.stroke();}
  const ground=mode==='walk'?7:0;
  for(let i=-3;i<=3;i++){line([i*25,ground,-80],[i*25,ground,80],'#9acbc51a',.45);line([-75,ground,i*25],[75,ground,i*25],'#9acbc51a',.45);}
  ctx.beginPath();ctx.ellipse(width/2,height*.85,40*scale,8*scale,0,0,Math.PI*2);ctx.fillStyle='#00101866';ctx.fill();
  function plane(points,color){ctx.beginPath();points.map(project).forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=color+'13';ctx.fill();ctx.strokeStyle=color+'65';ctx.lineWidth=1;ctx.stroke();}
  const colors={sagittal:'#6bd5ef',frontal:'#e7bd46',transverse:'#c3a0ff'};
  if(mode==='all'||mode==='sagittal')plane([[0,0,-45],[0,190,-45],[0,190,45],[0,0,45]],colors.sagittal);
  if(mode==='all'||mode==='frontal')plane([[-55,0,0],[-55,190,0],[55,190,0],[55,0,0]],colors.frontal);
  if(mode==='all'||mode==='transverse')plane([[-55,100,-45],[-55,100,45],[55,100,45],[55,100,-45]],colors.transverse);
  const segments=[],joints=[];let focusPose;const add=(a,b,r,active=false)=>segments.push({a,b,r,active,z:(project(a)[2]+project(b)[2])/2});
  add([0,91,0],[0,108,0],29);add([0,108,0],[0,124,0],25);add([0,124,0],[0,135,0],38);add([-18,138,0],[18,138,0],17);add([0,135,0],[0,154,0],9);add([-8,94,-7],[8,94,-7],18);
  for(const limbSide of [-1,1]){
   const p=poseFor(mode,phase,{side:limbSide,manual:poses[String(limbSide)]}),armActive=limbSide===1&&['sagittal','frontal'].includes(mode),legActive=mode==='walk'&&limbSide===1;
   if(limbSide===1)focusPose=p;
   add(p.hip,p.knee,16,legActive);add(p.knee,p.ankle,10,legActive);
   add([p.ankle[0],p.ankle[1]-2,p.ankle[2]-4],[p.ankle[0],p.ankle[1]-3,p.ankle[2]+5],9,legActive);
   add([p.ankle[0],p.ankle[1]-3,p.ankle[2]+5],[p.ankle[0],p.ankle[1]-4,p.ankle[2]+15],6,legActive);
   add(p.shoulder,p.elbow,11,armActive);add(p.elbow,p.wrist,8,armActive);add(p.wrist,[p.wrist[0],p.wrist[1]-5,p.wrist[2]+1],6,armActive);
   for(const key of ['shoulder','elbow','wrist','hip','knee','ankle'])joints.push({point:p[key],active:mode==='puppet'||(armActive&&key===(mode==='sagittal'?'elbow':'shoulder'))||(legActive&&['hip','knee','ankle'].includes(key))});
  }
  segments.sort((a,b)=>b.z-a.z).forEach(s=>{const p=project(s.a),q=project(s.b),gradient=ctx.createLinearGradient(p[0]-s.r*scale/2,p[1],p[0]+s.r*scale/2,p[1]);gradient.addColorStop(0,s.active?'#8f885e':'#425f6c');gradient.addColorStop(.45,s.active?'#e4d6a0':'#bdced1');gradient.addColorStop(1,s.active?'#9a956f':'#658693');ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.lineCap='round';ctx.lineWidth=s.r*scale;ctx.strokeStyle=gradient;ctx.stroke();});
  const head=project([0,170,0]),radius=12*scale,g=ctx.createRadialGradient(head[0]-radius*.35,head[1]-radius*.35,1,head[0],head[1],radius);g.addColorStop(0,'#dde7e4');g.addColorStop(1,'#63818c');ctx.beginPath();ctx.ellipse(head[0],head[1],radius*.8,radius*1.15,0,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
  const turn=mode==='transverse'?Math.sin(phase)*.85:0,nose=[Math.sin(turn)*14,170,Math.cos(turn)*14];
  if(Math.cos(yaw-turn)<.25)line([nose[0],nose[1]+2,nose[2]-3],nose,'#d9e1df',4);
  if(Math.cos(yaw)<0){line([-12,138,10],[12,138,10],'#e7bd4670',1);line([0,144,12],[0,120,12],'#e7bd4670',.8);}else line([0,145,-15],[0,108,-15],'#7eaccb80',1);
  function axis(a,b,color){line(a,b,color,1.2);}
  if(mode==='all'){axis([-65,100,0],[65,100,0],colors.sagittal);axis([0,100,-60],[0,100,60],colors.frontal);axis([0,0,0],[0,198,0],colors.transverse);}
  if(mode==='sagittal')axis([-10,109,0],[55,109,0],colors.sagittal);
  if(mode==='frontal')axis([23,139,-40],[23,139,40],colors.frontal);
  if(mode==='transverse')axis([0,150,0],[0,200,0],colors.transverse);
  for(const joint of joints){const p=project(joint.point);ctx.beginPath();ctx.arc(p[0],p[1],(joint.active?4:2.8)*scale,0,Math.PI*2);ctx.fillStyle=joint.active?'#ffdf82':'#3f606c';ctx.fill();ctx.beginPath();ctx.arc(p[0],p[1],(joint.active?7:3.8)*scale,0,Math.PI*2);ctx.strokeStyle=joint.active?'#ffdf8270':'#b6d8d777';ctx.lineWidth=1;ctx.stroke();}
  function label(point,text,edge='right',offsetY=0){
   const p=project(point);ctx.font=(width<420?'10':'11')+'px Arial';const size=ctx.measureText(text).width,x=edge==='left'?14:width-14-size,y=Math.max(26,Math.min(height-55,p[1]+offsetY));
   ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(edge==='left'?x+size+7:x-7,y-4);ctx.strokeStyle='#ffdb8070';ctx.lineWidth=1;ctx.stroke();
   ctx.fillStyle='#071e29e8';ctx.fillRect(x-5,y-15,size+10,22);ctx.fillStyle='#f4e8bd';ctx.fillText(text,x,y);
  }
  if(showLabels.checked&&focusPose){
   if(mode==='walk'){label(focusPose.hip,'Кульшовий','left',-8);label(focusPose.knee,'Колінний','left');label(focusPose.ankle,'Гомілковостопний','right',-4);}
   if(mode==='sagittal')label(focusPose.elbow,'Лікоть');
   if(mode==='frontal')label(focusPose.shoulder,'Плечовий суглоб','right',-20);
  }
  if(animated)schedule();
 }
 resize();sync();fromHash();
}
if(typeof document!=='undefined'){mountMovementLearning();mountMovement();}
