import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// dist/*.js are browser ES modules without a package.json, so run them from a temp ESM folder.
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'exercise-library-'));
fs.writeFileSync(path.join(temp, 'package.json'), '{"type":"module"}');
for (const file of ['exercises-data.js', 'exercises.js']) fs.copyFileSync(path.join('dist', file), path.join(temp, file));
const data = await import(pathToFileURL(path.join(temp, 'exercises-data.js')).href);
const lib = await import(pathToFileURL(path.join(temp, 'exercises.js')).href);
const {exercises, contentTypes, movementPatterns, bodyRegions, equipmentLabels, claimsPendingNote} = data;

// --- Data model -----------------------------------------------------------------
assert.equal(exercises.length, 12, 'The seed map defines twelve owner-recorded entries');
const unique = key => assert.equal(new Set(exercises.map(e => e[key])).size, exercises.length, `${key} must be unique`);
['id', 'slug', 'titleUk'].forEach(unique);
assert.equal(new Set(exercises.map(e => e.media.videoId)).size, exercises.length, 'Video ids must be unique');
// Canonical ids, slugs and videos from docs/EXERCISE_LIBRARY_SEED_MAP.md.
assert.deepEqual(exercises.map(e => [e.id, e.slug, e.media.videoId]), [
  ['exercise_dumbbell_row_bent_over', 'tyaha-hanteli-v-nahili', 'qrL6N-35QrE'],
  ['practice_scapular_activation_control', 'kontrol-lopatky', 'NDSyt1Ib89E'],
  ['practice_rotator_cuff_complex', 'rotatorna-manzheta-kompleks', 'MTdKHhtTRZQ'],
  ['practice_shoulder_scapula_mobility_complex', 'mobilnist-plecha-lopatky', 'HXc_N5WXAfw'],
  ['practice_chest_shoulder_girdle_context', 'hrudy-plechovyi-poyas', 'w2XC6Igeyyo'],
  ['practice_scapular_control_progression', 'progresiya-kontrolyu-lopatky', 'P6t_LAZCdqw'],
  ['practice_back_mobility_complex', 'spyna-mobilnist-kompleks', 'fg9Wpawsi9c'],
  ['exercise_back_strength_cobra_set', 'sylovyi-kompleks-spyna', '6Mxz9Raufy8'],
  ['practice_animal_flow_mobility', 'animal-flow-mobilnist', 'ZAt8wfSPpb4'],
  ['practice_animal_flow_integrated', 'animal-flow-intehrovanyi-rukh', 'dAOMp3ITOkw'],
  ['practice_general_movement_skills', 'rukhovyi-kompleks-navychky', 'EtyFaqzJ7_o'],
  ['screen_coordination_challenge', 'test-koordinatsiyi', 'hVHK4ncfr6A']
], 'ids, slugs and videos must match the seed map in order');
const typeCount = Object.fromEntries(Object.keys(contentTypes).map(t => [t, exercises.filter(e => e.contentType === t).length]));
assert.deepEqual(typeCount, {strength: 3, mobility: 3, movement_control: 3, coordination: 1, rehab_practice: 1, screen_or_test: 1});
// Old addresses from the first slice keep working.
assert.equal(lib.findExercise(exercises, 'tyaha-hanteli-v-nahyli').slug, 'tyaha-hanteli-v-nahili');
assert.equal(lib.findExercise(exercises, 'kompleks-rotatornoyi-manzhety').slug, 'rotatorna-manzheta-kompleks');
// The coordination entry is a challenge, never a diagnostic test (seed map §2.12).
const challenge = exercises.find(e => e.slug === 'test-koordinatsiyi');
assert(/не діагностичний/.test(challenge.shortDescriptionUk) && /не валідований клінічний скринінг/.test(challenge.movementNoteUk));
assert(challenge.limitationsUk.join(' ').includes('Не є медичним тестом'));

