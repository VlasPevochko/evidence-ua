import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STAGES, STAGE_IDS, SLOTS, SEGMENTS, NIGHT_MS, SUMMARY, rowOf, labelOf, segmentAt, stageAt, segmentsOf, firstStart, halves, advance, renderNight} from '../src/sleep/night.mjs';

// Схема ночі на сторінці «Сон і відновлення» (рішення власника 35, 2026-11-09). Вона умовна й нічого не вигадує: показує лише те, що вже написано на сторінці за NIH/NHLBI
// (стадії чергуються, цикл повторюється кілька разів, N3 зазвичай більше на початку ночі, REM зазвичай більше ближче до ранку). Тест перевіряє саме це, а не «красу»:
// якщо хтось змінить дані так, що схема почне суперечити тексту сторінки, він упаде. Справжній вигляд і рух міряє Browser QA (sleepNightFlow).
const read = f => fs.readFileSync(f, 'utf8');

// 1) Дані: відрізки йдуть підряд без дірок і накладань, покривають усю ніч; стадії лише відомі; починається й закінчується неспанням.
assert.deepEqual(STAGE_IDS, ['wake', 'rem', 'n1', 'n2', 'n3'], 'rows from top to bottom as on a hypnogram');
assert.equal(SEGMENTS.reduce((n, s) => n + s.len, 0), SLOTS, 'the segments add up to the whole night');
SEGMENTS.forEach((seg, i) => {
  assert(STAGE_IDS.includes(seg.stage) && seg.len > 0, `segment ${i} has a known stage and a positive length`);
  assert.equal(seg.start, i === 0 ? 0 : SEGMENTS[i - 1].end, `segment ${i} starts where the previous one ends`);
  assert.equal(seg.end, seg.start + seg.len);
  if (i) assert.notEqual(seg.stage, SEGMENTS[i - 1].stage, `neighbouring segments ${i - 1} and ${i} are different stages (otherwise they would be one bar)`);
});
assert.equal(SEGMENTS[0].stage, 'wake', 'the night starts awake');
assert.equal(SEGMENTS.at(-1).stage, 'wake', 'and ends awake');
assert(SEGMENTS.every(seg => seg.len >= 1) && SEGMENTS.filter(seg => seg.len === 1).length <= 8, 'bars are at least one slot wide');

// 2) Те, що сказано на сторінці: «цикл повторюється кілька разів», «N3 більше на початку ночі», «REM більше ближче до ранку».
const cycles = segmentsOf('rem').length;
assert(cycles >= 4 && cycles <= 6, `several cycles, each ends in REM (found ${cycles})`);
assert(SUMMARY.includes('п’яти циклів') && cycles === 5, 'the caption says five cycles and the data has five REM periods');
for (const stage of ['n1', 'n2', 'n3', 'rem']) assert(segmentsOf(stage).length >= 2, `${stage} comes back during the night, it is not a one-off step`);
const n3 = halves('n3'), rem = halves('rem');
assert(n3.first > n3.second * 3, `N3 mostly in the first half of the night (${n3.first} vs ${n3.second})`);
assert(rem.second > rem.first * 2, `REM mostly in the second half of the night (${rem.first} vs ${rem.second})`);
const remLens = segmentsOf('rem').map(s => s.len);
assert(remLens.every((len, i) => !i || len >= remLens[i - 1]), `REM periods do not get shorter towards the morning (${remLens})`);
const n3Lens = segmentsOf('n3').map(s => s.len);
assert(n3Lens.every((len, i) => !i || len <= n3Lens[i - 1]), `N3 periods do not get longer towards the morning (${n3Lens})`);
// Сторінка справді каже це (схема не повинна показувати те, чого немає в тексті): шукаємо тексти в самій сторінці.
const page = read('dist/sleep.html');
assert(/Зазвичай його більше на початку ночі/.test(page), 'the page says N3 is usually more at the beginning of the night');
assert(/REM зазвичай стає більше ближче до ранку/.test(page), 'the page says REM is usually more towards the morning');
assert(/цей цикл повторюється кілька разів/.test(page), 'the page says the cycle repeats several times');

