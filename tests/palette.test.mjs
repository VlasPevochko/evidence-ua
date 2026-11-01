import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {parseColor,toHex,tokenKey,mapCss} from '../scripts/palette/css-colors.mjs';
import {cosmicOf,rgbToHsl,ANCHORS} from '../scripts/palette/cosmic-map.mjs';
import {tokenizeCss,tokenizeHtml,run as tokenizeRun} from '../scripts/palette/tokenize.mjs';
import {paletteCss,tokenKeys} from '../scripts/build-palette.mjs';
import {CSS_TARGETS,HTML_TARGETS,EXTRAS,OUTPUT,EXCLUDED_CSS,isHomeOnlyCss} from '../scripts/palette/targets.mjs';

// Палітри сайту (рішення власника 2026-10-31): усі сторінки, крім головної, за замовчуванням у космічних кольорах головної,
// а колишній зелений (сосновий) вигляд лишається варіантом у меню «Аа». Механізм: кольори у стилях сторінок записані як
// var(--c-КЛЮЧ, оригінал). Зелений варіант не задає токенів, тож показує оригінал; космічний задає їх у dist/palette-cosmic.css.
const read=f=>fs.readFileSync(f,'utf8');
const rgba=lit=>{const {r,g,b,a}=parseColor(lit);return {r,g,b,a};}; // parseColor also reports hexAlpha; only the channels matter here

// 1) Сканер кольорів у CSS: лише значення властивостей, без селекторів, url(), рядків і коментарів.
assert.deepEqual(rgba('#E3BD6B'),{r:227,g:189,b:107,a:1});
assert.deepEqual(rgba('#fff'),{r:255,g:255,b:255,a:1});
assert.equal(Math.round(parseColor('#ffffff80').a*100),50);
assert.deepEqual(rgba('rgb(1 2 3 / 50%)'),{r:1,g:2,b:3,a:.5});
assert.deepEqual(rgba('rgba(1,2,3,.25)'),{r:1,g:2,b:3,a:.25});
assert.equal(parseColor('transparent'),null);
assert.equal(tokenKey(parseColor('#e3bd6b')),'e3bd6b');
assert.equal(tokenKey(parseColor('#E3BD6B80')),'e3bd6b80','alpha is part of the key');
{
  const seen=[];
  mapCss('#e3bd6b{color:#112233}a:hover{border-color:#abcdef}/* #010203 */.x{content:"#040506";background:url("data:image/svg+xml,%3Csvg fill=\'%23070809\'%3E%3C/svg%3E") #0a0b0c;color:var(--c-0d1916,#0d1916);outline:var(--other,#0f1011)}',lit=>{seen.push(lit);return null;});
  assert.deepEqual(seen.sort(),['#0a0b0c','#0f1011','#112233','#abcdef'].sort(),'selectors, comments, strings, url() and finished tokens are skipped; a plain var() fallback is scanned');
}

// 2) Відповідність кольорів. Головні ролі сосни точно переходять у значення головної сторінки.
const home=read('dist/home-spectrum.css');
const homeValue=name=>(new RegExp('--spectrum-'+name+':(#[0-9a-f]{6})').exec(home)||[])[1];
const asHex=key=>'#'+ANCHORS[key];
assert.equal(asHex('0d1916'),homeValue('bg'),'page background equals the home background');
assert.equal(asHex('e9efe9'),homeValue('text'),'main text equals the home text');
assert.equal(asHex('9db1a7'),homeValue('muted'),'muted text equals the home muted text');
assert.equal(asHex('e3bd6b'),homeValue('accent'),'accent equals the home accent');
const cosmic=hex=>{const c=cosmicOf(parseColor(hex));return c&&toHex(c);};
for(const [from,to] of Object.entries(ANCHORS))assert.equal(cosmic('#'+from),'#'+to,`anchor ${from}`);
for(const neutral of ['#000000','#ffffff','#888888','#101010','#f5f5f5'])assert.equal(cosmic(neutral),null,`neutral ${neutral} is not touched`);
for(const warn of ['#c8402f','#e07b39','#f0a050','#e88aa0','#ff7a7a'])assert.equal(cosmic(warn),null,`warning/red/orange/pink ${warn} keeps its meaning`);
for(const accent of ['#65ddf2','#62c0ae','#83e9b9','#8fdceb'])assert.equal(cosmic(accent),null,`bright teal/blue accent ${accent} stays as the second colour`);
for(const pine of ['#0f1c19','#152a25','#1c3a33','#26403a','#35544c','#6f9084','#8aa398','#b5cbc8','#d8e6e0']){
  const [h,s]=rgbToHsl(...Object.values(parseColor(cosmic(pine)||pine)).slice(0,3));
  assert(cosmic(pine),`pine ${pine} is mapped`);
  assert(h>=240&&h<=285&&s<=.5,`pine ${pine} becomes a purple-grey (hue ${h.toFixed(0)}, saturation ${s.toFixed(2)})`);
}
for(const gold of ['#e7bd46','#ffdc7e','#e3bd6b','#d4a94a']){
  const m=cosmic(gold);assert(m,`gold ${gold} is mapped`);
  const [h,,l]=rgbToHsl(...Object.values(parseColor(m)).slice(0,3));
  assert(h>=262&&h<=285&&l>=.55,`gold ${gold} becomes lavender (hue ${h.toFixed(0)}, lightness ${l.toFixed(2)})`);
}
{ // Порядок яскравості темних поверхонь зберігається (рамки світліші за панелі, панелі світліші за фон).
  const L=hex=>rgbToHsl(...Object.values(parseColor(cosmic(hex))).slice(0,3))[2];
  assert(L('#0d1916')<L('#142520')&&L('#142520')<L('#26403a'),'background < panel < line');
}

