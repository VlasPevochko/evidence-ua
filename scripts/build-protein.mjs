// Протеїн: renders the approved protein module into the existing #supplement-protein card on the home page.
// Idempotent: replaces only the content between PROTEIN markers, the protein style and the protein script tag.
import fs from 'node:fs';
import path from 'node:path';
import {proteinBase, proteinModule} from '../src/evidence/supplements/protein/module.mjs';
import {ConfidenceBadge, SourceCard, claimButton, escapeHTML as e} from '../src/evidence/core/components.mjs';

const root = process.cwd();
const indexPath = path.join(root, 'dist/index.html');
const out = path.join(root, 'dist/evidence');

for (const c of proteinBase.claims) {
  if (c.evidenceConfidence !== null) throw Error('Protein Claims must not show a confidence level before assessment: ' + c.id);
  if (!c.publicationApproved || c.publicationAcceptance?.kind !== 'user_wording_approval') throw Error('Protein Claim wording not approved: ' + c.id);
}
for (const id of proteinModule.claimIds) if (!proteinBase.claims.some(c => c.id === id)) throw Error('Unknown protein Claim: ' + id);

const record = id => proteinBase.records.find(r => r.id === id);
const num = x => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 2}).format(x);
// Training-only gains from Morton 2018 full text (Discussion): 1RM 27 ± 22 kg; FFM 1.1 ± 1.2 kg.
const scale = [
  {title: 'Сила, 1ПМ', training: 27, protein: record('EVR-000016').result.estimate, unit: 'кг'},
  {title: 'Безжирова маса', training: 1.1, protein: record('EVR-000017').result.estimate, unit: 'кг'}
];
const plateau = record('EVR-000104').result, noTraining = record('EVR-000106').result;
const sign = x => (x < 0 ? '−' : '') + num(Math.abs(x));

// Compact Claim cards (owner request 2026-10-21: improve the card, shorter on phones): statement, status and
// the evidence drawer; full summaries, context and limitations open in the drawer, as in the other dossiers.
function CompactClaim(id) {
  const c = proteinBase.claims.find(x => x.id === id);
  return `<article class="eua-claim bc-claim" data-claim-id="${e(c.id)}"><div class="eua-kicker">Ефект · люди</div><h3>${e(proteinBase.presentation.labels[id])}</h3><p class="eua-statement">${e(c.shortStatement)}</p>${ConfidenceBadge(c)}${claimButton(id, 'Докази й межі')}</article>`;
}

