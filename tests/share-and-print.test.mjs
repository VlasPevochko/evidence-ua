import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readBase} from '../scripts/site-url.mjs';

// Картки для поширення й друк (рішення власника 2026-10-20).
const pages=fs.readdirSync('dist').filter(f=>f.endsWith('.html')).map(f=>f.replace('.html',''));
const jpegSize=file=>{const b=fs.readFileSync(file);assert.equal(b[0],0xff);assert.equal(b[1],0xd8,`${file} must be a JPEG`);let i=2;while(i<b.length){if(b[i]!==0xff){i++;continue;}const m=b[i+1];if(m>=0xc0&&m<=0xcf&&![0xc4,0xc8,0xcc].includes(m))return [b.readUInt16BE(i+7),b.readUInt16BE(i+5)];i+=2+b.readUInt16BE(i+2);}throw Error('no size in '+file);};
for(const p of pages){
  const file=`dist/og/${p}.jpg`;assert(fs.existsSync(file),`${p}: has its own card`);
  assert.deepEqual(jpegSize(file),[1200,630],`${p}: card is 1200x630`);
  assert(fs.statSync(file).size<350_000,`${p}: card stays light for messengers`);
  const html=fs.readFileSync(`dist/${p}.html`,'utf8');
  assert(html.includes(`${readBase()}og/${p}.jpg`),`${p}: og:image points to its card`);
  assert(/property="og:image:alt" content="Картка сторінки: /.test(html),`${p}: the card has its own alt text`);
  assert(html.includes('print.css')&&html.includes('media="print"'),`${p}: loads the print style`);
}
const css=fs.readFileSync('dist/print.css','utf8');
for(const rule of ['@media print','.eua-site-header','.eua-next','filter:none','a[href^="http"]::after','break-inside:avoid','@page'])assert(css.includes(rule),`print.css has ${rule}`);
assert(!/https?:\/\//.test(css),'no third-party requests');
const next=fs.readFileSync('src/platform/next-steps.mjs','utf8');
assert(next.includes("view.print()")&&next.includes('Друкувати або зберегти PDF'),'the block offers a print button');
assert(fs.existsSync('scripts/make-og-cards.mjs'),'the cards can be regenerated');
// Картки в космічних кольорах (рішення власника 2026-10-31). До цього вони були сосново-зелені, бо кольори стояли в генераторі окремими значеннями.
// Тепер генератор бере ті самі токени --pine-* і файл палітри, що сторінки, а Python-скрипт двох карток «Харчування» має ті самі п'ять значень.
// Колір готових JPEG міряє Browser QA (shareCardsFlow): Node не розбирає JPEG без додаткових бібліотек.
const og=fs.readFileSync('scripts/make-og-cards.mjs','utf8'),nutritionCards=fs.readFileSync('scripts/make-nutrition-share-cards.py','utf8');
assert(og.includes('./fonts.css')&&og.includes('./page-pine.css')&&og.includes('./palette-cosmic.css'),'the card template loads the site fonts, the pine tokens and the cosmic palette');
assert(['--pine-text','--pine-muted','--pine-accent'].every(token=>og.includes(`var(${token})`)),'the card colours come from the --pine-* tokens');
assert(!/#(?:9db1a7|e9efe9|e3bd6b|0d1916|8fae9f)/i.test(og),'the card template keeps no old green hex values');
assert(og.includes("new Set(['nutrition','nutrition-inside'])")&&/card\('nutrition',/.test(nutritionCards)&&/card\('nutrition-inside',/.test(nutritionCards),'the two Nutrition cards belong to their own script and the generator leaves them alone');
const pine=fs.readFileSync('dist/page-pine.css','utf8'),cosmic=fs.readFileSync('dist/palette-cosmic.css','utf8');
const cosmicToken=name=>{
  const key=pine.match(new RegExp(`--pine-${name}:var\\(--c-([0-9a-f]+),`))?.[1];assert(key,`--pine-${name} is a palette token`);
  const hex=cosmic.match(new RegExp(`--c-${key}:(#[0-9a-f]{6})`))?.[1];assert(hex,`--c-${key} has a cosmic value`);return hex;
};
for(const [constant,name] of [['BG','bg'],['LINE','line'],['TEXT','text'],['MUTED','muted'],['ACCENT','accent']])assert(nutritionCards.includes(`${constant} = '${cosmicToken(name)}'`),`make-nutrition-share-cards.py ${constant} equals the cosmic --pine-${name} (${cosmicToken(name)})`);
assert(!/#(?:0c2119|294235|afc1b5|eef0e8|d9b977|b9c8bc|355140|e3c47d)/i.test(nutritionCards),'the Nutrition cards keep no old green hex values');
console.log('Share cards and print: 21 own cards, 1200x630, light, per-page meta, cosmic palette tokens, print style passed.');
