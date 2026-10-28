// The owner selected the cosmic question-led home on 2026-10-27. These tests
// protect its useful, catalog-backed links and its native HTML fallbacks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog,learningLocation} from '../src/platform/catalog.mjs';

assert(fs.existsSync('src/platform/home-spectrum.mjs'),'the spectrum home renderer must exist');
const {homeSpectrumHTML}=await import('../src/platform/home-spectrum.mjs');

function inspect(markup){
  return JSON.parse(execFileSync('python',['-c',`
from lxml import html
import json,sys
r=html.fromstring(sys.stdin.read())
def text(n): return ' '.join(''.join(n.itertext()).split())
def attrs(n): return dict(n.attrib)
forms=r.xpath('.//form')
dialog=r.xpath('.//dialog')[0]
print(json.dumps({
 'root':attrs(r), 'headings':[text(n) for n in r.xpath('.//h1')],
 'ids':r.xpath('descendant-or-self::*/@id'),
 'form':attrs(forms[0]), 'inputs':[attrs(n) for n in forms[0].xpath('.//input')],
 'labels':[{'text':text(n),**attrs(n)} for n in forms[0].xpath('.//label')],
 'submit':[{'text':text(n),**attrs(n)} for n in forms[0].xpath('.//button[@type="submit"]')],
 'links':[{'text':text(n),**attrs(n)} for n in r.xpath('.//a')],
 'routeText':[text(n) for n in r.xpath('.//*[@data-spectrum-route-label]')],
 'steps':[text(n) for n in r.xpath('.//*[@data-spectrum-step]')],
 'dialog':attrs(dialog), 'dialogTitle':[text(n) for n in dialog.xpath('.//*[@id="spectrum-directions-title"]')],
 'close':[attrs(n) for n in dialog.xpath('.//button[@data-spectrum-close]')],
 'topics':[{'text':text(n),**attrs(n)} for n in dialog.xpath('.//a[@data-spectrum-area]')],
 'wave':[{'tag':n.tag,**attrs(n)} for n in r.xpath('.//*[@data-spectrum-wave]')],
 'activeElements':len(r.xpath('.//script|.//iframe|.//object|.//img[@onerror]|.//svg[@onload]')),
 'nestedLinks':len(r.xpath('.//a//a')),
 'text':text(r)
}))
`],{input:markup,encoding:'utf8'}));
}

const page=inspect(homeSpectrumHTML());
assert.equal(page.root.id,'top');
assert(page.root.class.split(' ').includes('spectrum-home'));
assert.deepEqual(page.headings,['Почни з питання.']);
assert.equal(new Set(page.ids).size,page.ids.length,'all hero and dialog ids are unique');
for(const retainedId of ['cards','start-here'])assert(!page.ids.includes(retainedId),'lower content owns '+retainedId);
assert.equal(page.nestedLinks,0);
assert.equal(page.activeElements,0);

// Removing JavaScript must still leave a usable GET query to the real directory.
assert.equal(page.form.id,'spectrum-search');
assert.equal(page.form.role,'search');
assert.equal(page.form.action,'./directions.html');
assert.equal(page.form.method.toLowerCase(),'get');
assert.equal(page.inputs.length,1);
assert.equal(page.inputs[0].type,'search');
assert.equal(page.inputs[0].id,'spectrum-query');
assert.equal(page.inputs[0].name,'q');
assert(page.labels.some(l=>l.for==='spectrum-query'&&l.text==='Що хочеш зрозуміти?'));
assert.equal(page.submit.length,1);
assert.equal(page.submit[0]['aria-label']||page.submit[0].text,'Знайти матеріал');

const questions=page.links.filter(link=>link['data-spectrum-question']);
assert.deepEqual(questions.map(link=>link['data-spectrum-question']),['muscle','fat','creatine']);
const destinations={muscle:['muscle','structure','./muscle-lab.html#explorer','Як працюють м’язи?'],fat:['nutrition','fat-loss','./fat-burning.html','Куди зникає жир?'],creatine:['supplements','creatine','./index.html#creatine','Що відомо про креатин?']};
for(const link of questions){
  const [areaId,unitId,href,title]=destinations[link['data-spectrum-question']];
  assert.equal(link.href,href);
  assert.equal(link.href,catalog.getArea(areaId).units.find(unit=>unit.id===unitId).href);
  assert(link.text.includes(title));
}

