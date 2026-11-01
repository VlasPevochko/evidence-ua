import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shapeOf,isElevation,isOverlayShadow,isExemptRadius,CONTROL_RADIUS,PANEL_RADIUS,KEEP_UP_TO,CARD_SHADOW_TOKEN,CARD_SHADOW_VALUE,EXEMPT_RADIUS} from '../scripts/shapes/shape-map.mjs';
import {tokenizeRadiusValue,tokenizeRadii,tokenizeShadows,tokenizeShapes,maskCss,run as shapesRun} from '../scripts/shapes/tokenize.mjs';
import {paletteCss,shapeKeys} from '../scripts/build-palette.mjs';
import {CSS_TARGETS,HTML_TARGETS,OUTPUT,isHomeOnlyCss} from '../scripts/palette/targets.mjs';

// Форми карток і кнопок (рішення власника 2026-10-31: «вирівняй картки й кнопки під головну»).
// Космічний стиль (за замовчуванням) бере форми головної: картки, кнопки, чипи й поля мають радіус 3px, великі панелі 5px, кола лишаються колами,
// підняті тіні карток зникають. Зелений варіант токенів не задає й показує оригінал (колишні форми).
const read=f=>fs.readFileSync(f,'utf8');

// 1) Таблиця відповідності: уже «як на головній» не чіпаємо, решту зводимо до двох радіусів головної.
for(const px of [0,1,2,3,4,5])assert.equal(shapeOf(px),null,`${px}px is already home-like`);
for(const px of [6,8,9,10,12,14,16,17])assert.equal(shapeOf(px),CONTROL_RADIUS,`${px}px becomes a control/card radius`);
for(const px of [18,20,22,24,26,30,32])assert.equal(shapeOf(px),PANEL_RADIUS,`${px}px becomes a panel radius`);
for(const px of [99,100,999])assert.equal(shapeOf(px),CONTROL_RADIUS,`${px}px pills become rectangular chips like on the home`);
assert.equal(shapeOf(NaN),null);assert.equal(KEEP_UP_TO,5);

// 2) Значення звіряємо з самою головною: її радіуси — це тільки 0, 1–5px і кола.
{
  const home=read('dist/home-spectrum.css').replace(/\/\*[\s\S]*?\*\//g,'');
  const values=new Set([...home.matchAll(/border-radius:\s*([^;}]+)/g)].flatMap(m=>m[1].trim().split(/\s+/)));
  assert(values.has(CONTROL_RADIUS+'px'),`the home uses ${CONTROL_RADIUS}px for cards and buttons`);
  assert(values.has(PANEL_RADIUS+'px'),`the home uses ${PANEL_RADIUS}px for its larger panels`);
  const biggest=Math.max(...[...values].filter(v=>/^\d+px$/.test(v)).map(v=>parseInt(v)));
  assert(biggest<=PANEL_RADIUS,`no home radius is larger than the panel radius (${biggest}px)`);
}

