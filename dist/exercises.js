// Exercise Library — index and reusable detail template. All content comes from exercises-data.js.
// Rendering uses textContent only; the YouTube player is created after an explicit click.
import {
  exercises, contentTypes, movementPatterns, bodyRegions, equipmentLabels,
  reviewStatusLabels, claimsPendingNote
} from './exercises-data.js?v=4';

const atlasZoneLabels = {shoulder: 'Плече', spine: 'Хребет', muscles: 'М’язова система', knee: 'Коліно', brain: 'Мозок', gut: 'ШКТ'};
const norm = value => String(value ?? '').toLocaleLowerCase('uk').replace(/ё/g, 'е').trim();
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export const isValidVideoId = id => VIDEO_ID.test(String(id ?? ''));
export const youtubeEmbedUrl = id => {
  if (!isValidVideoId(id)) throw Error('Invalid YouTube video id');
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
};
export const youtubeWatchUrl = id => {
  if (!isValidVideoId(id)) throw Error('Invalid YouTube video id');
  return `https://www.youtube.com/watch?v=${id}`;
};

export function findExercise(list, slug) {
  return list.find(item => item.slug === slug || (item.legacySlugs || []).includes(slug)) || null;
}

export function facetOptions(list, key, labels) {
  const values = new Map();
  for (const item of list) {
    const raw = item[key];
    for (const value of Array.isArray(raw) ? raw : [raw]) {
      if (value) values.set(value, labels[value] || value);
    }
  }
  return [...values].map(([value, label]) => ({value, label}));
}

export function filterExercises(list, {q = '', region = '', type = '', pattern = '', equipment = ''} = {}) {
  const needle = norm(q);
  return list.filter(item => {
    if (region && !item.bodyRegions.includes(region)) return false;
    if (type && item.contentType !== type) return false;
    if (pattern && !item.movementPatterns.includes(pattern)) return false;
    if (equipment && !item.equipment.includes(equipment)) return false;
    if (!needle) return true;
    return [item.titleUk, item.titleEn, ...item.aliases].some(text => norm(text).includes(needle));
  });
}

export function readState(search) {
  const params = new URLSearchParams(search);
  return {
    slug: params.get('e') || '',
    q: params.get('q') || '',
    region: params.get('region') || '',
    type: params.get('type') || '',
    pattern: params.get('pattern') || '',
    equipment: params.get('equipment') || ''
  };
}

export function writeState(state) {
  const params = new URLSearchParams();
  for (const key of ['q', 'region', 'type', 'pattern', 'equipment']) if (state[key]) params.set(key, state[key]);
  const text = params.toString();
  return text ? `?${text}` : '';
}

