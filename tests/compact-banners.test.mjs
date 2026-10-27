import assert from 'node:assert/strict';
import fs from 'node:fs';

// Компактні банери на інших сторінках (рішення власника 2026-10-25): та сама схема, що на «Харчуванні».
const css=fs.readFileSync('dist/page-pine.css','utf8');
const rule=css.slice(css.indexOf('@media(min-width:761px){\n body[data-pine]>.eua-platform-nav:has('));
assert(rule.length>200,'the compact banner block exists in page-pine.css');
assert(rule.includes('height:0')&&rule.includes('background:none!important')&&rule.includes('border:0!important'),'on wide screens the strip takes no space and has no seams');
assert(rule.includes('position:absolute;top:18px;right:max(16px,calc((100% - 1180px)/2))'),'the button sits in the banner, aligned with its content edge');
assert(rule.includes('.pb-inner{padding:34px 0 30px}'),'the banner is lower');
assert(rule.includes('.pb-split{padding-top:70px}'),'the picture in the sleep banner stays clear of the button');
assert(rule.includes(':only-child'),'only pages whose strip is a single menu are affected (muscle and cell keep their link strip)');
assert(!/@media\s*\(max-width:760px\)[^}]*:has\(>\.eua-module-menu/.test(css),'the phone layout keeps the strip');
for(const f of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const html=fs.readFileSync('dist/'+f,'utf8');
 if(html.includes('page-pine.css'))assert(html.includes('page-pine.css?v=18'),`${f} loads the bumped page-pine.css`);
}
console.log('Compact banners: strip moved into the banner on wide screens, phone layout kept, version bumped passed.');