// 3) Контраст головних пар у космічній палітрі не нижчий за 4.5:1 (текст) і 3:1 (рамки на фоні) — так само, як у зеленій.
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);};
const ratio=(a,b)=>{const [x,y]=[lum(parseColor(a)),lum(parseColor(b))].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
const role=key=>'#'+ANCHORS[key];
for(const [name,fg,bg,min] of [
  ['text on page','e9efe9','0d1916',7],['muted on page','9db1a7','0d1916',4.5],['text on panel','e9efe9','142520',7],['muted on panel','9db1a7','142520',4.5],
  ['accent on page','e3bd6b','0d1916',4.5],['accent on panel','e3bd6b','142520',4.5],['ink on accent','1b1608','e3bd6b',4.5]
])assert(ratio(role(fg),role(bg))>=min,`${name}: ${ratio(role(fg),role(bg)).toFixed(2)} must be at least ${min}`);

// 4) Кольори в стилях ніколи не повертаються «голими»: нові зелені/золоті літерали мають іти через токен (node scripts/palette/tokenize.mjs).
assert.deepEqual(tokenizeRun(process.cwd(),{check:true}),[],'a pine green/gold colour was added without a palette token: run node scripts/palette/tokenize.mjs');
const untokenize=css=>css.replace(/var\(--c-[0-9a-f]{6}(?:[0-9a-f]{2})?,(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\)/g,'$1');
let tokenCount=0;
for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
  const text=read(f),plain=untokenize(text);
  assert(!/var\(--c-/.test(plain),`${f}: every token has a plain colour as its fallback`);
  assert.equal((f.endsWith('.html')?tokenizeHtml:tokenizeCss)(plain),text,`${f}: tokenizing the plain colours gives the file back (the tokens are canonical)`);
  for(const m of text.matchAll(/var\(--c-([0-9a-f]{6}(?:[0-9a-f]{2})?),(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\)/g)){
    tokenCount++;
    assert.equal(tokenKey(parseColor(m[2])),m[1],`${f}: the fallback ${m[2]} must be the colour the token is named after, so the green look is unchanged`);
  }
}
assert(tokenCount>1500,`the stylesheets use palette tokens (${tokenCount})`);
for(const f of CSS_TARGETS)assert(fs.existsSync(f),`${f} exists`);
assert.deepEqual(tokenizeCss(tokenizeCss('a{color:#e3bd6b;background:rgba(227,189,107,.5)}')),tokenizeCss('a{color:#e3bd6b;background:rgba(227,189,107,.5)}'),'tokenizing twice changes nothing');
assert.equal(tokenizeCss('a{color:#e3bd6b}'),'a{color:var(--c-e3bd6b,#e3bd6b)}');
assert.equal(tokenizeCss('a{color:#ffffff;border-color:#c8402f}'),'a{color:#ffffff;border-color:#c8402f}','neutrals and warnings stay raw');

// 4б) Жоден стиль не лишається поза увагою: кожен CSS у dist — ціль палітри, стиль головної або в списку винятків із причиною.
{
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):e.name.endsWith('.css')?[d+'/'+e.name]:[]);
  const targets=new Set(CSS_TARGETS.map(f=>f.replace(/^src\/platform\//,'dist/').replace(/^src\/evidence\//,'dist/evidence/')));
  for(const f of walk('dist')){
    if(isHomeOnlyCss(f)||EXCLUDED_CSS[f])continue;
    assert(targets.has(f),`${f}: add it to CSS_TARGETS (scripts/palette/targets.mjs) or to EXCLUDED_CSS with a reason`);
  }
  for(const [f,why] of Object.entries(EXCLUDED_CSS)){assert(fs.existsSync(f),`${f} exists (${why})`);assert.equal(typeof why,'string');}
  // Винятки, що спираються на твердження про використання, перевіряємо:
  const pages=fs.readdirSync('dist').filter(f=>f.endsWith('.html'));
  for(const page of pages)assert(!read('dist/'+page).includes('directions.css?')&&!/href="[^"]*[^-]directions\.css/.test(read('dist/'+page)),`${page}: dist/directions.css must stay unused`);
  assert(!fs.readdirSync('dist').filter(f=>f.endsWith('.js')&&f!=='navigation-v17.js').some(f=>read('dist/'+f).includes('navigation-v17.css')),'navigation-v17.css is loaded only by navigation-v17.js');
  assert.deepEqual(pages.filter(p=>read('dist/'+p).includes('navigation-v17.js')),['index.html'],'navigation-v17.js (and so its stylesheet) belongs to the home page only');
  assert(!/var\(--c-/.test(read('dist/print.css')),'print.css has no palette tokens');
  assert.equal(tokenizeCss(read('dist/print.css')),read('dist/print.css'),'print.css has no pine colours that would need tokens');
}

// 5) Згенерований dist/palette-cosmic.css свіжий, містить усі токени й нічого зайвого.
const {css:fresh,count,colours,shapes}=paletteCss(process.cwd());
assert.equal(read(OUTPUT),fresh,'dist/palette-cosmic.css is stale: run node scripts/build-site.mjs');
const keys=tokenKeys(process.cwd());
assert.equal(colours,keys.length,'every colour token has a cosmic value');
assert(count>=colours+shapes,'the cosmic block also carries the shape tokens (see shapes.test.mjs)');
const defined=new Set([...read(OUTPUT).matchAll(/--c-([0-9a-f]{6}(?:[0-9a-f]{2})?):#[0-9a-f]{6,8}/g)].map(m=>m[1]));
for(const k of keys)assert(defined.has(k),`token --c-${k} has a cosmic value`);
assert(read(OUTPUT).includes('html:not([data-palette="green"]){--c-'),'tokens apply unless the green palette is chosen');
for(const [key,value] of Object.entries(ANCHORS))assert(read(OUTPUT).includes(`--c-${key}:#${value}`),`the palette file maps ${key} → ${value}`);
assert(fs.existsSync(EXTRAS)&&read(OUTPUT).includes(read(EXTRAS).trim()),'hand-written extras are part of the generated file');
assert(!/https?:\/\//.test(read(OUTPUT)),'no third-party requests');
const build=read('scripts/build-site.mjs');
assert(build.includes("'palette-cosmic.css'")&&build.includes("'scripts/build-palette.mjs'"),'the palette file is a generated file with its own builder');

// 6) Доповнення діють лише в космічній палітрі, не чіпають зелену й тримають кольори даних у схемах.
const extras=read(EXTRAS).replace(/\/\*[\s\S]*?\*\//g,'');
for(const rule of extras.split('}').map(r=>r.trim()).filter(Boolean))assert(rule.startsWith('html:not([data-palette="green"])'),`extras never apply to the green palette: ${rule.slice(0,60)}`);
// Текст називає колір («золотий круг», «золота — ліва нога моделі»), тож ці кольори даних лишаються золотими й у космічній палітрі.
assert(read('dist/mechanisms.html').includes('аденозин (золотий круг)'));
assert(extras.includes('.mc-key-ad')&&extras.includes('--c-e3bd6b:#e3bd6b'),'adenosine stays gold');
for(const sel of ['.mc-key-ad','.mc-lamp','.mol.ad','.mc-bar','.cr-flow'])assert(read('dist/mechanisms-page.css').includes(sel),`${sel} still exists in the stylesheet the extras refer to`);
assert(read('dist/movement.html').includes('золота — ліва нога моделі')&&extras.includes('.model-legend i{--gold:#e3bd6b'),'the movement legend key stays gold');
assert(read('dist/movement.css').includes('.model-legend i'),'.model-legend i still exists in movement.css');
assert(extras.includes('.atlas-topic-icon')&&read('dist/atlas.css').includes('.atlas-topic-icon'),'atlas numbers are recoloured from bronze to violet');

// 7) Головна не змінюється: власні стилі, без файлу палітри й без токенів.
const homeHtml=read('dist/index.html');
assert(!homeHtml.includes('palette-cosmic.css'),'the home page does not load the palette file');
assert(!/var\(--c-/.test(homeHtml),'no palette tokens inline on the home page');
const homeOnly=fs.readdirSync('dist').filter(f=>/^home-.*\.css$/.test(f)||f==='desktop.css'||f==='evidence-trainer.css');
assert(homeOnly.length>=15,'the home-only stylesheets are found');
for(const f of homeOnly){
  assert(!/var\(--c-/.test(read(path.join('dist',f))),`${f}: home-only stylesheets are not tokenized`);
  assert(!CSS_TARGETS.includes('dist/'+f),`${f} is not a palette target`);
}
console.log(`Palette: ${keys.length} tokens, ${tokenCount} uses, green identical by construction, home isolated.`);
