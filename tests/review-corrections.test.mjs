import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import {execFileSync} from 'node:child_process';
import {catalog} from '../src/platform/catalog.mjs';
import {headerHTML} from '../src/platform/site-header.mjs';
import {homeLearningHTML} from '../src/platform/learning-ui.mjs';

function inspect(source, expression) {
  return JSON.parse(execFileSync('python', ['-c', `from lxml import html
import json,sys
root=html.fromstring(sys.stdin.read())
print(json.dumps(${expression}))`], {input:source, encoding:'utf8'}));
}

test('primary topic navigation has one clearly named catalog destination', () => {
  const entries = inspect(headerHTML(), "[{'label':' '.join(a.text_content().split()),'href':a.get('href')} for a in root.xpath('.//nav/a')]");
  assert.deepEqual(entries.filter(e => e.label === 'Напрями'), [{label:'Напрями', href:'./directions.html'}]);
  assert(!entries.some(e => e.label === 'Каталог'));
});

test('learning routes are immediately visible without opening About', () => {
  assert(inspect(homeLearningHTML(), "'open' in root.attrib"), 'The three existing routes start open');
  const result = JSON.parse(execFileSync('python', ['-c', `from lxml import html
import json
root=html.parse('dist/index.html')
routes=root.xpath('//*[@id="home-learning-paths"]')
print(json.dumps({'count':len(routes),'open':bool(routes and 'open' in routes[0].attrib),'insideAbout':bool(routes and routes[0].xpath('ancestor::*[@id="home-about"]')),'cards':len(routes[0].xpath('.//article')) if routes else 0}))`], {encoding:'utf8'}));
  assert.deepEqual(result, {count:1, open:true, insideAbout:false, cards:3});
});

test('the digestion starter opens the promised material directly', () => {
  const hrefs = JSON.parse(execFileSync('python', ['-c', `from lxml import html
import json
root=html.parse('dist/directions.html')
print(json.dumps(root.xpath('//a[contains(.,"Від їжі до клітини")]/@href')))`], {encoding:'utf8'}));
  assert.deepEqual(hrefs, ['./nutrition-digestion.html']);
});

test('the catalog points to per-claim confidence instead of a stale blanket status', () => {
  assert.equal(catalog.getArea('supplements').review, 'Впевненість і статус наукового перегляду зазначено для кожного твердження');
});

test('legacy startup preserves the same single catalog entry before the shared header loads', () => {
  const element = () => ({children:[], style:{setProperty(){}}, append(...nodes){this.children.push(...nodes);}, replaceChildren(){this.children=[];}, setAttribute(){}, querySelector(){return this.children[0];}});
  const nav=element(), cards=element(), cta={}, heading={};
  const document = {createElement:element, getElementById:()=>cards, querySelector:selector=>selector==='.copy .cta'?cta:heading};
  const source=fs.readFileSync('dist/navigation-v17.js','utf8');
  const start=source.indexOf('  nav.replaceChildren();'), end=source.indexOf('  const carousel =');
  assert(start>=0&&end>start);
  vm.runInNewContext(source.slice(start,end), {nav, document, window:{EvidenceUAHomeTopics:[]}});
  assert.equal(nav.children[0].textContent, 'Напрями');
  assert.equal(nav.children[0].href, './directions.html', 'Later legacy setup must not restore the old topic-picker link');
  assert.equal(nav.children.filter(a=>a.href==='./directions.html').length,1);
  assert.equal(cta.href, '#start-here', 'The separate hero action still opens the local topic picker');
});