// 3) Обгортання радіусів: оригінал лишається запасним значенням.
assert.equal(tokenizeRadiusValue('14px'),'var(--rd-14,14px)');
assert.equal(tokenizeRadiusValue('0 10px 10px 0'),'0 var(--rd-10,10px) var(--rd-10,10px) 0');
assert.equal(tokenizeRadiusValue('8px 8px 0 0'),'var(--rd-8,8px) var(--rd-8,8px) 0 0');
for(const keep of ['0','3px','5px','50%','999%','var(--x)','calc(1px + 2px)','50% 50% 22px 22px','38% 62% 60% 40%','12px / 6px'])assert.equal(tokenizeRadiusValue(keep),null,`${keep} stays as written`);
assert.equal(tokenizeRadii('.a{border-radius:14px}','x.css'),'.a{border-radius:var(--rd-14,14px)}');
assert.equal(tokenizeRadii('.a{border-radius:14px!important}','x.css'),'.a{border-radius:var(--rd-14,14px)!important}');
assert.equal(tokenizeRadii('.a{border-radius:var(--rd-14,14px)}','x.css'),'.a{border-radius:var(--rd-14,14px)}','tokenizing twice changes nothing');
assert.equal(tokenizeRadii('.a{border-radius:50%;border-radius:999px}','x.css'),'.a{border-radius:50%;border-radius:var(--rd-999,999px)}','circles stay, pills change');
assert.equal(tokenizeRadii('@media(max-width:600px){.a{border-radius:18px}}','x.css'),'@media(max-width:600px){.a{border-radius:var(--rd-18,18px)}}','rules inside @media are covered');
{ // коментарі, рядки й url() не чіпаємо
  const css='/* .a{border-radius:14px} */.b{content:"border-radius:14px";background:url("data:image/svg+xml,%3Csvg style=\'border-radius:14px\'%3E")}';
  assert.equal(tokenizeRadii(css,'x.css'),css);
  assert.equal(maskCss(css).length,css.length,'the mask keeps positions');
}
// Винятки: смуги даних і малюнки, а не картки чи кнопки.
assert.equal(tokenizeRadii('.fb-bar{border-radius:100px}','fat-burning.css'),'.fb-bar{border-radius:100px}','the energy bar keeps its pill shape');
assert.equal(tokenizeRadii('.fb-bar span{border-radius:100px}','fat-burning.css'),'.fb-bar span{border-radius:100px}');
assert.equal(tokenizeRadii('.fb-bar{border-radius:100px}','other.css'),'.fb-bar{border-radius:var(--rd-100,100px)}','the exemption belongs to its own stylesheet');
assert(isExemptRadius('dist/muscle-lab.css','.mg-fiber-scale')&&!isExemptRadius('dist/muscle-lab.css','.card'));
assert(EXEMPT_RADIUS.every(([f,re,why])=>f.endsWith('.css')&&re instanceof RegExp&&why.length>5),'every exemption has a reason');

// 4) Тіні: прибираємо лише підняті тіні карток; кільця, світіння, вкладені тіні й накладки лишаються.
for(const yes of ['0 12px 32px #0002','0 24px 70px #0007','0 8px 24px #0005','0 18px 50px var(--c-aaaaaa,#0004)','0 12px 35px var(--c-39706210,#39706210)'])assert(isElevation(yes),`${yes} is a card elevation`);
for(const no of ['0 0 0 3px #fff','0 0 20px #d1a5ff','inset 0 0 18px #000','0 2px 8px #0003','0 12px 32px #0002, 0 0 0 1px red','none',''])assert(!isElevation(no),`${no||'(empty)'} is not a card elevation`);
for(const overlay of ['.eua-search','.eua-module-menu-content','.eua-nutrition-menu-content','.term-dialog','.eua-term-pop','.eua-appearance-panel','.primary-link'])assert(isOverlayShadow(overlay),`${overlay} is an overlay or an accent glow`);
assert.equal(tokenizeShadows('.card{box-shadow:0 12px 32px #0002}','x.css'),`.card{box-shadow:var(${CARD_SHADOW_TOKEN},0 12px 32px #0002)}`);
assert.equal(tokenizeShadows('.card{box-shadow:0 12px 32px #0002!important}','x.css'),`.card{box-shadow:var(${CARD_SHADOW_TOKEN},0 12px 32px #0002)!important}`);
assert.equal(tokenizeShadows('.eua-search{box-shadow:0 24px 60px #0009}','x.css'),'.eua-search{box-shadow:0 24px 60px #0009}','overlays keep their elevation');
assert.equal(tokenizeShadows('.ring{box-shadow:0 0 0 3px #fff}','x.css'),'.ring{box-shadow:0 0 0 3px #fff}');
assert.equal(tokenizeShadows(tokenizeShadows('.card{box-shadow:0 12px 32px #0002}','x.css'),'x.css'),`.card{box-shadow:var(${CARD_SHADOW_TOKEN},0 12px 32px #0002)}`,'tokenizing twice changes nothing');
assert.equal(CARD_SHADOW_VALUE,'none');
assert.equal(tokenizeShapes('.a{border-radius:12px;box-shadow:0 12px 32px #0002}','x.css'),`.a{border-radius:var(--rd-12,12px);box-shadow:var(${CARD_SHADOW_TOKEN},0 12px 32px #0002)}`);

