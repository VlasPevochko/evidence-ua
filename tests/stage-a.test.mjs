import assert from 'node:assert/strict';
import fs from 'node:fs';
import {publicText} from '../src/evidence/core/public-text.mjs';
import {evidenceBase,legacySources} from '../dist/evidence/data.js?v=1.8';
import {EvidenceDrawer,SourceCard,MechanismInteractive,StructureExplorer,ClaimCard,renderModule} from '../dist/evidence/ui.js';
assert.equal(publicText('Hedges_g'),"Hedges' g (стандартизована різниця)");assert.equal(publicText('mean_difference'),'різниця середніх');assert.equal(publicText('mg/dL'),'мг/дл');
assert.equal(publicText('Ефект 0.14 mg/dL (95% CI 0.05–0.22)'), 'Ефект 0,14 мг/дл (95% ДІ 0,05–0,22)');
assert.equal(publicText('Перевірено 09.10.2026.'),'Перевірено 09.10.2026.');assert.equal(publicText('HIGH'),'HIGH');assert.equal(publicText('high'),'high');
for(const s of evidenceBase.sources){const card=SourceCard(s);assert(card.includes(s.title));assert(card.includes('Фінансування й конфлікти інтересів: ще не перевірено за повним текстом'));assert(card.includes('<summary>Технічна довідка</summary>'));assert(!card.includes('Не внесено в seed'));}
for(const c of evidenceBase.claims){const drawer=EvidenceDrawer(c.id);assert(!drawer.includes('Hedges_g'));assert(!drawer.includes('mean_difference'));assert(!drawer.includes('ДІ не внесено'));assert(ClaimCard(c.id).includes(`data-confidence="${c.evidenceConfidence}"`));}
assert(legacySources.length>=11);assert(!renderModule().includes('Джерела попередньої сторінки'));assert(MechanismInteractive().includes('<summary>Технічна довідка</summary>'));assert(StructureExplorer().includes('<summary>Технічна довідка</summary>'));
const html=fs.readFileSync('dist/index.html','utf8');assert(!html.includes('07 СВІТІВ ЗНАНЬ'));assert(!html.includes('<a href="#categories">Практика</a>'));assert(html.includes('Матеріал освітній і не є персональною медичною рекомендацією.'));
console.log('Stage A: display-only terminology, decimals, article titles, unchanged confidence attributes, technical disclosures, retained legacy data and navigation wording passed.');
