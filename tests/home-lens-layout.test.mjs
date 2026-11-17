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
// 2026-11-15 (рішення власника «давай всі 4»): у ядрі стоять шість кадрів напрямів, тож після трьох картинок оздоби йдуть шість картинок кадрів
// (ті самі файли, що у вікні вибору), так само ледачі й без alt (назва напряму це текст посилання).
assert.deepEqual(parsed.images.map(n=>n.src),['./home-lens-nebula.webp','./home-lens-core.webp','./home-lens-core.webp','./card-art-muscle-v1-cosmic.webp','./card-art-cell-v1-cosmic.webp','./card-art-nutrition-v1-cosmic.webp','./card-art-supplements-v1-cosmic.webp','./card-art-movement-v2-cosmic.webp','./card-art-sleep-v2-cosmic.webp']);
assert(parsed.images.every(n=>n.lazy==='lazy'&&Number(n.width)>0&&Number(n.height)>0&&n.alt===''),'Below-hero decorative art must have stable dimensions and lazy loading');
// 2026-11-15: було 1 (лише кнопка вибору); тепер кнопка й шість кадрів-посилань напрямів.
assert.equal(parsed.controls,1+topics.length,'The central jump and the six direction frames are the internal actions');
const lensCSS=fs.readFileSync('dist/home-lens.css','utf8');
assert(!/\.home-lens-core::before/.test(lensCSS),'the opening must show the nebula behind the halves, never another closed copy of the lens');
// 2026-11-12 («немає корекції»): two abutting clipped copies leave a dark one-pixel line down the closed lens wherever the join
// falls between device pixels (measured on 23 of 33 desktop and phone sizes, up to 91 of 255 levels deep). While progress is exactly 0
// the left copy is shown whole and the right copy is not painted; both turn into halves within the first pixel of scroll. The real
// pixels are measured by Browser QA (homeLensSeamFlow); this pins the mechanism and the rules that must stay in the right order.
assert.match(lensCSS,/\.home-lens-core\{[^}]*--lens-split:clamp\(0,calc\(var\(--lens-progress\)\*400\),1\)/,'the split factor is 0 only at progress 0 and 1 after the first pixel of scroll');
const supports=lensCSS.indexOf('@supports (clip-path:inset(0 calc(50% * clamp(0,calc(1*400),1)) 0 0)){');
assert(supports>0,'the whole-image rules sit behind @supports, so a browser that cannot evaluate them keeps the two halves');
const whole=lensCSS.slice(supports);
assert(/\.home-lens-half--left\{clip-path:inset\(0 calc\(50% \* var\(--lens-split\)\) 0 0\)\}/.test(whole),'the left copy is unclipped at progress 0');
assert(/\.home-lens-half--right\{opacity:var\(--lens-split\)\}/.test(whole),'the right copy is not painted at progress 0');
assert(whole.includes('mask-image:linear-gradient(90deg,#000 calc(100% - 50% * var(--lens-split) - var(--lens-progress)*12px),transparent calc(100% - 50% * var(--lens-split)))'),'the left copy keeps its soft inner edge and loses its mask at progress 0');
// 2026-11-15: половини їдуть за --lens-open (= прогрес × 1,45, не більше 1), а не за самим прогресом: просвіт стає повним, коли текст ядра вже непрозорий.
assert(/--lens-open:clamp\(0,calc\(var\(--lens-progress\)\*1\.45\),1\)/.test(lensCSS),'the opening factor is derived from the scroll progress');
assert(lensCSS.includes('clip-path:inset(0 50% 0 0);transform:translateX(calc(var(--lens-open)*var(--lens-travel)*-1))')&&lensCSS.includes('clip-path:inset(0 0 0 50%);transform:translateX(calc(var(--lens-open)*var(--lens-travel)))'),'without @supports the original two clipped halves still apply');
assert(supports>lensCSS.lastIndexOf('.home-lens-half--right .home-lens-art{'),'the whole-image rules must come after the base mask rules; at equal specificity the later rule wins');
assert(/mask-image:linear-gradient\(90deg,#000 calc\(50% - var\(--lens-progress\)\*12px\),transparent 50%\)/.test(lensCSS.slice(0,supports)),'the base rule keeps the half mask for browsers without @supports');
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
// 2026-11-12: home-lens.css v=7 -> v=8: the closed lens is one whole image (no dark join line); returning visitors must receive it.
// 2026-11-15: home-lens.css v=8 -> v=9 (половини в межах сцени, кадри напрямів, підказка, обрізання тексту).
assert.deepEqual(structure.styles,['./home-lens.css?v=9']);
// 2026-11-11: home-lens.js v=6 -> v=7: the earlier mobile lens action (src/platform/home-lens.mjs) must reach returning visitors. This assertion stays on its own line: it used to sit inside the previous comment, so it never ran.
// 2026-11-15: home-lens.js v=7 -> v=8 (фокус на кадрі напряму тримає ядро відкритим).
assert.deepEqual(structure.scripts,['./home-lens.js?v=8']);
// 2026-11-15, чотири правки лінзи (docs/HOME_LENS_FOUR_FIXES.md).
const peek=inspect(homeDirectionsHTML(topics),`[{'href':n.get('href'),'area':n.get('data-peek-area'),'name':n.xpath('./span[@class="home-lens-cell-name"]')[0].text_content(),'imgs':len(n.xpath('./img[@alt=""][@loading="lazy"]')),'inList':len(n.xpath('parent::li/parent::ul[@data-lens-peek][@aria-label]')),'hidden':len(n.xpath('ancestor::*[@aria-hidden="true" or @hidden or @inert]'))} for n in root.xpath('.//*[@class="home-lens-interior"]//a[@class="home-lens-cell"]')]`);
assert.deepEqual(peek.map(n=>[n.area,n.href,n.name]),topics.map(t=>[t.id,t.href,t.title]),'the core frames are the six canonical directions: same order, same addresses, the title is the link text');
assert(peek.every(n=>n.imgs===1&&n.inList===1&&n.hidden===0),'each frame is a real link in a labelled list with one decorative lazy picture');
// 2026-11-16: картинки кадрів розкодовуються разом із кадром сторінки (decoding="sync"): з async одна з них іноді лишалась ненамальованою
// до наступного перемальовування (docs/HOME_LENS_FOUR_FIXES.md, доповнення). Ледаче завантаження лишається.
assert.equal((homeDirectionsHTML(topics).match(/<a class="home-lens-cell"[^>]*><img [^>]*loading="lazy" decoding="sync" alt="">/g)||[]).length,topics.length,'every core frame picture is lazy and decoded with the frame');
const order=homeDirectionsHTML(topics);
assert(order.indexOf('home-lens-count')<order.indexOf('data-lens-peek')&&order.indexOf('data-lens-peek')<order.indexOf('home-lens-invitation')&&order.indexOf('home-lens-invitation')<order.indexOf('data-lens-reveal'),'reading order in the core: count, frames, invitation, chooser button');
// 1. Половини не виходять за сцену: розмір кулі й розліт рахуються від ширини сцени, і куля + 2 × розліт не перевищує 100% сцени на кожній ширині.
const sizes=[...lensCSS.matchAll(/--lens-size:min\((\d+)px,(\d+)cqw\);--lens-travel:min\((\d+)px,(\d+)cqw\)/g)].map(m=>m.slice(1).map(Number));
assert.equal(sizes.length,3,'three size steps (phone, tablet, desktop)');
for(const [,core,,travel] of sizes)assert(core+2*travel<=100,`sphere ${core}% + 2 × travel ${travel}% fits the stage`);
assert(/@supports \(width:1cqw\) and \(container-type:inline-size\)\{[\s\S]*container-type:inline-size/.test(lensCSS),'container sizing sits behind @supports; older browsers keep the pixel sizes');
// 3. Підказка «Прокрути — відкрий ядро» видима лише поки ядро закрите.
assert(lensCSS.includes('[data-home-lens][data-lens-ready]:not([data-lens-complete]):not([data-lens-open])>.home-lens-hint{visibility:visible}'),'the hint leaves once the core is usable');
// 4. Текст і кадри ядра обрізані до просвіту між половинами, поки ті не розійшлись; кнопка вибору не обрізана (вона має бути доступна одразу).
assert(/\[data-lens-ready\] \.home-lens-interior>:not\(\.home-lens-jump\)\{clip-path:inset\(-60px calc\(50% - var\(--lens-open\)\*var\(--lens-travel\)/.test(lensCSS),'core text is clipped to the opening');
assert(!/\.home-lens-jump\{[^}]*clip-path/.test(lensCSS),'the chooser button is never clipped');
// Кадр не менший за 44 px на кожній ширині.
for(const size of [...lensCSS.matchAll(/\.home-lens-cell\{[^}]*width:(\d+)px;height:(\d+)px/g)].flatMap(m=>[Number(m[1]),Number(m[2])]))assert(size>=44,`a frame is a 44 px touch target (${size})`);
console.log('Home lens layout: split lazy art and accessible interior, six canonical native links, accessible jump, compact retained routes/library and cache wiring passed.');
