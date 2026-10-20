// Підказки до термінів: перше входження терміна в тексті стає кнопкою з коротким поясненням і посиланням на джерело.
// Означення спираються на тексти, які вже є на сайті («Як читати докази», досьє, Fat Burning Lab); нових наукових тверджень тут немає.
const handbook=n=>({label:'Cochrane Handbook ↗',href:'https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-'+String(n).padStart(2,'0')});
const meerman={label:'Meerman & Brown, BMJ 2014 ↗',href:'https://www.bmj.com/content/349/bmj.g7257'};
export const TERMS=[
  {id:'rkd',title:'РКД',definition:'Рандомізоване контрольоване дослідження: учасників розподіляють між групами за правилом випадку, а результати порівнюють із контролем.',source:handbook(8),patterns:['РКД','[Рр]андомізован\\p{L}* контрольован\\p{L}* дослідженн\\p{L}*']},
  {id:'meta',title:'Метааналіз',definition:'Об’єднує результати кількох досліджень. Це не означає, що будь-який висновок стає істиною: потрібно дивитися, які люди, що порівнювали й наскільки надійні дослідження.',source:handbook(10),patterns:['[Мм]етааналіз\\p{L}*']},
  {id:'ci',title:'Довірчий інтервал (ДІ)',definition:'Діапазон значень ефекту, сумісних з даними дослідження. Для різниці середніх нуль означає відсутність різниці, для відношення ризиків — одиниця: якщо інтервал їх охоплює, чіткої переваги не встановлено.',source:handbook(6),patterns:['95% довірчий інтервал','[Дд]овірчий інтервал','95% ДІ','ДІ']},
  {id:'smd',title:'Стандартизована різниця середніх',definition:'Спосіб порівняти результати, виміряні в різних одиницях, на спільній шкалі. Це не кілограми, не секунди й не відсоток покращення.',source:handbook(6),patterns:['[Сс]тандартизован\\p{L}* різниц\\p{L}* середніх']},
  {id:'i2',title:'I²',definition:'Показник статистичної неоднорідності результатів. Це не «відсоток поганих досліджень», а низьке I² не гарантує однакових умов у дослідженнях.',source:handbook(10),patterns:['I²']},
  {id:'grade',title:'GRADE',definition:'Підхід, який для конкретного результату оцінює впевненість у доказах: ризик упередженості, неузгодженість, непрямість, неточність і публікаційне упередження. Це не рейтинг «добавки загалом».',source:handbook(14),patterns:['GRADE']},
  {id:'triglycerides',title:'Тригліцериди',definition:'Форма, у якій жирова тканина зберігає значну частину енергії. Це запас енергії, а не речовина, яка просто «тане» від тепла.',source:meerman,patterns:['[Тт]ригліцерид\\p{L}*']},
  {id:'lipolysis',title:'Ліполіз',definition:'Розщеплення тригліцеридів, після якого жирні кислоти можуть виходити в кров і використовуватися. Ліполіз не тотожний втраті жиру: вивільнення жирних кислот ще не гарантує їх кінцевого окиснення.',source:meerman,patterns:['[Лл]іполіз\\p{L}*']}
];
// Де шукати терміни: лише в основному читанні, а не в заголовках, кнопках і посиланнях.
export const TERM_SCOPES={'index.html':['.evidence-guide','.dossier-panel'],'fat-burning.html':['.fb-main'],'protein-meta.html':['main'],'supplements.html':['main'],'nutrition.html':['main'],'nutrition-digestion.html':['main']};
const SKIP='a,button,summary,h1,h2,h3,h4,h5,h6,script,style,textarea,select,option,code,[data-eua-term],.eua-term,.eua-term-pop,.eua-trainer,[aria-hidden="true"],svg';
const edge='(?<![\\p{L}\\p{N}])',tail='(?![\\p{L}\\p{N}])';
export function termRegex(term){return new RegExp(edge+'(?:'+term.patterns.join('|')+')'+tail,'u');}
export function findTerm(text,term,skip=false){
  const m=termRegex(term).exec(text);return m?{index:m.index,length:m[0].length,text:m[0]}:null;
}
export function wrapTerms(container,terms=TERMS){
  const doc=container?.ownerDocument,done=new Set();let count=0;
  if(typeof doc?.createTreeWalker!=='function')return 0;
  for(const term of terms){
    if(done.has(term.id))continue;
    const walker=doc.createTreeWalker(container,4);let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;if(!parent||parent.closest(SKIP))continue;
      const hit=findTerm(node.nodeValue,term);if(!hit)continue;
      const before=node.nodeValue.slice(0,hit.index),after=node.nodeValue.slice(hit.index+hit.length);
      const wrap=doc.createElement('span');wrap.className='eua-term-wrap';wrap.dataset.euaTerm=term.id;
      const button=doc.createElement('button');button.type='button';button.className='eua-term';button.textContent=hit.text;
      button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',hit.text+': пояснення терміна');
      wrap.append(button);
      const frag=doc.createDocumentFragment();if(before)frag.append(before);frag.append(wrap);if(after)frag.append(after);
      node.replaceWith(frag);done.add(term.id);count++;break;
    }
  }
  return count;
}
function openPop(root,wrap,term){
  closePop(root);
  const pop=root.createElement('div');pop.className='eua-term-pop';pop.setAttribute('role','group');pop.setAttribute('aria-label','Пояснення: '+term.title);
  const h=root.createElement('strong');h.textContent=term.title;
  const p=root.createElement('p');p.textContent=term.definition;
  const a=root.createElement('a');a.href=term.source.href;a.target='_blank';a.rel='noopener';a.textContent=term.source.label;
  const x=root.createElement('button');x.type='button';x.className='eua-term-close';x.textContent='Закрити';
  pop.append(h,p,a,x);wrap.append(pop);
  wrap.querySelector('.eua-term').setAttribute('aria-expanded','true');
  const view=root.defaultView;
  // Keep the card inside the viewport: shift it left when the term sits near the right edge.
  const box=pop.getBoundingClientRect();let shift=0;
  if(box.right>view.innerWidth-12)shift=box.right-(view.innerWidth-12);
  if(box.left-shift<12)shift=box.left-12;
  pop.style.left=(-shift)+'px';
  x.addEventListener('click',()=>{closePop(root,true);});
}
function closePop(root,focus){
  const pop=root.querySelector('.eua-term-pop');if(!pop)return;
  const wrap=pop.closest('.eua-term-wrap'),btn=wrap?.querySelector('.eua-term');
  pop.remove();btn?.setAttribute('aria-expanded','false');if(focus)btn?.focus();
}
export function mountTerms(root=document){
  const view=root.defaultView;if(!view||view.self!==view.top||root.body.dataset.euaTermsMounted)return 0;
  const file=String(view.location?.pathname||'').split('/').pop()||'index.html',scopes=TERM_SCOPES[file];if(!scopes)return 0;
  root.body.dataset.euaTermsMounted='1';
  let n=0;
  for(const selector of scopes)for(const container of root.querySelectorAll(selector))n+=wrapTerms(container);
  if(!n)return 0;
  const head=root.head;if(head&&!root.querySelector('link[data-terms-style]')){const css=root.createElement('link');css.rel='stylesheet';css.href='./terms.css?v=1';css.dataset.termsStyle='';head.append(css);}
  root.addEventListener('click',event=>{
    const btn=event.target.closest?.('.eua-term');
    if(btn){const wrap=btn.closest('.eua-term-wrap'),term=TERMS.find(t=>t.id===wrap.dataset.euaTerm);
      if(wrap.querySelector('.eua-term-pop'))closePop(root,false);else if(term)openPop(root,wrap,term);return;}
    if(!event.target.closest?.('.eua-term-pop'))closePop(root,false);
  });
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.querySelector('.eua-term-pop')){event.preventDefault();closePop(root,true);}});
  return n;
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountTerms(document),{once:true});else mountTerms(document);}
