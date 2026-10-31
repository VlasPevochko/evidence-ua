// Owner 2026-10-29 approved two clipped image halves around a real central
// action. Native navigation and scientific preservation contracts stay intact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog} from '../src/platform/catalog.mjs';
import {homeDirectionsHTML} from '../src/platform/home-directions.mjs';

const topics=catalog.areas.filter(area=>area.available).map(area=>({id:area.id,title:area.title,subtitle:area.lab,state:area.state,href:area.id==='supplements'?'#supplement-library':area.href,position:'50%'}));
function inspect(markup,expression){return JSON.parse(execFileSync('python',['-c',`from lxml import html\nimport json,sys\nroot=html.fromstring('<main>'+sys.stdin.read()+'</main>')\nprint(json.dumps(${expression}))`],{input:markup,encoding:'utf8'}));}
const parsed=inspect(homeDirectionsHTML(topics),`{'stage':len(root.xpath('.//*[@data-lens-stage][not(@aria-hidden)]')),'halves':[{'class':n.get('class'),'art':n.xpath('.//img/@src'),'decorative':len(n.xpath('ancestor::*[@aria-hidden="true"]'))>0} for n in root.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," home-lens-half ")]')],'images':[{'src':n.get('src'),'lazy':n.get('loading'),'width':n.get('width'),'height':n.get('height'),'alt':n.get('alt')} for n in root.xpath('.//*[@data-lens-stage]//img')],'jump':[{'href':n.get('href'),'stage':len(n.xpath('ancestor::*[@data-lens-stage]')),'interior':len(n.xpath('ancestor::*[@class="home-lens-interior"]')),'hidden':len(n.xpath('ancestor-or-self::*[@aria-hidden="true"]')),'label':n.text_content().strip()} for n in root.xpath('.//a[@data-lens-reveal]')],'core':root.xpath('.//*[@class="home-lens-interior"]')[0].text_content() if root.xpath('.//*[@class="home-lens-interior"]') else '', 'controls':len(root.xpath('.//*[@data-lens-stage]//a|.//*[@data-lens-stage]//button')),'actions':[{'id':n.get('data-area'),'href':n.get('href'),'title':n.xpath('./strong')[0].text_content(),'state':n.xpath('./span[@class="topic-state"]')[0].text_content(),'hidden':n.get('hidden'),'inert':n.get('inert')} for n in root.xpath('.//*[@id="cards"]/a')]}`);
assert.equal(parsed.stage,1,'The stage contains the accessible central action');
assert.equal(parsed.halves.length,2,'Both halves must carry the actual lens image');
assert(parsed.halves[0].class.includes('home-lens-half--left'));
assert(parsed.halves[1].class.includes('home-lens-half--right'));
assert(parsed.halves.every(n=>n.decorative&&n.art.length===1&&n.art[0]==='./home-lens-core.webp'));
assert.deepEqual(parsed.images.map(n=>n.src),['./home-lens-nebula.webp','./home-lens-core.webp','./home-lens-core.webp']);
assert(parsed.images.every(n=>n.lazy==='lazy'&&Number(n.width)>0&&Number(n.height)>0&&n.alt===''),'Below-hero decorative art must have stable dimensions and lazy loading');
assert.equal(parsed.controls,1,'The central jump is the only internal action');
// Owner 2026-10-31: choices are a closed dialog; without JS the real link opens the directory.
assert.deepEqual(parsed.jump,[{href:'./directions.html',stage:1,interior:1,hidden:0,label:'Обрати напрям →'}],'A unique native fallback sits inside the stage outside hidden decoration');
const chooser=inspect(homeDirectionsHTML(topics),`{'closed':len(root.xpath('.//dialog[@data-lens-picker][not(@open)]')),'inside':len(root.xpath('.//dialog//*[@id="cards"]/a')),'outside':len(root.xpath('.//*[@id="cards"]/a[not(ancestor::dialog)]')),'close':len(root.xpath('.//dialog//button[@data-lens-picker-close]')),'images':len(root.xpath('.//dialog//*[@id="cards"]/a/img[@loading="lazy"]'))}`);
assert.deepEqual(chooser,{closed:1,inside:6,outside:0,close:1,images:6},'All six choices and their existing art live only inside the closed chooser');
assert.match(parsed.core,/6 напрямів/,'Readable HTML explains what the light core reveals');
assert.deepEqual(parsed.actions.map(n=>n.id),topics.map(n=>n.id));
for(const [i,item] of parsed.actions.entries()){
 assert.equal(item.href,topics[i].href);assert.equal(item.title,topics[i].title);assert.equal(item.state,topics[i].state);
 assert.equal(item.hidden,null);assert.equal(item.inert,null);
}
const unsafe=inspect(homeDirectionsHTML([{...topics[0],title:'<img src=x onerror=alert(1)>',state:'<script>alert(1)</script>',id:'bad" onclick="alert(1)',href:'./?x="&y=<tag>'}]),`len(root.xpath('.//script|.//img[@onerror]'))`);
assert.equal(unsafe,0,'Canonical labels must remain escaped text');
const escaped=inspect(homeDirectionsHTML([{...topics[0],id:'quoted"&<id>',href:'./?a="&b=<value>',title:'<b>Тема</b>',state:'Доступний & відкритий'}]),`[{'id':n.get('data-area'),'href':n.get('href'),'title':n.xpath('./strong')[0].text_content(),'state':n.xpath('./span[@class="topic-state"]')[0].text_content(),'onclick':n.get('onclick')} for n in root.xpath('.//*[@id="cards"]/a')]`);
assert.deepEqual(escaped,[{id:'quoted"&<id>',href:'./?a="&b=<value>',title:'<b>Тема</b>',state:'Доступний & відкритий',onclick:null}]);
const page=fs.readFileSync('dist/index.html','utf8');
const structure=inspect(page,`{'lens':len(root.xpath('.//section[@class="home-directory-section"][@data-home-lens]')),'routeClosed':len(root.xpath('.//details[@id="home-learning-paths"][@open]'))==0,'library':len(root.xpath('.//section[@class="home-library-section"]/details[@class="home-library-fold"]/summary')),'libraryClosed':len(root.xpath('.//details[@class="home-library-fold"][@open]'))==0,'libraryTargets':root.xpath('.//details[@class="home-library-fold"]//*[@class="se-list"]/li/a/@href'),'choicesDirect':len(root.xpath('.//*[@id="start-here"]/div[@class="start-choices"]')),'styles':root.xpath('.//link[contains(@href,"home-lens.css")]/@href'),'scripts':root.xpath('.//script[contains(@src,"home-lens.js")]/@src')}`);
assert.equal(structure.lens,1);assert(structure.routeClosed,'Auxiliary route outlines start compact after the selected lens');
assert.equal(structure.library,1);assert(structure.libraryClosed);assert.equal(structure.libraryTargets.length,11);
assert.equal(structure.choicesDirect,1,'Continue/saved insertion anchor must stay outside closed details');
// Owner-approved stage timing and visual polish need fresh assets for returning visitors.
assert.deepEqual(structure.styles,['./home-lens.css?v=4']);assert.deepEqual(structure.scripts,['./home-lens.js?v=6']);
console.log('Home lens layout: split lazy art and accessible interior, six canonical native links, accessible jump, compact retained routes/library and cache wiring passed.');
