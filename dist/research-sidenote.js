// Бічні примітки з джерелами на сторінці розборів (бриф T3, 2026-11-02, рішення D5: примітки лише від 1360 px, колонку не зсуваємо).
// Примітка будується з тих самих даних джерела (STUDIES[].source), що й рядок джерела всередині картки, але стоїть ПОЗА картки: сусідом <details>,
// тому лишається видимою, коли картка згорнута. Жодне речення розбору й жоден текстовий вузол картки не змінюється.
// Нижче 1360 px примітка схована (display:none), а рядок джерела в картці лишається; від 1360 px навпаки: схований рядок у картці, видима примітка.
// Так екранний диктор не зустрічає те саме джерело двічі.
const esc=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const SIDENOTE_MIN_WIDTH=1360;
// Адреса джерела: DOI або сторінка PubMed. Та сама функція будує посилання в картці й у примітці, тож вони не можуть розійтися.
export const sourceHref=source=>source.doi?'https://doi.org/'+source.doi:'https://pubmed.ncbi.nlm.nih.gov/'+source.pmid+'/';
// Пробіл перед стрілкою ↗ у примітці нерозривний: стрілка не лишається сама на новому рядку; видимий підпис той самий («назва ↗»).
// Позначка n: окремий елемент, не частина речень. У картці й у примітці лише для ока (aria-hidden), показується від 1360 px.
export const markHTML=n=>`<sup class="eua-sidenote-mark" aria-hidden="true">${n}</sup>`;
export function sidenoteHTML(study,n,checked){
  return `<aside class="eua-sidenote eua-stamp" role="note" aria-label="Джерело розбору ${n}">${markHTML(n)}<span class="eua-sidenote-type">${esc(study.type)}</span><a href="${esc(sourceHref(study.source))}" target="_blank" rel="noopener noreferrer">${esc(study.source.label)}&nbsp;↗</a><span class="eua-sidenote-checked">Перевірено ${esc(checked)}.</span></aside>`;
}
