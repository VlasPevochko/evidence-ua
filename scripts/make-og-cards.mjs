// Картки для поширення: окреме превʼю 1200×630 для кожної сторінки (заголовок, власний мотив, сосновий фон).
// Запуск локально (потрібен Playwright і Chromium): node scripts/make-og-cards.mjs
// Результат лежить у dist/og/*.jpg і комітиться як звичайні зображення; збірка лише підставляє їх у <meta> (build-platform.mjs).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const dist=path.resolve('dist'),out=path.join(dist,'og');fs.mkdirSync(out,{recursive:true});
const motifFor={'index':'shippo','directions':'kumiko','fat-burning':'uroko','nutrition':'nami','nutrition-digestion':'enso','atlas':'asanoha','exercises':'yagasuri','muscle-lab':'take','cell-lab':'kikko','movement':'seigaiha','sleep':'kasumi','supplements':'shippo','protein-meta':'shippo','glossary':'ichimatsu','compare':'kagome','map':'tatewaku','changes':'hishi'};
const eyebrow={'index':'Наука · Здоров’я · Рух','directions':'Каталог','fat-burning':'Харчування','nutrition':'Харчування','nutrition-digestion':'Харчування','atlas':'Атлас','exercises':'Практика','muscle-lab':'Muscle Lab','cell-lab':'Cell Lab','movement':'Movement Lab','sleep':'Відновлення','supplements':'Докази','protein-meta':'Докази','glossary':'Довідка','compare':'Докази','map':'Навігація','changes':'Журнал'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const text=(html,re)=>{const m=html.match(re);return m?m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim():'';};
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const pages=fs.readdirSync(dist).filter(f=>f.endsWith('.html')).map(f=>f.replace('.html',''));
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1200,height:630}});
for(const name of pages){
  const html=fs.readFileSync(path.join(dist,name+'.html'),'utf8');
  let title=decode(text(html,/<title>([^<]+)<\/title>/)).replace(/\s*[—–-]\s*Evidence UA\s*$/,'').replace(/^Evidence UA\s*[—–-]\s*/,'');
  if(name==='index')title='Що, якщо ми помилялись?';
  title=title.split(/(?<=[?!])\s/)[0];
  const desc=decode((html.match(/<meta name="description" content="([^"]*)"/)||[])[1]||'').split(/(?<=[.!?])\s/)[0].slice(0,150);
  const motif=motifFor[name]||'shippo';
  const tmp=path.join(dist,'.og-tmp.html');
  fs.writeFileSync(tmp,`<!doctype html><html lang="uk"><head><meta charset="utf-8"><link rel="stylesheet" href="./page-pine.css"><style>
html,body{margin:0}body{width:1200px;height:630px;overflow:hidden;font-family:Inter,system-ui,sans-serif}
.card{position:relative;box-sizing:border-box;width:1200px;height:630px;padding:64px 80px;display:flex;flex-direction:column;justify-content:space-between;--pb-opacity:.55}
.card::before{inset:0}
.eb{font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:#9db1a7;font-weight:600}
h1{margin:14px 0 0;max-width:900px;font:700 ${title.length>34?66:80}px/1.06 "Source Serif 4",Georgia,serif;color:#e9efe9;letter-spacing:-.015em}
h1::after{content:"";display:block;width:230px;height:18px;margin-top:20px;background:#e3bd6b;border-radius:10px 40px 10px 40px}
.lead{margin:22px 0 0;max-width:860px;font-size:30px;line-height:1.4;color:#9db1a7}
.foot{display:flex;align-items:center;gap:18px;font-size:26px;color:#e9efe9;font-weight:600}
.e{display:grid;place-items:center;width:54px;height:54px;border:1.5px solid #e3bd6b66;border-radius:16px;color:#e3bd6b;font:800 32px/1 Inter,sans-serif}
.foot b{color:#e3bd6b}.foot small{margin-left:auto;font-size:22px;color:#9db1a7;font-weight:500}
</style></head><body data-pine><section class="pb card" style="padding:64px 80px" data-motif="${motif}"><div><div class="eb">${esc(eyebrow[name]||'Evidence UA')}</div><h1>${esc(title)}</h1>${desc?`<p class="lead">${esc(desc)}</p>`:''}</div><div class="foot"><span class="e">E</span><span>Evidence <b>UA</b></span><small>Наука · Здоров’я · Рух</small></div></section></body></html>`);
  await page.goto(pathToFileURL(tmp).href);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
  await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86});
  console.log(name,fs.statSync(path.join(out,name+'.jpg')).size);
}
fs.rmSync(path.join(dist,'.og-tmp.html'),{force:true});
await browser.close();