const atlasZones = ['brain', 'shoulder', 'spine', 'muscles', 'gut', 'knee'];
for (const e of exercises) {
  assert(/^[a-z0-9-]+$/.test(e.slug), `slug format: ${e.slug}`);
  assert(lib.isValidVideoId(e.media.videoId) && e.media.provider === 'youtube');
  assert(contentTypes[e.contentType], `known content type: ${e.contentType}`);
  e.movementPatterns.forEach(p => assert(movementPatterns[p], `known pattern ${p}`));
  e.bodyRegions.forEach(r => assert(bodyRegions[r], `known region ${r}`));
  e.equipment.forEach(q => assert(equipmentLabels[q], `known equipment ${q}`));
  e.atlasZones.forEach(z => assert(atlasZones.includes(z), `Atlas zone must reuse an existing identity: ${z}`));
  assert(e.shortDescriptionUk.length > 20 && e.jointActionsUk.length && e.primaryStructuresUk.length);
  assert(e.limitationsUk.length, 'Every entry carries a caution section');
  // Texts checked against the videos, but claims and medical review are still pending; no fake evidence.
  assert.equal(e.editorial.reviewStatus, 'video_checked');
  assert.equal(e.editorial.lastReviewed, '2026-10-18');
  assert.equal(e.editorial.claimReviewStatus, 'not_assessed');
  assert.deepEqual(e.relatedClaimIds, [], 'No Claim may be attached before it is reviewed');
  assert.deepEqual(e.relatedSourceIds, []);
}

// --- Language and safety rules (implementation pack §11) ----------------------------
const forbidden = ['виправляє поставу', 'лікує біль', 'прибирає защемлення', 'запобігає травмам', 'найкраща вправа', 'ідеальна техніка'];
const everyText = [
  JSON.stringify(data),
  fs.readFileSync('dist/exercises.html', 'utf8'),
  fs.readFileSync('dist/exercises.js', 'utf8')
].join('\n').toLocaleLowerCase('uk');
for (const phrase of forbidden) assert(!everyText.includes(phrase), `Forbidden claim wording: ${phrase}`);
assert(!/@[a-z0-9.-]+\.[a-z]{2,}/i.test(JSON.stringify(data)), 'No e-mail addresses in the data');

// --- Pure helpers ---------------------------------------------------------------
assert.equal(lib.filterExercises(exercises, {}).length, 12);
assert.deepEqual(lib.filterExercises(exercises, {q: 'ТЯГА'}).map(e => e.id), ['exercise_dumbbell_row_bent_over']);
assert.deepEqual(lib.filterExercises(exercises, {q: 'манжета'}).map(e => e.slug), ['rotatorna-manzheta-kompleks']);
assert.deepEqual(lib.filterExercises(exercises, {q: 'скапулярна активація'}).map(e => e.slug), ['kontrol-lopatky']);
assert.equal(lib.filterExercises(exercises, {region: 'shoulder'}).length, exercises.filter(e => e.bodyRegions.includes('shoulder')).length);
assert(lib.filterExercises(exercises, {region: 'shoulder'}).length >= 8);
assert.deepEqual(lib.filterExercises(exercises, {type: 'rehab_practice'}).map(e => e.slug), ['rotatorna-manzheta-kompleks']);
assert.equal(lib.filterExercises(exercises, {region: 'elbow'}).length, 1);
assert.equal(lib.filterExercises(exercises, {type: 'strength'}).length, 3);
assert.equal(lib.filterExercises(exercises, {q: 'animal flow'}).length, 2);
assert.equal(lib.filterExercises(exercises, {q: 'координац'}).length, 2);
assert.equal(lib.filterExercises(exercises, {q: 'zzzz'}).length, 0);
assert.equal(lib.findExercise(exercises, 'kontrol-lopatky').id, 'practice_scapular_activation_control');
assert.equal(lib.findExercise(exercises, 'nope'), null);
assert.deepEqual(lib.readState('?e=a&region=shoulder&q=x'), {slug: 'a', q: 'x', region: 'shoulder', type: '', pattern: '', equipment: ''});
assert.equal(lib.writeState({q: 'тяга', region: 'shoulder'}), '?q=%D1%82%D1%8F%D0%B3%D0%B0&region=shoulder');
assert.equal(lib.writeState({}), '');
assert.equal(lib.facetOptions(exercises, 'equipment', equipmentLabels).length, 1, 'Single-value facets are not worth a filter');
for (const e of exercises) for (const field of ['bodyRegions', 'movementPatterns']) assert(lib.facetOptions([e], field, {...bodyRegions, ...movementPatterns}).every(o => o.label !== o.value), 'Every facet value has a Ukrainian label');
assert.equal(lib.youtubeEmbedUrl('qrL6N-35QrE'), 'https://www.youtube-nocookie.com/embed/qrL6N-35QrE?autoplay=1&rel=0');
assert.equal(lib.youtubeWatchUrl('qrL6N-35QrE'), 'https://www.youtube.com/watch?v=qrL6N-35QrE');
for (const bad of ['', 'short', 'has space!!', 'a"><script>', null]) {
  assert.equal(lib.isValidVideoId(bad), false);
  assert.throws(() => lib.youtubeEmbedUrl(bad), /Invalid/);
}

