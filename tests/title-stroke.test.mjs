import assert from 'node:assert/strict';
import fs from 'node:fs';

// Без мазка-підкреслення під назвою сторінки (рішення власника 2026-11-01: «можна прибрати», бо на головній такого мазка немає,
// а з тонким шрифтом він виглядав важчим за текст). У космосі (за замовчуванням) мазка немає, у «Зеленому» він лишається. Справжній вигляд у браузері міряє headingsFlow.
const read=f=>fs.readFileSync(f,'utf8');
const extras=read('src/palette/cosmic-extras.css'),palette=read('dist/palette-cosmic.css'),pine=read('dist/page-pine.css');
const GREEN='html:not([data-palette="green"])';

// 1) Правила: ховають обидва місця й повертають частину висоти; діють лише в космосі.
const rules=[
  `${GREEN} .pb h1::after{content:none}`,
  `${GREEN} .pb h1,\n${GREEN} .sp-head h1{margin-bottom:8px}`,
  `${GREEN} .sp-brush{display:none}`
];
for(const rule of rules){assert(extras.includes(rule),`the cosmic extras hold: ${rule.split('\n')[0]}`);assert(palette.includes(rule),`the generated palette file holds: ${rule.split('\n')[0]} (run node scripts/build-site.mjs)`);}

// 2) Мазок малюють рівно два місця, і обидва лишились у базових файлах (їх показує «Зелений»). Третє місце з таким мазком тест помітить.
assert(/\.pb h1::after\{content:"";display:block;width:170px;height:14px;margin-top:12px/.test(pine),'the base page banner still draws the stroke (the green palette shows it)');
assert(/\.sp-brush\{display:block;width:170px;height:14px;margin-top:12px/.test(read('dist/supplements.css')),'the base supplements style still sizes the stroke icon');
assert(read('dist/supplements.html').includes('<svg class="sp-brush" viewBox="0 0 170 14"'),'the supplements markup is unchanged');
const holders=[];
for(const dir of ['dist','src'])for(const file of fs.readdirSync(dir,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&/\.(css|html|js|mjs|svg)$/.test(e.name)))
  {const path=`${file.parentPath||file.path}/${file.name}`;if(/palette-cosmic\.css$/.test(path))continue;if(read(path).includes('0 0 170 14'))holders.push(path.replace(/^\.\//,''));}
assert.deepEqual(holders.filter(f=>f.startsWith('dist/')).sort(),['dist/page-pine.css','dist/supplements.html'],'only the page banner and the supplements page draw the brush stroke: a new one must be added to the cosmic rule');

// 3) Версії, журнал, документи.
const inner=fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='index.html');
const versions=new Set(inner.map(f=>read('dist/'+f).match(/palette-cosmic\.css\?v=(\d+)/)?.[1]));
assert(versions.size===1&&Number([...versions][0])>=7,`all inner pages load one palette-cosmic.css version, v=7 or newer (${[...versions].join(', ')})`);
assert(!read('dist/index.html').includes('palette-cosmic.css'),'the home does not load the palette file (it never had the stroke)');
const changes=read('dist/changes-data.js');
assert(changes.includes("title:'Без мазка під назвою сторінки'")&&changes.indexOf("title:'Без мазка під назвою сторінки'")<changes.indexOf("title:'Шапка й меню як на головній'"),'the journal tells about it, newest first');
assert(Number(read('dist/changes.html').match(/changes-page\.js\?v=(\d+)/)?.[1])>=12&&/from '\.\/changes-data\.js\?v=(\d+)'/.test(read('dist/changes-page.js')),'the journal page and its data carry new versions');
const colors=read('docs/COLORS.md');
assert(colors.includes('Мазок-підкреслення під назвою сторінки')&&colors.includes('tests/title-stroke.test.mjs'),'docs/COLORS.md describes the removal and its check');
console.log('Title stroke: gone in cosmic (banner and supplements), kept in green, only two places draw it, versions, journal and docs passed.');
