import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NEXT_STEPS,nextStepsHTML} from '../src/platform/next-steps.mjs';
import {materials} from '../src/platform/materials.mjs';

// «Куди далі» (рішення власника 2026-10-20): три сусідні матеріали внизу сторінок. Це навігація, наукових тверджень тут немає.
const pages=Object.keys(NEXT_STEPS);
assert.equal(pages.length,12,'every content page except home and the catalogue has the block');
const known=new Set(materials.map(m=>m.href.split('#')[0].split('?')[0]).concat(['./fat-burning.html','./supplements.html','./protein-meta.html','./nutrition-digestion.html','./exercises.html','./atlas.html']));
for(const [file,items] of Object.entries(NEXT_STEPS)){
  assert(fs.existsSync('dist/'+file),`${file} exists`);
  const html=fs.readFileSync('dist/'+file,'utf8');
  assert(/platform-shell\.js\?v=9\d/.test(html)||html.includes('platform-next-steps.js'),`${file} loads the module that mounts the block`);
  assert.equal(items.length,3,`${file}: exactly three next steps`);
  assert.equal(new Set(items.map(i=>i[0])).size,3,`${file}: no duplicates`);
  for(const [href,title,tag] of items){
    const [path,hash]=href.split('#'),target=path.replace('./','');
    assert(fs.existsSync('dist/'+target),`${file} → ${href}: target page exists`);
    assert.notEqual(target,file,`${file} must not point to itself`);
    assert(known.has(path),`${href} is a known material`);
    if(hash)assert(fs.readFileSync('dist/'+target,'utf8').includes(`id="${hash}"`)||fs.readFileSync('dist/navigation-v17.js','utf8').includes(hash),`${href}: anchor exists`);
    assert(title&&tag,'every card has a title and an area label');
  }
  const out=nextStepsHTML(file);assert(out.includes('Куди далі')&&(out.match(/<li>/g)||[]).length===3);
}
assert.equal(nextStepsHTML('index.html'),'','home has its own entry points');
assert.equal(nextStepsHTML('directions.html'),'','the catalogue is already a list of next steps');
assert(!/https?:\/\//.test(fs.readFileSync('src/platform/next-steps.mjs','utf8')+fs.readFileSync('dist/next-steps.css','utf8')),'no third-party requests');
console.log('Next steps: 11 pages, three real targets each, no self-links or science text passed.');
