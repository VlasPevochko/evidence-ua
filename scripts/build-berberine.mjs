// Берберин: renders the approved berberine module into #supplement-berberine on the home page.
// Idempotent: replaces only the content between BERBERINE markers, its style and its script tag.
// Layout reuses the protein card classes (pc-*); compact Claim cards keep details in the evidence drawer.
import fs from 'node:fs';
import path from 'node:path';
import {berberineBase, berberineModule} from '../src/evidence/supplements/berberine/module.mjs';
import {ConfidenceBadge, SourceCard, claimButton, escapeHTML as e} from '../src/evidence/core/components.mjs';

const root = process.cwd();
const indexPath = path.join(root, 'dist/index.html');
const out = path.join(root, 'dist/evidence');

for (const c of berberineBase.claims) {
  if (c.evidenceConfidence !== null) throw Error('Berberine Claims must not show a confidence level before assessment: ' + c.id);
  if (!c.publicationApproved || c.publicationAcceptance?.kind !== 'user_wording_approval') throw Error('Berberine Claim wording not approved: ' + c.id);
}

const rec = id => {const r = berberineBase.records.find(x => x.id === id); if (!r) throw Error('Unknown record ' + id); return r;};
const num = x => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 2}).format(x);
const signed = x => (x < 0 ? '−' : x > 0 ? '+' : '') + num(Math.abs(x));
const types = {efficacy: 'Ефект', safety: 'Безпека'};
const layers = {human_outcome: 'люди', mechanistic: 'лабораторія'};

// One row per outcome. Each row has its own symmetric axis around zero (units differ); the dot is the
// pooled estimate and the bar its 95% CI. A bar that crosses zero is drawn muted and labelled as such.
const rows = [
  ['EVR-000111', 'Глюкоза натще'],
  ['EVR-000112', 'HbA1c', '≈ −0,4 п.п.'],
  ['EVR-000115', 'Тригліцериди'],
  ['EVR-000116', 'ЛПНЩ («поганий» холестерин)'],
  ['EVR-000117', 'ЛПВЩ («хороший» холестерин)'],
  ['EVR-000118', 'Систолічний тиск'],
  ['EVR-000119', 'Маса тіла']
];
function ForestRow([id, label, note]) {
  const {estimate: x, lowerCI: lo, upperCI: hi, unit} = rec(id).result;
  const range = Math.max(Math.abs(lo), Math.abs(hi)) * 1.25;
  const pos = v => ((v + range) / (2 * range) * 100).toFixed(1);
  const clear = hi < 0 || lo > 0;
  return `<li class="bc-row${clear ? '' : ' bc-null'}"><div class="bc-label"><b>${e(label)}</b><span>${clear ? '' : 'Різниці не виявлено · '}${signed(x)} ${e(unit)}${note ? ' · ' + e(note) : ''}</span></div><div class="bc-axis" role="img" aria-label="${e(label)}: ${signed(x)} ${e(unit)}, 95% ДІ від ${signed(lo)} до ${signed(hi)}"><i class="bc-zero" style="left:50%"></i><i class="bc-ci" style="left:${pos(lo)}%;width:${(pos(hi) - pos(lo)).toFixed(1)}%"></i><i class="bc-dot" style="left:${pos(x)}%"></i></div><small class="bc-ci-text">ДІ ${signed(lo)}…${signed(hi)}</small></li>`;
}

function CompactClaim(id) {
  const c = berberineBase.claims.find(x => x.id === id);
  return `<article class="eua-claim bc-claim" data-claim-id="${e(c.id)}"><div class="eua-kicker">${e(types[c.claimType] || c.claimType)} · ${e(layers[c.evidenceLayer])}</div><h3>${e(berberineBase.presentation.labels[id])}</h3><p class="eua-statement">${e(c.shortStatement)}</p>${ConfidenceBadge(c)}${claimButton(id, 'Докази й межі')}</article>`;
}

