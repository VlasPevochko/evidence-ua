// Блок «Нове на сайті» на головній (бриф T4, 2026-11-02): три картки різної форми замість трьох однакових.
// Усе, що можна взяти з даних, береться з тих самих даних, що й сторінки, на які ведуть картки (дослідження, схеми, журнал),
// тому картки не можуть розійтися зі сторінками. Головна має працювати без JavaScript, тож розмітка збирається під час збірки.
//
// Картка А «Дослідження простими словами»: одне питання з дослідженням, що має графік, і мініатюра цього графіка (T1).
//   Яке саме дослідження, вирішив власник (D6): беремо з ручного списку «Останні розбори» (.home-fresh-latest), нове поле дати не заводимо.
// Картка Б «Як це працює»: два нерухомі кадри схеми кофеїну (аденозин на рецепторі; кофеїн займає місце). Положення молекул узято з кроків 2 і 3
//   схеми на сторінці mechanisms.html; tests/home-fresh-cards.test.mjs звіряє їх із mechanisms-page.css, тому кадри не вигадані.
// Картка В «Що нового й що перевірено»: три останні записи журналу з датами з dist/changes-data.js (найновіші першими). Дат у цьому файлі немає.
//
// Одне посилання на картку (вся картка). Малюнки декоративні (aria-hidden), підписи під кадрами звичайний текст.
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const MONTHS=['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
// '2026-11-02' -> '2 листопада' (рік не показуємо: це три найновіші записи).
export function shortDate(iso){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if(!match)throw new Error(`The journal date must be YYYY-MM-DD, got ${JSON.stringify(iso)}`);
  const month=Number(match[2]);
  if(month<1||month>12)throw new Error(`The journal month is out of range: ${iso}`);
  return `${Number(match[3])} ${MONTHS[month-1]}`;
}
export const plural=(count,forms)=>forms[new Intl.PluralRules('uk').select(count)]||forms.many;

// Кадри схеми кофеїну. Числа збігаються з mechanisms-page.css: [data-scene="caffeine"][data-stage="2"|"3"] (координати молекул у системі 640 × 330).
export const FRAMES=[
  {stage:2,lamp:1,mols:[['ad',160,200],['ad',320,200],['ad',480,200],['ad',80,110],['ad',400,115],['ad',570,95]]},
  {stage:3,lamp:0.22,mols:[['ad',90,100],['ad',250,60],['ad',410,125],['ad',560,80],['ad',330,140],['ad',30,150],['cf',160,200],['cf',320,200],['cf',480,200]]}
];
const SOCKETS=[160,320,480];
const HEXAGON='-9,-16 9,-16 18,0 9,16 -9,16 -18,0';
function frameSVG(frame){
  const molecule=([kind,x,y])=>kind==='ad'
    ?`<g class="fp-ad" transform="translate(${x},${y})"><circle r="16"/><rect x="-5" y="12" width="10" height="10" rx="2"/></g>`
    :`<g class="fp-cf" transform="translate(${x},${y})"><polygon points="${HEXAGON}"/><rect x="-5" y="12" width="10" height="10" rx="2"/></g>`;
  return `<svg class="fp-svg" viewBox="40 56 560 262" focusable="false" aria-hidden="true"><rect class="fp-space" x="0" y="0" width="640" height="204"/><rect class="fp-membrane" x="0" y="204" width="640" height="38"/><rect class="fp-cell" x="0" y="242" width="640" height="88"/>`
    +SOCKETS.map(x=>`<path class="fp-socket" transform="translate(${x},204)" d="M-34 0h68v16q0 26-34 26t-34-26z"/>`).join('')
    +SOCKETS.map(x=>`<circle class="fp-lamp" cx="${x}" cy="288" r="13" style="opacity:${frame.lamp}"/>`).join('')
    +frame.mols.map(molecule).join('')+'</svg>';
}

// data: {studies, latestStudyId, changes, science, scenes, miniInterval}
export function homeFreshGridHTML({studies,latestStudyId,changes,science,scenes,miniInterval}){
  const study=studies.find(item=>item.id===latestStudyId);
  if(!study||!study.chart)throw new Error(`The featured write-up «${latestStudyId}» must exist and have a chart`);

  const studyCard=`<a class="home-fresh-card home-fresh-card--study" href="./research.html"><span class="home-fresh-tag">${studies.length} розборів</span><strong class="home-fresh-question">${esc(study.question)}</strong><span class="home-fresh-summary">Питання, коротка відповідь і чого дослідження не доводить. Можна прочитати лише відповідь.</span><span class="home-fresh-foot"><span class="home-fresh-go" aria-hidden="true">Читати розбори →</span>${miniInterval(study.chart)}</span></a>`;

  const steps=scenes.caffeine;
  const animations=Object.keys(scenes).length;
  const frames=FRAMES.map(frame=>`<span class="home-fresh-frame">${frameSVG(frame)}<span class="home-fresh-cap">${esc(steps[frame.stage-1].tab)}</span></span>`).join('<span class="home-fresh-then" aria-hidden="true">→</span>');
  const schemeCard=`<a class="home-fresh-card home-fresh-card--scheme" href="./mechanisms.html"><span class="home-fresh-tag">${animations} ${plural(animations,{one:'анімація',few:'анімації',many:'анімацій'})}</span><strong>Як це працює</strong><span class="home-fresh-frames">${frames}</span><span class="home-fresh-summary">Кофеїн і аденозин, фосфокреатин і АТФ: схеми, які рухаються крок за кроком.</span><span class="home-fresh-go" aria-hidden="true">Дивитись схеми →</span></a>`;

  // Найновіші записи першими: групи в журналі йдуть від нової дати до старої, записи в групі від новішого до старішого.
  const entries=changes.flatMap(group=>group.items.map(item=>({date:group.date,...item}))).slice(0,3);
  if(entries.length<3)throw new Error('The journal needs at least three entries for the home card');
  const note=entries.every(entry=>entry.science==='none')?science.none:science.new;
  // Записи з однаковою датою стоять під одним заголовком дати: три записи за один день не повторюють дату тричі.
  const groups=[];
  for(const entry of entries){const last=groups.at(-1);if(last&&last.date===entry.date)last.titles.push(entry.title);else groups.push({date:entry.date,titles:[entry.title]});}
  const list=groups.map(group=>`<div class="home-fresh-day"><time datetime="${esc(group.date)}">${shortDate(group.date)}</time><ul>${group.titles.map(title=>`<li>${esc(title)}</li>`).join('')}</ul></div>`).join('');
  const journalCard=`<a class="home-fresh-card home-fresh-card--journal" href="./changes.html"><span class="home-fresh-tag">Журнал</span><strong>Що нового й що перевірено</strong><span class="home-fresh-journal">${list}</span><span class="home-fresh-note">${esc(note)}</span><span class="home-fresh-go" aria-hidden="true">Відкрити журнал →</span></a>`;

  return `\n${studyCard}\n${schemeCard}\n${journalCard}\n`;
}
