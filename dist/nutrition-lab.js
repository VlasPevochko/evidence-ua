import {nutritionBase,nutritionModule} from './nutrition-data.js?v=55';
import {createNutritionPlayer} from './nutrition-player.js?v=55';
import {ClaimCard,SourceCard,claimButton,getClaim,escapeHTML,mountEvidenceDrawer} from './evidence/components.js?v=55';

const e=escapeHTML;
// Structures that can be picked on the diagram: which route and step show them, and which Claim explains them.
const structures={
 sglt1:{route:'glucose',index:1,claimId:'CLM-000022'},glut2:{route:'glucose',index:2,claimId:'CLM-000023'},pump:{route:'glucose',index:1,claimId:'CLM-000024'},
 pept1:{route:'protein',index:1,claimId:'CLM-000025'},micelle:{route:'lipids',index:0,claimId:'CLM-000027'},chylomicron:{route:'lipids',index:2,claimId:'CLM-000028'}
};
// The chips under the diagram double as its legend: only the structures that exist on the current route are offered.
const routeStructures={glucose:['sglt1','glut2','pump'],protein:['pept1'],lipids:['micelle','chylomicron']};
const structureLabels={sglt1:'SGLT1',glut2:'GLUT2',pump:'Na⁺/K⁺-насос',pept1:'PEPT1',micelle:'Міцела',chylomicron:'Хіломікрон'};
const routeLegend={
 glucose:[['#f4cf63','Глюкоза'],['#98ecf0','Na⁺']],
 protein:[['#6db8ee','Пептид'],['#8ee5f3','Амінокислота']],
 lipids:[['#d7bcff','Ліпідні складники'],['#806bc2','Хіломікрон']]
};
// Where the action is in the 900×560 drawing: used to zoom in on a phone, where the whole cell is too small to read.
const focusX={glucose:[125,250,640,785],protein:[125,250,640,785],lipids:[140,280,550,785]};
const focusY={glucose:210,protein:280,lipids:400};
const PHONE_ZOOM=1.9;

// The same context sentence under every card is shown once above them; anything that differs stays on its card.
export function dedupeContext(cards){
 const pattern=/<div class="eua-context"><span>Для кого \/ контекст<\/span><p>([\s\S]*?)<\/p><\/div>/;
 const found=cards.map(card=>card.match(pattern)?.[1]);
 const shared=found[0]&&found.every(text=>text===found[0])?found[0]:null;
 const cleaned=cards.map(card=>(shared?card.replace(pattern,''):card).replace('<p></p>',''));
 return {cards:cleaned,shared};
}