export function BerberineCard() {
  const sources = berberineBase.sources.map(s => SourceCard(s, berberineBase.records.filter(r => r.sourceId === s.id), true, 'berberine-source', 3)).join('');
  const w = rec('EVR-000119').result;
  return `<div class="eua-module pc bc" data-berberine-card>
<div class="base-intro"><div class="base-copy"><h2 class="pc-headline">Помірно знижує цукор і ліпіди. Не для схуднення</h2><p class="base-definition">Берберин — жовтий алкалоїд із рослин барбарису, коптису й жовтокореня. Його продають як добавку для «контролю цукру» і схуднення.</p><p class="pc-lead">У людей з діабетом 2 типу, предіабетом чи порушеним холестерином він помірно знижує цукор, тригліцериди й ЛПНЩ. Маса тіла майже не змінюється. Перед прийомом важливо перевірити, чи не взаємодіє він з твоїми ліками.</p></div><div class="base-art bc-art" aria-hidden="true"></div></div>
<section class="pc-scale" aria-labelledby="bc-effects-title"><h2 id="bc-effects-title">Що змінюється</h2><p class="pc-sub">Різниця з плацебо через 3–5 місяців. Крапка — середня оцінка, смуга — 95% довірчий інтервал; ліворуч від нуля — зниження.</p><ul class="bc-forest">${rows.map(ForestRow).join('')}</ul><p class="pc-foot">Глюкоза й HbA1c — Zhao 2023; ліпіди й тиск — Liu 2025; маса тіла — Elahi Vahed 2025. Кожен рядок має власну шкалу.</p></section>
<section class="bc-safety" aria-labelledby="bc-safety-title"><h2 id="bc-safety-title">Перш ніж приймати</h2><ul><li><b>Приймаєш ліки?</b> Берберин пригнічує ферменти печінки, які розщеплюють багато ліків, тому може змінювати їхню дію. Порадься з лікарем або фармацевтом.</li><li><b>Лікуєш діабет?</b> Разом із цукрознижувальними ліками є ризик надто низького цукру (гіпоглікемії). Не замінюй ліки добавкою.</li><li><b>Вагітність, годування груддю, немовлята</b> — не варто: безпеку не досліджено, а лабораторні дані дають сигнал ризику для новонароджених.</li></ul><p class="pc-note">Найчастіші побічні ефекти — нудота, закреп, дискомфорт у животі. Дані про переносимість є лише для 3–5 місяців.</p></section>
<div class="pc-facts"><div><span>У дослідженнях</span><strong>0,9–1,5 г/добу</strong><small>у 2–3 прийоми, 3–5 місяців. Це не рекомендація дози.</small></div><div><span>Вага</span><strong>${signed(w.estimate)} кг</strong><small>у середньому за кілька місяців (ДІ ${signed(w.lowerCI)}…${signed(w.upperCI)})</small></div><div><span>Рівень впевненості</span><strong>не оцінено</strong><small>формального наукового перегляду ще не було</small></div></div>
<h2 class="pc-h2">Твердження й докази</h2><div class="eua-claim-grid bc-claims">${berberineModule.claimIds.map(CompactClaim).join('')}</div>
<section class="pc-not" aria-labelledby="bc-not-title"><h2 id="bc-not-title">Чого ми не стверджуємо</h2>${berberineModule.notClaimed.map(n => `<article><h3>${e(n.topic)}</h3><p>${e(n.reason)}</p></article>`).join('')}</section>
<details class="pc-more"><summary>Межі всіх досліджень</summary><ul>${berberineModule.commonLimits.map(l => `<li>${e(l)}</li>`).join('')}</ul></details>
<details class="pc-more"><summary>Джерела (${berberineBase.sources.length})</summary><div class="eua-source-grid">${sources}</div></details>
<p class="pc-status">Науковий перегляд: не завершено · Формулювання погоджено 21 жовтня 2026 року · Матеріал освітній і не є персональною медичною рекомендацією.</p>
<dialog class="eua-dialog" data-berberine-dialog aria-label="Докази до твердження про берберин"><div data-evidence-content></div></dialog>
</div>`;
}

