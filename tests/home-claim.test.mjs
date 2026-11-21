// «Одне твердження наживо» під героєм головної (рішення власника «2 і 3», 2026-11-17; src/platform/home-claim.mjs, docs/HOME_FIRST_SCREEN.md).
// Тест стежить, щоб картка не розійшлася з даними розбору креатину й не сказала більше, ніж записано:
// той самий короткий текст, рівень і позначка «попередня оцінка», ті самі кого/з чим, ті самі числа ефекту, перша межа, те саме джерело.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {homeClaimHTML,HOME_CLAIM_ID,CONFIDENCE_STEPS,EFFECT_MARKS} from '../src/platform/home-claim.mjs';
import {confidenceLabels} from '../src/evidence/core/components.mjs';
import {creatineClaims,creatineSources,evidenceRecordsByClaimId} from '../dist/evidence/data.js';
import {unstampHome} from '../scripts/combined-source.mjs';

const home=unstampHome(fs.readFileSync('dist/index.html','utf8'));
const claim=creatineClaims.find(item=>item.id===HOME_CLAIM_ID),records=evidenceRecordsByClaimId[HOME_CLAIM_ID];
const source=creatineSources.find(item=>item.id===records[0].sourceId);
const html=homeClaimHTML({claim,records,source},confidenceLabels);
const block=(home.match(/<!-- EUA_HOME_CLAIM_START -->([\s\S]*?)<!-- EUA_HOME_CLAIM_END -->/)||[])[1];
assert.equal(block,html,'the home carries the card built from the creatine data (run node scripts/build-site.mjs)');
const text=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');

// Місце: одразу під героєм, перед «Обери напрям».
assert(home.indexOf('<!-- EUA_HOME_SPECTRUM_END -->')<home.indexOf('<!-- EUA_HOME_CLAIM_START -->')&&home.indexOf('<!-- EUA_HOME_CLAIM_END -->')<home.indexOf('id="start-here-title"'),'the card stands right under the hero');
assert.equal((home.match(/class="home-claim"/g)||[]).length,1,'one card on the home');

// Зміст із даних, нічого понад.
assert(html.includes(`<h2 id="home-claim-title">${claim.shortStatement}</h2>`),'the statement is the claim short statement word for word');
assert.equal(claim.evidenceConfidence,'high');assert.equal(claim.provisional,true);
assert(text.includes('Впевненість: висока')&&text.includes('попередня оцінка, науковий перегляд триває'),'the level and the provisional mark are both shown');
assert(html.includes(`<li class="home-claim-step is-reached is-current" aria-current="true"><span>Висока</span></li>`),'the current step is «Висока»');
assert.equal((html.match(/class="home-claim-step[ "]/g)||[]).length,CONFIDENCE_STEPS.length,'all four levels are drawn');
assert(text.includes(claim.population.description)&&text.includes(claim.comparator.description),'who and what was compared come from the claim');
const shown=[...html.matchAll(/class="home-claim-effect-name">([^<]+)<\/span>[\s\S]*?--at:([\d.]+)%[\s\S]*?g = ([\d,]+)</g)].map(m=>[m[1],Number(m[2]),m[3]]);
const expected=records.filter(r=>r.result?.effectMeasure==='Hedges_g'&&r.direction==='supports_claim').map(r=>[r.outcome.name,Math.round(r.result.estimate*1000)/10,String(r.result.estimate).replace('.',',')]);
assert.deepEqual(shown,expected,'every point and number is an estimate from the evidence records, at its own place on the ruler');
assert.deepEqual([...html.matchAll(/class="home-claim-mark" style="--at:([\d.]+)%"><span>([^<]+)<\/span>/g)].map(m=>[Number(m[1]),m[2]]),EFFECT_MARKS.map(([v,l])=>[v*100,l]),'the ruler marks are 0,2 малий, 0,5 середній, 0,8 великий');
assert(fs.readFileSync('dist/research-data.js','utf8').includes('g = 0,54 і 0,55, тобто середній'),'the site already describes these two numbers as «середній» in the review of the same meta-analysis');
assert(text.includes('Меж похибки для неї на сайті поки немає'),'the card says plainly that no error margins are drawn');
assert(!/home-claim-(?:ci|interval)|lo=|hi=/.test(html),'no interval is drawn: the records have none');
assert(text.includes(claim.limitations[0]),'the first stated limitation of the claim is shown');
assert(/<details class="home-claim-more"><summary>Межа висновку й джерело<\/summary><p class="home-claim-limit">[\s\S]*<p class="home-claim-source">[\s\S]*<\/details>/.test(html),'the limit and the full source are folded together under a summary that names them, not deleted');
assert(text.indexOf('Меж похибки')<text.indexOf('Межа висновку'),'the note that no error margins are drawn stays visible next to the ruler, outside the fold');
assert(text.includes(source.shortCitation)&&html.includes(`href="${source.pubmedUrl}"`),'the source is the one the estimates come from');
assert(records.every(r=>r.sourceId===source.id),'all estimates come from that one source');
// Посилання: назви кажуть, куди ведуть; розбір відкривається на картках тверджень.
assert(html.includes('<a class="home-claim-open" href="./creatine.html#evidence-card">Усі твердження про креатин <span aria-hidden="true">→</span></a>'));
assert(fs.readFileSync('dist/creatine.html','utf8').includes('id="evidence-card"'),'the target anchor exists on the creatine page');
assert(/<a class="home-claim-pubmed" href="https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/" rel="noopener">Джерело в PubMed/.test(html),'the PubMed link names its destination and opens only on click');
// Без тексту в малюнку й без сторонніх запитів до кліку.
assert(!/<svg|<img|<script|<iframe/.test(html),'plain HTML: no drawing with text, no images, no scripts');
// Неповні дані зупиняють збірку, а не малюють порожню картку.
assert.throws(()=>homeClaimHTML({claim:{...claim,id:'CLM-X'},records,source},confidenceLabels),/claim record/);
assert.throws(()=>homeClaimHTML({claim,records:[],source},confidenceLabels),/Hedges g/);
assert.throws(()=>homeClaimHTML({claim,records,source:{...source,pubmedUrl:'http://example.com'}},confidenceLabels),/PubMed/);
assert.throws(()=>homeClaimHTML({claim:{...claim,evidenceConfidence:null},records,source},confidenceLabels),/confidence/);
assert.throws(()=>homeClaimHTML({claim:{...claim,limitations:[]},records,source},confidenceLabels),/limitation/);
// Стилі: лише палітра головної, текст не менший за 12 px, цілі посилань 44 px.
const css=fs.readFileSync('dist/home-claim.css','utf8');
for(const size of [...css.matchAll(/font(?:-size)?:[^;]*?(\d+(?:\.\d+)?)px/g)].map(m=>Number(m[1])))assert(size>=12,`no text under 12 px (${size})`);
assert(/\.home-claim-links a\{[^}]*min-height:44px/.test(css)&&/\.home-claim-more>summary\{[^}]*min-height:44px/.test(css),'links and the fold are 44 px tall');
assert(/\.home-claim-more>summary::after\{content:"";/.test(css)&&!/content:"[+−]"/.test(css),'the fold shows the home corner, not a plus');
assert(/@media print\{[\s\S]*\.home-claim-more::details-content\{content-visibility:visible/.test(css),'the fold prints open');
assert(!/url\(|@import|https?:/.test(css),'no external requests in the styles');
assert(home.includes('<link rel="stylesheet" href="./home-claim.css?v=1">'),'the stylesheet is linked with a version');
console.log('Home claim card: one real claim under the hero, every word and number from the creatine records, no invented interval.');
