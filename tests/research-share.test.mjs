import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES,TOPICS} from '../dist/research-data.js';
import {shareText,shareStudy,cardUrl,shareFileName,wrapLines,layoutCard,FITS,CARD,SHARE_NOTE,sourceHref,cardColors} from '../dist/research-share.js';

// «Поділитись» для розборів (рішення власника 2026-10-27, пункт 3): текст + картинка; нічого не йде на сервер.
const page='https://example.test/evidence-ua/research.html?x=1#old';
const s=STUDIES.find(x=>x.id==='coffee');
assert.equal(cardUrl(s,page),'https://example.test/evidence-ua/research.html?x=1#coffee','the link opens exactly this write-up');
const t=shareText(s,page);
for(const part of [s.question,s.answer,'Джерело: '+s.source.label,sourceHref(s),SHARE_NOTE,'research.html?x=1#coffee'])assert(t.includes(part),`the text has ${part}`);
assert(t.length<900,'the text is short enough for a message');
assert(!shareText(s,page,{withUrl:false}).includes('example.test'),'the native-share text keeps the address separate');
assert.equal(shareFileName(s),'evidence-ua-coffee.png');
assert.match(sourceHref(STUDIES.find(x=>x.id==='short-sleep-weight')),/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/26080646\/$/,'a study without DOI links to PubMed');

// Рідне вікно, копіювання, ручний режим.
{let got=null;assert.equal(await shareStudy(s,page,{share:async d=>{got=d;}}),'shared');assert(got.title===s.question&&got.url.endsWith('#coffee')&&!got.text.includes('#coffee'));}
assert.equal(await shareStudy(s,page,{share:async()=>{const e=new Error('x');e.name='AbortError';throw e;}}),'cancelled','closing the share sheet is not an error');
{let copied='';assert.equal(await shareStudy(s,page,{clipboard:{writeText:async x=>{copied=x;}}}),'copied');assert(copied.includes('#coffee'));}
assert.equal(await shareStudy(s,page,{}),'manual');

// Розкладка картинки: усі розбори вміщаються (грубе вимірювання: 0,5 em на символ; точніше перевіряє Browser QA).
const measureFor=spec=>{const px=Number(/(\d+)px/.exec(spec)[1]);return text=>text.length*px*0.52;};
for(const x of STUDIES){const L=layoutCard(x,TOPICS[x.topic],measureFor);assert(FITS(L),`${x.id}: the card text fits (${L.bottom} of ${CARD.height})`);}
assert.deepEqual(wrapLines('раз два три чотири',70,x=>x.length*10),['раз два','три','чотири'],'wrapping breaks on words');
// Кольори картинки (рішення власника 2026-10-31, палітри): беруться з поточної палітри сторінки, а без сторінки лишаються зеленими.
assert.deepEqual(cardColors(undefined),{bg:'#0d1916',ink:'#8fae9f',line:'#26403a',muted:'#9db1a7',accent:'#e3bd6b',text:'#e9efe9'},'no page: the former green card');
{
  const fake=values=>({body:{},defaultView:{getComputedStyle:()=>({getPropertyValue:name=>values[name]??''})}});
  const cosmic=cardColors(fake({'--pine-bg':' #0b0a12','--pine-ink':'#a99cc0','--pine-line':'#2c2539','--pine-muted':'#c3b9d1','--pine-accent':'#d1a5ff','--pine-text':'#f7f3ef'}));
  assert.deepEqual(cosmic,{bg:'#0b0a12',ink:'#a99cc0',line:'#2c2539',muted:'#c3b9d1',accent:'#d1a5ff',text:'#f7f3ef'},'the card takes the cosmic colours from the page');
  assert.equal(cardColors(fake({'--pine-bg':'url(x)','--pine-accent':'red'})).bg,'#0d1916','a value that is not a plain hex colour is ignored');
  assert.equal(cardColors({defaultView:{getComputedStyle(){throw new Error('no style');}},body:{}}).accent,'#e3bd6b','a failure keeps the former colours');
}
const shareSource=fs.readFileSync('dist/research-share.js','utf8');
assert(!/g\.(?:fill|stroke)Style='#/.test(shareSource),'the card is drawn with palette colours, no raw hex fill or stroke');
console.log('Research share: text, native share, copy, manual fallback, card layout for every write-up and palette colours passed.');
