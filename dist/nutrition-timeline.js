(() => {
  'use strict';
  const panel=document.getElementById('digestion-panel'),embedded=document.getElementById('digestion-frame');
  let observer;
  embedded.addEventListener('load',()=>{
    const doc=embedded.contentDocument;
    if(!doc)return;
    const header=doc.querySelector('header');if(header)header.hidden=true;
    const resize=()=>{embedded.style.height=doc.documentElement.scrollHeight+'px';};
    observer=new ResizeObserver(resize);observer.observe(doc.body);resize();
  });
  panel.addEventListener('toggle',()=>{if(panel.open&&!embedded.getAttribute('src'))embedded.src=embedded.dataset.src;});
  const rows = [
    {name:'Тіамін · B1',pool:'Пул усього тіла',low:9,high:18,label:'9–18 днів',color:'#69ae99',text:'Institute of Medicine оцінює біологічний період напівобміну тіаміну приблизно у 9–18 днів. Це оцінка обміну речовини, а не гарантований термін появи дефіциту після зміни харчування.',url:'https://www.nationalacademies.org/read/6015/chapter/6',source:'Institute of Medicine · Thiamin'},
    {name:'Вітамін C',pool:'Пул усього тіла',low:8,high:40,label:'8–40 днів',color:'#dcaa58',text:'Institute of Medicine наводить широкий діапазон 8–40 днів. Період напівобміну залежить від розміру пулу. Вузький діапазон із відео не подаємо як універсальний.',url:'https://www.ncbi.nlm.nih.gov/books/NBK225480/',source:'Institute of Medicine · Vitamin C'},
    {name:'Вітамін B12',pool:'Розрахункова модель',low:693,high:693,label:'≈ 1,9 року*',color:'#a399cf',text:'Це розрахунок, а не виміряний діапазон: за сталої добової втрати 0,1% період зменшення пулу наполовину дорівнює приблизно 693 дням. Оцінка IOM передбачає нормальне всмоктування та повторне всмоктування B12. Вона не переноситься автоматично на порушення всмоктування.',url:'https://www.ncbi.nlm.nih.gov/books/NBK114329/',source:'Institute of Medicine · Appendix M'}
  ];
  const chart=document.getElementById('chart'),detail=document.getElementById('detail'),slider=document.getElementById('time'),play=document.getElementById('play'),clock=document.getElementById('clock');
  const position=days=>100*Math.log1p(days)/Math.log(731);
  rows.forEach((r,i)=>{const button=document.createElement('button');button.type='button';button.className='row';button.setAttribute('aria-pressed',String(i===0));button.style.setProperty('--row-color',r.color);const left=position(r.low),right=position(r.high),center=(left+right)/2;button.innerHTML='<span class="name">'+r.name+'<span class="meta">'+r.pool+'</span></span><span class="track"><span class="estimate" style="left:'+Math.min(88,Math.max(12,center))+'%">'+r.label+'</span><span class="band '+(r.low===r.high?'point':'')+'" style="left:'+left+'%;width:'+(r.low===r.high?'13px':right-left+'%')+'"></span><span class="cursor"></span></span>';button.addEventListener('click',()=>select(i));chart.append(button);});
  function select(index){const r=rows[index];chart.querySelectorAll('.row').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));detail.innerHTML='<p class="eyebrow">ЯК ЧИТАТИ ЦЮ СМУГУ</p><h3>'+r.name+' · '+r.label+'</h3><p>'+r.text+'</p><a href="'+r.url+'" target="_blank" rel="noopener">'+r.source+' →</a>';}
  let running=false,last=null,frame=null,value=0;
  function render(){const progress=Number(slider.value)/10,days=Math.round(Math.expm1(progress/100*Math.log(731)));clock.textContent=days<30?days+' днів':days<365?(days/30.44).toFixed(1).replace('.',',')+' міс.':(days/365.25).toFixed(1).replace('.',',')+' року';chart.querySelectorAll('.cursor').forEach(el=>el.style.left=progress+'%');slider.setAttribute('aria-valuetext',days+' днів');}
  function stop(){running=false;last=null;cancelAnimationFrame(frame);play.textContent='▶ Відтворити';}
  function tick(now){if(!running)return;if(last!==null)value=Math.min(1000,value+(now-last)/20);slider.value=Math.round(value);last=now;render();if(value>=1000){stop();return;}frame=requestAnimationFrame(tick);}
  play.addEventListener('click',()=>{if(running){stop();return;}if(Number(slider.value)>=1000)slider.value=0;value=Number(slider.value);running=true;last=null;play.textContent='Ⅱ Пауза';frame=requestAnimationFrame(tick);});slider.addEventListener('input',()=>{stop();render();});document.getElementById('reset').addEventListener('click',()=>{stop();slider.value=0;render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});select(0);render();
})();
