// Інтервальний графік до розбору: точка = оцінка, лінія = 95% довірчий інтервал, вертикальна лінія = «немає різниці».
// Числа беруться лише з анотацій статей (research-data.js). Підписи звичайним HTML-текстом, графік дублюється числами в рядку.
export const fmt=(n,dec=2)=>(Math.round(n*10**dec)/10**dec).toFixed(dec).replace('-','−').replace('.',',');
export const crossesNull=(row,nullValue)=>row.lo<=nullValue&&row.hi>=nullValue;

// Відношення (лінія «немає різниці» = 1) малюємо на логарифмічній осі: зниження й підвищення в разах виглядають симетрично.
export const isRatio=chart=>chart.null===1;
const LOG_TICKS=[0.25,0.33,0.5,0.67,0.75,0.8,1,1.25,1.5,2,2.5,3,4];
export function niceStep(span,target=4){const raw=span/target,mag=10**Math.floor(Math.log10(raw)),n=raw/mag;return (n<1.5?1:n<3?2:n<7?5:10)*mag;}

// Чиста розкладка: позиції у відсотках осі, позначки осі, ряди. Запас 8% з боків; лінія «немає різниці» завжди всередині.
export function chartGeometry(chart){
  const ratio=isRatio(chart),T=v=>ratio?Math.log(v):v,U=v=>ratio?Math.exp(v):v;
  const vals=chart.rows.flatMap(r=>[r.lo,r.hi]).concat(chart.null).map(T);
  const min=Math.min(...vals),max=Math.max(...vals),pad=(max-min)*0.08||1,lo=min-pad,hi=max+pad,span=hi-lo;
  const pos=v=>Math.round(((T(v)-lo)/span)*10000)/100;
  let ticks,tickDec=2;
  if(ratio)ticks=LOG_TICKS.filter(t=>T(t)>=lo&&T(t)<=hi);
  else{const st=niceStep(U(hi)-U(lo)),first=Math.ceil(U(lo)/st)*st;tickDec=st>=1?0:Math.ceil(-Math.log10(st));ticks=[];for(let t=first;t<=U(hi)+1e-9;t+=st)ticks.push(Math.round(t*1e6)/1e6);}
  // Підписи осі не ближчі за 14% один до одного; лінія «немає різниці» лишається завжди.
  const kept=[];for(const t of ticks.slice().sort((x,y)=>(y===chart.null)-(x===chart.null)||x-y)){if(t===chart.null||kept.every(k=>Math.abs(pos(k)-pos(t))>=14))kept.push(t);}
  ticks=kept.sort((x,y)=>x-y);
  const dec=chart.dec??2,trim=t=>t.includes(',')?t.replace(/0+$/,'').replace(/,$/,''):t;
  return {nullPos:pos(chart.null),dec,ticks:ticks.map(t=>({v:t,p:pos(t),text:trim(fmt(t,ratio?2:tickDec))})),
    rows:chart.rows.map((r,i)=>({...r,i,p:pos(r.v),pLo:pos(r.lo),pHi:pos(r.hi),crosses:crossesNull(r,chart.null),
      text:`${fmt(r.v,dec)} (${fmt(r.lo,dec)}…${fmt(r.hi,dec)})`}))};
}

export function renderChart(doc,chart){
  const g=chartGeometry(chart),make=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const fig=make('figure','rs-chart');
  const cap=make('figcaption','rs-chart-title',chart.title);fig.append(cap);
  const rows=make('div','rs-chart-rows');rows.setAttribute('role','list');
  for(const r of g.rows){
    const row=make('div','rs-crow'+(r.crosses?' is-null':''));row.setAttribute('role','listitem');row.style.setProperty('--i',r.i);
    row.title=`${r.label}: ${r.text}${r.crosses?'. Інтервал перетинає лінію «немає різниці»':''}`;
    const label=make('span','rs-clabel',r.label);
    const plot=make('span','rs-cplot');plot.setAttribute('aria-hidden','true');
    const nul=make('i','rs-cnull');nul.style.left=g.nullPos+'%';
    for(const t of g.ticks){if(t.v===chart.null)continue;const tk=make('i','rs-ctick');tk.style.left=t.p+'%';plot.append(tk);}
    const ci=make('i','rs-cci');ci.style.left=r.pLo+'%';ci.style.width=(r.pHi-r.pLo)+'%';ci.style.setProperty('--origin',((r.p-r.pLo)/Math.max(r.pHi-r.pLo,0.01)*100)+'%');
    const dot=make('i','rs-cdot');dot.style.left=r.p+'%';
    plot.append(nul,ci,dot);
    const value=make('span','rs-cval',r.text+(r.crosses?' · різниця незначуща':''));
    row.append(label,plot,value);rows.append(row);
  }
  const axisRow=make('div','rs-crow rs-caxisrow');axisRow.setAttribute('aria-hidden','true');
  const axis=make('span','rs-caxis');
  for(const t of g.ticks){const l=make('span',t.v===chart.null?'rs-tick rs-tick-null':'rs-tick',t.text);l.style.left=t.p+'%';axis.append(l);}
  axisRow.append(make('span',''),axis,make('span',''));
  fig.append(rows,axisRow);
  if(chart.left||chart.right){const dir=make('p','rs-cdir');dir.append(make('span','',chart.left?'← '+chart.left:''),make('span','',chart.right?chart.right+' →':''));fig.append(dir);}
  fig.append(make('p','rs-cnote',`Вертикальна лінія: ${fmt(chart.null,0)} означає «немає різниці». ${chart.note||'Точка це оцінка авторів, лінія це 95% довірчий інтервал.'}`));
  return fig;
}
