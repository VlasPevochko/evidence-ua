import {escapeHTML as e} from './components.mjs';
import {publishedStudyNotes} from '../supplements/published-study-notes.mjs';

const number = value => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 3}).format(value);
export function DossierPanel(d) {
 const note=publishedStudyNotes[d.id];
 const html=BaseDossierPanel(d);
 if(!note)return html;
 const block=`<article class="dossier-study-note" aria-labelledby="${e(d.route)}-study-title"><h3 id="${e(d.route)}-study-title">${e(note.title)}</h3><p>${e(note.summary)}</p><p>${e(note.context)}</p><details class="dossier-reason"><summary>Результати, джерело та межі висновку</summary>${note.results.map(r=>`<p><strong>${e(r.label)}</strong>: ${e(r.metricLabel || 'стандартизована різниця середніх')} ${number(r.estimate)}; 95% ДІ ${number(r.lower)}…${number(r.upper)}.</p>`).join('')}<ul>${note.limitations.map(l=>`<li>${e(l)}</li>`).join('')}</ul><p>${e(note.source.title)} · ${note.source.year}. ${e(note.source.locator)}.</p><a href="${e(note.source.url)}" target="_blank" rel="noopener noreferrer">PubMed · PMID ${e(note.source.pmid)} ↗</a><p>Фінансування й конфлікти інтересів: ще не перевірено за повним текстом.</p><p>Рівень впевненості Evidence UA не оцінено.</p></details></article>`;
 const readyBlock=note.source.fundingNote ? block.replace('Фінансування й конфлікти інтересів: ще не перевірено за повним текстом.',e(note.source.fundingNote)) : block;
 return html.replace(`<article id="${d.route}-dossier-context">`,readyBlock+`<article id="${d.route}-dossier-context">`);
}

// An editorial dossier is not an assessed Claim or an outcome Evidence Record.
// Existing prose is migrated verbatim; verified Claims can be linked later.
export function validateDossiers(dossiers){
 const ids=new Set(),routes=new Set();
 for(const d of dossiers){
  if(ids.has(d.id)||routes.has(d.route))throw Error('Duplicate dossier');
  ids.add(d.id);routes.add(d.route);
  if(d.confidenceAssessment!=='not_assessed'||d.lastScientificReview!==null)throw Error('Migration cannot manufacture scientific review');
  if(!d.existingConclusion||!d.sources.length)throw Error('Incomplete existing content: '+d.id);
  for(const s of d.sources)if(!/^https:\/\/(pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/|ods\.od\.nih\.gov\/)/.test(s.url))throw Error('Not an identified source: '+s.url);
 }
 return dossiers;
}
function BaseDossierPanel(d){
 const p=d.route+'-dossier';
 const sources=d.sources.map(s=>`<article class="dossier-source"><h4>${e(s.role==='selected_publication'?d.sourceContext:'NIH ODS — довідковий матеріал')}</h4><p>${e(s.role==='selected_publication'?'Вибрана публікація зі старого досьє; конкретні результати ще не структуровано.':'Джерело базових пояснень, не автоматичний доказ ефективності.')}</p><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${s.url.includes('pubmed')?'PubMed · PMID '+e(s.url.match(/\/(\d+)\//)[1]):'Відкрити довідник NIH'} ↗</a><p>Фінансування й конфлікти інтересів: ще не перевірено за повним текстом</p></article>`).join('');
 return `<div class="dossier-panel" data-dossier-id="${e(d.id)}" id="${p}"><p class="dossier-status">Попередній огляд · рівні впевненості не оцінено</p><h2>Досьє: що відомо та що ще перевіряємо</h2><p>Наявний матеріал перенесено без зміни висновків. Повна оцінка доказів ще не завершена.</p><nav aria-label="Розділи досьє ${e(d.title)}"><a href="#${p}-conclusion">Висновок</a><a href="#${p}-context">Практичні орієнтири</a><a href="#${p}-limits">Обмеження</a><a href="#${p}-sources">Джерела</a></nav><article id="${p}-conclusion"><h3>Поточний висновок</h3><p>${e(d.existingConclusion)}</p><details class="dossier-reason"><summary>Чому ми так стверджуємо?</summary><h4>Основа поточного тексту</h4><p>${e(d.sourceContext)}</p><p>Наведені нижче джерела збережено з попередньої сторінки. Їхню відповідність кожному окремому твердженню ще потрібно перевірити; саме посилання на статтю не є доказом усіх висновків.</p><h4>Що потрібно перевірити</h4><ul>${d.pendingFields.map(f=>`<li>${e(f)} — ще не перевірено.</li>`).join('')}</ul><p>Рівень впевненості не оцінено. Це не те саме, що «низька впевненість» або «недостатньо даних» після оцінювання.</p>${d.route==='supplement-collagen'?'<p>Рівні певності у попередньому тексті належать авторам огляду, а не власній оцінці Evidence UA.</p>':''}${d.route==='supplement-vitd'?'<p>Основне джерело — одне рандомізоване дослідження, а не сукупний огляд доказів.</p>':''}${d.route==='supplement-magnesium'?'<p>Основне джерело — довідник NIH, а не систематичний огляд ефективності.</p>':''}</details></article><article id="${p}-context"><h3>Практичні орієнтири</h3><p>${e(d.practicalGuidance)}</p><p>Практичний текст не оформлено як окреме оцінене наукове твердження.</p></article><article id="${p}-limits"><h3>Обмеження</h3><p>${e(d.limitations)}</p><p>Пошук усіх релевантних досліджень і аналіз суперечливих результатів не завершено.</p></article><details id="${p}-sources"><summary>Джерела та їхній статус</summary><div class="dossier-source-grid">${sources}</div></details><footer><p>Науковий перегляд: не завершено.</p><p>Версія структури: ${e(d.version)} · Перенесення матеріалу: <time datetime="${e(d.migratedAt)}">11 жовтня 2026 року</time>.</p><p>Матеріал освітній і не є персональною медичною рекомендацією.</p></footer></div>`;
}
