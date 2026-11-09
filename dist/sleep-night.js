// Схема ночі для сторінки «Сон і відновлення» (2026-11-09, рішення власника 35).
//
// Це УМОВНИЙ приклад, а не записана ніч і не норма. Він показує лише те, що вже сказано на самій сторінці за матеріалами NIH/NHLBI:
// стадії чергуються, цикл повторюється кілька разів; глибокого сну (N3) зазвичай більше на початку ночі; REM зазвичай більше ближче до ранку.
// Часових одиниць і чисел у схемі немає: «слот» лише ділить умовну ніч на рівні частини (довжина стадій у реальному сні різна, про це сказано в підписі схеми).
//
// Файл чистий (без DOM): його читають і збірка (renderNight будує нерухому розмітку, видиму й без JavaScript), і браузер (геометрія, пошук стадії під курсором),
// і тести (tests/sleep-night.test.mjs перевіряє, що схема справді показує те, що сказано на сторінці).

// Рядки згори донизу, як на гіпнограмі. «Неспання» лише на початку й наприкінці ночі: на сторінці це «перехід від неспання до сну» (N1) і пробудження.
export const STAGES = [
  {id: 'wake', label: 'Неспання'},
  {id: 'rem', label: 'REM'},
  {id: 'n1', label: 'N1'},
  {id: 'n2', label: 'N2'},
  {id: 'n3', label: 'N3'}
];
export const STAGE_IDS = STAGES.map(s => s.id);

// Умовна ніч із п'яти циклів, пари [стадія, довжина в слотах]. Сума довжин = SLOTS.
// Цикли (без першого й останнього «неспання»): 12 + 12 + 12 + 11 + 11 = 58 слотів.
const RAW = [
  ['wake', 1],
  ['n1', 1], ['n2', 3], ['n3', 5], ['n2', 1], ['rem', 2],
  ['n2', 2], ['n3', 4], ['n2', 2], ['rem', 3], ['n1', 1],
  ['n2', 3], ['n3', 2], ['n2', 2], ['rem', 4], ['n1', 1],
  ['n2', 4], ['n3', 1], ['n2', 2], ['rem', 4],
  ['n2', 4], ['rem', 6], ['n2', 1],
  ['wake', 1]
];
export const SLOTS = RAW.reduce((sum, [, len]) => sum + len, 0);
export const SEGMENTS = (() => {
  let start = 0;
  return RAW.map(([stage, len], index) => { const seg = {index, stage, start, len, end: start + len}; start += len; return seg; });
})();

export const rowOf = stage => STAGE_IDS.indexOf(stage);
export const labelOf = stage => (STAGES.find(s => s.id === stage) || {}).label || stage;

// Частка ночі t (0 ≤ t < 1) → відрізок під курсором.
export const segmentAt = t => {
  const slot = Math.min(SLOTS - 1, Math.max(0, Math.floor(t * SLOTS)));
  return SEGMENTS.find(seg => slot >= seg.start && slot < seg.end);
};
export const stageAt = t => segmentAt(t).stage;

// Усі відрізки однієї стадії й частка ночі, з якої починається перший із них (для «показати, де в ночі ця стадія»).
export const segmentsOf = stage => SEGMENTS.filter(seg => seg.stage === stage);
export const firstStart = stage => { const seg = segmentsOf(stage)[0]; return seg ? seg.start / SLOTS : 0; };

// Скільки слотів стадія займає в першій і другій половині ночі (для тесту «N3 на початку, REM ближче до ранку»).
export const halves = stage => {
  const middle = SLOTS / 2;
  let first = 0, second = 0;
  for (const seg of segmentsOf(stage)) {
    const a = Math.max(0, Math.min(seg.end, middle) - seg.start), b = Math.max(0, seg.end - Math.max(seg.start, middle));
    first += a; second += b;
  }
  return {first, second};
};

// Крок руху курсора: dt у мілісекундах, ніч проходить за NIGHT_MS. Після кінця ночі курсор повертається на початок.
export const NIGHT_MS = 30000;
export const advance = (t, dt) => { const next = t + dt / NIGHT_MS; return next >= 1 ? next - Math.floor(next) : next; };

// Текст для читача екрана й підпис схеми. Лише те, що сказано на сторінці (з тим самим «зазвичай»), плюс чесне «це приклад». Кількість циклів = кількість відрізків REM (перевіряє тест).
export const SUMMARY = 'Умовна ніч із п’яти циклів: стадії чергуються. Зазвичай глибокого сну N3 більше на початку ночі, а REM ближче до ранку. Це приклад, а не запис чиєїсь ночі.';

const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

// Нерухома розмітка схеми (видима й без JavaScript). Рядки-підписи й смуги лежать в одній сітці, тож підписи завжди проти своїх смуг.
// Усі підписи звичайним текстом (не всередині малюнка), смуги й курсор для читача екрана приховані: схему описує aria-label та прихований абзац.
export function renderNight() {
  const labels = STAGES.map(s => `<span class="night-label" data-row="${s.id}">${esc(s.label)}</span>`).join('');
  const bars = SEGMENTS.map(seg => `<i class="night-bar" data-stage="${seg.stage}" data-i="${seg.index}" style="--s:${seg.start};--l:${seg.len}"></i>`).join('');
  return `<figure class="sleep-night" data-sleep-night style="--slots:${SLOTS}">`
    + `<figcaption class="night-head"><b>Схема ночі</b><span>Умовний приклад: довжина стадій у реальному сні різна</span></figcaption>`
    + `<div class="night-chart" role="img" aria-label="${esc(SUMMARY)}">`
    + `<div class="night-rows" aria-hidden="true">${labels}</div>`
    + `<div class="night-plot" aria-hidden="true">${bars}<b class="night-cursor"></b></div>`
    + `</div>`
    + `<p class="night-axis" aria-hidden="true"><span>початок ночі</span><span>ранок</span></p>`
    + `</figure>`;
}
