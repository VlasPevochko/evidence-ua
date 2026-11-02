// Бриф T3 (2026-11-02, рішення D5): бічні примітки з джерелами на сторінці розборів від 1360 px; колонку 860 px не зсуваємо.
// Примітка будується з тих самих даних, що й рядок джерела, і стоїть поруч із карткою, а не всередині неї. Жодне речення розбору не змінюється.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES,CHECKED} from '../dist/research-data.js';
import {SIDENOTE_MIN_WIDTH,sourceHref,markHTML,sidenoteHTML} from '../dist/research-sidenote.js';

assert.equal(SIDENOTE_MIN_WIDTH,1360,'the margin mode starts at 1360 px (860 + 2 × 250), decision D5');
assert.equal(STUDIES.length,16,'sixteen write-ups, so sixteen notes (update this if a write-up is added)');

// 1. Одна примітка на джерело: посилання точно з даних, підпис із « ↗», тип, дата перевірки, позначка з номером.
const norm=text=>text.replace(/\s+/g,' ').trim();
const decode=text=>text.replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
const notes=STUDIES.map((study,i)=>({study,n:i+1,html:sidenoteHTML(study,i+1,CHECKED)}));
for(const {study,n,html} of notes){
  assert.equal((html.match(/<aside /g)||[]).length,1,`${study.id}: one aside`);assert(html.startsWith('<aside class="eua-sidenote eua-stamp" role="note"')&&html.endsWith('</aside>'));
  const links=[...html.matchAll(/<a href="([^"]*)" target="_blank" rel="noopener noreferrer">([^<]*)<\/a>/g)];
  assert.equal(links.length,1,`${study.id}: exactly one source link`);
  const expected=study.source.doi?`https://doi.org/${study.source.doi}`:`https://pubmed.ncbi.nlm.nih.gov/${study.source.pmid}/`;
  assert.equal(links[0][1],expected,`${study.id}: the link is the DOI or PubMed address from the data`);
  assert.equal(sourceHref(study.source),expected);
  assert.equal(norm(decode(links[0][2])),`${study.source.label} ↗`,`${study.id}: the visible label is the label from the data plus « ↗» (the space before the arrow is non-breaking)`);
  assert(links[0][2].endsWith('&nbsp;↗'),`${study.id}: the arrow cannot be left alone on a new line`);
  assert(decode(html).includes(`<span class="eua-sidenote-type">${study.type}</span>`),`${study.id}: the type string is unchanged`);
  assert(html.includes(`<span class="eua-sidenote-checked">Перевірено ${CHECKED}.</span>`),`${study.id}: the check date comes from CHECKED`);
  assert(html.includes(markHTML(n))&&markHTML(n)===`<sup class="eua-sidenote-mark" aria-hidden="true">${n}</sup>`,`${study.id}: marker ${n}`);
  assert(html.includes(`aria-label="Джерело розбору ${n}"`));
  assert(!/<script|onerror|onclick/i.test(html));
}
assert.equal(notes.length,STUDIES.filter(study=>study.source).length,'the number of notes equals the number of sources in the data');
assert(STUDIES.some(study=>!study.source.doi&&study.source.pmid)&&STUDIES.some(study=>study.source.doi),'both address kinds (DOI and PubMed) are covered');
assert.equal(sourceHref({pmid:'26080646'}),'https://pubmed.ncbi.nlm.nih.gov/26080646/');
// Екранування: підпис і тип не можуть вставити розмітку.
const tricky=sidenoteHTML({type:'<b>x</b>',source:{label:'A & "B"',doi:'10.1/x"y'}},3,'01.01.2026');
assert(!tricky.includes('<b>')&&tricky.includes('&lt;b&gt;')&&tricky.includes('A &amp; &quot;B&quot;')&&tricky.includes('href="https://doi.org/10.1/x&quot;y"'),'text and address are escaped');