assert.deepEqual(page.routeText,['Клітина та енергія']);
assert.deepEqual(page.steps,['Мітохондрія','М’язове волокно','Механізм ATP–PCr']);
const route=page.links.find(link=>'data-spectrum-route' in link);
assert.equal(route.href,'./cell-lab.html?organelle=ORG-MITOCHONDRION&path=energy&lesson=0#cell-canvas');
const location=learningLocation(new URL(route.href,'https://evidence.invalid/').href);
assert.equal(location.path.id,'energy');
assert.equal(location.index,0);
assert.equal(location.step.id,'mitochondrion');

const trigger=page.links.find(link=>link.id==='spectrum-directions-trigger');
assert.equal(trigger.href,'./directions.html');
assert.equal(trigger.text,'Усі напрями');
assert.equal(page.dialog.id,'spectrum-directions');
assert(!('open' in page.dialog),'native dialog is closed before enhancement');
assert.equal(page.dialog['aria-labelledby'],'spectrum-directions-title');
assert.deepEqual(page.dialogTitle,['Напрями Evidence UA']);
assert.equal(page.close.length,1);
assert.equal(page.close[0].type,'button');
assert(page.close[0]['aria-label']);
assert.deepEqual(page.topics.map(link=>link['data-spectrum-area']),['muscle','cell','nutrition','supplements','movement','sleep']);
for(const link of page.topics){
  const area=catalog.getArea(link['data-spectrum-area']);
  assert.equal(link.href,area.href);
  assert(link.text.includes(area.title));
  assert(link.text.includes(area.state),'statuses must come from catalog, without implying completed review');
}
assert(page.links.some(link=>link.href==='./directions.html'&&link.text==='Усі матеріали →'));
for(const link of page.links){
  const url=new URL(link.href,'https://evidence.invalid/');
  assert.equal(url.origin,'https://evidence.invalid');
  const file='dist'+url.pathname;
  assert(fs.existsSync(file),'real local target: '+link.href);
  if(url.hash)assert(fs.readFileSync(file,'utf8').includes('id="'+url.hash.slice(1)+'"'),'real target anchor: '+link.href);
}
assert.equal(page.wave.length,1);
assert.equal(page.wave[0].tag,'canvas','motion draws into the authored decorative canvas');
assert.equal(page.wave[0].id,'spectrum-wave');
assert.equal(page.wave[0]['aria-hidden'],'true');

// The renderer uses shared catalog data, while treating its labels as text.
const muscle=catalog.getArea('muscle'),before={title:muscle.title,state:muscle.state};
try{
  muscle.title='<script>alert("title")</script> & м’язи';
  muscle.state='"><img src=x onerror="alert(1)">';
  const escaped=inspect(homeSpectrumHTML());
  assert.equal(escaped.activeElements,0);
  assert(escaped.topics[0].text.includes(muscle.title));
  assert(escaped.topics[0].text.includes(muscle.state));
}finally{Object.assign(muscle,before);}

// The router writes inline display:var(--home-layout,block)!important. Preserve
// that variable contract, while allowing the native no-JS :target rules to hide
// the home behind a supplement dossier. CI additionally checks computed styles.
const css=fs.readFileSync('dist/home-spectrum.css','utf8');
const homeScope='body[data-platform-area="home"]:not([data-route-view="article"])';
const scopes=[...css.matchAll(/body[^\n{]+/g)].map(match=>match[0]);
assert(scopes.length>0);
assert(scopes.every(selector=>selector.startsWith(homeScope)),'every spectrum rule must match the scriptless home and exclude the article route');
const pageRule=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([,selector])=>selector.trim()===homeScope+' .page');
assert(pageRule,'the home page has a scoped layout declaration');
const declarations=new Map(pageRule[2].split(';').filter(Boolean).map(declaration=>{
  const colon=declaration.indexOf(':');
  return [declaration.slice(0,colon).trim(),declaration.slice(colon+1).trim()];
}));
assert.equal(declarations.get('--home-layout'),'block!important','router inline display must resolve to a single full-width block');
assert.equal(declarations.get('display'),'var(--home-layout,block)','native :target!important must outrank the normal authored display');
const secondaryRule=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([,selector])=>selector.includes('a[data-home-secondary]'));
assert(secondaryRule,'all six header destinations stay in the DOM while the home displays a compact subset');
assert(secondaryRule[1].trim().startsWith(homeScope));
assert(secondaryRule[2].split(';').some(declaration=>declaration.trim()==='display:none!important'));
console.log('Home spectrum: semantic search fallback, canonical links/route, six directions, decorative wave and escaped catalog text passed.');
