import {sources,organelles,cellKnowledge} from './cell-lab-data.js?v=56';

const topics={
 'SRC-CELL-TEXT-001':{title:'Органели та цитоскелет',chapter:'3.2'},
 'SRC-CELL-TEXT-002':{title:'Ядро та ядерце',chapter:'3.3'},
 'SRC-CELL-TEXT-003':{title:'Мембрана та обмін',chapter:'3.1'}
};
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const countLabel=count=>`${count} ${count%10===1&&count%100!==11?'структура':count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?'структури':'структур'}`;
const disclosure=(label,value)=>`${label}: ${!value||value.status==='not_checked'?'ще не перевірено за повним текстом.':value.summary||value.status}`;

export function renderCellSources(){
 return sources.map(source=>{
  const topic=topics[source.id],structures=organelles.filter(o=>o.sourceIds.includes(source.id)),records=cellKnowledge.records.filter(record=>record.sourceId===source.id);
  const publicationNote=source.sourceStatus==='not_checked'?'Статус публікації ще не перевірено.':`Статус публікації: ${source.sourceStatus}.`;
  const reviewNote=records.some(record=>record.reviewStatus==='pending')?'Науковий перегляд пояснень не завершено.':'';
  return `<article class="cell-source-card" id="source-${escapeHTML(source.id)}">
<div class="cell-source-heading"><p class="cell-source-kicker"><span>Розділ ${escapeHTML(topic.chapter)}</span><span class="cell-source-count">${escapeHTML(countLabel(structures.length))}</span></p><h3 class="cell-source-title">${escapeHTML(topic.title)}</h3><p class="cell-source-citation">${escapeHTML(source.shortCitation)} · ${escapeHTML(source.year)}</p></div>
<p class="cell-source-scope">${escapeHTML(source.scope)}</p>
<p class="cell-source-structure-label">Структури в цьому розділі</p>
<ul class="cell-source-structures" aria-label="Структури розділу: ${escapeHTML(topic.title)}">${structures.map(o=>`<li><button type="button" data-organelle="${escapeHTML(o.id)}" data-source-jump="true" aria-controls="organelle-panel" aria-pressed="false">${escapeHTML(o.label)}</button></li>`).join('')}</ul>
<a class="cell-source-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer" aria-label="Відкрити розділ: ${escapeHTML(topic.title)}">Відкрити розділ</a>
<details class="cell-source-details"><summary>Пояснення та перевірка джерела</summary><p class="cell-source-original-title"><strong>Оригінальний розділ:</strong> ${escapeHTML(source.title)}</p>
<div class="cell-source-records">${records.map(record=>`<div class="cell-source-record"><h4>${escapeHTML(record.outcome.name)}</h4><p>${escapeHTML(record.result.summary)}</p><p class="cell-source-locator"><strong>Місце в джерелі:</strong> ${escapeHTML(record.extractionLocator)}</p></div>`).join('')}</div>
<div class="cell-source-limitations"><h4>Межі джерела</h4><ul>${source.keyLimitations.map(limit=>`<li>${escapeHTML(limit)}</li>`).join('')}</ul></div>
<div class="cell-source-checks"><h4>Стан перевірки</h4><p>${escapeHTML(publicationNote)}</p><p>${escapeHTML(disclosure('Фінансування',source.funding))}</p><p>${escapeHTML(disclosure('Конфлікти інтересів',source.conflicts))}</p><p>Перевірка метаданих: ${escapeHTML(source.lastChecked)}. Це дата звірення метаданих джерела.</p>${reviewNote?`<p>${escapeHTML(reviewNote)}</p>`:''}</div></details>
</article>`;
 }).join('');
}
