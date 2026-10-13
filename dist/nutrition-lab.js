import {nutritionBase,nutritionModule} from './nutrition-data.js?v=55';
import {createNutritionPlayer} from './nutrition-player.js?v=55';
import {ClaimCard,SourceCard,claimButton,getClaim,escapeHTML,mountEvidenceDrawer} from './evidence/components.js?v=55';

const e=escapeHTML;
const structures={
 sglt1:{route:'glucose',index:1,claimId:'CLM-000022'},glut2:{route:'glucose',index:2,claimId:'CLM-000023'},pump:{route:'glucose',index:1,claimId:'CLM-000024'},
 pept1:{route:'protein',index:1,claimId:'CLM-000025'},micelle:{route:'lipids',index:0,claimId:'CLM-000027'},chylomicron:{route:'lipids',index:2,claimId:'CLM-000028'}
};
export function mountNutritionLab(root=document,{base=nutritionBase,module=nutritionModule,schedule=setInterval,unschedule=clearInterval}={}){
 if(!root.querySelector('#nutrition-lab'))return null;
 const win=root.defaultView||globalThis,url=new URL(win.location?.href||'https://evidence.invalid/nutrition.html');
 const player=createNutritionPlayer(module,{route:url.searchParams.get('nutrient')||'glucose'});
 const one=id=>root.querySelector('#'+id),all=selector=>[...root.querySelectorAll(selector)];
 const preferences=href=>{const params=new URL(href).searchParams;return {depth:params.get('depth')==='detailed'?'detailed':'simple',view:params.get('scale')==='body'?'body':'cell',index:/^[0-3]$/.test(params.get('step'))?Number(params.get('step')):0,structure:Object.hasOwn(structures,params.get('structure'))?params.get('structure'):null};};
 let {depth,view,index:initialIndex,structure:selectedStructure}=preferences(url.href),timer=null;
 player.selectStep(initialIndex);
 if(selectedStructure){const s=structures[selectedStructure];player.selectRoute(s.route);player.selectStep(s.index);}
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const stopTimer=()=>{if(timer!==null){unschedule(timer);timer=null;}};
 function move(id,x,y,hidden=false){const item=one(id);item.setAttribute('transform',`translate(${x} ${y})`);item.style.transform=`translate(${x}px, ${y}px)`;item.toggleAttribute('hidden',hidden);}
 function scene(){
  const {routeId,index}=player.state();
  all('[data-nl-route]').forEach(g=>g.toggleAttribute('hidden',g.dataset.nlRoute!==routeId));
  const position=[125,250,640,785][index];
  move('nl-glucose-particle',position,210);move('nl-sodium-particle',index<2?position+25:355,240);
  move('nl-peptide-particle',index<2?position:380,280,index>=2);
  move('nl-aa-particle',index===2?450:position,280,index<2);
  move('nl-lipid-particle',[151,280,495,495][index],395,index>=2);
  // The micelle remains luminal. Only a new intracellular chylomicron is exported.
  move('nl-chylomicron',index===3?785:550,index===3?440:407,index<2);
  const highlight=selectedStructure||(routeId==='glucose'?(index===1?'sglt1':index===2?'glut2':null):routeId==='protein'?(index===1?'pept1':null):index<2?'micelle':'chylomicron');
  all('[data-nl-highlight]').forEach(node=>node.classList.toggle('is-selected',node.dataset.nlHighlight===highlight));
  all('[data-nl-structure]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nlStructure===highlight)));
  one('nutrition-lab').style.setProperty('--nl-accent',({glucose:'#e7bd46',protein:'#6bd5ef',lipids:'#bca3f3'})[routeId]);
 }
 function explanation(){
  const {route,step,index}=player.state();
  const ids=selectedStructure?[structures[selectedStructure].claimId]:step.claimIds;
  const unique=[...new Set(ids)];
  let text=`<p class="nl-step-kicker">${e(route.label)} · КРОК ${index+1}</p><h3>${e(selectedStructure?getClaim(unique[0],base).shortStatement:step.label)}</h3>`;
  for(const id of unique){const c=getClaim(id,base);text+=`<p>${e(depth==='detailed'?c.statement:c.shortStatement)}</p>${depth==='detailed'?`<p class="nl-limits">${e(c.limitations.join(' '))}</p>`:''}${claimButton(id,'Чому ми так пояснюємо?')}`;}
  if(!unique.length){text+=`<p>${e(getClaim('CLM-000021',base).statement)}</p>`;if(step.contextSourceId){const s=base.sources.find(s=>s.id===step.contextSourceId);text+=`<p class="nl-note">Джерело контексту: <a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a></p>`;}text+=claimButton('CLM-000021','Перетравлення та всмоктування: пояснення');}
  if(depth==='detailed')text+=`<p class="nl-note">${e(module.visualization.simplificationNote)}</p><span class="eua-provisional">Рівень впевненості не оцінено</span>`;
  one('nl-step-text').innerHTML=text;
 }
 function render(){
  const {route,index,running}=player.state();
  one('nl-counter').textContent=`Крок ${index+1} / ${route.steps.length}`;
  all('[data-nl-nutrient]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nlNutrient===route.id)));
  all('[data-nl-depth]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nlDepth===depth)));
  const buttons=one('nl-step-buttons');
  if(buttons.dataset.route!==route.id){buttons.dataset.route=route.id;buttons.innerHTML=route.steps.map((step,i)=>`<button type="button" data-nl-step="${i}" aria-pressed="false">${i+1}. ${e(step.label)}</button>`).join('');}
  all('[data-nl-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.nlStep)===index)));
  all('[data-nl-action]').forEach(b=>{const action=b.dataset.nlAction;b.disabled=action==='previous'&&index===0||action==='next'&&index===route.steps.length-1||action==='play'&&(running||reduced?.matches)||action==='pause'&&!running;});
  scene();explanation();if(!running)stopTimer();
  if(win.location?.href&&win.history){const link=new URL(win.location.href);link.searchParams.set('nutrient',route.id);link.searchParams.set('step',String(index));link.searchParams.set('depth',depth);link.searchParams.set('scale',view);if(selectedStructure)link.searchParams.set('structure',selectedStructure);else link.searchParams.delete('structure');win.history.replaceState(null,'',link.toString());}
 }
 function setView(value){
  view=value;player.pause();stopTimer();
  one('nl-body').hidden=view!=='body';one('nl-enterocyte').hidden=view!=='cell';
  all('[data-nl-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nlView===view)));
  const panel=one('digestion-panel');panel.open=view==='body';
  if(view==='cell'){try{const doc=one('digestion-frame').contentDocument,play=doc?.getElementById('play');if(play?.getAttribute('aria-pressed')==='true')play.click();}catch{/* optional same-origin embedded viewer */}}
  render();
 }
 const onClick=event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.nlView){setView(b.dataset.nlView);return;}
  if(b.dataset.nlDepth){depth=b.dataset.nlDepth;render();return;}
  if(b.dataset.nlNutrient){stopTimer();selectedStructure=null;player.selectRoute(b.dataset.nlNutrient);render();return;}
  if(b.dataset.nlStep!==undefined){stopTimer();selectedStructure=null;player.selectStep(Number(b.dataset.nlStep));render();return;}
  if(b.dataset.nlStructure){const s=structures[b.dataset.nlStructure];stopTimer();selectedStructure=b.dataset.nlStructure;player.selectRoute(s.route);player.selectStep(s.index);render();return;}
  if(b.dataset.nlAction){const action=b.dataset.nlAction;stopTimer();selectedStructure=null;
   if(action==='play'){player.play();if(!reduced?.matches)timer=schedule(()=>{player.tick();render();},2400);else player.pause();}
   else player[action]();render();
  }
 };
 const onHidden=()=>{if(root.hidden){player.pause();stopTimer();render();}};
 const onReduced=()=>{if(reduced.matches){player.pause();stopTimer();render();}};
 const onPageHide=()=>{player.pause();stopTimer();render();};
 const onPop=()=>{player.pause();stopTimer();const link=new URL(win.location.href),next=preferences(link.href);depth=next.depth;selectedStructure=next.structure;player.selectRoute(link.searchParams.get('nutrient')&&module.routes.some(r=>r.id===link.searchParams.get('nutrient'))?link.searchParams.get('nutrient'):'glucose');player.selectStep(next.index);if(selectedStructure){const s=structures[selectedStructure];player.selectRoute(s.route);player.selectStep(s.index);}setView(next.view);};
 root.addEventListener('click',onClick);root.addEventListener('visibilitychange',onHidden);reduced?.addEventListener('change',onReduced);win.addEventListener?.('pagehide',onPageHide);win.addEventListener?.('popstate',onPop);
  one('nl-model-note').textContent=module.visualization.simplificationNote+(reduced?.matches?' Увімкнено обмеження руху: користуйся кнопками Назад / Далі.':'');
 one('nl-version').textContent=module.version;
 one('nl-claims').innerHTML=module.claimIds.map(id=>ClaimCard(id,base)).join('');
 one('nl-sources').innerHTML=base.sources.map(s=>SourceCard(s,base.records.filter(r=>r.sourceId===s.id),true,'nutrition')).join('');
 const unmountDrawer=mountEvidenceDrawer(root,base);
 setView(view);
 return {player,render,setView,state:()=>({...player.state(),depth,view,selectedStructure}),destroy(){stopTimer();unmountDrawer?.();root.removeEventListener('click',onClick);root.removeEventListener('visibilitychange',onHidden);reduced?.removeEventListener('change',onReduced);win.removeEventListener?.('pagehide',onPageHide);win.removeEventListener?.('popstate',onPop);}};
}
if(typeof document!=='undefined')mountNutritionLab(document);
