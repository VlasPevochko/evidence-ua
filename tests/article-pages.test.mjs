// Розбори добавок окремими сторінками, етапи 1–2 (рішення власника «3 та 7», «2-4 так»; docs/HOME_SPLIT_PLAN.md).
// Сторінки вирізаються зі спільного документа dist/index.html (src/platform/article-pages.mjs). Тест стежить за головним:
//   1) наукові тексти переїхали без жодної зміни: розділ у сторінці відрізняється від розділу в спільному документі лише адресами посилань-якорів;
//   2) сторінка самодостатня: один розбір, жодного шматка головної, кожне посилання-якір кудись веде;
//   3) етап 2: на сторінки ведуть усі посилання сайту, вони відкриті для пошукових систем, є в карті сайту й пошуку;
//      старі адреси index.html#… головна переводить на них (таблиця якорів збирається з самих розборів).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ARTICLES,ARTICLE_FILES,HOME_ONLY_SCRIPTS,ROUTER_MARK,homePageHTML,REVIEW_ONLY_STYLESHEETS,REVIEW_ONLY_SCRIPTS,REVIEW_ONLY_STYLE_BLOCKS,layout,sectionSpan,anchorOwners,rewriteHashLinks,articlePageHTML,articleTitle,articleDescription,redirectTable,withRedirectTable,movedAddress,homeOnlyHTML} from '../src/platform/article-pages.mjs';
import {readBase} from '../scripts/site-url.mjs';
import {unstampHome} from '../scripts/combined-source.mjs';

// 2026-11-17 (етап 3): спільний документ лежить у src/site/index.combined.html, а dist/index.html це лише головна, вирізана з нього.
const base=readBase(),combined=fs.readFileSync('src/site/index.combined.html','utf8'),publishedHome=unstampHome(fs.readFileSync('dist/index.html','utf8')); // 2026-11-17: останній рядок це відбиток збірки (захист від ручних правок)
assert(/\n<!-- EUA_HOME_DIGEST sha256:[0-9a-f]{64} -->\n$/.test(fs.readFileSync('dist/index.html','utf8')),'the published home ends with its build digest');
assert.equal(publishedHome,homePageHTML(combined),'dist/index.html is the home cut from the combined document (run node scripts/build-site.mjs)');
assert(!/<section\b[^>]*\bid="(?:creatine|supplement-(?!library)[a-z-]+)"/.test(publishedHome),'the published home carries no review');
for(const asset of [...REVIEW_ONLY_STYLESHEETS,...REVIEW_ONLY_SCRIPTS])assert(!publishedHome.includes('./'+asset),`the published home does not load ${asset}`);
for(const mark of REVIEW_ONLY_STYLE_BLOCKS)assert(!publishedHome.includes(mark),`the published home has no ${mark} block`);
for(const article of ARTICLES)for(const asset of ['home-article.css','home-article-cosmic.css','evidence/evidence.css'])assert(fs.readFileSync('dist/'+article.file,'utf8').includes('./'+asset),`${article.file} still loads ${asset}`);
assert(publishedHome.includes('EUA_ARTICLE_REDIRECTS_START')&&publishedHome.includes("if(to){location.replace(to);return;}"),'the published home still moves old review addresses to their pages');
const read=file=>fs.readFileSync('dist/'+file,'utf8');
const text=html=>html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const withoutHrefs=html=>html.replace(/\bhref="[^"]*"/g,'href');
const parts=layout(combined),owners=anchorOwners(combined);
const navigationStyle=fs.readFileSync('dist/navigation-v17.js','utf8').match(/stylesheet\.href = '(\.\/navigation-v17\.css\?v=\d+)'/)[1];

