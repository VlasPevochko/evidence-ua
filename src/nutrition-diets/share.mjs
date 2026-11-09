export const STORY_SIZE={width:1080,height:1920,pad:92};
export const STORY_NOTE='Результат опублікованого дослідження. Не оцінка Evidence UA. Не медична порада.';

export function storyUrl(id,pageUrl){
 const url=new URL(pageUrl);
 url.hash='diet-'+id;
 return url.href;
}

export function storyText(story,url){
 return `${story.title} — результат дослідження\n\n${story.finding}\n\nДжерело: ${story.sourceLabel}. ${story.sourceUrl}\n\n${STORY_NOTE}\n\n${url}`;
}

export function storyFileName(story){
 return `evidence-ua-diet-${story.id}-story.png`;
}

export function wrapLines(text,maxWidth,measure){
 const words=String(text).split(/\s+/).filter(Boolean),lines=[];
 let line='';
 for(const word of words){
  const next=line?line+' '+word:word;
  if(line&&measure(next)>maxWidth){lines.push(line);line=word;}
  else line=next;
 }
 if(line)lines.push(line);
 return lines;
}

export function layoutStory(story,measureFor){
 const {width,height,pad}=STORY_SIZE,contentWidth=width-pad*2;
 const items=[];
 let fitsWidth=true;
 let y=pad;
 const addText=(kind,text,size,family,color,lineHeight=size*1.35,gap=0)=>{
  const font=`${kind==='title'?'600':'500'} ${size}px ${family}`;
  const measure=measureFor(font);
  const lines=wrapLines(text,contentWidth,measure);
  if(lines.some(line=>measure(line)>contentWidth+1))fitsWidth=false;
  items.push({kind,lines,size,y,lineHeight,color});
  y+=lines.length*lineHeight+gap;
 };

 addText('brand','EVIDENCE UA',30,'sans','text',40,70);
 addText('kicker','ХАРЧУВАННЯ  /  НАУКОВИЙ РЕЗУЛЬТАТ',24,'sans','accent',34,48);
 addText('title',story.title,76,'serif','text',88,65);
 addText('label','ЩО ПОКАЗАЛИ ДОСЛІДЖЕННЯ',25,'sans','muted',36,24);
 addText('finding',story.finding,43,'sans','text',59,52);
 addText('source','Джерело: '+story.sourceLabel,29,'sans','accent',41,26);
 addText('note',STORY_NOTE,25,'sans','muted',36,28);
 addText('url','Читати картку: vlaspevochko.github.io/evidence-ua/nutrition.html#diet-'+story.id,22,'sans','muted',32,0);
 return {items,bottom:y,fits:fitsWidth&&y<=height-pad-100};
}

export async function shareStory(story,file,pageUrl,nav=globalThis.navigator){
 if(!file||!nav?.share||!nav?.canShare)return 'unsupported';
 try{
  if(!nav.canShare({files:[file]}))return 'unsupported';
  await nav.share({title:`${story.title} — Evidence UA`,text:storyText(story,pageUrl),files:[file]});
  return 'shared';
 }catch(error){
  return error?.name==='AbortError'?'cancelled':'failed';
 }
}

