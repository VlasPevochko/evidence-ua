// Креатин: fills the CREATINE-MORE markers that src/evidence/evidence-ui.mjs leaves in #creatine.
// TOP — «Що змінюється» (rows from the existing creatine records and the approved additional module) + «Перш ніж приймати»;
// CLAIMS — eight additional approved Claims as compact cards with their own evidence dialog;
// NOT — «Чого ми не стверджуємо» and common limits; SOURCES — sources of the additional Claims.
// Idempotent: replaces only marker contents, one style and one script tag.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {creatineMoreBase as more, creatineMoreModule as moreModule} from '../src/evidence/supplements/creatine-more/module.mjs';
import {ConfidenceBadge, SourceCard, claimButton, escapeHTML as e} from '../src/evidence/core/components.mjs';

const root = process.cwd();
const indexPath = path.join(root, 'dist/index.html');
const out = path.join(root, 'dist/evidence');

for (const c of more.claims) {
  if (c.evidenceConfidence !== null) throw Error('Additional creatine Claims must stay unassessed: ' + c.id);
  if (!c.publicationApproved || c.publicationAcceptance?.kind !== 'user_wording_approval') throw Error('Wording not approved: ' + c.id);
}

const num = x => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 2}).format(x);
const signed = x => (x < 0 ? '−' : x > 0 ? '+' : '') + num(Math.abs(x));
const label = m => ({Hedges_g: 'g', 'Hedges g': 'g', 'Стандартизована різниця середніх': 'SMD'}[m] || '');

// Each row has its own symmetric axis around 0 (units differ). Rows without a reported interval show the point only.
function Row({label: name, result: r, note}) {
  const hasCI = typeof r.lowerCI === 'number' && typeof r.upperCI === 'number';
  const range = (hasCI ? Math.max(Math.abs(r.lowerCI), Math.abs(r.upperCI)) : Math.abs(r.estimate) * 1.4) * 1.25;
  const pos = v => ((v + range) / (2 * range) * 100).toFixed(1);
  const clear = hasCI ? (r.upperCI < 0 || r.lowerCI > 0) : true;
  const unit = r.unit === 'kg' ? 'кг' : r.unit === 'mL/min' ? 'мл/хв' : (r.unit || '');
  const value = `${label(r.effectMeasure) ? label(r.effectMeasure) + ' ' : ''}${signed(r.estimate)}${unit ? ' ' + unit : ''}`;
  const verdict = !clear ? 'різниці не виявлено' : r.estimate > 0 ? 'більше' : 'менше';
  return `<li class="bc-row${clear ? '' : ' bc-null'}${hasCI ? '' : ' cr-noci'}"><div class="bc-label"><b>${e(name)}</b><span>${e(value)} · ${verdict}${note ? ' · ' + e(note) : ''}</span></div><div class="bc-axis" role="img" aria-label="${e(name)}: ${e(value)}${hasCI ? `, 95% ДІ від ${signed(r.lowerCI)} до ${signed(r.upperCI)}` : ', довірчий інтервал у джерелі не наведено'}"><i class="bc-zero" style="left:50%"></i>${hasCI ? `<i class="bc-ci" style="left:${pos(r.lowerCI)}%;width:${(pos(r.upperCI) - pos(r.lowerCI)).toFixed(1)}%"></i>` : ''}<i class="bc-dot" style="left:${pos(r.estimate)}%"></i></div><small class="bc-ci-text">${hasCI ? `ДІ ${signed(r.lowerCI)}…${signed(r.upperCI)}` : 'ДІ не наведено'}</small></li>`;
}

function CompactClaim(id) {
  const c = more.claims.find(x => x.id === id);
  return `<article class="eua-claim bc-claim" data-claim-id="${e(c.id)}"><div class="eua-kicker">${c.claimType === 'safety' ? 'Безпека' : 'Ефект'}</div><h3>${e(more.presentation.labels[id])}</h3><p class="eua-statement">${e(c.shortStatement)}</p>${ConfidenceBadge(c)}${claimButton(id, 'Докази й межі')}</article>`;
}