// Список розборів: 11, у порядку документа; назви такі самі, як у списку бібліотеки на головній.
assert.equal(ARTICLES.length,11);
assert.deepEqual(parts.articles.map(a=>a.id),ARTICLES.map(a=>a.id));
const library=(combined.match(/<ul class="se-list"[\s\S]*?<\/ul>/)||[''])[0];
const listed=[...library.matchAll(/<li><a href="\.\/([a-z0-9-]+)\.html">(?:<i\b[^>]*><\/i>)?([^<]+)<\/a><\/li>/g)].map(m=>[m[1],m[2]]);
assert.deepEqual(listed,ARTICLES.map(a=>[a.id,a.name]),'review names and order equal the library list on the home');
assert.deepEqual(ARTICLE_FILES,ARTICLES.map(a=>a.id+'.html'),'a page is named after the anchor of its review');
assert.equal(new Set(ARTICLE_FILES).size,11);

let totalBytes=0;
for(const article of ARTICLES){
  const page=read(article.file),name=article.file;
  // Сторінка свіжа: рівно те, що видає модуль зі спільного документа.
  assert.equal(page,articlePageHTML(combined,article.id,{base,indexable:true,styles:[navigationStyle]}),`${name} is fresh (run node scripts/build-site.mjs)`);

  // 1) Наукові тексти без змін.
  const original=parts.articles.find(a=>a.id===article.id).section;
  const span=sectionSpan(page,article.id),moved=page.slice(span.start,span.end);
  assert.equal(moved,rewriteHashLinks(original,article.id,owners),`${name}: the review section is the original with only anchor links re-addressed`);
  assert.equal(withoutHrefs(moved),withoutHrefs(original),`${name}: apart from link addresses the section is byte-for-byte the original`);
  assert.equal(text(moved),text(original),`${name}: the visible text of the review is unchanged`);
  assert(text(moved).length>1500,`${name}: the review is not empty`);

  // 2) Самодостатня сторінка.
  assert.equal((page.match(/<section\b[^>]*\bid="(?:creatine|supplement-[a-z0-9-]+)"/g)||[]).length,1,`${name}: exactly one review on the page`);
  assert.equal((page.match(/<h1[\s>]/g)||[]).length,1,`${name}: exactly one <h1>`);
  for(const marker of ['spectrum-home','data-home-lens','id="categories"','id="start-here"','home-fresh-grid','se-list','EUA_HOME_'])assert(!page.includes(marker),`${name}: no piece of the home (${marker})`);
  assert(!page.includes(ROUTER_MARK),`${name}: the home router script is gone`);
  const body=/<body\b[^>]*>/.exec(page)[0];
  assert(body.includes('data-platform-area="home"')&&body.includes('data-route-view="article"')&&body.includes(`data-article="${article.id}"`),`${name}: the body carries the article markers statically`);
  assert(page.includes(`body[data-article="${article.id}"][data-route-view="article"]>#${article.id}{display:block!important}`),`${name}: the review is visible without any script`);
  assert(/<main class="page" data-article-mode><header class="home-header">[\s\S]*?<\/header><\/main>/.test(page),`${name}: only the site header stays of the home <main>`);
  for(const script of HOME_ONLY_SCRIPTS)assert(!new RegExp(`src="\\./${script.replace('.','\\.')}`).test(page),`${name}: does not load ${script}`);
  for(const script of ['platform-shell.js','evidence/ui.js','appearance.js','anchor-reveal.js'])assert(page.includes(`src="./${script}?`),`${name}: loads ${script}`);
  assert.equal(page.split(navigationStyle).length-1,1,`${name}: links the stylesheet that navigation-v17.js used to add`);
  // Стилі з проміжку між розборами (після «Креатину») потрібні кожному розбору; скрипт пошуку PubMed лише «Креатину».
  for(const style of parts.articles.flatMap(a=>a.extra.match(/<style\b[^>]*>[\s\S]*?<\/style>/g)||[]))assert(page.includes(style),`${name}: carries the shared style block that stands between the reviews`);
  assert.equal(page.includes("document.getElementById('research-load')"),article.id==='creatine',`${name}: the PubMed search script is only on the creatine page`);

  // Кожне посилання-якір веде до чогось наявного: у цій сторінці, в іншому розборі або на головній.
  const ids=new Set([...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const [,anchor] of page.matchAll(/\bhref="#([^"]+)"/g))assert(ids.has(anchor),`${name}: #${anchor} exists on the page`);
  for(const [,file,anchor] of page.matchAll(/\bhref="\.\/((?:creatine|supplement-[a-z0-9-]+)\.html)(?:#([^"]+))?"/g)){
    assert(ARTICLE_FILES.includes(file),`${name}: links to a known review page (${file})`);
    if(anchor)assert(new RegExp(`\\bid="${anchor}"`).test(read(file)),`${name}: ${file}#${anchor} exists`);
  }
  for(const [,anchor] of page.matchAll(/\bhref="\.\/index\.html#([^"]+)"/g))assert(new RegExp(`\\bid="${anchor}"`).test(combined.slice(0,combined.indexOf('</main>'))),`${name}: index.html#${anchor} exists on the home`);
  assert(!/\bhref="#top"/.test(page),`${name}: «на головну» leads to the home page, not to an anchor that is not here`);

  // Назва, опис, адреса, картка.
  const title=articleTitle(article),description=articleDescription(article);
  assert.equal(title,article.name+' — Evidence UA');
  assert(page.includes(`<title>${title}</title>`),`${name}: its own <title>`);
  assert(description.length>=40&&description.length<=300&&description.includes(article.name),`${name}: a 40–300 character description that names the supplement`);
  assert(page.includes(`<meta name="description" content="${description}">`)&&page.includes(`<meta property="og:description" content="${description}">`),`${name}: description in both places`);
  assert(page.includes(`<link rel="canonical" href="${base}${name}">`)&&page.includes(`<meta property="og:url" content="${base}${name}">`),`${name}: canonical address`);
  assert(page.includes(`<meta property="og:image" content="${base}og/${article.id}.jpg">`)&&fs.statSync(`dist/og/${article.id}.jpg`).size>20000,`${name}: its own share card`);

  // 3) Етап 2: сторінка відкрита для пошукових систем і є в карті сайту.
  assert(!/<meta name="robots"/.test(page),`${name}: open to search engines`);
  assert(fs.readFileSync('dist/sitemap.xml','utf8').includes(`<loc>${base}${name}</loc>`),`${name}: listed in the sitemap`);
  totalBytes+=Buffer.byteLength(page);
  assert(Buffer.byteLength(page)<Buffer.byteLength(combined)*0.45,`${name}: lighter than half of the combined document (${Math.round(Buffer.byteLength(page)/1024)} KB)`);
}
// Опис це шаблон: жодного твердження про добавку, лише її назва.
assert.equal(new Set(ARTICLES.map(a=>articleDescription(a).replace(a.name,'…'))).size,1,'one description template for every review');

