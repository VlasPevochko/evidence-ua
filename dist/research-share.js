// «Поділитись» для розборів: короткий текст (рідне вікно або копіювання) і картинка 1080×1350 для Telegram/Instagram.
// Нічого не надсилається на сервер: картинку малює браузер читача на canvas, вона зберігається як файл після натискання.
export const SHARE_NOTE='Це переказ висновків авторів дослідження, не медична порада.';
export const sourceHref=s=>s.source.doi?'https://doi.org/'+s.source.doi:'https://pubmed.ncbi.nlm.nih.gov/'+s.source.pmid+'/';
export const cardUrl=(study,pageUrl)=>String(pageUrl).split('#')[0]+'#'+study.id;
export const shareFileName=study=>`evidence-ua-${study.id}.png`;

// Текст: питання, відповідь, джерело, межі. Адреса або в тексті (копіювання), або окремо (рідне вікно «Поділитись»).
export function shareText(study,pageUrl,{withUrl=true}={}){
  const lines=[study.question,'',study.answer,'',`Джерело: ${study.source.label}. ${sourceHref(study)}`,SHARE_NOTE];
  if(withUrl)lines.push('',cardUrl(study,pageUrl));
  return lines.join('\n');
}

export async function shareStudy(study,pageUrl,nav=globalThis.navigator){
  const url=cardUrl(study,pageUrl);
  if(nav?.share){
    try{await nav.share({title:study.question,text:shareText(study,pageUrl,{withUrl:false}),url});return 'shared';}
    catch(e){if(e&&e.name==='AbortError')return 'cancelled';}
  }
  if(nav?.clipboard?.writeText){try{await nav.clipboard.writeText(shareText(study,pageUrl));return 'copied';}catch{}}
  return 'manual';
}

// Розкладка картинки: чиста функція, щоб перевіряти вмістимість тексту без малювання.
export const CARD={width:1080,height:1350,pad:90};
export function wrapLines(text,maxWidth,measure){
  const words=String(text).split(/\s+/).filter(Boolean),lines=[];let line='';
  for(const w of words){const next=line?line+' '+w:w;if(line&&measure(next)>maxWidth){lines.push(line);line=w;}else line=next;}
  if(line)lines.push(line);return lines;
}
export function layoutCard(study,topicLabel,measureFor){
  const W=CARD.width-CARD.pad*2,out={items:[],bottom:0};let y=CARD.pad+8;
  const qSize=study.question.length>58?60:68,aSize=study.answer.length>80?50:56,sSize=30;
  const q=wrapLines(study.question,W,measureFor('700 '+qSize+'px serif'));
  const a=wrapLines(study.answer,W,measureFor('600 '+aSize+'px sans'));
  const src=wrapLines(`Джерело: ${study.source.label}`,W,measureFor('500 '+sSize+'px sans'));
  const note=wrapLines(SHARE_NOTE,W,measureFor('500 '+sSize+'px sans'));
  y+=96;out.items.push({kind:'tag',text:topicLabel,y:CARD.pad});
  out.items.push({kind:'q',lines:q,size:qSize,y});y+=q.length*Math.round(qSize*1.2)+34;
  out.items.push({kind:'rule',y});y+=54;
  out.items.push({kind:'a',lines:a,size:aSize,y});y+=a.length*Math.round(aSize*1.3)+54;
  out.items.push({kind:'src',lines:src,size:sSize,y});y+=src.length*Math.round(sSize*1.45);
  out.items.push({kind:'note',lines:note,size:sSize,y:y+10});y+=10+note.length*Math.round(sSize*1.45);
  out.bottom=y;return out;
}
export const FITS=layout=>layout.bottom<=CARD.height-CARD.pad-70;

