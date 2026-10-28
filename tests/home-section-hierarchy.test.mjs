// Owner request 2026-10-28: make the lower home distinct sections instead of
// one continuous text list; preserve destinations and native no-script access.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog,learningHref} from '../src/platform/catalog.mjs';
import {homeLearningHTML,pathCard} from '../src/platform/learning-ui.mjs';

assert(fs.existsSync('src/platform/home-directions.mjs'),'The lower-home directions renderer must expose real canonical actions');
const {homeDirectionsHTML}=await import('../src/platform/home-directions.mjs');
const topics=catalog.areas.filter(area=>area.available).map(area=>({id:area.id,title:area.title,subtitle:area.lab,state:area.state,href:area.id==='supplements'?'#supplement-library':area.href,position:'50%'}));
function inspect(markup,expression){return JSON.parse(execFileSync('python',['-c',`from lxml import html\nimport json,sys\nroot=html.fromstring(sys.stdin.read())\nprint(json.dumps(${expression}))`],{input:markup,encoding:'utf8'}));}

const directions=inspect(homeDirectionsHTML(topics),`[{'area':n.get('data-area'),'href':n.get('href'),'title':n.xpath('.//strong')[0].text_content(),'state':n.xpath('.//*[@class="topic-state"]')[0].text_content(),'action':n.xpath('.//*[@class="topic-open"]')[0].text_content()} for n in root.xpath('.//*[@id="cards"]/a')]`);
assert.deepEqual(directions.map(item=>item.area),['muscle','cell','nutrition','supplements','movement','sleep']);
assert.deepEqual(directions.map(item=>item.href),['./muscle-lab.html','./cell-lab.html','./nutrition.html','#supplement-library','./movement.html','./sleep.html']);
for(const item of directions){assert.equal(item.title,catalog.getArea(item.area).title);assert.equal(item.state,catalog.getArea(item.area).state);assert.match(item.action,/Відкрити/);}
const unsafe=inspect(homeDirectionsHTML([{...topics[0],title:'<script>alert(1)</script>',state:'<img src=x onerror=alert(1)>'}]),`len(root.xpath('.//script|.//img[@onerror]'))`);
assert.equal(unsafe,0,'Navigation labels remain text rather than executable markup');

const routes=inspect(homeLearningHTML(),`{'open':'open' in root.attrib,'title':root.xpath('./summary')[0].text_content(),'items':[{'id':n.get('data-home-path'),'start':n.xpath('./a[contains(@class,"path-start")]/@href'),'outlineCount':len(n.xpath('./details[@class="home-path-outline"]')),'closed':len(n.xpath('./details[@class="home-path-outline"][@open]'))==0,'steps':n.xpath('./details//ol/li/a/@href')} for n in root.xpath('.//article[@class="path-card"]')]}`);
assert(routes.open,'Route starts remain visible without opening a second menu');
assert.match(routes.title,/Навчальні маршрути/);
assert.deepEqual(routes.items.map(item=>item.id),catalog.paths.map(path=>path.id));
for(const [index,item]of routes.items.entries()){
  const path=catalog.paths[index];
  assert.deepEqual(item.start,[learningHref(path.id,0)]);
  assert.equal(item.outlineCount,1);assert(item.closed);
  assert.deepEqual(item.steps,path.steps.map((_,step)=>learningHref(path.id,step)));
}
assert.equal(inspect(pathCard(catalog.paths[0]),`len(root.xpath('.//details'))`),0,'The directory keeps its existing full route renderer');

const structure=inspect(fs.readFileSync('dist/index.html','utf8'),`{'directory':len(root.xpath('//*[@id="start-here"]/section[@class="home-directory-section"]//*[@id="cards"]/a')),'title':root.xpath('//*[@id="start-here-title"]')[0].text_content(),'examples':len(root.xpath('//*[@id="start-here"]/div[@class="start-choices"]/details[@class="home-examples"]')),'examplesClosed':len(root.xpath('//*[@class="home-examples"][@open]'))==0,'exampleLinks':root.xpath('//*[@class="home-examples"]//a/@href'),'library':len(root.xpath('//section[@class="home-library-section"]//*[@id="supplement-library"]'))}`);
assert.equal(structure.directory,6);assert.equal(structure.title,'Обери напрям');
assert.equal(structure.examples,1);assert(structure.examplesClosed);assert.equal(structure.exampleLinks.length,3);
assert.equal(structure.library,1);
assert.equal(inspect(fs.readFileSync('dist/index.html','utf8'),`len(root.xpath('//a[@class="supplement-feature-link"][@hidden]'))`),1,'A new library wrapper must not revive the retained duplicate creatine action');
console.log('Home section hierarchy: six real actions, compact native route outlines, unchanged directory renderer and separate lower sections passed.');