// 3) Посилання сайту ведуть на сторінки розборів; старих адрес у посиланнях не лишилось.
for(const article of ARTICLES)assert(sectionSpan(combined,article.id).end>0,`the combined document still carries «${article.id}» (it is the source the pages are cut from)`);
const oldLink=/(?:index\.html(?:\?[^"'#\s]*)?|["'`])#(?:creatine(?:-[a-z-]+)?|supplement-(?:protein|caffeine|omega|vitd|magnesium|collagen|beta-alanine|citrulline|electrolytes|berberine)|evidence-card|pubmed-live)["'`]/;
const homePart=publishedHome.slice(publishedHome.indexOf('<body'),publishedHome.indexOf('</main>'));
assert(!/href="#(?:creatine|supplement-(?!library)[a-z-]+|evidence-card|pubmed-live)/.test(homePart),'the home part links to review pages, not to anchors of the reviews');
for(const file of ['index.html','platform-catalog.js','platform-materials.js','site-header.js','changes-data.js','atlas.js','sleep.html','protein-meta.html','muscle-lab.html','directions.html','supplements.html','platform-sections.js','sitemap.xml']){
  const source=read(file).replace(/\/\/[^\n]*/g,'');
  assert(!/index\.html(?:\?[^"'#\s]*)?#(?:creatine|supplement-(?:protein|caffeine|omega|vitd|magnesium|collagen|beta-alanine|citrulline|electrolytes|berberine)|evidence-card|pubmed-live)/.test(source),`${file} has no old review address left`);
}
for(const file of ['platform-catalog.js','site-header.js','changes-data.js','platform-sections.js','sitemap.xml'])assert(/creatine\.html/.test(read(file)),`${file} links to review pages`);
// Старі адреси: таблиця в скрипті головної свіжа, повна й веде до наявних якорів.
const table=redirectTable(combined);
assert.equal(withRedirectTable(combined),combined,'the redirect table in the home script is fresh (run node scripts/build-site.mjs)');
assert.deepEqual(Object.keys(table),ARTICLE_FILES);
assert.equal(Object.values(table).flat().length+ARTICLES.length,owners.size,'every anchor of every review is in the table');
assert.equal(new Set(Object.values(table).flat()).size,Object.values(table).flat().length,'no anchor belongs to two reviews');
for(const [file,anchors] of Object.entries(table))for(const anchor of anchors)assert(new RegExp(`\\bid="${anchor}"`).test(read(file)),`${file}#${anchor} exists`);
assert.equal(movedAddress('creatine',table),'./creatine.html');assert.equal(movedAddress('creatine-dosing',table),'./creatine.html#creatine-dosing');
assert.equal(movedAddress('supplement-vitd',table),'./supplement-vitd.html');assert.equal(movedAddress('top',table),null);assert.equal(movedAddress('supplement-library',table),null);
assert(combined.includes('if(to){location.replace(to);return;}'),'the home script moves an old address to the review page');
// Індекс розділів: розділи розборів знаходяться на сторінках розборів, а не двічі.
const sections=read('platform-sections.js');
assert(sections.includes('"creatine.html#creatine-dosing"')&&!/"index\.html#(?:creatine|supplement-(?!library))/.test(sections),'review sections are indexed on their own pages only');
assert(!homeOnlyHTML(combined).includes('id="creatine"')&&homeOnlyHTML(combined).includes('id="categories"')&&homeOnlyHTML(combined).includes('platform-shell.js'),'the home-only view drops the reviews and keeps the home and its scripts');

// Модуль зупиняє збірку на несподіваному документі замість тихо різати не те.
assert.throws(()=>sectionSpan('<p></p>','creatine'),/no <section id="creatine">/);
assert.throws(()=>sectionSpan('<section id="creatine"><section>','creatine'),/not closed/);
assert.throws(()=>articlePageHTML(combined,'supplement-unknown',{base}),/Unknown review/);
assert.throws(()=>articlePageHTML(combined,'creatine',{base:'http://example.com/'}),/https URL/);
assert.throws(()=>articlePageHTML(combined,'creatine',{base,styles:['https://example.com/x.css']}),/Unexpected stylesheet/);
assert.throws(()=>layout(combined.replace('id="supplement-berberine"','id="supplement-new"')),/missing from ARTICLES|no <section id="supplement-berberine">/);
assert.throws(()=>articlePageHTML(combined.replace('<title>','<title>x</title><title>'),'creatine',{base}),/exactly one <title>/);
assert.throws(()=>articlePageHTML(combined.replace(ROUTER_MARK,'const MOVED='),'creatine',{base}),/router script was not found|EUA_ARTICLE_REDIRECTS/);
assert.throws(()=>withRedirectTable('<p></p>'),/exactly one EUA_ARTICLE_REDIRECTS/);
// Посилання: свої лишаються, чужі ведуть на сторінку розбору, решта на головну.
assert.equal(rewriteHashLinks('<a href="#evidence-card">a</a><a href="#supplement-omega">b</a><a href="#top">c</a><a href="#categories">d</a><a href="./x.html#y">e</a>','creatine',owners),
  '<a href="#evidence-card">a</a><a href="./supplement-omega.html">b</a><a href="./index.html">c</a><a href="./index.html#categories">d</a><a href="./x.html#y">e</a>');
assert.equal(rewriteHashLinks('<a href="#evidence-card">a</a>','supplement-omega',owners),'<a href="./creatine.html#evidence-card">a</a>','an anchor inside another review keeps its place on that page');
console.log(`Review pages: 11 pages cut from the combined document, texts unchanged, self-contained, linked and open to search engines, old addresses redirect; ${Math.round(totalBytes/1024/11)} KB on average against ${Math.round(Buffer.byteLength(combined)/1024)} KB.`);
