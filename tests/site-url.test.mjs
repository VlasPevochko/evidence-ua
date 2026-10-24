import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readBase,checkBase,pageFiles} from '../scripts/site-url.mjs';
import {buildSeo} from '../scripts/build-seo.mjs';
import {setSiteUrl} from '../scripts/set-site-url.mjs';

// Адреса сайту в одному місці (рішення власника 2026-10-24: готуємо перехід на власний домен).
const base=readBase();
assert(/^https:\/\/[^/]+\/.*\/$|^https:\/\/[^/]+\/$/.test(base),'site.json holds an https address ending with /');
// Every page's canonical, og:url and og:image start with that address, so nothing points to a stale host.
for(const file of pageFiles()){
  const html=fs.readFileSync('dist/'+file,'utf8');
  const canon=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert(canon&&canon.startsWith(base),`${file}: canonical uses the site address`);
  for(const m of html.matchAll(/<meta property="og:(?:url|image)" content="([^"]+)"/g))assert(m[1].startsWith(base),`${file}: ${m[1]} uses the site address`);
}
// The address is validated.
for(const bad of ['http://example.com/','https://example.com','https://example.com/?a=1','https://user:pw@example.com/','not a url'])assert.throws(()=>checkBase(bad),`${bad} is rejected`);
assert.equal(checkBase('https://evidenceua.com/'),'https://evidenceua.com/');
// Sitemap and robots.txt list every page once and point at the site address.
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8'),robots=fs.readFileSync('dist/robots.txt','utf8');
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(locs).size,locs.length,'no duplicate addresses');
assert.equal(locs.length,pageFiles().length,'every page is listed');
assert(locs.includes(base),'the home page is listed as the site root');
for(const file of pageFiles().filter(f=>f!=='index.html'))assert(locs.includes(base+file),`${file} is listed`);
assert(robots.includes(`Sitemap: ${base}sitemap.xml`)&&robots.includes('Allow: /')&&!/Disallow: \//.test(robots),'robots.txt allows crawling and names the sitemap');
// Moving to a new domain: all pages, docs, site.json and the sitemap change together, and a second run changes nothing.
const root=fs.mkdtempSync(path.join(os.tmpdir(),'eua-url-'));
try{
  fs.mkdirSync(path.join(root,'dist/og'),{recursive:true});fs.mkdirSync(path.join(root,'docs'));
  for(const f of ['index.html','nutrition.html','videos.html'])fs.copyFileSync('dist/'+f,path.join(root,'dist',f));
  fs.writeFileSync(path.join(root,'site.json'),JSON.stringify({base})+'\n');
  fs.writeFileSync(path.join(root,'README.md'),`Live: <${base}>\n`);fs.writeFileSync(path.join(root,'docs/DEPLOYMENT.md'),`Site: ${base}\n`);
  const next='https://evidenceua.com/';
  const r=setSiteUrl(root,next);
  assert.equal(r.next,next);assert(r.changed>=4,'pages and docs were rewritten');
  for(const f of ['index.html','nutrition.html','videos.html']){const h=fs.readFileSync(path.join(root,'dist',f),'utf8');assert(!h.includes(base),`${f}: no old address left`);assert(h.includes(next),`${f}: new address present`);}
  assert.equal(readBase(root),next);
  assert(fs.readFileSync(path.join(root,'dist/sitemap.xml'),'utf8').includes('<loc>https://evidenceua.com/nutrition.html</loc>'));
  assert(fs.readFileSync(path.join(root,'dist/robots.txt'),'utf8').includes('Sitemap: https://evidenceua.com/sitemap.xml'));
  assert.equal(setSiteUrl(root,next).changed,0,'a second run changes nothing');
  assert.throws(()=>setSiteUrl(root,'http://evidenceua.com/'),'an insecure address is refused');
  assert.equal(readBase(root),next,'a refused change leaves site.json intact');
}finally{fs.rmSync(root,{recursive:true,force:true});}
console.log('Site address: one source of truth, valid canonical/og addresses, sitemap and robots, safe domain switch passed.');
