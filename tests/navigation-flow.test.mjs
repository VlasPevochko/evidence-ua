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
assert.equal(result.missingTargets,0);assert.equal(result.htmlPages,11);
for(const area of catalog.areas.filter(a=>a.available)){
 const url=new URL(area.href,'https://evidence.invalid/');assert(fs.existsSync(path.join('dist',url.pathname)));
}
for(const route of catalog.paths)for(let i=0;i<route.steps.length;i++){
 const url=new URL(learningHref(route.id,i),'https://evidence.invalid/');const location=learningLocation(url.href);assert.equal(location.index,i);assert.equal(location.path.id,route.id);
}
const muscle=fs.readFileSync('dist/muscle-lab.html','utf8'),home=fs.readFileSync('dist/index.html','utf8'),protein=fs.readFileSync('dist/protein-meta.html','utf8');
assert(muscle.includes('href="./index.html#top"'));assert(muscle.includes('href="./directions.html"'));assert(home.includes('href="#start-here"'));assert(protein.includes('#supplement-protein'));assert(protein.includes('#top'));
// Execute the production hash router, not a reimplementation of it.
// The VM records declarations; v76 resolves the home layout through CSS so
// desktop grid and mobile flex survive a round trip through an article.
const layoutCSS=fs.readFileSync('dist/home-vcard.css','utf8');
assert(home.includes('./home-vcard.css?v=76'));
assert(layoutCSS.includes('--home-layout:grid'));assert(layoutCSS.includes('--home-layout:flex'));
const start=home.indexOf('(()=>{\n const page='),end=home.indexOf('</script>',start);assert(start>=0&&end>start);
const nodes=new Map(),callbacks=new Map(),articles=[];
const make=(id,tagName='DIV')=>{const n={id,tagName,style:{setProperty(k,v){this[k]=v;}},classList:{toggle(){}},contains(child){return child?.article===this;},querySelector(){return {textContent:id};},scrollIntoView(){this.scrolled=true;}};nodes.set(id,n);return n;};
const page=make('page');for(const id of ['creatine','supplement-protein','supplement-magnesium'])articles.push(make(id,'SECTION'));
for(const id of ['top','start-here','categories','cards','supplement-library','home-feedback'])make(id);
make('evidence-card').article=articles[0];
const doc={body:{dataset:{}},querySelector(){return page;},getElementById:id=>nodes.get(id)||null,querySelectorAll(selector){return selector.startsWith('body>section')?articles.slice(1):[];}};
const location={hash:'#top'},sandbox={document:doc,location,window:{addEventListener(k,fn){callbacks.set(k,fn);}},requestAnimationFrame(fn){fn();}};vm.runInNewContext(home.slice(start,end),sandbox);
for(const id of ['creatine','evidence-card','supplement-protein','supplement-magnesium']){location.hash='#'+id;callbacks.get('hashchange')();assert.equal(page.style.display,'none');assert.equal(doc.body.dataset.routeView,'article');assert(nodes.get(id).scrolled);}
for(const id of ['top','start-here','categories','cards','supplement-library','home-feedback','missing-target']){location.hash='#'+id;callbacks.get('hashchange')();assert.equal(page.style.display,'var(--home-layout, block)');assert.equal(doc.body.dataset.routeView,'home');assert(articles.every(a=>a.style.display==='none'));}
console.log('Navigation target audit:',result,'All available catalog, Atlas and teaching routes resolve. This validates code/targets, not live clicks or layout.');