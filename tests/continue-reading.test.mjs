import assert from 'node:assert/strict';
import fs from 'node:fs';
import {continueEntry,continueFromStorage,CONTINUE_KEY} from '../src/platform/shell.mjs';

// «Продовжити з місця»: останній матеріал живе лише в localStorage відвідувача, на головній показується одна картка.
const now=Date.UTC(2026,9,19);
assert.equal(continueEntry('/x/nutrition.html','','Харчування · Від їжі до клітини — Evidence UA',now).title,'Харчування · Від їжі до клітини','the site suffix is dropped');
assert.deepEqual(continueEntry('/evidence-ua/nutrition.html','','Evidence UA — Харчування',now),{href:'nutrition.html',title:'Харчування',at:now});
assert.equal(continueEntry('/evidence-ua/cell-lab.html','?path=structure&lesson=1','Evidence UA — Cell Lab',now).href,'cell-lab.html?path=structure&lesson=1');
for(const skipped of ['index.html','directions.html','supplements.html'])assert.equal(continueEntry('/x/'+skipped,'','Evidence UA — Щось',now),null,`${skipped} is not a «continue» target`);
assert.equal(continueEntry('/x/page.html','?a=<script>','Evidence UA — Щось',now),null,'unsafe query is refused');
assert.equal(continueEntry('/x/page.html','','Evidence UA — ',now),null,'a page without a title is not remembered');
// Reading back never trusts storage: wrong shape, foreign paths and old records are ignored.
const ok=JSON.stringify({href:'nutrition.html',title:'Харчування',at:now-1000});
assert.deepEqual(continueFromStorage(ok,now),{href:'nutrition.html',title:'Харчування'});
for(const bad of [null,'{',JSON.stringify({href:'javascript:alert(1)',title:'x',at:now}),JSON.stringify({href:'//evil.example/a.html',title:'x',at:now}),JSON.stringify({href:'index.html',title:'x',at:now}),JSON.stringify({href:'a.html',title:'x',at:now-91*864e5})])assert.equal(continueFromStorage(bad,now),null);
assert.equal(CONTINUE_KEY,'eua-continue-v1');
const source=fs.readFileSync('src/platform/shell.mjs','utf8');
assert(!/https?:\/\//.test(source.slice(source.indexOf('CONTINUE_KEY'),source.indexOf('export function navigationHTML'))),'no third-party requests in the continue code');
assert(fs.readFileSync('dist/index.html','utf8').includes('home-continue.css?v='),'home loads the card styles');
console.log('Continue reading: local-only record, strict read-back, home card wiring passed.');
