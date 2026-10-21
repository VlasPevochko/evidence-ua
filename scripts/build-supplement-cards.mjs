// Омега-3, вітамін D і кофеїн: one renderer for approved supplement modules. Ratio rows (risk, hazard, odds or rate
// ratios) share one log axis around 1; difference rows (scale: 'linear' — SMD, g, mm Hg) get their own symmetric axis
// around 0 because units differ. Same layout family as the berberine card.
// Idempotent: replaces only content between CARD markers inside each section, plus one style and one script tag.
import fs from 'node:fs';
import path from 'node:path';
import {omegaBase, omegaModule} from '../src/evidence/supplements/omega/module.mjs';
import {vitdBase, vitdModule} from '../src/evidence/supplements/vitd/module.mjs';
import {caffeineBase, caffeineModule} from '../src/evidence/supplements/caffeine/module.mjs';
import {ConfidenceBadge, SourceCard, claimButton, escapeHTML as e} from '../src/evidence/core/components.mjs';

const root = process.cwd();
const indexPath = path.join(root, 'dist/index.html');
const out = path.join(root, 'dist/evidence');
const num = x => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 2, minimumFractionDigits: 2}).format(x);
const types = {efficacy: 'Ефект', safety: 'Безпека'};
const layers = {human_outcome: 'люди', mechanistic: 'лабораторія'};