// --- Rendering with a minimal DOM ---------------------------------------------------
class Node {
  constructor(tag) { this.tagName = tag; this.attrs = {}; this.children = []; this.listeners = {}; this._text = ''; this._value = undefined; }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  append(...c) { this.children.push(...c); }
  replaceChildren(...c) { this.children = c; this._text = ''; }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  set value(v) { this._value = v; }
  get value() { return this._value ?? this.attrs.value ?? ''; }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  fire(t) { for (const f of this.listeners[t] || []) f({preventDefault() {}}); }
  walk(fn) { fn(this); for (const c of this.children) c.walk?.(fn); }
  find(pred) { const out = []; this.walk(n => pred(n) && out.push(n)); return out; }
  querySelector(sel) { return this.find(n => sel.startsWith('#') && n.attrs.id === sel.slice(1))[0] || null; }
}
const doc = {createElement: tag => new Node(tag)};

const row = exercises[0];
const detail = lib.renderDetail(doc, row);
const headings = detail.find(n => n.tagName === 'h2').map(n => n.textContent);
assert.deepEqual(headings.slice(0, 5), ['Коротко', 'Що рухається', 'Анатомія', 'Як виконувати', 'Типові помилки']);
for (const required of ['Легше та складніше', 'Варіанти', 'Коли бути обережним', 'Докази', 'Дослідити тіло']) assert(headings.includes(required), `Missing section ${required}`);
assert.equal(detail.find(n => n.tagName === 'h1').length, 1, 'One h1 per detail view');
assert.equal(detail.find(n => n.tagName === 'header').length, 0, 'The shared shell injects navigation after every <header>; the detail must not contain one');
assert.equal(detail.find(n => n.attrs.class === 'ex-disclaimer').length, 0, 'The disclaimer lives once on the page, not in every detail');
const layers = detail.find(n => n.attrs['data-layer']).map(n => n.attrs['data-layer']);
for (const layer of ['facts', 'coaching', 'safety', 'evidence']) assert(layers.includes(layer), `Missing layer ${layer}`);
assert(detail.textContent.includes(claimsPendingNote), 'Shows the pending-claims note instead of a fake evidence score');
assert(detail.textContent.includes('звірено з відео') && detail.textContent.includes('не завершено'), 'Shows review status and its limits');
assert.equal(detail.find(n => n.tagName === 'iframe').length, 0, 'No YouTube request before the click');
const play = detail.find(n => n.attrs.class === 'ex-video-play')[0];
assert(play && play.attrs['aria-label'].includes(row.titleUk));
play.fire('click');
const frame = detail.find(n => n.tagName === 'iframe');
assert.equal(frame.length, 1);
assert(frame[0].attrs.src.startsWith('https://www.youtube-nocookie.com/embed/qrL6N-35QrE'));
assert(frame[0].attrs.title.includes(row.titleUk));
const ext = detail.find(n => n.tagName === 'a' && n.attrs.href === 'https://www.youtube.com/watch?v=qrL6N-35QrE')[0];
assert.equal(ext.attrs.rel, 'noopener noreferrer');
assert.equal(ext.attrs.target, '_blank');
const zoneLinks = detail.find(n => n.tagName === 'a' && String(n.attrs.href).startsWith('./atlas.html?zone='));
assert.deepEqual(zoneLinks.map(n => n.attrs.href), row.atlasZones.map(z => `./atlas.html?zone=${z}`), 'Links to every Atlas zone the exercise belongs to');
assert(zoneLinks[0].textContent.startsWith('Атлас:'));

