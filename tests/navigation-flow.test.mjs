// Owner-selected Spectrum replaces the old hero jump; legacy target and real catalog destination remain.
// home-vcard.css bumped 77 -> 78: accent colours snapped to the shared gold/cyan set (cache busting).
// home-vcard.css version bumped 76 -> 77 because its border-radius values moved to the 8/16/30 scale (cache busting).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {catalog,learningHref,learningLocation} from '../src/platform/catalog.mjs';
import {areaCard,pathCard} from '../dist/directions.js';
import {renderTopics} from '../dist/muscle-lab.js';
import {muscleKnowledge,sources} from '../src/muscle-lab/module.mjs';
import {ClaimCard,SourceCard} from '../src/evidence/core/components.mjs';
import {materials} from '../src/platform/materials.mjs';
import {materialCard} from '../src/platform/quick-tools.mjs';
import {redirectTable,movedAddress} from '../src/platform/article-pages.mjs';
const generated={
 'muscle-lab.html':renderTopics('university')+muscleKnowledge.claims.map(c=>ClaimCard(c.id,muscleKnowledge)).join('')+sources.map(s=>SourceCard(s,[])).join(''),
 'directions.html':catalog.areas.filter(a=>a.available).map(areaCard).join('')+catalog.paths.map(pathCard).join('')+materials.map(materialCard).join(''),
 // These targets are created by the existing home navigation controller.
 'index.html':'<div id="supplement-library"></div><div id="evidence-guide-title"></div>'
};
const result=JSON.parse(execFileSync('python',['-c',`import json,sys
from pathlib import Path
from lxml import html
from urllib.parse import urljoin,urlsplit,unquote
generated=json.load(sys.stdin)
documents={p.name:html.fromstring(p.read_text()) for p in Path('dist').glob('*.html')}
targets={name:set(tree.xpath('//*[@id]/@id')) for name,tree in documents.items()}
for name,markup in generated.items():
    fragment=html.fromstring('<div>'+markup+'</div>')
    targets[name].update(fragment.xpath('//*[@id]/@id'))
count=0
for name,tree in documents.items():
    extras=html.fromstring('<div>'+generated.get(name,'')+'</div>')
    for href in tree.xpath('//*[@href]/@href')+extras.xpath('//*[@href]/@href'):
        url=urlsplit(urljoin('https://evidence.invalid/'+name,href))
        if url.netloc!='evidence.invalid' or url.scheme not in ('http','https'): continue
        file=unquote(url.path.lstrip('/')) or 'index.html'
        assert (Path('dist')/file).is_file(), (name,href,'missing local file')
        if url.fragment and file.endswith('.html'):
            assert unquote(url.fragment) in targets[file], (name,href,'missing anchor')
        count+=1
print(json.dumps({'internalLinkOccurrences':count,'htmlPages':len(documents),'missingTargets':0}))
`],{input:JSON.stringify(generated),encoding:'utf8'}));
// New educational pages belong to the same complete local-link and anchor audit.
assert.equal(result.missingTargets,0);
assert.equal(result.htmlPages,fs.readdirSync('dist').filter(file=>file.endsWith('.html')).length);
assert(result.htmlPages>=13,'Fat Burning Lab adds the 13th available HTML page');
for(const area of catalog.areas.filter(a=>a.available)){
 const url=new URL(area.href,'https://evidence.invalid/');assert(fs.existsSync(path.join('dist',url.pathname)));
}
for(const route of catalog.paths)for(let i=0;i<route.steps.length;i++){
 const url=new URL(learningHref(route.id,i),'https://evidence.invalid/');const location=learningLocation(url.href);assert.equal(location.index,i);assert.equal(location.path.id,route.id);
}
const muscle=fs.readFileSync('dist/muscle-lab.html','utf8'),home=fs.readFileSync('dist/index.html','utf8'),protein=fs.readFileSync('dist/protein-meta.html','utf8');
assert(muscle.includes('href="./index.html#top"'));assert(muscle.includes('href="./directions.html"'));assert(home.includes('id="start-here"')&&home.includes('id="spectrum-directions-trigger"')&&home.includes('href="./directions.html"'));assert(protein.includes('href="./supplement-protein.html"'));assert(protein.includes('#top'));
// Execute the production home script, not a reimplementation of it.
// 2026-11-17 (docs/HOME_SPLIT_PLAN.md, етап 2): розбори добавок мають власні сторінки. Скрипт головної більше не показує розбір у себе:
// стару адресу (index.html#creatine, index.html#creatine-dosing, index.html#supplement-…) він переводить на сторінку розбору з тим самим якорем,
// а для якорів самої головної лишає головну видимою (макет головної, як і раніше, дає CSS: grid на комп’ютері, flex на телефоні).
const layoutCSS=fs.readFileSync('dist/home-vcard.css','utf8');
assert(home.includes('./home-vcard.css?v=78'));
assert(layoutCSS.includes('--home-layout:grid'));assert(layoutCSS.includes('--home-layout:flex'));
const start=home.indexOf('(()=>{\n // Розбори добавок живуть на власних сторінках'),end=home.indexOf('</script>',start);assert(start>=0&&end>start);
const nodes=new Map(),callbacks=new Map();
const make=(id,tagName='DIV')=>{const n={id,tagName,attrs:{},removeAttribute(name){this.attrs[name]=false;},style:{setProperty(k,v){this[k]=v;}},scrollIntoView(){this.scrolled=true;}};nodes.set(id,n);return n;};
const page=make('page');
for(const id of ['top','start-here','categories','cards','supplement-library','home-feedback'])make(id);
const doc={body:{dataset:{}},title:'',querySelector(){return page;},getElementById:id=>nodes.get(id)||null,querySelectorAll(){return [];}};
const location={hash:'#top',replaced:[],replace(to){this.replaced.push(to);}},win={addEventListener(k,fn){callbacks.set(k,fn);}},sandbox={document:doc,location,window:win,requestAnimationFrame(fn){fn();}};
vm.runInNewContext(home.slice(start,end),sandbox);
const table=redirectTable(home);
assert.equal(Object.keys(table).length,11);assert(table['creatine.html'].includes('evidence-card')&&table['creatine.html'].includes('pubmed-live')&&table['creatine.html'].includes('creatine-dosing'));
// Старі адреси: розбір цілком, якір усередині розбору, картка твердження.
for(const [old,to] of [['creatine','./creatine.html'],['evidence-card','./creatine.html#evidence-card'],['creatine-dosing','./creatine.html#creatine-dosing'],['pubmed-live','./creatine.html#pubmed-live'],['supplement-protein','./supplement-protein.html'],['supplement-magnesium','./supplement-magnesium.html'],['CLM-000053','./supplement-protein.html#CLM-000053']]){
  assert.equal(movedAddress(old,table),to);
  location.hash='#'+old;location.replaced.length=0;callbacks.get('hashchange')();
  assert.deepEqual(location.replaced,[to],`index.html#${old} moves to ${to}`);
}
// Якорі головної: без переходу, головна видима.
for(const id of ['top','start-here','categories','cards','supplement-library','home-feedback','missing-target']){
  location.hash='#'+id;location.replaced.length=0;callbacks.get('hashchange')();
  assert.deepEqual(location.replaced,[],`#${id} stays on the home`);
  assert.equal(page.style.display,'var(--home-layout, block)');assert.equal(page.attrs['data-article-mode'],false);assert.equal(doc.body.dataset.routeView,'home');
  if(nodes.has(id))assert.equal(nodes.get(id).scrolled,true,`#${id} is scrolled into view`);
}
assert.equal(movedAddress('top',table),null);assert.equal(movedAddress('supplement-library',table),null);
// Кожен якір таблиці справді є на сторінці, куди він веде.
for(const [file,anchors] of Object.entries(table)){const target=fs.readFileSync('dist/'+file,'utf8');for(const anchor of anchors)assert(target.includes(`id="${anchor}"`),`${file}#${anchor} exists`);}
console.log('Navigation target audit:',result,'All available catalog, Atlas and teaching routes resolve. This validates code/targets, not live clicks or layout.');