export const cards = [
  {key: 'omega', base: omegaBase, module: omegaModule, art: '--base-x:75%;--base-y:0%', file: 'src/evidence/supplements/omega/module.mjs', exportName: 'omegaBase',
    headline: 'Знижує тригліцериди. Серце майже не захищає',
    definition: 'Омега-3 — група жирних кислот. EPA і DHA містяться в жирній рибі й риб’ячому жирі, рослинна ALA — у льоні, волоських горіхах, ріпаковій олії.',
    lead: 'У великих дослідженнях капсули EPA і DHA майже не змінили ризик інфарктів, інсультів і смертність, але знизили тригліцериди. У дозах понад 1 г на добу зростав ризик фібриляції передсердь.',
    rowsTitle: 'Що змінюється', rowsNote: 'Відношення ризиків з плацебо або звичайним харчуванням. 1 — без різниці; ліворуч — рідше, праворуч — частіше.',
    rows: [['EVR-000018', 'Серцево-судинні події'], ['EVR-000125', 'Загальна смертність'], ['EVR-000126', 'Події ішемічної хвороби серця'], ['EVR-000130', 'Фібриляція передсердь'], ['EVR-000131', 'Фібриляція, понад 1 г/добу']],
    rowsSource: 'Cochrane 2020 (Abdelhamid); фібриляція передсердь — Gencer 2021.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Є фібриляція передсердь чи ризик її?</b> У великих дослідженнях омега-3 підвищувала цей ризик, сильніше — у дозах понад 1 г на добу. Порадься з лікарем.', '<b>Хочеш знизити тригліцериди?</b> Це питання до лікаря: зниження тригліцеридів саме по собі не довело менше серцевих подій.', '<b>Рослинна ALA (льон, горіхи)</b> — інша речовина. Висновки про EPA і DHA на неї не переносимо.'],
    facts: [['Тригліцериди', '≈ −15%', 'що більша доза, то сильніше'], ['Події ІХС', '1 з ~167', 'стільки людей мають приймати, щоб уникнути однієї події; низька певність'], ['Рівень впевненості', 'не оцінено', 'формального наукового перегляду ще не було']]},
  {key: 'vitd', base: vitdBase, module: vitdModule, art: '--base-x:100%;--base-y:0%', file: 'src/evidence/supplements/vitd/module.mjs', exportName: 'vitdBase',
    headline: 'Без дефіциту від переломів не захищає',
    definition: 'Вітамін D допомагає засвоювати кальцій. Він утворюється в шкірі під сонцем і надходить із деяких продуктів.',
    lead: 'У дорослих, яких не відбирали за дефіцитом, сам вітамін D не зменшив переломів і не змінив загальної смертності. Інфекцій дихальних шляхів було трохи менше. Дуже великі разові дози шкодили.',
    rowsTitle: 'Що змінюється', rowsNote: 'Відношення ризиків, шансів або частот з плацебо. 1 — без різниці; ліворуч — рідше, праворуч — частіше.',
    rows: [['EVR-000136', 'Переломи, лише вітамін D'], ['EVR-000137', 'Переломи, вітамін D з кальцієм'], ['EVR-000019', 'Переломи, VITAL (2000 МО/добу)'], ['EVR-000141', 'Падіння, 500 000 МО раз на рік'], ['EVR-000142', 'Переломи, 500 000 МО раз на рік'], ['EVR-000143', 'Інфекції дихальних шляхів'], ['EVR-000145', 'Загальна смертність']],
    rowsSource: 'Переломи — Massé 2026 і VITAL 2022; великі дози — Sanders 2010; інфекції — Jolliffe 2021; смертність — Zhang 2019.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Не бери великих разових доз.</b> 500 000 МО раз на рік у жінок від 70 років підвищили частоту падінь і переломів.', '<b>Підозрюєш дефіцит?</b> Це перевіряють аналізом крові й лікують з лікарем. Висновки цієї картки — про прийом без відбору за дефіцитом.', '<b>Більше — не краще.</b> Надлишок вітаміну D може шкодити.'],
    facts: [['Переломи', '1,00', 'відношення ризиків для самого вітаміну D (69 РКД, 2026)'], ['Інфекції', '61,3% проти 62,3%', 'мали хоча б одну інфекцію за час досліджень'], ['Рівень впевненості', 'не оцінено', 'формального наукового перегляду ще не було']]},
  {key: 'caffeine', base: caffeineBase, module: caffeineModule, art: '--base-x:50%;--base-y:0%', file: 'src/evidence/supplements/caffeine/module.mjs', exportName: 'caffeineBase', scale: 'linear',
    headline: 'Допомагає на витривалість. Ціна — сон',
    definition: 'Кофеїн — стимулятор, який міститься в каві, чаї, енергетиках і деяких добавках. Він впливає на відчуття бадьорості й навантаження.',
    lead: 'Кофеїн приблизно за годину до навантаження допомагає швидше пройти дистанцію й трохи додає сили. Увечері він скорочує сон, а енергетики тимчасово підвищують тиск.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця з плацебо. SMD і g — стандартизований ефект: 0,2 — малий, 0,5 — помірний. Для часу на дистанції менше — краще.',
    rows: [['EVR-000165', 'Час на дистанції, до 3 мг/кг', {word: 'швидше'}], ['EVR-000166', 'Час на дистанції, 4–6 мг/кг', {word: 'швидше'}], ['EVR-000168', 'Максимальна сила (1ПМ)'], ['EVR-000169', 'Стрибок'], ['EVR-000171', 'Швидкість штанги'], ['EVR-000173', 'Жінки, фізичні результати'], ['EVR-000182', 'Жуйка з кофеїном'], ['EVR-000177', 'Тиск у спокої (енергетики)', {word: 'вищий', harm: true}], ['EVR-000178', 'Тиск під час навантаження (енергетики)', {word: 'вищий', harm: true}]],
    rowsSource: 'Дистанція — Martins 2026; сила й стрибок — Grgic 2018; штанга — Xiao 2025; жінки — Zhu 2026; жуйка — Miraftabi 2026; тиск — Gualberto 2024 і Grinberg 2022.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Тренуєшся ввечері?</b> Кофеїн скорочує сон у середньому на 35–45 хв. За розрахунком авторів огляду каву варто пити щонайменше за 8,8 год до сну, порцію передтренувальної добавки — за 13,2 год.', '<b>Вагітність або годування груддю</b> — не більше 200 мг на добу з усіх джерел.', '<b>Підвищений тиск чи хвороба серця?</b> Енергетики підвищують тиск, особливо під час навантаження. Спершу порадься з лікарем.', '<b>Підлітки</b> — не більше 3 мг на кілограм маси тіла на добу.'],
    facts: [['Доза', '3–6 мг/кг', 'приблизно за 60 хв до навантаження (ISSN 2021)'], ['Безпечно за добу', 'до 400 мг', 'дорослим; за раз — до 200 мг (EFSA 2015)'], ['Рівень впевненості', 'не оцінено', 'формального наукового перегляду ще не було']]},
];

function check(card) {
  for (const id of card.module.claimIds) {
    const c = card.base.claims.find(x => x.id === id);
    if (!c) throw Error('Unknown Claim ' + id);
    if (c.evidenceConfidence !== null) throw Error('Confidence must stay unassessed: ' + id);
    if (!c.publicationApproved || c.publicationAcceptance?.kind !== 'user_wording_approval') throw Error('Wording not approved: ' + id);
  }
}

