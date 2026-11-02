import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeTitle,pickByTitle,openAround,findTarget,landingBand,mountAnchorReveal} from '../src/platform/anchor-reveal.mjs';

// Перехід до розділу (рішення власника 2026-11-02, пошук по розділах): спільний модуль на кожній сторінці відкриває згорнутий блок, доводить ціль до верху вікна
// після того, як сторінка змінила висоту, і за ?section= знаходить заголовок без власного id. Тут перевіряються чисті частини й підключення;
// положення на екрані в справжньому браузері міряє sectionsFlow у Browser QA.
const read=f=>fs.readFileSync(f,'utf8');

// 1) Порівняння назв: однакове в збірці й на сторінці.
assert.equal(normalizeTitle('  Вагітність. '),'вагітність','case and the final full stop do not matter');
assert.equal(normalizeTitle('→ Чому м’яз росте ↗'),"чому м'яз росте",'arrows at the edges and apostrophe kinds do not matter');
assert.equal(normalizeTitle('Нирки ≠ креатинін'),'нирки ≠ креатинін','signs inside the name stay');
assert.equal(normalizeTitle('Що таке метааналіз?'),'що таке метааналіз?','a question mark stays');
assert.equal(normalizeTitle(null),'','empty input is empty');

// 2) Вибір заголовка за назвою й номером.
const items=[{text:'Сила',id:1},{text:'Тиск',id:2},{text:' сила. ',id:3}];
assert.equal(pickByTitle(items,'Сила').id,1,'the first match by default');
assert.equal(pickByTitle(items,'сила',2).id,3,'the n-th match');
assert.equal(pickByTitle(items,'Сила',3),null,'no such match');
assert.equal(pickByTitle(items,'Сила','abc').id,1,'a bad number means the first');
assert.equal(pickByTitle(items,''),null,'an empty name finds nothing');

// 3) Відкриття згорнутих блоків: всі зовнішні <details>, а відкритий не чіпається.
const mk=(tagName,props={})=>Object.assign({tagName,open:false,parentElement:null,closest(sel){let n=this;while(n){if(sel==='details'&&n.tagName==='DETAILS')return n;if(sel==='dialog'&&n.tagName==='DIALOG')return n;n=n.parentElement;}return null;}},props);
const outer=mk('DETAILS'),inner=mk('DETAILS',{parentElement:outer}),heading=mk('H3',{parentElement:inner});
assert.equal(openAround(heading),true,'a heading inside two closed blocks opens both');
assert(outer.open&&inner.open,'both blocks are open');
assert.equal(openAround(heading),false,'nothing to open the second time');
const self=mk('DETAILS');
assert.equal(openAround(self)&&self.open,true,'a target that is itself a closed block opens');
assert.equal(openAround(mk('H3')),false,'a heading outside blocks needs nothing');

// 4) Пошук цілі: якір, назва в якорі, назва на всій сторінці, діалог.
const el=(tagName,text,extra={})=>({tagName,textContent:text,closest:()=>null,...extra});
const claim=el('H3','Вагітність'),other=el('H3','Тиск'),hiddenOne=el('H3','Вагітність',{closest:()=>({})});
const container={tagName:'SECTION',closest:()=>null,querySelectorAll:()=>[hiddenOne,claim,other]};
const doc={getElementById:id=>id==='box'?container:id==='dlg'?{tagName:'DIALOG',closest:()=>null}:null,body:{querySelectorAll:()=>[other,claim]}};
assert.equal(findTarget(doc,{hash:'#box'}).el,container,'a plain anchor is the target');
assert.equal(findTarget(doc,{hash:'#box',search:'?section=%D0%92%D0%B0%D0%B3%D1%96%D1%82%D0%BD%D1%96%D1%81%D1%82%D1%8C'}).el,claim,'a name inside the anchor finds the heading and skips hidden parts');
assert.equal(findTarget(doc,{hash:'#box',search:'?section=%D0%92%D0%B0%D0%B3%D1%96%D1%82%D0%BD%D1%96%D1%81%D1%82%D1%8C'}).byTitle,true,'and says it was found by name');
assert.equal(findTarget(doc,{hash:'',search:'?section=%D0%A2%D0%B8%D1%81%D0%BA'}).el,other,'without an anchor the whole page is searched');
assert.equal(findTarget(doc,{hash:'#box',search:'?section=nope'}).el,container,'an unknown name falls back to the anchor');
assert.equal(findTarget(doc,{hash:'#dlg'}).modal,true,'a dialog is never scrolled to');
assert.equal(findTarget(doc,{hash:'#missing'}).el,null,'a missing anchor is no target');
assert.equal(findTarget(doc,{hash:'#%E0%A4%A'}).el,null,'a broken escape does not throw');

// 5) Де має стояти ціль.
assert.deepEqual(landingBand(true,844),[8,140],'a section found by name stands in the top part of the window');
assert.deepEqual(landingBand(true,400),[8,100],'on a short window the band is a quarter of its height');
assert.deepEqual(landingBand(false,800),[0,480],'an anchor may stand in the upper 60% (that is where the browser leaves it)');

// 6) Джерело модуля: нічого не надсилає й не зберігає, вмикається один раз, використовує миттєву прокрутку.
const src=read('src/platform/anchor-reveal.mjs');
assert(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|https?:\/\//.test(src),'the module talks to no one and stores nothing');
assert(src.includes('window.__euaAnchorReveal')&&src.includes("behavior:'instant'")&&src.includes("'wheel','touchstart','keydown','mousedown'"),'it mounts once, scrolls instantly and leaves the page alone once the visitor scrolls');
assert(src.includes('prefers-reduced-motion:no-preference'),'the highlight fades only for visitors who allow motion');
assert.equal(typeof mountAnchorReveal,'function','the mount function is exported for tests');

// 7) Підключення: копія в dist, один тег на кожній сторінці, у <head>.
assert.equal(read('dist/anchor-reveal.js'),src,'the built copy equals the source (run node scripts/build-site.mjs)');
const pages=fs.readdirSync('dist').filter(f=>f.endsWith('.html'));
assert.equal(pages.length,21,'twenty-one pages');
for(const f of pages){
  const html=read('dist/'+f);
  assert.equal((html.match(/<script type="module" src="\.\/anchor-reveal\.js\?v=1"><\/script>/g)||[]).length,1,`${f} loads anchor-reveal.js once`);
  assert(html.indexOf('anchor-reveal.js')<html.indexOf('</head>'),`${f} loads it in the head`);
}
const build=read('scripts/build-platform.mjs');
assert(build.includes("fs.copyFileSync('src/platform/anchor-reveal.mjs','dist/anchor-reveal.js')")&&build.includes("if(old.includes('anchor-reveal.js'))continue;"),'the build copies it and adds the tag once');
assert(read('scripts/build-site.mjs').includes("'platform-sections.js', 'anchor-reveal.js'"),'both new files are in the list of generated files');
console.log('Anchor reveal: names, picking, opening blocks, targets, band, safe source, one tag per page passed.');
