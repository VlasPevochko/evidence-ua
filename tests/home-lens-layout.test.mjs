// Owner 2026-10-28 selected the below-hero cosmic lens and quick native-scroll
// reveal, with auxiliary reading folded. Scientific preservation tests stay intact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog} from '../src/platform/catalog.mjs';
import {homeDirectionsHTML} from '../src/platform/home-directions.mjs';

const topics=catalog.areas.filter(area=>area.available).map(area=>({id:area.id,title:area.title,subtitle:area.lab,state:area.state,href:area.id==='supplements'?'#supplement-library':area.href,position:'50%'}));
function inspect(markup,expression){return JSON.parse(execFileSync('python',['-c',`from lxml import html\nimport json,sys\nroot=html.fromstring('<main>'+sys.stdin.read()+'</main>')\nprint(json.dumps(${expression}))`],{input:markup,encoding:'utf8'}));}
const parsed=inspect(homeDirectionsHTML(topics),`{'stage':len(root.xpath('.//*[@data-lens-stage][@aria-hidden="true"]')),'images':[{'src':n.get('src'),'lazy':n.get('loading'),'width':n.get('width'),'height':n.get('height')} for n in root.xpath('.//*[@data-lens-stage]//img')],'jump':root.xpath('.//a[@data-lens-reveal]/@href'),'actions':[{'id':n.get('data-area'),'href':n.get('href'),'title':n.xpath('./strong')[0].text_content(),'state':n.xpath('./span[@class="topic-state"]')[0].text_content(),'hidden':n.get('hidden'),'inert':n.get('inert')} for n in root.xpath('.//*[@id="cards"]/a')]}`);
assert.equal(parsed.stage,1,'The lower home needs a decorative lens, separate from all native links');
assert.deepEqual(parsed.images.map(n=>n.src),['./home-lens-nebula.webp','./home-lens-core.webp']);
assert(parsed.images.every(n=>n.lazy==='lazy'&&Number(n.width)>0&&Number(n.height)>0),'Below-hero art must have stable dimensions and lazy loading');
assert.deepEqual(parsed.jump,['#cards'],'A native jump keeps the direction chooser reachable without enhancement');
assert.deepEqual(parsed.actions.map(n=>n.id),topics.map(n=>n.id));
for(const [i,item] of parsed.actions.entries()){
 assert.equal(item.href,topics[i].href);assert.equal(item.title,topics[i].title);assert.equal(item.state,topics[i].state);
 assert.equal(item.hidden,null);assert.equal(item.inert,null);
}
const unsafe=inspect(homeDirectionsHTML([{...topics[0],title:'<img src=x onerror=alert(1)>',state:'<script>alert(1)</script>'}]),`len(root.xpath('.//script|.//img[@onerror]'))`);
assert.equal(unsafe,0,'Canonical labels must remain escaped text');
const page=fs.readFileSync('dist/index.html','utf8');
const structure=inspect(page,`{'lens':len(root.xpath('.//section[@class="home-directory-section"][@data-home-lens]')),'routeClosed':len(root.xpath('.//details[@id="home-learning-paths"][@open]'))==0,'library':len(root.xpath('.//section[@class="home-library-section"]/details[@class="home-library-fold"]/summary')),'libraryClosed':len(root.xpath('.//details[@class="home-library-fold"][@open]'))==0,'libraryTargets':root.xpath('.//details[@class="home-library-fold"]//*[@class="se-list"]/li/a/@href'),'choicesDirect':len(root.xpath('.//*[@id="start-here"]/div[@class="start-choices"]')),'styles':root.xpath('.//link[contains(@href,"home-lens.css")]/@href'),'scripts':root.xpath('.//script[contains(@src,"home-lens.js")]/@src')}`);
assert.equal(structure.lens,1);assert(structure.routeClosed,'Auxiliary route outlines start compact after the selected lens');
assert.equal(structure.library,1);assert(structure.libraryClosed);assert.equal(structure.libraryTargets.length,11);
assert.equal(structure.choicesDirect,1,'Continue/saved insertion anchor must stay outside closed details');
assert.deepEqual(structure.styles,['./home-lens.css?v=1']);assert.deepEqual(structure.scripts,['./home-lens.js?v=1']);
console.log('Home lens layout: decorative lazy art, six canonical native links, accessible jump, compact retained routes/library and cache wiring passed.');