// Кольори картки беруться з поточної палітри сторінки (космічної або зеленої), щоб картинка для соцмереж виглядала як сам сайт.
// Без сторінки (тести) або без значень лишаються колишні зелені.
const CARD_COLORS={bg:'#0d1916',ink:'#8fae9f',line:'#26403a',muted:'#9db1a7',accent:'#e3bd6b',text:'#e9efe9'};
export function cardColors(doc){
  const out={...CARD_COLORS};
  try{
    const cs=doc?.defaultView?.getComputedStyle(doc.body);
    for(const [name,key] of [['--pine-bg','bg'],['--pine-ink','ink'],['--pine-line','line'],['--pine-muted','muted'],['--pine-accent','accent'],['--pine-text','text']]){
      const v=cs?.getPropertyValue(name).trim();if(/^#[0-9a-f]{6}$/i.test(v))out[key]=v;
    }
  }catch{}
  return out;
}
export async function drawCard(study,topicLabel,doc=document){
  const col=cardColors(doc);
  const c=doc.createElement('canvas');c.width=CARD.width;c.height=CARD.height;const g=c.getContext('2d');
  try{await doc.fonts?.ready;}catch{}
  const serif='"Source Serif 4",Georgia,"Times New Roman",serif',sans='Inter,system-ui,-apple-system,"Segoe UI",sans-serif';
  const fontOf=spec=>spec.replace('serif',serif).replace('sans',sans);
  const measureFor=spec=>t=>{g.font=fontOf(spec);return g.measureText(t).width;};
  const layout=layoutCard(study,topicLabel,measureFor);
  g.fillStyle=col.bg;g.fillRect(0,0,CARD.width,CARD.height);
  // Спокійна текстура: ромби лінією, як у смузі сайту.
  g.strokeStyle=col.ink;g.globalAlpha=.1;g.lineWidth=1.2;
  for(let x=0;x<CARD.width+60;x+=60)for(let y=0;y<CARD.height+60;y+=60){g.beginPath();g.moveTo(x,y-22);g.lineTo(x+22,y);g.lineTo(x,y+22);g.lineTo(x-22,y);g.closePath();g.stroke();}
  g.globalAlpha=1;g.textBaseline='top';
  // Короткий текст центруємо між позначкою теми й підписом, щоб картинка не була порожньою знизу.
  const shift=Math.max(0,Math.floor((CARD.height-CARD.pad-70-layout.bottom)/2));
  for(const it of layout.items){
    if(it.kind!=='tag')it.y+=shift;
    if(it.kind==='tag'){g.font=fontOf('600 28px sans');const w=g.measureText(it.text).width+44;g.strokeStyle=col.line;g.lineWidth=2;g.beginPath();g.roundRect(CARD.pad,it.y,w,52,26);g.stroke();g.fillStyle=col.muted;g.fillText(it.text,CARD.pad+22,it.y+11);}
    else if(it.kind==='rule'){g.fillStyle=col.accent;g.beginPath();g.roundRect(CARD.pad,it.y,200,12,6);g.fill();}
    else{const spec=it.kind==='q'?'700 '+it.size+'px serif':(it.kind==='a'?'600 '+it.size+'px sans':'500 '+it.size+'px sans');g.font=fontOf(spec);g.fillStyle=it.kind==='q'?col.text:it.kind==='a'?col.accent:col.muted;const lh=Math.round(it.size*(it.kind==='q'?1.2:it.kind==='a'?1.3:1.45));it.lines.forEach((l,i)=>g.fillText(l,CARD.pad,it.y+i*lh));}
  }
  g.fillStyle=col.text;g.font=fontOf('700 34px sans');g.fillText('Evidence UA',CARD.pad,CARD.height-CARD.pad-34);
  g.fillStyle=col.muted;g.font=fontOf('500 26px sans');const tail='Наука · Здоров’я · Рух';g.fillText(tail,CARD.width-CARD.pad-g.measureText(tail).width,CARD.height-CARD.pad-30);
  return {canvas:c,layout};
}
export async function saveCard(study,topicLabel,doc=document){
  const {canvas}=await drawCard(study,topicLabel,doc);
  const blob=await new Promise(res=>canvas.toBlob(res,'image/png'));
  const a=doc.createElement('a');a.href=URL.createObjectURL(blob);a.download=shareFileName(study);doc.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);return blob.size;
}