export async function creatineMoreParts() {
  const {evidenceBase: base} = await import(pathToFileURL(path.join(out, 'data.js')).href + '?build=' + Date.now());
  const rec = (b, id) => {const r = b.records.find(x => x.id === id); if (!r) throw Error('Unknown record ' + id); return r.result;};
  const rows = [
    {label: 'Сила, верх тіла', result: rec(base, 'EVR-000001')},
    {label: 'Сила, низ тіла', result: rec(base, 'EVR-000002')},
    {label: 'Безжирова маса', result: rec(base, 'EVR-000004')},
    {label: 'Сила від 60 років', result: rec(more, 'EVR-000150')},
    {label: 'Витривалість', result: rec(more, 'EVR-000149')},
    {label: 'Пам’ять', result: rec(more, 'EVR-000153')},
    {label: 'Фільтрація нирок (виміряна)', result: rec(base, 'EVR-000007')}
  ];
  const top = `<section class="pc-scale" aria-labelledby="cr-effects-title"><h2 id="cr-effects-title">Що змінюється</h2><p class="pc-sub">Різниця з плацебо в дослідженнях. Крапка — середня оцінка, смуга — 95% довірчий інтервал; кожен рядок має власну шкалу. g і SMD — стандартизований ефект: 0,2 — малий, 0,5 — помірний.</p><ul class="bc-forest">${rows.map(Row).join('')}</ul><p class="pc-foot">Сила й безжирова маса — дорослі з силовими тренуваннями; від 60 років — Yao 2026; витривалість — Fernández-Landa 2023; пам’ять — Xu 2024; нирки — метааналіз у «Докази й межі» твердження «Функція нирок».</p></section>
<section class="bc-safety" aria-labelledby="cr-safety-title"><h2 id="cr-safety-title">Перш ніж приймати</h2><ul><li><b>Здаєш аналіз крові на нирки?</b> Креатин може трохи підвищити креатинін, і розрахована фільтрація нирок виглядатиме гіршою без реальної шкоди. Скажи лікарю, що приймаєш креатин.</li><li><b>Є хвороба нирок?</b> Безпеку для людей із хворобами нирок не досліджено — спершу лікар.</li><li><b>Підліток, вагітність або годування груддю</b> — самостійно не варто: даних про безпеку мало.</li></ul><p class="pc-note">У середньому побічних ефектів не більше, ніж на плацебо; іноді бувають скарги на шлунок, особливо від великих разових доз.</p></section>`;
  // Folded to keep the phone page short: the key numbers of these Claims are already in «Що змінюється» and «Перш ніж приймати».
  const claims = `<details class="cr-fold" id="creatine-more-claims"><summary>Інші питання: витривалість, вік 60+, пам’ять, безпека · ${moreModule.claimIds.length}</summary><div class="eua-claim-grid bc-claims" data-creatine-more>${moreModule.claimIds.map(CompactClaim).join('')}<dialog class="eua-dialog" data-creatine-more-dialog aria-label="Докази до твердження про креатин"><div data-evidence-content></div></dialog></div></details>`;
  const not = `<section class="pc-not" aria-labelledby="cr-not-title"><h2 id="cr-not-title">Чого ми не стверджуємо</h2>${moreModule.notClaimed.map(n => `<article><h3>${e(n.topic)}</h3><p>${e(n.reason)}</p></article>`).join('')}</section><details class="pc-more"><summary>Межі досліджень</summary><ul>${moreModule.commonLimits.map(l => `<li>${e(l)}</li>`).join('')}</ul></details>`;
  const sources = `<h3 class="cr-more-title">Джерела до інших питань</h3><div class="eua-source-grid">${more.sources.map(s => SourceCard(s, more.records.filter(r => r.sourceId === s.id), true, 'creatine-more-source', 3)).join('')}</div>`;
  return {top, claims, not, sources};
}