const S = ':is(#supplement-berberine,#supplement-omega,#supplement-vitd,#supplement-protein,#creatine,#supplement-caffeine,#supplement-magnesium,#supplement-collagen,#supplement-beta-alanine,#supplement-citrulline,#supplement-electrolytes)';
const css = `#supplement-berberine .bc-art{background-image:url('./supplement-berberine-v1.webp');background-size:cover;background-position:center}
${S} .bc-forest{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:18px}
${S} .bc-row{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.4fr) 132px;align-items:center;gap:6px 18px}
${S} .bc-label{display:flex;flex-direction:column;gap:2px;min-width:0}
${S} .bc-label b{font-size:15px}
${S} .bc-label span{font-size:13px;color:var(--pc-cyan-soft);font-variant-numeric:tabular-nums}
${S} .bc-null .bc-label span{color:var(--pc-muted)}
${S} .bc-axis{position:relative;height:22px;border-radius:8px;background:#ffffff08}
${S} .bc-axis i{position:absolute;top:50%;transform:translate(-50%,-50%)}
${S} .bc-zero{width:1px;height:22px;background:#ffffff40}
${S} .bc-ci{height:6px;border-radius:3px;background:var(--pc-cyan);transform:translateY(-50%)!important}
${S} .bc-dot{width:12px;height:12px;border-radius:50%;background:var(--pc-cyan-soft);box-shadow:0 0 0 3px #101517}
${S} .bc-null .bc-ci{background:#5d6b7a}${S} .bc-null .bc-dot{background:#9aa6b2}
${S} .bc-ci-text{font-size:12px;color:var(--pc-muted);text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
${S} .bc-safety{margin:0 0 16px;padding:clamp(20px,3vw,28px);border:1px solid #6b5a33;border-radius:16px;background:#1d1b15}
${S} .bc-safety h2{font-size:clamp(22px,2.6vw,30px);margin:0 0 12px;color:var(--pc-gold)}
${S} .bc-safety ul{margin:0;padding-left:20px;display:grid;gap:10px}
${S} .bc-safety li{line-height:1.6;color:#e5dfcf}
${S} .bc-safety .pc-note{margin:14px 0 0}
${S} .bc-claims{grid-template-columns:repeat(3,minmax(0,1fr))}
${S} .bc-claim{display:flex;flex-direction:column;gap:6px}
${S} .bc-claim .eua-statement{flex:1}
${S} .pc-more ul{padding-left:20px}
@media(max-width:900px){${S} .bc-claims{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){${S} .bc-forest{gap:14px}${S} .bc-row{grid-template-columns:minmax(0,1fr) auto}${S} .bc-axis{grid-column:1/-1;grid-row:2;height:18px}${S} .bc-zero{height:18px}${S} .bc-ci-text{grid-column:2;grid-row:1;align-self:start}${S} .bc-claims{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}${S} .bc-claim{padding:14px}${S} .bc-claim h3{font-size:16px;margin:4px 0}${S} .bc-claim .eua-statement{font-size:14px;line-height:1.45;margin:0 0 6px}${S} .bc-claim .eua-kicker{font-size:10px}${S} .bc-claim .eua-provisional{font-size:11px}${S} .bc-claim .eua-evidence-button{font-size:13px;padding:10px;min-height:44px}${S} .pc-facts{gap:10px;margin-bottom:32px}${S} .pc-facts div{padding:14px 16px}${S} .pc-facts strong{margin:6px 0 4px}${S} .pc-not article{padding:12px 14px}${S} .pc-not p{font-size:14px}}
@media(max-width:360px){${S} .bc-claims{grid-template-columns:minmax(0,1fr)}}`;

const ui = `// Generated by scripts/build-berberine.mjs. Opens the evidence drawer for berberine Claims.
import {berberineBase} from './berberine-data.js?v=1';
import {mountEvidenceDrawer} from './components.js?v=2.0';
const root = typeof document !== 'undefined' ? document.getElementById('supplement-berberine') : null;
if (root) mountEvidenceDrawer(root, berberineBase, {dialogSelector: '[data-berberine-dialog]'});
`;

export function buildBerberine() {
  const moduleSource = fs.readFileSync(path.join(root, 'src/evidence/supplements/berberine/module.mjs'), 'utf8');
  if (!moduleSource.includes("from '../../core/registry.mjs'")) throw Error('Berberine module registry import changed');
  fs.writeFileSync(path.join(out, 'berberine-data.js'), '// Generated from src/evidence/supplements/berberine/module.mjs.\n' + moduleSource.replace("from '../../core/registry.mjs'", "from './registry.js'"));
  fs.writeFileSync(path.join(out, 'berberine-ui.js'), ui);
  let html = fs.readFileSync(indexPath, 'utf8');
  const markers = /(<!-- BERBERINE:START -->)[\s\S]*?(<!-- BERBERINE:END -->)/;
  if (!markers.test(html)) throw Error('BERBERINE markers missing in #supplement-berberine');
  html = html.replace(markers, (_, a, b) => a + BerberineCard() + b);
  html = html.replace(/<style data-berberine-style>[\s\S]*?<\/style>/g, '').replace(/<script[^>]*data-berberine-script[^>]*><\/script>/g, '');
  html = html.replace('</head>', '<style data-berberine-style>' + css + '</style></head>');
  html = html.replace('</body>', '<script type="module" src="./evidence/berberine-ui.js?v=1" data-berberine-script></script></body>');
  fs.writeFileSync(indexPath, html);
}
