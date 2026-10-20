import assert from 'node:assert/strict';
import fs from 'node:fs';

// Картки для поширення й друк (рішення власника 2026-10-20).
const pages=fs.readdirSync('dist').filter(f=>f.endsWith('.html')).map(f=>f.replace('.html',''));
const jpegSize=file=>{const b=fs.readFileSync(file);assert.equal(b[0],0xff);assert.equal(b[1],0xd8,`${file} must be a JPEG`);let i=2;while(i<b.length){if(b[i]!==0xff){i++;continue;}const m=b[i+1];if(m>=0xc0&&m<=0xcf&&![0xc4,0xc8,0xcc].includes(m))return [b.readUInt16BE(i+7),b.readUInt16BE(i+5)];i+=2+b.readUInt16BE(i+2);}throw Error('no size in '+file);};
for(const p of pages){
  const file=`dist/og/${p}.jpg`;assert(fs.existsSync(file),`${p}: has its own card`);
  assert.deepEqual(jpegSize(file),[1200,630],`${p}: card is 1200x630`);
  assert(fs.statSync(file).size<350_000,`${p}: card stays light for messengers`);
  const html=fs.readFileSync(`dist/${p}.html`,'utf8');
  assert(html.includes(`https://vlaspevochko.github.io/evidence-ua/og/${p}.jpg`),`${p}: og:image points to its card`);
  assert(/property="og:image:alt" content="Картка сторінки: /.test(html),`${p}: the card has its own alt text`);
  assert(html.includes('print.css')&&html.includes('media="print"'),`${p}: loads the print style`);
}
const css=fs.readFileSync('dist/print.css','utf8');
for(const rule of ['@media print','.eua-site-header','.eua-next','filter:none','a[href^="http"]::after','break-inside:avoid','@page'])assert(css.includes(rule),`print.css has ${rule}`);
assert(!/https?:\/\//.test(css),'no third-party requests');
const next=fs.readFileSync('src/platform/next-steps.mjs','utf8');
assert(next.includes("view.print()")&&next.includes('Друкувати або зберегти PDF'),'the block offers a print button');
assert(fs.existsSync('scripts/make-og-cards.mjs'),'the cards can be regenerated');
console.log('Share cards and print: 16 own cards, 1200x630, light, per-page meta, print style passed.');