let changed = null;
const state = {q: '', region: '', type: '', pattern: '', equipment: ''};
const index = lib.renderIndex(doc, exercises, state, s => { changed = {...s}; });
const results = () => index.querySelector('#ex-results').children;
assert.equal(results().length, 12);
assert(index.querySelector('#ex-count').textContent.includes('12'));
assert(index.querySelector('#ex-filter-region') && index.querySelector('#ex-filter-type') && index.querySelector('#ex-filter-pattern'));
assert.equal(index.querySelector('#ex-filter-equipment'), null, 'Equipment filter hidden while it has a single value');
const form = index.children[0];
index.querySelector('#ex-search').value = 'ротатор';
form.fire('input');
assert.equal(results().length, 1);
assert.equal(changed.q, 'ротатор');
index.querySelector('#ex-search').value = 'zzz';
form.fire('input');
assert.equal(results().length, 0);
assert(index.querySelector('#ex-count').textContent.includes('не знайдено'));
index.querySelector('#ex-search').value = '';
index.querySelector('#ex-filter-type').value = 'strength';
form.fire('change');
assert.equal(results().length, 3);
const cardLinks = index.find(n => n.tagName === 'a' && String(n.attrs.href).startsWith('./exercises.html?e='));
assert(cardLinks.length >= 1 && cardLinks.every(a => a.textContent.length));