const css = `#creatine{--pc-line:#2f3b40;--pc-cyan:#65ddf2;--pc-cyan-soft:#b9f5ff;--pc-gold:#e7bd46;--pc-muted:#b8bdc6}
#creatine .cr-notes{margin:14px 0 0}
#creatine .cr-notes>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:#a9d7e7;font-weight:600}
#creatine .cr-notes>summary:focus-visible{outline:2px solid #96e7ff;outline-offset:4px}
#creatine .cr-lead{color:#e5dfcf;line-height:1.6;font-weight:600;max-width:760px}
#creatine .cr-fold{margin:0;border-top:1px solid #2f3b40;padding:4px 0}
#creatine .eua-block.cr-fold{margin:0;padding-top:4px;padding-bottom:4px}
#creatine .cr-fold[open]{padding-bottom:20px}
#creatine .cr-fold>summary{cursor:pointer;min-height:48px;display:flex;align-items:center;color:#a9d7e7;font-size:clamp(17px,2.2vw,22px);font-weight:700;list-style:none;padding:6px 0}
#creatine .cr-fold>summary::before{content:"+";display:inline-grid;place-items:center;width:28px;height:28px;margin-right:12px;border:1px solid #2f3b40;border-radius:50%;font-size:16px;color:#e7bd46;flex:0 0 auto}
#creatine .cr-fold[open]>summary::before{content:"−"}
#creatine .cr-fold>summary::-webkit-details-marker{display:none}
#creatine .cr-fold>summary:focus-visible{outline:2px solid #96e7ff;outline-offset:4px}
#creatine .cr-more-title{font-size:clamp(20px,2.4vw,26px);margin:36px 0 14px}
#creatine .cr-noci .bc-dot{background:transparent;border:2px solid #b9f5ff}
#creatine .eua-content{display:block}
#creatine .eua-section-nav{display:none}`;

const ui = `// Generated by scripts/build-creatine-more.mjs. Evidence drawer for the additional creatine Claims.
import {creatineMoreBase} from './creatine-more-data.js?v=1';
import {mountEvidenceDrawer} from './components.js?v=2.0';
const root = typeof document !== 'undefined' ? document.querySelector('[data-creatine-more]') : null;
if (root) mountEvidenceDrawer(root, creatineMoreBase, {dialogSelector: '[data-creatine-more-dialog]'});
`;

export async function buildCreatineMore() {
  const src = fs.readFileSync(path.join(root, 'src/evidence/supplements/creatine-more/module.mjs'), 'utf8');
  if (!src.includes("from '../../core/registry.mjs'")) throw Error('Registry import changed');
  fs.writeFileSync(path.join(out, 'creatine-more-data.js'), '// Generated from src/evidence/supplements/creatine-more/module.mjs.\n' + src.replace("from '../../core/registry.mjs'", "from './registry.js'"));
  fs.writeFileSync(path.join(out, 'creatine-more-ui.js'), ui);
  const parts = await creatineMoreParts();
  let html = fs.readFileSync(indexPath, 'utf8');
  for (const [key, content] of Object.entries({TOP: parts.top, CLAIMS: parts.claims, NOT: parts.not, SOURCES: parts.sources})) {
    const re = new RegExp(`(<!-- CREATINE-MORE:${key}:START -->)[\\s\\S]*?(<!-- CREATINE-MORE:${key}:END -->)`);
    if (!re.test(html)) throw Error('CREATINE-MORE marker missing: ' + key);
    html = html.replace(re, (_, a, z) => a + content + z);
  }
  html = html.replace(/<style data-creatine-more-style>[\s\S]*?<\/style>/g, '').replace(/<script[^>]*data-creatine-more-script[^>]*><\/script>/g, '');
  html = html.replace('</head>', '<style data-creatine-more-style>' + css + '</style></head>');
  html = html.replace('</body>', '<script type="module" src="./evidence/creatine-more-ui.js?v=1" data-creatine-more-script></script></body>');
  fs.writeFileSync(indexPath, html);
}