export function mountNutritionLab(root=document,{base=nutritionBase,module=nutritionModule,schedule=setInterval,unschedule=clearInterval}={}){
 if(!root.querySelector('#nutrition-lab'))return null;
 const win=root.defaultView||globalThis,url=new URL(win.location?.href||'https://evidence.invalid/nutrition.html');
 const player=createNutritionPlayer(module,{route:url.searchParams.get('nutrient')||'glucose'});
 const one=id=>root.querySelector('#'+id),all=selector=>[...root.querySelectorAll(selector)];
 // The reading-depth switcher is retired: the short text is always shown, the full statement and limits sit under "Докладніше".
 const preferences=href=>{const params=new URL(href).searchParams;return {view:params.get('scale')==='body'?'body':'cell',index:/^[0-3]$/.test(params.get('step'))?Number(params.get('step')):0,structure:Object.hasOwn(structures,params.get('structure'))?params.get('structure'):null};};
 let {view,index:initialIndex,structure:selectedStructure}=preferences(url.href),timer=null,moreOpen=false,chipsRoute=null;
 player.selectStep(initialIndex);
 if(selectedStructure){const s=structures[selectedStructure];player.selectRoute(s.route);player.selectStep(s.index);}
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)'),phone=win.matchMedia?.('(max-width: 760px)');
 const stopTimer=()=>{if(timer!==null){unschedule(timer);timer=null;}};
 function move(id,x,y,hidden=false){const item=one(id);item.setAttribute('transform',`translate(${x} ${y})`);item.style.transform=`translate(${x}px, ${y}px)`;item.toggleAttribute('hidden',hidden);}
 // Zoom the diagram towards the active point (phone only). Percentages of the drawing; clamped so no empty edge shows.
 function focusStage(routeId,index){
  const stage=one('nl-stage');if(!stage)return;
  const zoom=phone?.matches?PHONE_ZOOM:1,clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const px=focusX[routeId][index]/900*100,py=focusY[routeId]/560*100;
  stage.style.setProperty('--nl-zoom',String(zoom));
  stage.style.setProperty('--nl-tx',zoom===1?'0%':`${clamp(50-zoom*px,100*(1-zoom),0).toFixed(1)}%`);
  stage.style.setProperty('--nl-ty',zoom===1?'0%':`${clamp(50-zoom*py,100*(1-zoom),0).toFixed(1)}%`);
 }
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
  focusStage(routeId,index);
 }
 function explanation(){
  const {route,step,index}=player.state();
  const ids=selectedStructure?[structures[selectedStructure].claimId]:step.claimIds;
  const unique=[...new Set(ids)];
  let text=`<p class="nl-step-kicker">${e(route.label)} · КРОК ${index+1}</p><h3>${e(selectedStructure?getClaim(unique[0],base).shortStatement:step.label)}</h3>`;
  if(unique.length){
   const cs=unique.map(id=>getClaim(id,base));
   text+=cs.map(c=>`<p class="nl-lead">${e(c.shortStatement)}</p>`).join('')+`<details class="nl-more"${moreOpen?' open':''}><summary>Докладніше й межі</summary>${cs.map(c=>`<p>${e(c.statement)}</p><p class="nl-limits">${e(c.limitations.join(' '))}</p>`).join('')}<p class="nl-note">${e(module.visualization.simplificationNote)}</p><span class="eua-provisional">Рівень впевненості не оцінено</span></details>`+unique.map(id=>claimButton(id,unique.length>1?`Чому так: ${getClaim(id,base).shortStatement.replace(/[.:]\s.*$/,'').slice(0,40)}`:'Чому ми так пояснюємо?')).join('');
  }
  if(!unique.length){text+=`<p class="nl-lead">${e(getClaim('CLM-000021',base).statement)}</p>`;if(step.contextSourceId){const s=base.sources.find(s=>s.id===step.contextSourceId);text+=`<p class="nl-note">Джерело контексту: <a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a></p>`;}text+=claimButton('CLM-000021','Перетравлення та всмоктування: пояснення');}
  one('nl-step-text').innerHTML=text;
 }
 function renderLegend(routeId){
  if(chipsRoute===routeId)return;
  chipsRoute=routeId;
  one('nl-legend').innerHTML=routeLegend[routeId].map(([color,label])=>`<li><i style="background:${color}" aria-hidden="true"></i>${e(label)}</li>`).join('');
  one('nl-structures').innerHTML=routeStructures[routeId].map(id=>`<button type="button" data-nl-structure="${id}" aria-pressed="false">${e(structureLabels[id])}</button>`).join('');
 }
 function render(){
  const {route,index,running}=player.state();
  one('nl-counter').textContent=`Крок ${index+1} / ${route.steps.length}`;
  all('[data-nl-nutrient]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nlNutrient===route.id)));
  const buttons=one('nl-step-buttons');
  if(buttons.dataset.route!==route.id){buttons.dataset.route=route.id;buttons.innerHTML=route.steps.map((step,i)=>`<button type="button" data-nl-step="${i}" aria-pressed="false"><span class="nl-step-num" aria-hidden="true">${i+1}</span><span>${e(step.label)}</span></button>`).join('');}
  all('[data-nl-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.nlStep)===index)));
  all('[data-nl-action]').forEach(b=>{b.setAttribute('aria-pressed',String(running));b.textContent=running?'Ⅱ Пауза':'▶ Відтворити';b.disabled=!running&&Boolean(reduced?.matches);});
  renderLegend(route.id);
  scene();explanation();if(!running)stopTimer();
  if(win.location?.href&&win.history){const link=new URL(win.location.href);link.searchParams.set('nutrient',route.id);link.searchParams.set('step',String(index));link.searchParams.set('scale',view);link.searchParams.delete('depth');if(selectedStructure)link.searchParams.set('structure',selectedStructure);else link.searchParams.delete('structure');win.history.replaceState(null,'',link.toString());}
 }
 const trimEmbed=()=>{try{const f=one('digestion-frame'),doc=f.contentDocument;if(!doc||doc.getElementById('nl-embed-trim'))return;const st=doc.createElement('style');st.id='nl-embed-trim';st.textContent='header,.fp-eyebrow,main>h1,.fp-intro,.fp-reading{display:none!important}main{padding-top:0!important}html,body{background:#0f1217!important;min-height:0!important;height:auto!important}';doc.head.appendChild(st);f.style.height='480px';}catch{}};
 try{one('digestion-frame').addEventListener('load',trimEmbed);trimEmbed();}catch{}
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
  if(b.dataset.nlNutrient){stopTimer();selectedStructure=null;player.selectRoute(b.dataset.nlNutrient);render();return;}
  if(b.dataset.nlStep!==undefined){stopTimer();selectedStructure=null;player.selectStep(Number(b.dataset.nlStep));render();return;}
  if(b.dataset.nlStructure){const s=structures[b.dataset.nlStructure];stopTimer();selectedStructure=b.dataset.nlStructure;player.selectRoute(s.route);player.selectStep(s.index);render();return;}
  if(b.dataset.nlAction==='play'){
   // One button: play when idle, pause while running. Under reduced motion it stays disabled; use the step buttons.
   const wasRunning=player.state().running;stopTimer();selectedStructure=null;
   if(wasRunning)player.pause();
   else{player.play();if(!reduced?.matches)timer=schedule(()=>{player.tick();render();},2400);else player.pause();}
   render();
  }
 };
 const onToggle=event=>{
  const node=event.target;
  if(node?.classList?.contains?.('nl-more'))moreOpen=node.open;
  // On a phone the diet cards sit in a swipe strip: bring the card that was just opened into view.
  if(node?.classList?.contains?.('nd-card')&&node.open&&phone?.matches)node.scrollIntoView?.({inline:'center',block:'nearest',behavior:reduced?.matches?'auto':'smooth'});
 };
 const onHidden=()=>{if(root.hidden){player.pause();stopTimer();render();}};
 const onReduced=()=>{if(reduced.matches){player.pause();stopTimer();render();}};
 const onPageHide=()=>{player.pause();stopTimer();render();};
 const onResize=()=>{const {routeId,index}=player.state();focusStage(routeId,index);};
 const onPop=()=>{player.pause();stopTimer();const link=new URL(win.location.href),next=preferences(link.href);selectedStructure=next.structure;player.selectRoute(link.searchParams.get('nutrient')&&module.routes.some(r=>r.id===link.searchParams.get('nutrient'))?link.searchParams.get('nutrient'):'glucose');player.selectStep(next.index);if(selectedStructure){const s=structures[selectedStructure];player.selectRoute(s.route);player.selectStep(s.index);}setView(next.view);};
 root.addEventListener('click',onClick);root.addEventListener('toggle',onToggle,true);root.addEventListener('visibilitychange',onHidden);reduced?.addEventListener('change',onReduced);phone?.addEventListener?.('change',onResize);win.addEventListener?.('pagehide',onPageHide);win.addEventListener?.('popstate',onPop);
 one('nl-model-note').textContent=module.visualization.simplificationNote+(reduced?.matches?' Увімкнено обмеження руху: користуйся кнопками кроків.':'');
 one('nl-version').textContent=module.version;
 const {cards,shared}=dedupeContext(module.claimIds.map(id=>ClaimCard(id,base)));
 one('nl-claims').innerHTML=(shared?`<p class="nl-note nl-claims-shared"><strong>Контекст для всіх пояснень нижче:</strong> ${e(shared)}</p>`:'')+cards.join('');
 one('nl-claim-count').textContent=String(module.claimIds.length);
 one('nl-sources').innerHTML=base.sources.map(s=>SourceCard(s,base.records.filter(r=>r.sourceId===s.id),true,'nutrition')).join('');
 one('nl-source-count').textContent=String(base.sources.length);
 const unmountDrawer=mountEvidenceDrawer(root,base);
 setView(view);
 return {player,render,setView,state:()=>({...player.state(),view,selectedStructure}),destroy(){stopTimer();unmountDrawer?.();root.removeEventListener('click',onClick);root.removeEventListener('toggle',onToggle,true);root.removeEventListener('visibilitychange',onHidden);reduced?.removeEventListener('change',onReduced);phone?.removeEventListener?.('change',onResize);win.removeEventListener?.('pagehide',onPageHide);win.removeEventListener?.('popstate',onPop);}};
}
if(typeof document!=='undefined')mountNutritionLab(document);