const sig = x => (x < 0 ? '−' : x > 0 ? '+' : '') + new Intl.NumberFormat('uk-UA', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Math.abs(x));
const short = {'Стандартизована різниця середніх': 'SMD', 'Hedges g': 'g'};
const units = {mmHg: 'мм рт. ст.'};
// Linear rows: options.better ('lower' when a smaller value is the better result, e.g. time), options.harm (gold when clear).
function LinearRows(card) {
  return card.rows.map(([id, label, o = {}]) => {
    const r = card.base.records.find(x => x.id === id)?.result;
    if (typeof r?.lowerCI !== 'number' || typeof r?.upperCI !== 'number') throw Error('Row needs an interval: ' + id);
    const R = Math.max(Math.abs(r.lowerCI), Math.abs(r.upperCI)) * 1.25, pos = v => ((v + R) / (2 * R) * 100).toFixed(1);
    const clear = typeof r.pValue === 'number' ? r.pValue < 0.05 : r.upperCI < 0 || r.lowerCI > 0;
    const value = (short[r.effectMeasure] ? short[r.effectMeasure] + ' ' : '') + sig(r.estimate) + (units[r.unit] ? ' ' + units[r.unit] : '');
    const word = !clear ? 'різниці не виявлено' : o.word || (r.estimate > 0 ? 'більше' : 'менше');
    const up = clear && o.harm;
    return `<li class="bc-row${clear ? '' : ' bc-null'}${up ? ' bc-up' : ''}"><div class="bc-label"><b>${e(label)}</b><span>${e(value)} · ${e(word)}</span></div><div class="bc-axis" role="img" aria-label="${e(label)}: ${e(value)}, 95% ДІ від ${sig(r.lowerCI)} до ${sig(r.upperCI)}"><i class="bc-zero" style="left:50%"></i><i class="bc-ci" style="left:${pos(r.lowerCI)}%;width:${(pos(r.upperCI) - pos(r.lowerCI)).toFixed(1)}%"></i><i class="bc-dot" style="left:${pos(r.estimate)}%"></i></div><small class="bc-ci-text">ДІ ${sig(r.lowerCI)}…${sig(r.upperCI)}</small></li>`;
  }).join('');
}

function Rows(card) {
  if (card.scale === 'linear') return LinearRows(card);
  const rs = card.rows.map(([id, label]) => {const r = card.base.records.find(x => x.id === id); if (!r?.result?.lowerCI) throw Error('Row needs a ratio record: ' + id); return {label, ...r.result};});
  const R = Math.max(...rs.flatMap(r => [Math.abs(Math.log(r.lowerCI)), Math.abs(Math.log(r.upperCI))])) * 1.15;
  const pos = v => ((Math.log(v) + R) / (2 * R) * 100).toFixed(1);
  return rs.map(r => {
    // A reported p-value decides when the rounded interval touches 1 (Sanders 2010: 1,00…1,59, p = 0,047).
    const clear = typeof r.pValue === 'number' ? r.pValue < 0.05 : r.upperCI < 1 || r.lowerCI > 1;
    const word = !clear ? 'різниці не виявлено' : r.estimate < 1 ? 'рідше' : 'частіше';
    return `<li class="bc-row${clear ? '' : ' bc-null'}${clear && r.estimate > 1 ? ' bc-up' : ''}"><div class="bc-label"><b>${e(r.label)}</b><span>${num(r.estimate)} · ${word}</span></div><div class="bc-axis" role="img" aria-label="${e(r.label)}: ${e(r.effectMeasure)} ${num(r.estimate)}, 95% ДІ від ${num(r.lowerCI)} до ${num(r.upperCI)}"><i class="bc-zero" style="left:50%"></i><i class="bc-ci" style="left:${pos(r.lowerCI)}%;width:${(pos(r.upperCI) - pos(r.lowerCI)).toFixed(1)}%"></i><i class="bc-dot" style="left:${pos(r.estimate)}%"></i></div><small class="bc-ci-text">ДІ ${num(r.lowerCI)}…${num(r.upperCI)}</small></li>`;
  }).join('');
}

function CompactClaim(card, id) {
  const c = card.base.claims.find(x => x.id === id);
  return `<article class="eua-claim bc-claim" data-claim-id="${e(c.id)}"><div class="eua-kicker">${e(types[c.claimType] || c.claimType)} · ${e(layers[c.evidenceLayer])}</div><h3>${e(card.base.presentation.labels[id])}</h3><p class="eua-statement">${e(c.shortStatement)}</p>${ConfidenceBadge(c)}${claimButton(id, 'Докази й межі')}</article>`;
}