export function ProteinCard() {
  const cards = proteinModule.claimIds.map(CompactClaim).join('');
  const sources = proteinBase.sources.map(s => SourceCard(s, proteinBase.records.filter(r => r.sourceId === s.id), true, 'protein-source', 3)).join('');
  return `<div class="eua-module pc bc" data-protein-card>
<div class="base-intro"><div class="base-copy"><h2 class="pc-headline">Працює разом із тренуваннями</h2><p class="base-definition">Протеїн — це білок, який ми отримуємо з їжі: молочних продуктів, яєць, риби, м’яса, бобових. Протеїновий порошок — лише зручне додаткове джерело білка.</p><p class="pc-lead">Додатковий білок трохи збільшує приріст сили й безжирової маси, але тільки тоді, коли є силові тренування. Головний результат дають самі тренування.</p></div><div class="base-art" style="--base-x:25%;--base-y:0%" aria-hidden="true"></div></div>
<section class="pc-scale" aria-labelledby="pc-scale-title"><h2 id="pc-scale-title">Масштаб ефекту</h2><p class="pc-sub">Середній приріст за 6–52 тижні силових тренувань (метааналіз Morton, 49 РКД).</p><div class="pc-bars">${scale.map(s => `<div class="pc-bar-group"><h3>${e(s.title)}</h3><div class="pc-row"><span>Тренування</span><div class="pc-track"><i style="width:100%"></i></div><b>≈ +${num(s.training)} ${s.unit}</b></div><div class="pc-row pc-p"><span>+ білок</span><div class="pc-track"><i style="width:${(s.protein / s.training * 100).toFixed(1)}%"></i></div><b>+${num(s.protein)} ${s.unit}</b></div></div>`).join('')}</div><p class="pc-foot">Ширина смуги — частка від приросту лише від тренувань. Середні значення, не прогноз для конкретної людини.</p></section>
<div class="pc-facts"><div><span>Орієнтир</span><strong>≈ ${num(1.6)} г/кг/добу</strong><small>загального білка з їжею. Межа невизначена: ${num(plateau.lowerCI)}–${num(plateau.upperCI)}</small></div><div><span>Без тренувань</span><strong>ефекту не виявлено</strong><small>на силу: +${num(noTraining.estimate)}% (ДІ від ${sign(noTraining.lowerCI)} до ${sign(noTraining.upperCI)})</small></div><div><span>Рівень впевненості</span><strong>не оцінено</strong><small>формального наукового перегляду ще не було</small></div></div>
<h2 class="pc-h2">Твердження й докази</h2><div class="eua-claim-grid bc-claims">${cards}</div>
<section class="pc-not" aria-labelledby="pc-not-title"><h2 id="pc-not-title">Чого ми не стверджуємо</h2>${proteinModule.notClaimed.map(n => `<article><h3>${e(n.topic)}</h3><p>${e(n.reason)}</p></article>`).join('')}</section>
<details class="pc-more"><summary>Практично: чи потрібна добавка</summary><ul><li><strong>Білка в раціоні вистачає?</strong> Порошок може бути необов’язковим. Звичайна їжа теж постачає білок.</li><li><strong>Незручно добирати білок їжею?</strong> Добавка може допомогти закрити цю прогалину.</li><li><strong>На упаковці написано «protein»?</strong> Подивися, скільки грамів білка містить порція і який склад. Сам напис не показує, чи потрібна покупка.</li><li><strong>Хочеш витратити розумно?</strong> Порівняй вартість однакової кількості білка у звичайних продуктах і добавках.</li></ul><p class="pc-note">Це практичні орієнтири редакції, а не результат досліджень: метааналізи не порівнювали ціни й продукти.</p></details>
<details class="pc-more"><summary>Джерела (${proteinBase.sources.length})</summary><div class="eua-source-grid">${sources}</div><p class="pc-links"><a href="protein-meta.html">Простою мовою: як читати метааналіз Morton</a><a href="https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/" target="_blank" rel="noopener noreferrer">NIH ODS — білок і спортивні добавки ↗</a></p></details>
<p class="pc-status">Науковий перегляд: не завершено · Формулювання погоджено 18 жовтня 2026 року · Матеріал освітній і не є персональною медичною рекомендацією.</p>
<dialog class="eua-dialog" data-protein-dialog aria-label="Докази до твердження про протеїн"><div data-evidence-content></div></dialog>
</div>`;
}