// --- Page and Atlas wiring ------------------------------------------------------
const html = fs.readFileSync('dist/exercises.html', 'utf8');
assert(html.includes('<html lang="uk">') && html.includes('<title>') && html.includes('id="exercise-app"'));
assert(html.includes('src="./exercises.js?v=7"') && html.includes('href="./exercises.css?v=2"'));
assert(!/<iframe/i.test(html) && !/youtube/i.test(html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')), 'No YouTube resource in the static page');
for (const file of ['dist/exercises.css', 'dist/exercises.js', 'dist/exercises-data.js']) assert(fs.existsSync(file));
const atlasJs = fs.readFileSync('dist/atlas.js', 'utf8');
assert(atlasJs.includes('./exercises.html?region=shoulder'), 'Atlas shoulder training links to the library');
assert(/atlas\.js\?v=\d+/.test(fs.readFileSync('dist/atlas.html', 'utf8')), 'Atlas script is versioned so cached copies refresh');

// --- Site-wide discovery: shared navigation and the home header (same pattern as the Atlas) -----
const shellSource = fs.readFileSync('src/platform/shell.mjs', 'utf8');
const shellBuilt = fs.readFileSync('dist/platform-shell.js', 'utf8');
for (const shell of [shellSource, shellBuilt]) {
  assert(shell.includes('./exercises.html'), 'Shared shell links to the Exercise Library');
  assert(shell.includes('eua-exercises-link') && shell.includes('${exercisesLink(current)}'), 'Library link is part of the shared navigation');
  assert(shell.includes('eua-home-exercises-entry'), 'Home header has a library entry');
}
assert.equal(
  shellBuilt,
  shellSource.replace("'./catalog.mjs'", "'./platform-catalog.js?v=83'").replace("'./quick-tools.mjs'", "'./platform-tools.js?v=83'"),
  'dist/platform-shell.js must match src/platform/shell.mjs as the platform build generates it'
);
assert(fs.readFileSync('dist/platform.css', 'utf8').includes('.eua-exercises-link'), 'Styles for the shared library link exist');
const catalogSource = fs.readFileSync('src/platform/catalog.mjs', 'utf8');
assert(!catalogSource.includes('exercises.html'), 'The library is a practice entry, not a new top-level catalog direction');

fs.rmSync(temp, {recursive: true, force: true});

// --- Author experience, browsing and related exercises ------------------------------
// Optional field: when present it must be plain short statements without outcome promises.
const forbiddenExperience = ['лікує', 'вилікує', 'виправляє поставу', 'прибирає защемлення', 'запобігає травмам', 'гарантує', 'найкраща вправа', 'ідеальна техніка'];
for (const e of exercises) {
  const notes = e.authorExperienceUk ?? [];
  assert(Array.isArray(notes) && notes.every(n => typeof n === 'string' && n.trim().length > 10 && n.length <= 400), `authorExperienceUk shape: ${e.slug}`);
  for (const phrase of forbiddenExperience) assert(!notes.join(' ').toLocaleLowerCase('uk').includes(phrase), `Forbidden wording in author experience (${e.slug}): ${phrase}`);
}
assert(!detail.find(n => n.attrs['data-layer'] === 'experience').length, 'No experience block while the author has not supplied text');
const withExperience = {...row, authorExperienceUk: ['Використовую цю вправу в роботі з 2012 року як базову для верхньої частини спини.']};
const experienceDetail = lib.renderDetail(doc, withExperience);
assert.equal(experienceDetail.find(n => n.attrs['data-layer'] === 'experience').length, 1, 'Experience block appears when text is supplied');
assert(experienceDetail.textContent.includes('Практичний досвід автора') && experienceDetail.textContent.includes('а не результат дослідження'), 'Experience is labelled as practice, not research');
assert(!experienceDetail.find(n => n.attrs['data-layer'] === 'evidence')[0].textContent.includes('2012'), 'Experience never leaks into the evidence layer');

const around = lib.neighbours(exercises, exercises[0]);
assert.equal(around.previous.slug, exercises.at(-1).slug, 'Previous wraps to the last entry');
assert.equal(around.next.slug, exercises[1].slug);
assert.deepEqual(lib.neighbours(exercises, {}), {previous: null, next: null}, 'Unknown item has no neighbours');
for (const e of exercises) {
  const related = lib.relatedExercises(exercises, e);
  assert(related.length >= 1 && related.length <= 3 && !related.some(r => r.slug === e.slug), `Related list is sane for ${e.slug}`);
  assert.equal(new Set(related.map(r => r.slug)).size, related.length, 'No duplicates in the related list');
}
const progression = exercises.find(e => e.slug === 'progresiya-kontrolyu-lopatky');
assert.equal(lib.relatedExercises(exercises, progression)[0].slug, 'kontrol-lopatky', 'The closest relative of the scapular progression is scapular control');
assert.equal(detail.find(n => n.attrs.class === 'ex-pager').length, 1, 'Detail has previous/next navigation');
assert(detail.find(n => n.attrs.class === 'ex-related-list')[0].find(n => n.tagName === 'a').length >= 1, 'Detail lists related exercises');
const placeholder = lib.renderDetail(doc, row).find(n => n.attrs.class === 'ex-video-play')[0];
assert(placeholder.textContent.includes(row.titleUk) && placeholder.textContent.includes('YouTube завантажиться після натискання'), 'Video placeholder names the exercise and says nothing loads before the click');

const pageHtml = fs.readFileSync('dist/exercises.html', 'utf8');
assert(!/чернетк/i.test(pageHtml) && !/чернетк/i.test(fs.readFileSync('dist/exercises.js', 'utf8')), 'No stale draft wording once entries are video-checked');

console.log('Exercise library: 12 video-checked entries, data model, safe wording, filters, detail layers, click-to-load video and Atlas link passed.');
