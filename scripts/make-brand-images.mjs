// Брендові картинки в космічних кольорах: вкладка браузера (favicon.svg, favicon.ico), іконка для головного екрана телефона (apple-touch-icon.png)
// і запасна картка бренду (og-image.png, у <meta> сторінок стоять власні картки dist/og/*.jpg). До 2026-11-01 вони були темно-синьо-блакитні.
// Запуск локально (потрібен Playwright і Chromium; шрифт Inter береться з dist/fonts.css, а «Е» в іконці — із системного Inter, як і раніше):
//   PLAYWRIGHT_MODULE=<шлях до playwright-core> BROWSER_EXECUTABLE=<chromium> node scripts/make-brand-images.mjs
// Результат лежить у dist і комітиться як звичайні файли. Кольори ті самі, що в шапці сайту (--pine-* у dist/palette-cosmic.css).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const dist=path.resolve('dist');
const BG='#0b0a12',PANEL='#14111d',LINE='#9b72d6',ACCENT='#d1a5ff',TEXT='#f7f3ef',MUTED='#c3b9d1',GLOW='#2a1f45';

const favicon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Evidence UA">
  <rect width="64" height="64" rx="16" fill="${BG}"/>
  <rect x="3" y="3" width="58" height="58" rx="13" fill="none" stroke="${LINE}" stroke-width="3"/>
  <text x="32" y="45" text-anchor="middle" font-family="Inter,Arial,Helvetica,sans-serif" font-size="38" font-weight="800" fill="${ACCENT}">E</text>
</svg>
`;
fs.writeFileSync(path.join(dist,'favicon.svg'),favicon);

const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE});
const shot=async(html,size,file,opts={})=>{
  const tmp=path.join(dist,'.brand-tmp.html');fs.writeFileSync(tmp,html);
  const page=await browser.newPage({viewport:size});
  await page.goto(pathToFileURL(tmp).href);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
  const buffer=await page.screenshot({type:'png',omitBackground:!!opts.transparent});
  await page.close();if(file)fs.writeFileSync(path.join(dist,file),buffer);return buffer;
};
const iconPage=px=>`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:${BG}}img{display:block;width:${px}px;height:${px}px}</style></head><body><img src="./favicon.svg"></body></html>`;

// Іконка для головного екрана: те саме зображення, 180×180.
await shot(iconPage(180),{width:180,height:180},'apple-touch-icon.png');
// favicon.ico: 16, 32 і 48 px, кожен розмір як PNG усередині ICO.
const sizes=[16,32,48],pngs=[];
for(const px of sizes)pngs.push(await shot(iconPage(px),{width:px,height:px}));
const head=Buffer.alloc(6);head.writeUInt16LE(0,0);head.writeUInt16LE(1,2);head.writeUInt16LE(sizes.length,4);
let offset=6+16*sizes.length;const entries=[];
sizes.forEach((px,i)=>{const e=Buffer.alloc(16);e[0]=px;e[1]=px;e.writeUInt16LE(1,4);e.writeUInt16LE(32,6);e.writeUInt32LE(pngs[i].length,8);e.writeUInt32LE(offset,12);offset+=pngs[i].length;entries.push(e);});
fs.writeFileSync(path.join(dist,'favicon.ico'),Buffer.concat([head,...entries,...pngs]));

// Запасна картка бренду 1200×630: логотип, назва, девіз і заголовок (макет як раніше, кольори космічні).
await shot(`<!doctype html><html lang="uk"><head><meta charset="utf-8"><link rel="stylesheet" href="./fonts.css"><style>
html,body{margin:0}body{width:1200px;height:630px;overflow:hidden;position:relative;font-family:Inter,system-ui,sans-serif;background:radial-gradient(ellipse at 82% 0%,${GLOW},transparent 58%),${BG}}
.brand{position:absolute;left:80px;top:78px;display:flex;align-items:center;gap:26px}
.e{display:grid;place-items:center;width:104px;height:104px;box-sizing:border-box;border:4px solid ${LINE};border-radius:28px;background:${PANEL};color:${ACCENT};font:800 66px/1 Inter,sans-serif}
.name{font:700 44px/1.1 Inter,sans-serif;color:${TEXT}}.tag{margin-top:6px;font:400 26px/1.2 Inter,sans-serif;color:${MUTED}}
h1{position:absolute;left:80px;top:262px;margin:0;width:1040px;font:800 78px/1.12 Inter,sans-serif;letter-spacing:-.02em;color:${TEXT}}h1 span{color:${ACCENT}}
.foot{position:absolute;left:80px;bottom:62px;font:700 28px/1 Inter,sans-serif;letter-spacing:.12em;color:#b88af0}
</style></head><body><div class="brand"><span class="e">E</span><div><div class="name">Evidence UA</div><div class="tag">Наука для здорового життя</div></div></div>
<h1>Що відомо, наскільки це надійно <span>і чому</span></h1><div class="foot">НАУКА · ЗДОРОВ’Я · РУХ</div></body></html>`,{width:1200,height:630},'og-image.png');
fs.rmSync(path.join(dist,'.brand-tmp.html'),{force:true});
await browser.close();
console.log('Брендові картинки оновлено: favicon.svg, favicon.ico, apple-touch-icon.png, og-image.png');