function el(doc, tag, attrs = {}, children = []) {
  const node = doc.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

const chips = (doc, items, className = 'ex-chip') =>
  el(doc, 'ul', {class: 'ex-chips'}, items.map(text => el(doc, 'li', {class: className, text})));

function listSection(doc, id, title, layer, items, emptyText) {
  const body = items.length
    ? el(doc, 'ul', {class: 'ex-list'}, items.map(text => el(doc, 'li', {text})))
    : el(doc, 'p', {class: 'ex-muted', text: emptyText});
  return section(doc, id, title, layer, [body]);
}

const layerLabels = {
  facts: 'Опис руху та анатомія',
  coaching: 'Редакційні поради (чернетка)',
  safety: 'Безпека',
  evidence: 'Докази'
};

function section(doc, id, title, layer, content) {
  return el(doc, 'section', {class: 'ex-section', 'data-layer': layer, 'aria-labelledby': id}, [
    el(doc, 'p', {class: 'ex-layer', text: layerLabels[layer]}),
    el(doc, 'h2', {id, text: title}),
    ...content
  ]);
}

function videoBlock(doc, item) {
  const id = item.media.videoId;
  const watch = youtubeWatchUrl(id);
  const frame = el(doc, 'div', {class: 'ex-video', 'data-video-id': id});
  const play = el(doc, 'button', {
    type: 'button', class: 'ex-video-play',
    'aria-label': `Відтворити відео: ${item.titleUk}`
  }, [
    el(doc, 'span', {class: 'ex-video-icon', 'aria-hidden': 'true', text: '▶'}),
    el(doc, 'span', {class: 'ex-video-label', text: 'Відтворити відео'})
  ]);
  play.addEventListener('click', () => {
    const iframe = el(doc, 'iframe', {
      src: youtubeEmbedUrl(id), title: `Відео: ${item.titleUk}`,
      allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture',
      referrerpolicy: 'strict-origin-when-cross-origin', allowfullscreen: true
    });
    frame.replaceChildren(iframe);
  });
  frame.append(play);
  return el(doc, 'div', {class: 'ex-media'}, [
    frame,
    el(doc, 'p', {class: 'ex-media-note'}, [
      el(doc, 'span', {text: 'Відео завантажується з YouTube лише після натискання. '}),
      el(doc, 'a', {href: watch, target: '_blank', rel: 'noopener noreferrer', text: 'Відкрити на YouTube'}),
      el(doc, 'span', {text: ` · Автор відео: ${item.media.author}`})
    ])
  ]);
}

export function renderDetail(doc, item) {
  const status = reviewStatusLabels[item.editorial.reviewStatus] || item.editorial.reviewStatus;
  const claims = item.relatedClaimIds.length
    ? el(doc, 'ul', {class: 'ex-list'}, item.relatedClaimIds.map(text => el(doc, 'li', {text})))
    : el(doc, 'p', {class: 'ex-muted', text: claimsPendingNote});
  return el(doc, 'article', {class: 'ex-detail'}, [
    el(doc, 'nav', {class: 'ex-crumbs', 'aria-label': 'Шлях'}, [
      el(doc, 'a', {href: './exercises.html', text: 'Бібліотека вправ'}),
      el(doc, 'span', {'aria-hidden': 'true', text: ' / '}),
      el(doc, 'span', {text: item.titleUk})
    ]),
    el(doc, 'div', {class: 'ex-detail-head'}, [
      el(doc, 'p', {class: 'ex-eyebrow', text: contentTypes[item.contentType] || item.contentType}),
      el(doc, 'h1', {id: 'exercise-title', text: item.titleUk}),
      el(doc, 'p', {class: 'ex-status', text: status}),
      chips(doc, item.bodyRegions.map(r => bodyRegions[r] || r))
    ]),
    videoBlock(doc, item),
    section(doc, 'ex-short', 'Коротко', 'facts', [el(doc, 'p', {text: item.shortDescriptionUk})]),
    section(doc, 'ex-moves', 'Що рухається', 'facts', [
      el(doc, 'ul', {class: 'ex-list'}, item.jointActionsUk.map(text => el(doc, 'li', {text}))),
      el(doc, 'p', {class: 'ex-note', text: item.movementNoteUk})
    ]),
    section(doc, 'ex-anatomy', 'Анатомія', 'facts', [
      el(doc, 'h3', {text: 'Основні структури'}),
      el(doc, 'ul', {class: 'ex-list'}, item.primaryStructuresUk.map(text => el(doc, 'li', {text}))),
      item.secondaryStructuresUk.length ? el(doc, 'h3', {text: 'Допоміжні структури'}) : null,
      item.secondaryStructuresUk.length
        ? el(doc, 'ul', {class: 'ex-list'}, item.secondaryStructuresUk.map(text => el(doc, 'li', {text})))
        : null
    ]),
    listSection(doc, 'ex-cues', 'Як виконувати', 'coaching', item.techniqueCuesUk, 'Поради ще не додано.'),
    listSection(doc, 'ex-errors', 'Типові помилки', 'coaching', item.commonErrorsUk, 'Не додано.'),
    section(doc, 'ex-levels', 'Легше та складніше', 'coaching', [
      el(doc, 'h3', {text: 'Легше'}),
      el(doc, 'ul', {class: 'ex-list'}, item.regressionsUk.map(text => el(doc, 'li', {text}))),
      el(doc, 'h3', {text: 'Складніше'}),
      el(doc, 'ul', {class: 'ex-list'}, item.progressionsUk.map(text => el(doc, 'li', {text})))
    ]),
    item.variationsUk.length ? listSection(doc, 'ex-variations', 'Варіанти', 'coaching', item.variationsUk, '') : null,
    listSection(doc, 'ex-care', 'Коли бути обережним', 'safety', item.limitationsUk, 'Не додано.'),
    section(doc, 'ex-evidence', 'Докази', 'evidence', [claims]),
    section(doc, 'ex-explore', 'Дослідити тіло', 'facts', [
      el(doc, 'ul', {class: 'ex-chips'}, (item.atlasZones.length ? item.atlasZones : [null]).map(zone => el(doc, 'li', {class: 'ex-chip'}, [
        el(doc, 'a', {
          class: 'ex-link',
          href: zone ? `./atlas.html?zone=${encodeURIComponent(zone)}` : './atlas.html',
          text: zone ? `Атлас: ${atlasZoneLabels[zone] || zone} →` : 'Відкрити Атлас Evidence →'
        })
      ]))),
      el(doc, 'p', {class: 'ex-muted', text: 'Атлас показує області тіла, анатомію й навантаження. Він не ставить діагнозів.'})
    ]),
  ].filter(Boolean));
}

function selectControl(doc, id, label, options, value) {
  const select = el(doc, 'select', {id, name: id.replace('ex-filter-', '')}, [
    el(doc, 'option', {value: '', text: 'Усі'}),
    ...options.map(o => el(doc, 'option', {value: o.value, text: o.label, selected: o.value === value}))
  ]);
  select.value = value || '';
  return el(doc, 'label', {class: 'ex-field', for: id}, [el(doc, 'span', {text: label}), select]);
}

function card(doc, item) {
  return el(doc, 'li', {class: 'ex-card-item'}, [
    el(doc, 'article', {class: 'ex-card', 'data-content-type': item.contentType}, [
      el(doc, 'p', {class: 'ex-eyebrow', text: contentTypes[item.contentType] || item.contentType}),
      el(doc, 'h2', {class: 'ex-card-title'}, [
        el(doc, 'a', {href: `./exercises.html?e=${encodeURIComponent(item.slug)}`, text: item.titleUk})
      ]),
      el(doc, 'p', {class: 'ex-card-text', text: item.shortDescriptionUk}),
      chips(doc, item.bodyRegions.map(r => bodyRegions[r] || r)),
      item.equipment.length ? chips(doc, item.equipment.map(e => equipmentLabels[e] || e), 'ex-chip ex-chip--equipment') : null,
      el(doc, 'a', {
        class: 'ex-open', href: `./exercises.html?e=${encodeURIComponent(item.slug)}`,
        'aria-label': `Відкрити: ${item.titleUk}`, text: 'Відкрити →'
      })
    ])
  ].filter(Boolean));
}

export function renderIndex(doc, list, state, onChange) {
  const fields = [
    ['ex-filter-region', 'Область тіла', facetOptions(list, 'bodyRegions', bodyRegions), 'region'],
    ['ex-filter-type', 'Тип', facetOptions(list, 'contentType', contentTypes), 'type'],
    ['ex-filter-pattern', 'Рух', facetOptions(list, 'movementPatterns', movementPatterns), 'pattern'],
    ['ex-filter-equipment', 'Обладнання', facetOptions(list, 'equipment', equipmentLabels), 'equipment']
  ].filter(([, , options]) => options.length > 1);

  const search = el(doc, 'input', {
    id: 'ex-search', type: 'search', name: 'q', autocomplete: 'off',
    placeholder: 'Назва або псевдонім', value: state.q || ''
  });
  const status = el(doc, 'p', {class: 'ex-count', id: 'ex-count', role: 'status', 'aria-live': 'polite'});
  const results = el(doc, 'ul', {class: 'ex-grid', id: 'ex-results'});
  const controls = el(doc, 'form', {class: 'ex-controls', role: 'search', 'aria-label': 'Пошук і фільтри вправ'}, [
    el(doc, 'label', {class: 'ex-field ex-field--search', for: 'ex-search'}, [el(doc, 'span', {text: 'Пошук'}), search]),
    ...fields.map(([id, label, options, key]) => selectControl(doc, id, label, options, state[key]))
  ]);
  controls.addEventListener('submit', event => event.preventDefault());

  const draw = () => {
    const current = {...state, q: search.value};
    for (const [id, , , key] of fields) current[key] = controls.querySelector(`#${id}`).value;
    Object.assign(state, current);
    const found = filterExercises(list, state);
    results.replaceChildren(...found.map(item => card(doc, item)));
    status.textContent = found.length
      ? `Знайдено вправ: ${found.length}`
      : 'За цими умовами вправ не знайдено. Змініть пошук або фільтри.';
    onChange?.(state);
  };
  controls.addEventListener('input', draw);
  controls.addEventListener('change', draw);
  draw();
  return el(doc, 'div', {class: 'ex-index'}, [controls, status, results]);
}

export function mountExerciseLibrary(doc = document, win = window) {
  const root = doc.getElementById('exercise-app');
  if (!root) return;
  const state = readState(win.location.search);
  const item = state.slug ? findExercise(exercises, state.slug) : null;
  const intro = doc.getElementById('exercise-intro');

  if (state.slug && !item) {
    intro?.setAttribute('hidden', '');
    root.replaceChildren(el(doc, 'section', {class: 'ex-missing', 'aria-labelledby': 'exercise-title'}, [
      el(doc, 'h1', {id: 'exercise-title', text: 'Вправу не знайдено'}),
      el(doc, 'p', {text: 'Можливо, посилання застаріло.'}),
      el(doc, 'a', {class: 'ex-link', href: './exercises.html', text: 'До бібліотеки вправ →'})
    ]));
    doc.title = 'Вправу не знайдено — Evidence UA';
    return;
  }
  if (item) {
    // Old shared links keep working and are rewritten to the canonical address.
    if (item.slug !== state.slug) win.history?.replaceState?.(null, '', `./exercises.html?e=${encodeURIComponent(item.slug)}`);
    intro?.setAttribute('hidden', '');
    root.replaceChildren(renderDetail(doc, item));
    doc.title = `${item.titleUk} — Бібліотека вправ — Evidence UA`;
    return;
  }
  root.replaceChildren(renderIndex(doc, exercises, state, next => {
    win.history?.replaceState?.(null, '', `./exercises.html${writeState(next)}`);
  }));
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') mountExerciseLibrary();
