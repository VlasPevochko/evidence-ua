// «Одне твердження наживо» на головній (рішення власника «2 і 3», 2026-11-17; docs/HOME_FIRST_SCREEN.md).
// Під героєм стоїть одне справжнє твердження сайту з усім, що робить його твердженням Evidence UA: рівень впевненості з позначкою, що оцінка
// попередня; кого стосується й з чим порівнювали; наскільки великий ефект; межа висновку; джерело. Нового наукового тексту тут немає:
// усе береться з тих самих записів, з яких збирається розбір креатину (dist/evidence/data.js), а збірка зупиняється, якщо чогось бракує.
//
// Лінійка ефекту: точки це середні оцінки (Hedges g) із записів доказів. Довірчих інтервалів у записах немає, тому лінійка їх не малює
// й прямо про це каже. Позначки «малий / середній / великий» стоять на 0,2 / 0,5 / 0,8: тими самими словами сайт описує ці числа
// в розборі цього ж метааналізу (research-data.js, «creatine-rt»: «g = 0,54 і 0,55, тобто середній»).
// Модуль чистий (без DOM і файлів).
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const HOME_CLAIM_ID='CLM-000001';
export const CONFIDENCE_STEPS=[['very_low','Дуже низька'],['low','Низька'],['moderate','Помірна'],['high','Висока']];
export const EFFECT_MARKS=[[0.2,'малий'],[0.5,'середній'],[0.8,'великий']];
export const EFFECT_MAX=1;
const decimal=value=>String(value).replace('.',',');

// data: {claim, records, source}; confidenceLabels: та сама таблиця, що на картках (src/evidence/core/components.mjs).
export function homeClaimHTML({claim,records,source},confidenceLabels){
  const fail=what=>{throw new Error(`The home claim ${HOME_CLAIM_ID} needs ${what}`);};
  if(!claim||claim.id!==HOME_CLAIM_ID)fail('its claim record');
  if(!claim.shortStatement||!claim.population?.description||!claim.comparator?.description)fail('a short statement, population and comparator');
  if(!CONFIDENCE_STEPS.some(([key])=>key===claim.evidenceConfidence)||!confidenceLabels[claim.evidenceConfidence])fail('an assessed confidence level');
  const effects=(records||[]).filter(record=>record.claimId===claim.id&&record.direction==='supports_claim'&&record.result?.effectMeasure==='Hedges_g'&&Number.isFinite(record.result.estimate));
  if(effects.length<1)fail('at least one Hedges g estimate in its evidence records');
  if(effects.some(record=>record.result.estimate<0||record.result.estimate>EFFECT_MAX))fail(`estimates between 0 and ${EFFECT_MAX}`);
  if(!source||!source.shortCitation||!/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/.test(source.pubmedUrl||''))fail('its source with a PubMed address');
  if(effects.some(record=>record.sourceId!==source.id))fail('every estimate to come from the shown source');
  const limit=(claim.limitations||[])[0];
  if(!limit)fail('a stated limitation');

  const level=CONFIDENCE_STEPS.findIndex(([key])=>key===claim.evidenceConfidence);
  // Підпис рівня: те саме слово, що на шкалі (на картках розбору це «Висока впевненість»; тут слово «впевненість» уже стоїть перед ним).
  const levelLabel=CONFIDENCE_STEPS[level][1].toLowerCase();
  const steps=CONFIDENCE_STEPS.map(([key,label],index)=>`<li class="home-claim-step${index<=level?' is-reached':''}${index===level?' is-current':''}"${index===level?' aria-current="true"':''}><span>${esc(label)}</span></li>`).join('');
  const at=value=>`${Math.round(value/EFFECT_MAX*1000)/10}%`;
  const marks=EFFECT_MARKS.map(([value,label])=>`<li class="home-claim-mark" style="--at:${at(value)}"><span>${esc(label)}</span><span class="home-claim-mark-value">${decimal(value)}</span></li>`).join('');
  // Один спільний grid на всю лінійку: рядки результатів і рядок засічок мають ті самі колонки, тож засічка 0,5 стоїть точно під серединою лінії.
  const rows=effects.map(record=>`<li class="home-claim-effect"><span class="home-claim-effect-name">${esc(record.outcome.name)}</span><span class="home-claim-track" aria-hidden="true"><i class="home-claim-dot" style="--at:${at(record.result.estimate)}"></i></span><span class="home-claim-effect-value">g = ${decimal(record.result.estimate)}</span></li>`).join('');

  return `<section class="home-claim" aria-labelledby="home-claim-title" data-home-claim="${esc(claim.id)}">`
    +`<p class="home-claim-eyebrow">Як виглядає твердження на Evidence UA</p>`
    +`<h2 id="home-claim-title">${esc(claim.shortStatement)}</h2>`
    +`<div class="home-claim-level"><p class="home-claim-label">Впевненість: <strong>${esc(levelLabel)}</strong>${claim.provisional?' <span class="home-claim-provisional">· попередня оцінка, науковий перегляд триває</span>':''}</p>`
    +`<ol class="home-claim-steps" aria-label="Чотири рівні впевненості">${steps}</ol></div>`
    +`<dl class="home-claim-scope"><div><dt>Кого стосується</dt><dd>${esc(claim.population.description)}</dd></div><div><dt>З чим порівнювали</dt><dd>${esc(claim.comparator.description)}</dd></div></dl>`
    +`<figure class="home-claim-ruler"><figcaption>Наскільки великий ефект</figcaption>`
    +`<ul class="home-claim-effects">${rows}<li class="home-claim-scale" aria-hidden="true"><ul class="home-claim-marks">${marks}</ul></li></ul>`
    +`<p class="home-claim-note">Точка: середня оцінка з метааналізу (Hedges g). Меж похибки для неї на сайті поки немає.</p></figure>`
    // Межа висновку й повне джерело згорнуті (CLAUDE.md, «службове згорнуте, але не видалене»): так картка вкладається в телефон.
    // Це звичайний <details>: відкривається без JavaScript, а в друку показується відкритим (dist/home-claim.css).
    +`<details class="home-claim-more"><summary>Межа висновку й джерело</summary>`
    +`<p class="home-claim-limit"><strong>Межа:</strong> ${esc(limit)}</p>`
    +`<p class="home-claim-source">Джерело: ${esc(source.shortCitation)}</p></details>`
    +`<p class="home-claim-links"><a class="home-claim-open" href="./creatine.html#evidence-card">Усі твердження про креатин <span aria-hidden="true">→</span></a><a class="home-claim-pubmed" href="${esc(source.pubmedUrl)}" rel="noopener">Джерело в PubMed <span aria-hidden="true">↗</span></a></p>`
    +`</section>`;
}