// 5) Стилі сторінок: «голих» радіусів і підняних тіней карток більше немає (нове: node scripts/shapes/tokenize.mjs).
assert.deepEqual(shapesRun(process.cwd(),{check:true}),[],'a rounded corner or a card shadow was added without a token: run node scripts/shapes/tokenize.mjs');
let radiusTokens=0,shadowTokens=0;
for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
  const text=read(f);
  for(const m of text.matchAll(/var\(--rd-(\d+),(\d+)px\)/g)){radiusTokens++;assert.equal(m[1],m[2],`${f}: the fallback of --rd-${m[1]} is the original ${m[1]}px, so the green look is unchanged`);assert.notEqual(shapeOf(+m[1]),null,`${f}: --rd-${m[1]} has a value in the cosmic style`);}
  for(const m of text.matchAll(/var\(--sd-card,((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)/g)){shadowTokens++;assert(isElevation(m[1]),`${f}: only elevation shadows are wrapped (${m[1]})`);}
  // Радіус більший за 5px без токена бувають лише у винятків (смуги, малюнки) і в кіл.
  const masked=maskCss(text);
  for(const m of masked.matchAll(/(?<![-\w])border-radius\s*:\s*([^;}]*)/g)){
    const v=m[1];if(v.includes('var('))continue;
    const big=(v.match(/\d+px/g)||[]).map(x=>parseInt(x)).filter(n=>n>KEEP_UP_TO);
    if(!big.length)continue;
    const open=masked.lastIndexOf('{',m.index);let start=open;while(start>0&&!'};{'.includes(masked[start-1]))start--;
    const selector=masked.slice(start,open).trim();
    assert(isExemptRadius(f,selector)||/%/.test(v),`${f}: ${selector} keeps a ${v.trim()} radius without being an exemption or an art shape`);
  }
}
assert(radiusTokens>300,`the page stylesheets use radius tokens (${radiusTokens})`);
assert(shadowTokens>=10,`card shadows are wrapped (${shadowTokens})`);
// Накладки (меню, діалоги, підказки, пошук) зберігають підняту тінь: вона лишається записаною як є, без токена.
for(const [f,shadow] of [['dist/site-header.css','box-shadow:0 24px 60px'],['dist/learning-notes.css','box-shadow:0 28px 100px'],['dist/terms.css','box-shadow:0 14px 36px'],['dist/appearance.css','box-shadow:0 14px 40px'],['dist/platform.css','box-shadow:0 24px 90px'],['dist/page-pine.css','box-shadow:0 18px 40px'],['dist/nutrition-navigation.css','box-shadow:0 18px 60px']])
  assert(read(f).includes(shadow),`${f}: the overlay keeps its elevation (${shadow})`);

// 6) Згенерований файл: значення токенів є, головні форми збігаються з таблицею, зелений нічого не отримує.
{
  const out=read(OUTPUT),keys=shapeKeys(process.cwd());
  assert(keys.length>=15,'several radius tokens are in use');
  for(const k of keys)assert(out.includes(`--rd-${k}:${shapeOf(k)}px`),`--rd-${k} → ${shapeOf(k)}px in the cosmic file`);
  assert(out.includes(`${CARD_SHADOW_TOKEN}:${CARD_SHADOW_VALUE}`),'card shadows are removed in the cosmic style');
  assert.equal(out,paletteCss(process.cwd()).css,'dist/palette-cosmic.css is fresh');
  const block=/html:not\(\[data-palette="green"\]\)\{([^}]*)\}/.exec(out)[1];
  for(const k of keys)assert(block.includes(`--rd-${k}:`),`--rd-${k} is defined only inside the block that excludes the green palette`);
  assert(!/^:root\{|\n:root\{|\nhtml\{|\nbody\{/.test(out),'nothing in the cosmic file applies to the green palette');
}

// 7) Головна не змінюється: власні стилі без токенів форм; її спільні стилі лишають оригінальні радіуси.
assert(!/var\(--(?:rd|sd)-/.test(read('dist/index.html')),'no shape tokens inline on the home page');
for(const f of fs.readdirSync('dist').filter(f=>isHomeOnlyCss('dist/'+f)))assert(!/var\(--(?:rd|sd)-/.test(read('dist/'+f)),`${f}: home-only stylesheets are not tokenized`);
assert(!read('dist/index.html').includes('palette-cosmic.css'),'the home page does not load the cosmic file, so shared stylesheets keep their original shapes there');
console.log(`Shapes: ${radiusTokens} radius tokens, ${shadowTokens} card shadows, overlays keep elevation, green unchanged by construction, home isolated.`);
