import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES,TOPICS} from '../dist/research-data.js';
import {shareText,shareStudy,cardUrl,shareFileName,wrapLines,layoutCard,FITS,CARD,SHARE_NOTE,sourceHref} from '../dist/research-share.js';

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
console.log('Research share: text, native share, copy, manual fallback, card layout for every write-up passed.');