function colorsFor(doc){
 const colors={bg:'#0d1916',surface:'#142520',line:'#26403a',text:'#e9efe9',muted:'#9db1a7',accent:'#e3bd6b',ink:'#8fae9f'};
 const style=doc.defaultView?.getComputedStyle(doc.body);
 for(const [property,key] of [['--pine-bg','bg'],['--pine-surface','surface'],['--pine-line','line'],['--pine-text','text'],['--pine-muted','muted'],['--pine-accent','accent'],['--pine-ink','ink']]){
  const value=style?.getPropertyValue(property).trim();
  if(/^#[\da-f]{6}$/i.test(value))colors[key]=value;
 }
 return colors;
}

function canvasBlob(canvas){
 return new Promise((resolve,reject)=>{
  canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Не вдалося створити PNG.')), 'image/png');
 });
}

export async function renderStory(story,canvas,doc=globalThis.document){
 const {width,height,pad}=STORY_SIZE,colors=colorsFor(doc);
 canvas.width=width;
 canvas.height=height;
 const context=canvas.getContext('2d');
 if(!context)throw new Error('Браузер не підтримує створення зображення.');
 await doc.fonts?.ready;
 const sans='Inter,system-ui,-apple-system,"Segoe UI",sans-serif';
 const serif='"Source Serif 4",Georgia,"Times New Roman",serif';
 const fontFor=spec=>{
  const space=spec.lastIndexOf(' '),family=spec.slice(space+1);
  return `${spec.slice(0,space+1)}${family==='sans'?sans:family==='serif'?serif:family}`;
 };
 const measureFor=spec=>text=>{context.font=fontFor(spec);return context.measureText(text).width;};
 const layout=layoutStory(story,measureFor);

 const background=context.createLinearGradient(0,0,width,height);
 background.addColorStop(0,colors.bg);
 background.addColorStop(.58,colors.surface);
 background.addColorStop(1,colors.bg);
 context.fillStyle=background;
 context.fillRect(0,0,width,height);

 context.save();
 context.globalAlpha=.16;
 context.strokeStyle=colors.ink;
 context.lineWidth=2;
 for(let ring=0;ring<5;ring++){
  context.beginPath();
  context.ellipse(width-pad-60,270,120+ring*42,90+ring*36,-.45,0,Math.PI*2);
  context.stroke();
 }
 context.fillStyle=colors.accent;
 for(const [x,y,r] of [[width-pad-90,225,8],[width-pad-210,355,6],[width-pad-10,440,5]]){
  context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fill();
 }
 context.restore();

 context.fillStyle=colors.line;
 context.beginPath();
 context.roundRect(pad,pad+44,width-pad*2,2,1);
 context.fill();
 context.textBaseline='top';
 for(const item of layout.items){
  context.font=fontFor(`${item.kind==='title'?'600':'500'} ${item.size}px ${item.kind==='title'?'serif':'sans'}`);
  context.fillStyle=colors[item.color];
  item.lines.forEach((line,index)=>context.fillText(line,pad,item.y+index*item.lineHeight));
 }
 context.fillStyle=colors.accent;
 context.beginPath();
 context.roundRect(pad,height-pad-92,150,8,4);
 context.fill();
 context.fillStyle=colors.muted;
 context.font=fontFor('500 24px sans');
 context.fillText('Наука · Здоров’я · Рух',pad,height-pad-60);

 return {layout,blob:await canvasBlob(canvas)};
}

function storyFromElement(element){
 return {
  id:element.dataset.storyId,
  title:element.dataset.storyTitle,
  finding:element.dataset.storyFinding,
  sourceLabel:element.dataset.storySource,
  sourceUrl:element.dataset.storySourceUrl
 };
}

function setStatus(element,message){
 element.querySelector('[data-story-status]').textContent=message;
}

function setStoryActions(element,disabled){
 element.querySelectorAll('[data-story-share],[data-story-download]').forEach(button=>{button.disabled=disabled;});
}

function downloadBlob(blob,story,doc){
 const url=URL.createObjectURL(blob),link=doc.createElement('a');
 link.href=url;
 link.download=storyFileName(story);
 doc.body.append(link);
 link.click();
 link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),4000);
}

export function initializeDietStories(doc=globalThis.document,nav=globalThis.navigator){
 const canonical=doc.querySelector('link[rel="canonical"]')?.href||doc.location.href;
 for(const element of doc.querySelectorAll('[data-diet-story]')){
  element.dataset.ready='true';
  const story=storyFromElement(element),canvas=element.querySelector('canvas');
  let rendered=null;
  element.addEventListener('toggle',async()=>{
   if(!element.open||rendered)return;
   try{
    const result=await renderStory(story,canvas,doc);
    if(!result.layout.fits)throw new Error('Текст не вміщується у формат сторіс.');
    rendered=result;
    element.dataset.rendered='true';
    setStoryActions(element,false);
   }catch(error){
    setStoryActions(element,false);
    setStatus(element,error instanceof Error?error.message:'Не вдалося створити сторіс.');
   }
  });
  element.querySelector('[data-story-download]').addEventListener('click',async()=>{
   try{
    setStatus(element,'Готую PNG…');
    const result=rendered||await renderStory(story,canvas,doc);
    if(!result.layout.fits)throw new Error('Текст не вміщується у формат сторіс.');
    rendered=result;
    element.dataset.rendered='true';
    setStoryActions(element,false);
    downloadBlob(result.blob,story,doc);
    setStatus(element,'PNG завантажено. Додайте його до Instagram Stories вручну.');
   }catch(error){
    setStatus(element,error instanceof Error?error.message:'Не вдалося завантажити PNG.');
   }
  });
  element.querySelector('[data-story-share]').addEventListener('click',async()=>{
   try{
    setStatus(element,'Готую зображення для поширення…');
    const result=rendered||await renderStory(story,canvas,doc);
    if(!result.layout.fits)throw new Error('Текст не вміщується у формат сторіс.');
    rendered=result;
    element.dataset.rendered='true';
    setStoryActions(element,false);
    const file=new File([result.blob],storyFileName(story),{type:'image/png'});
    const outcome=await shareStory(story,file,storyUrl(story.id,canonical),nav);
    if(outcome==='shared')setStatus(element,'Меню поширення відкрите. Оберіть Instagram → Stories, якщо такий варіант доступний.');
    else if(outcome==='cancelled')setStatus(element,'Поширення скасовано.');
    else if(outcome==='unsupported')setStatus(element,'Цей браузер не передає зображення в меню поширення. Завантажте PNG та додайте його до Instagram Stories вручну.');
    else setStatus(element,'Не вдалося відкрити меню поширення. Спробуйте завантажити PNG окремо.');
   }catch(error){
    setStatus(element,error instanceof Error?error.message:'Не вдалося підготувати зображення для поширення.');
   }
  });
 }
}

if(typeof document!=='undefined')initializeDietStories();
