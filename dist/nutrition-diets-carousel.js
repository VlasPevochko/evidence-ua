export function initDietCarousel(doc=globalThis.document){
 if(!doc)return;
 const track=doc.querySelector('[data-diet-carousel]');
 if(!track||track.dataset.carouselReady)return;
 const cards=[...track.querySelectorAll('.nd-card')];
 const previous=doc.querySelector('[data-diet-previous]');
 const next=doc.querySelector('[data-diet-next]');
 const counter=doc.querySelector('[data-diet-count]');
 const progress=doc.querySelector('[data-diet-progress]');
 if(!cards.length||!previous||!next||!counter||!progress)throw Error('Diet carousel markup is incomplete');
 const view=doc.defaultView;
 const reducedMotion=view.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let activeIndex=0;
 let targetIndex=null;
 let frame=0;
 let scrollTimer=0;

 const nearestIndex=()=>{
  const center=track.getBoundingClientRect().left+track.clientWidth/2;
  return cards.reduce((best,card,index)=>{
   const bounds=card.getBoundingClientRect();
   return Math.abs(bounds.left+bounds.width/2-center)<Math.abs(cards[best].getBoundingClientRect().left+cards[best].getBoundingClientRect().width/2-center)?index:best;
  },0);
 };
 const update=(index=nearestIndex())=>{
  activeIndex=index;
  counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  progress.style.setProperty('--nd-progress',`${(index+1)/cards.length*100}%`);
  previous.disabled=index===0;
  next.disabled=index===cards.length-1;
 };
 const centerCard=index=>{
  const bounds=cards[index].getBoundingClientRect();
  const trackBounds=track.getBoundingClientRect();
  const left=track.scrollLeft+bounds.left-trackBounds.left-(track.clientWidth-bounds.width)/2;
  track.scrollTo({left:Math.max(0,left),behavior:reducedMotion?'auto':'smooth'});
 };
 const move=step=>{
  const index=targetIndex??activeIndex;
  const target=Math.max(0,Math.min(cards.length-1,index+step));
  if(target===index)return;
  if(cards[index].open)cards[index].open=false;
  targetIndex=target;
  update(target);
  centerCard(target);
 };

 previous.addEventListener('click',()=>move(-1));
 next.addEventListener('click',()=>move(1));
 track.addEventListener('scroll',()=>{
  if(frame)view.cancelAnimationFrame(frame);
  frame=view.requestAnimationFrame(()=>{frame=0;update(targetIndex??nearestIndex());});
  if(targetIndex!==null){
   view.clearTimeout(scrollTimer);
   scrollTimer=view.setTimeout(()=>{targetIndex=null;update();},180);
  }
 },{passive:true});
 track.addEventListener('scrollend',()=>{
  view.clearTimeout(scrollTimer);
  targetIndex=null;
  update();
 },{passive:true});
 track.addEventListener('pointerdown',()=>{targetIndex=null;update();},{passive:true});
 track.addEventListener('keydown',event=>{
  if(event.target!==track)return;
  if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}
  if(event.key==='ArrowRight'){event.preventDefault();move(1);}
 });
 cards.forEach((card,index)=>card.addEventListener('toggle',()=>{
  view.requestAnimationFrame(()=>{
   if(card.open){targetIndex=index;update(index);centerCard(index);}
   else update();
  });
 }));
 track.dataset.carouselReady='true';
 update();
}

initDietCarousel();
