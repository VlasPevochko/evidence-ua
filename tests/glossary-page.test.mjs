import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TERMS} from '../src/platform/terms.mjs';
import {glossary} from '../src/platform/glossary-data.mjs';
import {findMaterials} from '../src/platform/materials.mjs';

// Сторінка «Словник» (рішення власника 2026-10-20): усі терміни підказок, руху й сну в одному місці, кожен із джерелом.
const html=fs.readFileSync('dist/glossary.html','utf8'),js=fs.readFileSync('dist/glossary-page.js','utf8'),css=fs.readFileSync('dist/glossary-page.css','utf8'),pine=fs.readFileSync('dist/page-pine.css','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('data-pine')&&html.includes('data-motif="ichimatsu"')&&pine.includes('.pb[data-motif="ichimatsu"]'),'pine band with its own motif');
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='glossary.html'))assert(!fs.readFileSync('dist/'+f,'utf8').includes('data-motif="ichimatsu"'),`${f} must not reuse ichimatsu`);
assert(html.includes('type="search"')&&html.includes('role="status"')||html.includes('aria-live="polite"'),'search and a live count');
assert(js.includes('platform-terms.js')&&js.includes('platform-glossary-data.js'),'entries come from the same data as the hints');
// The dictionary covers every hint term and every movement/sleep term, each with a source.
const all=[...TERMS,...glossary.movement,...glossary.sleep];
for(const t of all){assert(t.id&&t.title&&t.definition&&t.source?.href?.startsWith('https://'),`${t.id}: complete entry with a source`);}
assert.equal(new Set(all.map(t=>t.id)).size,all.length,'term ids are unique so #term-ID anchors work');
assert(findMaterials('словник').some(m=>m.href==='./glossary.html'),'the dictionary is searchable');
assert(fs.readFileSync('src/platform/terms.mjs','utf8').includes("'./glossary.html#term-'"),'hints link to the dictionary entry');
assert(!/https?:\/\//.test(css+js),'no third-party requests');
console.log('Glossary page: all hint, movement and sleep terms with sources, unique anchors, own motif passed.');
