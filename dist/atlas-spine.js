// Spine zone, "Анатомія" tab: region picker, region facts and the optional schematic 3D model.
// Loaded lazily by atlas.js. The 3D viewer (spine-viewer.js, bundled three.js) loads only after an explicit click.
// Content is educational orientation, not diagnosis. It is an editorial draft awaiting review by a clinician.

export const SPINE_REGIONS = [
  {
    id: 'cervical', title: 'Шийний відділ', range: 'C1–C7', count: 7, color: '#5cc8ff',
    facts: [
      'Сім хребців, що підтримують голову.',
      'Це найрухоміший відділ хребта: нахили, повороти та розгинання голови.',
      'Два верхні хребці (C1 і C2) мають особливу будову, яка забезпечує повороти голови.',
      'Звідси виходять нерви, що забезпечують шию, плечовий пояс і руки.'
    ]
  },
  {
    id: 'thoracic', title: 'Грудний відділ', range: 'T1–T12', count: 12, color: '#8fd3a4',
    facts: [
      'Дванадцять хребців, до яких прикріплюються ребра.',
      'Разом із ребрами та грудниною утворюють грудну клітку.',
      'Через ребра цей відділ стабільніший за шийний і поперековий.',
      'Природний вигин у цьому відділі спрямований опуклістю назад (кіфоз).'
    ]
  },
  {
    id: 'lumbar', title: 'Поперековий відділ', range: 'L1–L5', count: 5, color: '#ffb35c',
    facts: [
      'П’ять найбільших хребців: вони несуть значну частину ваги тіла.',
      'Нижній поперековий хребець (L5) з’єднується з крижами.',
      'Природний вигин у цьому відділі спрямований опуклістю вперед (лордоз).',
      'Між хребцями лежать міжхребцеві диски, що працюють як амортизатори.'
    ]
  },
  {
    id: 'sacral', title: 'Крижі та куприк', range: 'S1–S5, куприк', count: 6, color: '#c9a4ff',
    facts: [
      'Крижі — трикутна кістка, утворена п’ятьма зрощеними хребцями.',
      'З тазом крижі з’єднуються крижово-клубовими суглобами.',
      'Куприк — кінцевий відділ із кількох малих зрощених сегментів.'
    ]
  }
];

const NOTE_ON_MODEL = 'Це навчальна схема, а не анатомічно точна модель: форми спрощені. Форма вигинів хребта в різних людей різна.';

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

export function mountSpineHub(box) {
  let selected = null;
  let viewer = null;
  let loading = false;

  const viewerBox = el('div', {class: 'spine-viewer-box', hidden: true, id: 'spine-viewer-box'});
  const viewerNote = el('p', {class: 'spine-viewer-note', role: 'status', 'aria-live': 'polite'});
  const launch = el('button', {type: 'button', class: 'atlas-link-button spine-launch', 'aria-controls': 'spine-viewer-box', text: 'Показати 3D-модель'});
  const reset = el('button', {type: 'button', class: 'atlas-link-button', hidden: true, text: 'Скинути вигляд'});
  const close = el('button', {type: 'button', class: 'atlas-link-button', hidden: true, text: 'Сховати 3D'});
  const info = el('div', {class: 'spine-region-info', 'aria-live': 'polite'});
  const list = el('ul', {class: 'spine-regions'});
  const buttons = new Map();

  function renderInfo() {
    const region = SPINE_REGIONS.find(r => r.id === selected);
    if (!region) {
      info.replaceChildren(
        el('h3', {text: 'Оберіть відділ'}),
        el('p', {text: 'Хребет має чотири відділи. Оберіть відділ кнопкою або натисніть на нього в 3D-моделі, щоб побачити коротку довідку.'}),
        el('p', {class: 'atlas-muted', text: 'У нормі хребет має S-подібні вигини: лордоз у шийному та поперековому відділах і кіфоз у грудному та крижовому. Вони різні в різних людей.'})
      );
      return;
    }
    info.replaceChildren(
      el('h3', {text: `${region.title} · ${region.range}`}),
      el('ul', {class: 'atlas-list'}, region.facts.map(text => el('li', {text}))),
      el('p', {class: 'atlas-muted', text: 'Ця довідка пояснює будову. Вона не визначає причину болю: місце болю не завжди збігається з його джерелом.'})
    );
  }

  function select(id) {
    selected = id && selected !== id ? id : null;
    for (const [regionId, button] of buttons) button.setAttribute('aria-pressed', String(regionId === selected));
    viewer?.setRegion(selected);
    renderInfo();
  }

  for (const region of SPINE_REGIONS) {
    const swatch = el('span', {class: 'spine-swatch', 'aria-hidden': 'true'});
    swatch.style.background = region.color;
    const button = el('button', {type: 'button', class: 'spine-region-btn', 'aria-pressed': 'false'}, [
      swatch,
      el('span', {class: 'spine-region-name', text: region.title}),
      el('span', {class: 'spine-region-range', text: region.range})
    ]);
    button.addEventListener('click', () => select(region.id));
    buttons.set(region.id, button);
    list.append(el('li', {}, [button]));
  }

  async function showViewer() {
    if (loading || viewer) return;
    loading = true;
    launch.disabled = true;
    viewerNote.textContent = 'Завантаження 3D-моделі…';
    viewerBox.hidden = false;
    try {
      const module = await import('./spine-viewer.js?v=1');
      if (!box.isConnected) return;
      viewer = module.mountSpineViewer(viewerBox, {
        onSelect: id => select(id),
        onError: () => hideViewer('3D-модель недоступна на цьому пристрої. Відділи доступні кнопками й текстом.')
      });
      if (!viewer) {
        hideViewer('3D-модель недоступна на цьому пристрої (потрібна підтримка WebGL). Відділи доступні кнопками й текстом.');
        return;
      }
      viewer.setRegion(selected);
      viewerNote.textContent = `${NOTE_ON_MODEL} Обертання: перетягування або стрілки; масштаб: коліщатко, щипок або + і −.`;
      launch.hidden = true;
      reset.hidden = false;
      close.hidden = false;
    } catch {
      hideViewer('Не вдалося завантажити 3D-модель. Відділи доступні кнопками й текстом.');
    } finally {
      loading = false;
      launch.disabled = false;
    }
  }

  function hideViewer(message) {
    viewer?.dispose();
    viewer = null;
    viewerBox.hidden = true;
    launch.hidden = false;
    reset.hidden = true;
    close.hidden = true;
    viewerNote.textContent = message || '';
  }

  launch.addEventListener('click', showViewer);
  reset.addEventListener('click', () => viewer?.resetView());
  close.addEventListener('click', () => { hideViewer(''); launch.focus(); });

  renderInfo();
  box.replaceChildren(
    el('div', {class: 'atlas-copy-card'}, [
      el('h3', {text: 'Будова за відділами'}),
      el('p', {text: 'Оберіть відділ кнопкою, щоб побачити коротку довідку. За бажання можна відкрити схематичну 3D-модель.'})
    ]),
    el('div', {class: 'spine-hub'}, [
      el('div', {class: 'spine-viewer-col'}, [
        el('div', {class: 'spine-actions'}, [launch, reset, close]),
        viewerBox,
        viewerNote
      ]),
      el('div', {class: 'spine-info-col'}, [
        list,
        info
      ])
    ])
  );
  return {select, dispose: () => hideViewer('')};
}
