import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// Regression found while adding Atlas search terms: old ?v=2 matched ?v=20,
// and subsequent historical migrations turned a current header URL into ?v=110.
// Exercise the real platform builder, including its full historical migration chain.
const file='dist/cache-version-regression-probe.html';
assert.ok(!fs.existsSync(file),'probe must not overwrite an authored page');
try{
 fs.writeFileSync(file,'<!doctype html><html><head></head><body><script type="module" src="./site-header.js?v=20"></script><script type="module" src="./home-spectrum.js?v=10"></script></body></html>');
 let first;
 for(let run=0;run<2;run++){
  execFileSync(process.execPath,['scripts/build-platform.mjs'],{stdio:'pipe'});
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('./site-header.js?v=20"'),'complete header cache version retained');
  assert.ok(html.includes('./home-spectrum.js?v=10"'),'complete home cache version retained');
  if(run)assert.equal(html,first,'second build is byte-idempotent');else first=html;
 }
}finally{fs.unlinkSync(file);}
console.log('Real platform build retains complete current cache versions across repeated builds.');