const css = `:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc{--pc-line:#2f3b40;--pc-cyan:#65ddf2;--pc-cyan-soft:#b9f5ff;--pc-gold:#e7bd46;--pc-muted:#b8bdc6;margin-top:8px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-headline{font-size:clamp(23px,3vw,34px);line-height:1.3;margin:0 0 16px;color:var(--pc-cyan-soft);text-wrap:balance}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-lead{color:#e5dfcf;line-height:1.6;font-weight:600}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-scale{margin:32px 0 16px;padding:clamp(20px,3vw,32px);border:1px solid var(--pc-line);border-radius:16px;background:linear-gradient(135deg,#16242a,#101517 70%)}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc h2.pc-h2,:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-scale h2,:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-not h2{font-size:clamp(24px,3vw,34px);line-height:1.2;margin:0 0 8px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-sub,:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-foot{color:var(--pc-muted);font-size:14px;line-height:1.6;margin:0}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-foot{margin-top:18px;font-size:13px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-bars{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:22px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-bar-group h3{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a5c9d1;margin:0 0 12px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-row{display:grid;grid-template-columns:92px minmax(0,1fr) 84px;align-items:center;gap:12px;margin:10px 0;font-size:14px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-row span{color:var(--pc-muted)}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-row b{text-align:right;font-variant-numeric:tabular-nums}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-track{height:14px;border-radius:8px;background:#ffffff0d;overflow:hidden}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-track i{display:block;height:100%;border-radius:8px;background:#5d6b7a}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-p .pc-track i{background:var(--pc-cyan);min-width:6px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-p b,:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-p span{color:var(--pc-cyan-soft)}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:0 0 44px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-facts div{border:1px solid var(--pc-line);border-radius:16px;padding:20px;background:#111416;min-width:0}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-facts span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a5c9d1}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-facts strong{display:block;font-size:clamp(22px,2.6vw,30px);margin:10px 0 6px;color:var(--pc-cyan-soft)}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-facts small{color:var(--pc-muted);line-height:1.5;font-size:13px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc h2.pc-h2{margin-bottom:18px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-not{margin:44px 0 0;padding-top:28px;border-top:1px solid var(--pc-line)}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-not article{border-left:3px solid var(--pc-gold);background:#211f19;padding:14px 18px;margin:12px 0;border-radius:0 10px 10px 0}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-not h3{margin:0 0 6px;font-size:17px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-not p{margin:0;color:#d3cfc5;line-height:1.6;font-size:15px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-more{margin-top:24px;border-top:1px solid var(--pc-line);padding-top:6px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-more>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:#a9d7e7;font-size:16px;font-weight:600}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-more li{margin-bottom:12px;line-height:1.65;color:#d9dede}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-note,:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-status{color:var(--pc-muted);font-size:13px;line-height:1.7}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-links{display:flex;flex-wrap:wrap;gap:8px 24px}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-links a{display:inline-flex;align-items:center;min-height:44px;color:#8bdefb}
:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-status{margin-top:28px}
@media(max-width:760px){:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-bars,:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-facts{grid-template-columns:1fr}:is(#supplement-protein,#supplement-berberine,#supplement-omega,#supplement-vitd) .pc-row{grid-template-columns:78px minmax(0,1fr) 72px;gap:8px;font-size:13px}}`;

const ui = `// Generated by scripts/build-protein.mjs. Opens the evidence drawer for protein Claims.
import {proteinBase} from './protein-data.js?v=1';
import {mountEvidenceDrawer} from './components.js?v=1.9';
const root = typeof document !== 'undefined' ? document.getElementById('supplement-protein') : null;
if (root) mountEvidenceDrawer(root, proteinBase, {dialogSelector: '[data-protein-dialog]'});
`;

export function buildProtein() {
  const moduleSource = fs.readFileSync(path.join(root, 'src/evidence/supplements/protein/module.mjs'), 'utf8');
  if (!moduleSource.includes("from '../../core/registry.mjs'")) throw Error('Protein module registry import changed');
  fs.writeFileSync(path.join(out, 'protein-data.js'), '// Generated from src/evidence/supplements/protein/module.mjs.\n' + moduleSource.replace("from '../../core/registry.mjs'", "from './registry.js'"));
  fs.writeFileSync(path.join(out, 'protein-ui.js'), ui);
  let html = fs.readFileSync(indexPath, 'utf8');
  const markers = /(<!-- PROTEIN:START -->)[\s\S]*?(<!-- PROTEIN:END -->)/;
  if (!markers.test(html)) throw Error('PROTEIN markers missing in #supplement-protein');
  html = html.replace(markers, (_, a, b) => a + ProteinCard() + b);
  html = html.replace(/<style data-protein-style>[\s\S]*?<\/style>/g, '').replace(/<script[^>]*data-protein-script[^>]*><\/script>/g, '');
  html = html.replace('</head>', '<style data-protein-style>' + css + '</style></head>');
  html = html.replace('</body>', '<script type="module" src="./evidence/protein-ui.js?v=1" data-protein-script></script></body>');
  fs.writeFileSync(indexPath, html);
}