// 2. Сторінка: примітка сусід картки, не всередині .rs-body; те саме посилання будує рядок у картці; речення розбору не змінені.
const page=fs.readFileSync('dist/research-page.js','utf8');
assert(page.includes("import {sourceHref,markHTML,sidenoteHTML} from './research-sidenote.js?v=1';"));
assert(page.includes("item.append(card);item.insertAdjacentHTML('beforeend',sidenoteHTML(s,n,CHECKED));list.append(item);"),'the note is the sibling of the card inside one item');
assert(!/body\.append\([^)]*sidenote|card\.append\([^)]*sidenote|src\.append\([^)]*sidenote/i.test(page),'the note is never put inside the card or its body');
assert(page.includes("a.href=sourceHref(s.source)")&&page.includes("meta.insertAdjacentHTML('beforeend',chipHTML(s.type)+markHTML(n));"),'the card link uses the same address function; the card marker is a separate element');
for(const kept of ["const src=make('p','rs-source eua-stamp');src.append(make('span','',s.type+'. '));","make('span','rs-checked',' Перевірено '+CHECKED+'.')","dl.append(row('Хто досліджувався',s.who),row('Що знайшли',s.found),row('Чого це не доводить',s.limits));","make('span','rs-question',s.question),make('span','rs-answer',s.answer)"])
  assert(page.includes(kept),`the card text is built as before: ${kept.slice(0,50)}…`);
const sidenoteModule=fs.readFileSync('dist/research-sidenote.js','utf8').replace(/\/\/[^\n]*/g,'');
assert(!/https?:\/\/(?!doi\.org\/|pubmed\.ncbi\.nlm\.nih\.gov\/)/.test(sidenoteModule),'no third-party addresses');

// 3. Стилі: від 1360 px примітка видима, рядок у картці схований, нижче навпаки; колонка не зсувається; ряд сітки росте разом із приміткою.
const css=fs.readFileSync('dist/research-page.css','utf8'),mine=css.slice(css.indexOf('T3 (2026-11-02'));
assert(/\.eua-sidenote,\.rs-card \.eua-sidenote-mark\{display:none\}/.test(mine),'below 1360 px the note and the card marker are hidden');
const wide=mine.slice(mine.indexOf('@media(min-width:1360px)'));
assert(wide.includes('.rs-source{display:none}')&&wide.includes('.rs-item>.eua-sidenote{display:block')&&wide.includes('.rs-card .eua-sidenote-mark{display:inline-block}'),'from 1360 px the note and the marker show and the inline source line hides');
assert(/\.rs-item\{display:grid;grid-template-columns:minmax\(0,1fr\) 0;align-items:start\}/.test(wide),'a grid with a zero-width second column: the note sticks out to the right and its height lifts the row');
assert(!/\.rs-main\{[^}]*(margin-left|transform|translate|padding-right:)/.test(css)&&/\.rs-main\{width:min\(860px,calc\(100% - 32px\)\);margin:0 auto/.test(css),'the 860 px column is not shifted');
// Ширина примітки на межі режиму не менша за 220 px (потрібно 220–260), а справа лишається запас до краю вікна.
const room=(width)=>(width-860)/2,formula=width=>Math.min(230,room(width)-26);
assert(formula(1360)>=220&&formula(1360)+16<=room(1360),`the note is ${formula(1360)} px at 1360 and still fits the margin`);
assert(formula(1440)===230&&/margin:0 0 12px 16px/.test(wide));
assert(SIDENOTE_MIN_WIDTH===1360&&wide.startsWith('@media(min-width:1360px)'),'the media query matches the module constant');
assert(!/animation|transition/.test(mine),'no motion');
assert(!/https?:\/\//.test(mine),'no third-party requests');

// 4. Версії, журнал, документ.
const html=fs.readFileSync('dist/research.html','utf8');
const ver=name=>Number((html.match(new RegExp(name.replace('.','\\.')+'\\?v=(\\d+)'))||[])[1]);
assert(ver('research-page.js')>=10&&ver('research-page.css')>=8,'page versions raised (at least js 10, css 8)');
assert(fs.readFileSync('dist/changes-data.js','utf8').includes('Джерела поруч із розборами на широкому екрані'),'the change log has a record');
const doc=fs.readFileSync('docs/SIDENOTES.md','utf8');
for(const part of ['Що змінено','Як це влаштовано','Як перевірено','Межі','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/SIDENOTES.md has the section «${part}»`);
console.log('Sidenotes: sixteen notes from the data, same addresses, sibling of the card, margin mode from 1360 px, column not shifted passed.');