// 3) Геометрія й рух курсора.
assert.equal(stageAt(0), 'wake');
assert.equal(stageAt(0.9999), 'wake');
assert.equal(segmentAt(SEGMENTS[3].start / SLOTS).index, 3, 'the cursor at the start of a segment is in that segment');
assert.equal(segmentAt((SEGMENTS[3].end - 0.01) / SLOTS).index, 3, 'and just before its end');
assert(Math.abs(firstStart('n3') - SEGMENTS.find(s => s.stage === 'n3').start / SLOTS) < 1e-9 && firstStart('n3') < 0.2, 'N3 first appears early');
assert(firstStart('rem') < firstStart('n3') + 0.2 && firstStart('rem') > 0, 'the first REM comes after the first deep sleep');
assert.equal(rowOf('wake'), 0); assert.equal(rowOf('n3'), 4);
assert.equal(labelOf('wake'), 'Неспання'); assert.equal(labelOf('n2'), 'N2');
assert(Math.abs(advance(0, NIGHT_MS / 2) - 0.5) < 1e-9, 'half of the night takes half of its time');
assert(advance(0.99, NIGHT_MS * 0.05) < 0.05 && advance(0.99, NIGHT_MS * 0.05) >= 0, 'after the end of the night the cursor comes back to the start');
assert(NIGHT_MS >= 20000 && NIGHT_MS <= 45000, 'a slow sweep, not a flicker');

// 4) Розмітка: одна смуга на відрізок, п'ять підписів, курсор; без чисел часу; усі підписи звичайним текстом (не в малюнку); для читача екрана є опис.
const html = renderNight();
assert.equal((html.match(/class="night-bar"/g) || []).length, SEGMENTS.length, 'one bar per segment');
assert.equal((html.match(/class="night-label"/g) || []).length, STAGES.length, 'one label per row');
assert(html.includes('class="night-cursor"') && html.includes('role="img"') && html.includes(`aria-label="${SUMMARY}"`), 'a cursor and a text description');
assert(!/<svg|<text|<canvas/.test(html), 'no text inside a drawing and no canvas: the labels are real text');
assert(!/\d+\s*(хв|год|min|h\b)/i.test(html.replace(/--slots:\d+|--s:\d+|--l:\d+|data-i="\d+"/g, '')), 'no times or durations are claimed');
assert(!/https?:\/\//.test(html), 'no third-party addresses');

// 5) Сторінка містить саме цю розмітку між позначками (збірка не пропустила зміну даних), і вона одна.
const marked = page.match(/<!-- EUA_SLEEP_NIGHT_START -->([\s\S]*?)<!-- EUA_SLEEP_NIGHT_END -->/);
assert(marked, 'the page has the marked place for the night scheme');
assert.equal(marked[1], html, 'the scheme on the page is current: run node scripts/build-site.mjs');
assert.equal((page.match(/data-sleep-night/g) || []).length, 1, 'the scheme is on the page exactly once');
assert(page.indexOf('data-sleep-night') < page.indexOf('data-sleep-stage="n1"'), 'the scheme comes before the stage buttons it answers to');

// 6) Збірка: модуль доставляється в dist, sleep.js його підключає з версією, а версії піднято (браузер не покаже кеш).
const night = read('dist/sleep-night.js');
assert.equal(night, read('src/sleep/night.mjs'), 'dist/sleep-night.js is a copy of the module');
const loader = read('dist/sleep.js');
assert(/from '\.\/sleep-night\.js\?v=\d+'/.test(loader) && !loader.includes("'./night.mjs'"), 'sleep.js imports the delivered module with a version');
assert(Number((page.match(/sleep\.js\?v=(\d+)/) || [])[1]) >= 83 && Number((page.match(/sleep\.css\?v=(\d+)/) || [])[1]) >= 86, 'the page carries new versions of sleep.js and sleep.css');
assert(read('scripts/build-site.mjs').includes("'sleep-night.js'"), 'the delivered module is a known generated file');
console.log('Sleep night scheme: data matches what the page says, contiguous, five cycles, N3 early and REM late, real-text labels, current markup, delivered with versions passed.');
