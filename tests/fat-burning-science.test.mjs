import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Наукові тексти «Куди зникає жир?» лишаються дослівно, хоч сторінку оформлено заново (рішення власника 2026-11-14, «все так»).
// Раніше весь файл dist/fat-burning.html був «замороженим» одним хешем у tests/fixtures/nutrition-architecture-preservation.json:
// цей хеш не дозволяв змінити оформлення. Тепер той запис знято, а захист перенесено сюди й звужено до самих текстів:
// заголовки й вступи розділів, «Неочікуваний факт», чотири напрями практики, примітка про силу доказів, п'ять запитань і відповідей про міфи,
// чотири джерела з пов'язаними описами, застереження статусу. Еталонні хеші пораховано з версії сторінки до апгрейду (HEAD 3fcc789).
// Нове (вердикти міфів, графік запасу, підписи схеми) сюди не входить: це оформлення, воно не змінює висновків.
// Блок «Не зупиняйся на одному поясненні» (дублював посилання практики) прибрано за тим самим рішенням.
const html=fs.readFileSync('dist/fat-burning.html','utf8');
const txt=h=>h.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const all=re=>[...html.matchAll(re)].map(m=>m[1]);
const got=new Map();
const put=(k,v)=>Array.isArray(v)?v.forEach((x,i)=>got.set(`${k}[${i}]`,sha(x))):got.set(k,sha(v));
put('sectionHeads',all(/<div class="fb-section-head">([\s\S]*?)<\/div>/g).map(txt));
put('fact',txt(all(/<p class="fb-fact">([\s\S]*?)<\/p>/g)[0]));
put('practice',all(/<article class="fb-practice-card">([\s\S]*?)<\/article>/g).map(txt));
put('evidence',txt(all(/<div class="fb-evidence-note">([\s\S]*?)<\/div>/g)[0]));
put('mythQ',all(/<p class="fb-myth-q">([\s\S]*?)<\/p>/g).map(x=>txt(x).replace(/^\d+ /,'')));
put('mythA',all(/<p class="fb-myth-a">([\s\S]*?)<\/p>/g).map(txt));
put('sources',all(/<article><span>([\s\S]*?)<\/article>/g).map(txt));
put('disclaimer',txt(all(/<p class="fb-source-disclaimer">([\s\S]*?)<\/p>/g)[0]));
put('barsNote',txt(all(/<p class="fb-small">(Смуги[\s\S]*?)<\/p>/g)[0]));
const baseline=[
 ["sectionHeads[0]","cda63cb5bcad3d8df41b61619c33e8bfbab736082e42ff0d85acf832eaf2ed4c"],
 ["sectionHeads[1]","fc1aa55cbdaf444c2aae51b2383c120f8d0a9de2eb286b804b1e76b3290ca631"],
 ["sectionHeads[2]","1673a787bb10e527ebc300be7ae0b19e6bedd305201841ad169c69d3deee0ac3"],
 ["sectionHeads[3]","077fcb330a5f62e1866609eaee4a5009bbb463b69c47cb8497d0765db85205ee"],
 ["sectionHeads[4]","24204d285277bcb397df8611b6b44a169cbe8a07111dad413727da6da27b0b7f"],
 ["fact","faaea5239225af0eac5fd199afe379243b57132496e541f7b7de02f5a8c282bb"],
 ["practice[0]","51d7495b5f4d8d1e4cac94d0ed4ba9e60b2e9028c16ee5b64e8667faca1b6271"],
 ["practice[1]","bb1d4de6127b2dbaeb0c155697c7a3f1c8869b7c51ffc0d5ab2f3af3d4df434c"],
 ["practice[2]","c25c8aff893716d125d70f7d80c49ec0fb14ee3822b9e8733ff174ac8742cfe5"],
 ["practice[3]","60167b3d62be027118a55328cbd08cd3ada599a527ef5266a52ec13f5c9cc2c0"],
 ["evidence","1905b8dc3e71aa84cdc92bb4cce4f6dd2215106bc9f97c911a474567cf54c293"],
 ["mythQ[0]","adb6622a3eeb73403f360fb6077a79638a9a5b24f1bc2b9edad78081de27ede0"],
 ["mythQ[1]","fe4c445f687489857aab485b446397f6786148bb284aead75381c0e211b58827"],
 ["mythQ[2]","f58bb5510b03c7139dbcc7006b79c8f00b8f91301da0a5837a9c0c767ca679a7"],
 ["mythQ[3]","fcfe0813cab4e5976c7c2a651b0b26880839d5ae47d79a024bf703851f2c069c"],
 ["mythQ[4]","c66b71764f031d455f7a9aefa2b56c3400844f61b77d44ae87b29d52f727a561"],
 ["mythA[0]","9cdb05765794020e3737d2b4ddcd0e14d94d28b666c5be618aeda8cc8611528f"],
 ["mythA[1]","bbf5f5a2545d1b098b57df82a6018b987bb38596e3c31ad2a39dbb9137257657"],
 ["mythA[2]","0ecb1631bc1af687cd2668087819f5536d17dee3d3165c233ea1d51c0ac3eb77"],
 ["mythA[3]","af1a3a588ac30c83f2af8924b3af9ce51ea3c21337b0a97d69808f9878449497"],
 ["mythA[4]","c4d0802468eb24f7798be7d9d1f4f96b18fd2f14552b07aa70fa1bc693aa5e18"],
 ["sources[0]","276ca96c514deb318f29fc6ff2b7508cfa6a8f2416e933f348acf63360f009eb"],
 ["sources[1]","cfbff1efb7308d08f055195cab71187e4363e18a7cfbf31741615ba7935c66a2"],
 ["sources[2]","0b2bf5e713e72c410a8f092a71c8420785a7641166f66d01561a87a1bc9b0249"],
 ["sources[3]","34d317face99fb23e822a18cec52d3c5525930ae794b5da57d3be1321ad6d5e1"],
 ["disclaimer","6f9d7da5446bf1a9082161f964b42f6b845ac84da1d707e867a8c29dcda65714"],
 ["barsNote","1c12bb322fb9f4bf4b6dc376e5dbf442fe06be46ab60a64bcb68ad7f7b4db7b3"]
];
assert.equal(got.size,baseline.length,'the same number of protected text items');
for(const [key,hash] of baseline)assert.equal(got.get(key),hash,`scientific text changed: ${key}`);

// Нові елементи не вводять чисел і нових тверджень: вердикт має бути з трьох дозволених слів-підсумків уже сказаного в відповіді.
const verdicts=all(/<p class="fb-verdict"><b[^>]*>[^<]*<\/b><span>([^<]*)<\/span>/g);
assert.deepEqual(verdicts,['Ні','Не гарантовано','Не доведено','Ні','Доказів недостатньо'],'myth verdicts');
assert(!/\d\s?(?:кг|ккал|%)/.test(html.slice(html.indexOf('class="fb-lab"'),html.indexOf('id="sources"'))),'no invented numbers in the new visuals');
console.log('Fat burning science texts preserved verbatim:',baseline.length,'items.');
