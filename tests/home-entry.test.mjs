import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {catalog} from '../src/platform/catalog.mjs';
import {feedbackReport,mountHomeFeedback} from '../src/platform/home-feedback.mjs';
const index=fs.readFileSync('dist/index.html','utf8'),nav=fs.readFileSync('dist/navigation-v17.js','utf8'),css=fs.readFileSync('dist/home-entry.css','utf8');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('dist/home-catalog.js','utf8'),sandbox);
const topics=JSON.parse(JSON.stringify(sandbox.window.EvidenceUAHomeTopics));
assert.deepEqual(topics.map(t=>t.id),catalog.areas.filter(a=>a.available).map(a=>a.id));assert.equal(topics.length,5);
for(const t of topics){const area=catalog.getArea(t.id);assert.equal(t.state,area.state);assert.equal(t.href,t.id==='supplements'?'#supplement-library':area.href);}
assert(index.includes('<a class="cta" href="#start-here">'));assert(nav.includes("document.querySelector('.copy .cta').href = '#start-here'"));assert(index.indexOf('home-catalog.js?v=57')<index.indexOf('navigation-v17.js?v=74'));
for(const id of ['start-here','start-here-title','home-feedback','home-feedback-form','feedback-useful','feedback-stuck','feedback-change','home-feedback-output','home-feedback-status'])assert(index.includes(`id="${id}"`));
assert(index.includes('id="feedback-generate" disabled'));assert(index.includes('не вказуйте персональних'.replace(/^н/,'Н')));assert(index.includes('Форма нічого не надсилає'));
assert(css.includes('min-height:44px'));assert(css.includes('grid-template-columns:minmax(0,1fr)'));assert(css.includes('font-size:16px'));

// Run the actual catalog-card creation block, without a browser-layout claim.
const element=tag=>({tagName:tag,children:[],dataset:{},style:{setProperty(k,v){this[k]=v;}},setAttribute(k,v){this[k]=v;},append(...items){this.children.push(...items);},replaceChildren(){this.children=[];}});
const cards=element('div');vm.runInNewContext(nav.slice(nav.indexOf("  const cards ="),nav.indexOf("  document.querySelector('.supplement-heading').id")),{window:sandbox.window,document:{getElementById:()=>cards,createElement:element}});
assert.equal(cards.children.length,5);for(const [i,card] of cards.children.entries()){assert.equal(card.tagName,'a');assert.equal(card.href,topics[i].href);assert.equal(card.dataset.area,topics[i].id);assert(card.children[2].textContent.includes(topics[i].state));}

// The generated footer must retain a real catalog destination.
const footer=element('footer');
vm.runInNewContext(nav.slice(nav.indexOf('  const footer ='),nav.lastIndexOf('})();')),{document:{querySelector:()=>footer,createElement:element}});
const footerCatalog=footer.children.find(child=>child.tagName==='a');
assert(footerCatalog,'Footer catalog link missing');
assert.equal(footerCatalog.href,'./directions.html');
assert(footerCatalog.textContent.includes('Каталог'));

assert.equal(feedbackReport({}),null);
const report=feedbackReport({useful:' Зрозуміла схема ',stuck:'Кнопка',change:'Підпис'},'https://evidence-ua.surecrow3.chatgpt.site/?utm_source=x&token=secret#private','Телефон');
assert(report.includes('Зрозуміла схема'));assert(report.includes('Телефон'));assert(!report.includes('secret'));assert(!report.includes('utm_source'));assert(!report.includes('#private'));
assert(feedbackReport({change:'x'.repeat(3000)}).includes('x'.repeat(2000)));assert(!feedbackReport({change:'x'.repeat(3000)}).includes('x'.repeat(2001)));
function fixture(clipboard){
 const nodes=new Map(),handlers=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',hidden:true,disabled:true,events:new Map(),addEventListener(k,f){this.events.set(k,f);},removeEventListener(){},focus(){this.focused=true;},select(){this.selected=true;}});return nodes.get(id);};
 const root={querySelector:node,defaultView:{location:{href:'https://evidence-ua.surecrow3.chatgpt.site/?utm_campaign=trial',hash:''},navigator:{clipboard}},addEventListener(k,f){handlers.set(k,f);},removeEventListener(){}};
 mountHomeFeedback(root);return {node,submit:()=>node('#home-feedback-form').events.get('submit')({preventDefault(){}}),edit:()=>node('#home-feedback-form').events.get('input')(),copy:()=>node('#home-feedback-copy').events.get('click')(),open:()=>handlers.get('click')({target:{closest:()=>({})}})};
}
let copied=null;const f=fixture({writeText:async text=>{copied=text;}});assert(!f.node('#feedback-generate').disabled);f.submit();assert(f.node('#home-feedback-output').hidden);assert(f.node('#home-feedback-status').textContent.includes('хоча б'));
f.node('#feedback-useful').value='Все зрозуміло';f.node('#feedback-device').value='Телефон';f.submit();assert(!f.node('#home-feedback-output').hidden);assert(f.node('#home-feedback-text').focused);assert(f.node('#home-feedback-status').textContent.includes('не надісланий'));
await f.copy();assert.equal(copied,f.node('#home-feedback-text').value);assert(!f.node('#home-feedback-copy').disabled);f.edit();assert(f.node('#home-feedback-output').hidden);f.open();assert(f.node('#home-feedback').open);
const fallback=fixture(undefined);fallback.node('#feedback-stuck').value='Не знайшов джерела';fallback.submit();await fallback.copy();assert(fallback.node('#home-feedback-text').selected);assert(fallback.node('#home-feedback-status').textContent.includes('вручну'));
const rejected=fixture({writeText:async()=>{throw Error('Denied');}});rejected.node('#feedback-change').value='Більший шрифт';rejected.submit();await rejected.copy();assert(rejected.node('#home-feedback-text').selected);
const feedbackSource=fs.readFileSync('src/platform/home-feedback.mjs','utf8');for(const api of ['fetch(','localStorage','sendBeacon','XMLHttpRequest','new WebSocket'])assert(!feedbackSource.includes(api));

// Compare all ten article subtrees with independent pre-v57 digests; not with the edited source.
execFileSync('python',['-c',`from pathlib import Path
from lxml import html
import json,hashlib
expected=json.loads(Path('tests/fixtures/home-v56-science-digests.json').read_text())
assert len(expected)==10
root=html.fromstring(Path('dist/index.html').read_text())
actual={n.get('id'):hashlib.sha256(html.tostring(n,encoding='utf-8')).hexdigest() for n in root.xpath('//body/section[@id="creatine" or starts-with(@id,"supplement-")]')}
assert expected==actual, 'Scientific article HTML changed'
ids=[n.get('id') for n in root.xpath('//*[@id]')]
assert len(ids)==len(set(ids)), 'Duplicate HTML IDs'
assert root.xpath('//*[@id="evidence-card"]'), 'Starter link target absent'
directions=root.xpath('//*[@id="start-here"]/*[@id="cards"]')
assert len(directions)==1 and len(directions[0].xpath('./a'))==5, 'Five direct directions must work without JavaScript'
assert directions[0].xpath('./a/@data-area')==['muscle','cell','nutrition','supplements','movement']
start=root.xpath('//*[@id="start-here"]')[0]
assert list(start).index(directions[0]) < list(start).index(start.xpath('./div[@class="start-choices"]')[0]), 'Directions must precede example questions'
`]);
console.log('Home entry: five actual catalog pages, CTA flow, real cards, feedback handlers, no sending/storage/tracking, copy success/fallback, sanitized URLs and ten unchanged article subtrees passed. Browser layout QA pending.');