export function SupplementCard(card) {
  check(card);
  const k = card.key, b = card.base, m = card.module;
  const sources = b.sources.map(s => SourceCard(s, b.records.filter(r => r.sourceId === s.id), true, k + '-source', 3)).join('');
  return `<div class="eua-module pc bc" data-supplement-card="${k}">
<div class="base-intro"><div class="base-copy"><h2 class="pc-headline">${e(card.headline)}</h2><p class="base-definition">${e(card.definition)}</p><p class="pc-lead">${e(card.lead)}</p></div><div class="base-art" style="${card.art}" aria-hidden="true"></div></div>
<section class="pc-scale" aria-labelledby="${k}-effects-title"><h2 id="${k}-effects-title">${e(card.rowsTitle)}</h2><p class="pc-sub">${e(card.rowsNote)}</p><ul class="bc-forest">${Rows(card)}</ul><p class="pc-foot">${e(card.rowsSource)} Крапка — середня оцінка, смуга — 95% довірчий інтервал; ${card.scale === 'linear' ? 'кожен рядок має власну шкалу.' : 'шкала логарифмічна.'}</p></section>
<section class="bc-safety" aria-labelledby="${k}-safety-title"><h2 id="${k}-safety-title">${e(card.safetyTitle)}</h2><ul>${card.safety.map(s => `<li>${s}</li>`).join('')}</ul></section>
<div class="pc-facts">${card.facts.map(([a, v, n]) => `<div><span>${e(a)}</span><strong>${e(v)}</strong><small>${e(n)}</small></div>`).join('')}</div>
<h2 class="pc-h2">Твердження й докази</h2><div class="eua-claim-grid bc-claims bc-claims-4">${m.claimIds.map(id => CompactClaim(card, id)).join('')}</div>
<section class="pc-not" aria-labelledby="${k}-not-title"><h2 id="${k}-not-title">Чого ми не стверджуємо</h2>${m.notClaimed.map(n => `<article><h3>${e(n.topic)}</h3><p>${e(n.reason)}</p></article>`).join('')}</section>
<details class="pc-more"><summary>Межі всіх досліджень</summary><ul>${m.commonLimits.map(l => `<li>${e(l)}</li>`).join('')}</ul></details>
<details class="pc-more"><summary>Джерела (${b.sources.length})</summary><div class="eua-source-grid">${sources}</div></details>
<p class="pc-status">Науковий перегляд: не завершено · Формулювання погоджено 21 жовтня 2026 року · Матеріал освітній і не є персональною медичною рекомендацією.</p>
<dialog class="eua-dialog" data-supplement-dialog="${k}" aria-label="Докази до твердження: ${e(m.title)}"><div data-evidence-content></div></dialog>
</div>`;
}

const S = ':is(#supplement-omega,#supplement-vitd,#supplement-caffeine)';
const css = `${S} .bc-up .bc-ci{background:#e7bd46}${S} .bc-up .bc-dot{background:#f3d98a}${S} .bc-up .bc-label span{color:#f3d98a}
${S} .bc-claims-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media(max-width:1100px){${S} .bc-claims-4{grid-template-columns:repeat(2,minmax(0,1fr))}}`;

const ui = `// Generated by scripts/build-supplement-cards.mjs. Opens the evidence drawer for omega-3, vitamin D and caffeine Claims.
import {omegaBase} from './omega-data.js?v=1';
import {vitdBase} from './vitd-data.js?v=1';
import {caffeineBase} from './caffeine-data.js?v=1';
import {mountEvidenceDrawer} from './components.js?v=2.0';
if (typeof document !== 'undefined') for (const [id, key, base] of [['supplement-omega', 'omega', omegaBase], ['supplement-vitd', 'vitd', vitdBase], ['supplement-caffeine', 'caffeine', caffeineBase]]) {
  const root = document.getElementById(id);
  if (root) mountEvidenceDrawer(root, base, {dialogSelector: '[data-supplement-dialog="' + key + '"]'});
}
`;

export function buildSupplementCards() {
  let html = fs.readFileSync(indexPath, 'utf8');
  for (const card of cards) {
    const src = fs.readFileSync(path.join(root, card.file), 'utf8');
    if (!src.includes("from '../../core/registry.mjs'")) throw Error('Registry import changed: ' + card.file);
    fs.writeFileSync(path.join(out, card.key + '-data.js'), '// Generated from ' + card.file + '.\n' + src.replace("from '../../core/registry.mjs'", "from './registry.js'"));
    const markers = new RegExp('(<!-- CARD:' + card.key + ':START -->)[\\s\\S]*?(<!-- CARD:' + card.key + ':END -->)');
    if (!markers.test(html)) throw Error('CARD markers missing for ' + card.key);
    html = html.replace(markers, (_, a, z) => a + SupplementCard(card) + z);
  }
  fs.writeFileSync(path.join(out, 'supplement-cards-ui.js'), ui);
  html = html.replace(/<style data-supplement-cards-style>[\s\S]*?<\/style>/g, '').replace(/<script[^>]*data-supplement-cards-script[^>]*><\/script>/g, '');
  html = html.replace('</head>', '<style data-supplement-cards-style>' + css + '</style></head>');
  html = html.replace('</body>', '<script type="module" src="./evidence/supplement-cards-ui.js?v=2" data-supplement-cards-script></script></body>');
  fs.writeFileSync(indexPath, html);
}
