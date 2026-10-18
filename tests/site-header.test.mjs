import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

assert(fs.existsSync('src/platform/site-header.mjs'), 'one shared header must exist for every page');
const {headerHTML} = await import('../src/platform/site-header.mjs');
const html = headerHTML();
const result = JSON.parse(execFileSync('python', ['-c', `
from lxml import html
import json,sys
r=html.fromstring(sys.stdin.read())
print(json.dumps({'headers':len(r.xpath('self::header')), 'brands':len(r.xpath('.//a[contains(@class,"eua-header-brand")]')), 'navs':len(r.xpath('.//nav')), 'links':r.xpath('.//nav/a/@href'), 'brandText':' '.join(r.xpath('.//a[contains(@class,"eua-header-brand")]//text()')), 'nestedLinks':len(r.xpath('.//a//a')), 'menu':len(r.xpath('.//button[@aria-controls="eua-header-links"]'))}))
`], {input:html, encoding:'utf8'}));
assert.equal(result.headers,1);
assert.equal(result.brands,1);
assert.equal(result.navs,1);
assert.equal(result.menu,1);
assert.equal(result.nestedLinks,0);
for(const text of ['Evidence','UA','НАУКА','ЗДОРОВ’Я','РУХ'])assert(result.brandText.includes(text));
assert.deepEqual(result.links,['./index.html#start-here','./nutrition.html','./directions.html','./index.html#pubmed-live','./atlas.html','./exercises.html','./supplements.html']);
assert(!/https?:\/\//.test(html),'the shared header uses local destinations only');
console.log('shared header: one brand, one menu, local destinations and supplements entry verified');
