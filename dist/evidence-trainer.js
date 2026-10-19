// Тренажер «Перевір твердження» у блоці «Як читати докази».
// Числа й межі висновку взято слово в слово з досьє «Кофеїн» і «Магній» на цій самій сторінці; нових даних тут немає.
// Усе працює в самій сторінці: нічого не надсилається й не зберігається.
export const CARDS = [
  {
    id: 'caffeine-smd',
    claim: 'Кофеїн скорочує час завершення аеробних тестів',
    facts: ['Низькі дози за класифікацією авторів', 'Стандартизована різниця середніх −0,27', '95% ДІ −0,44…−0,11'],
    question: 'Що означає −0,27?',
    source: ['PubMed · PMID 42356375', 'https://pubmed.ncbi.nlm.nih.gov/42356375/'],
    correct: 1,
    options: [
      ['Результат покращується на 27%.', 'Ні. Це стандартизована різниця середніх, а не відсоток покращення чи секунди.'],
      ['У групах кофеїну час завершення тесту був меншим, ніж у плацебо; число показує розмір різниці в одиницях розкиду, а не в секундах.', 'Так. Інтервал −0,44…−0,11 не торкається нуля, тож у включених дослідженнях різницю видно. Це не рекомендація дозування.'],
      ['Кожна людина стане швидшою на 0,27 секунди.', 'Ні. Число не в секундах, а оцінка — середня по включених дослідженнях, не обіцянка для окремої людини.']
    ]
  },
  {
    id: 'magnesium-ci',
    claim: 'Магній і судоми',
    facts: ['3 дослідження, 177 учасників', 'Різниця середніх −9,59 процентного пункта', '95% ДІ −23,14…3,97'],
    question: 'Що показує інтервал від −23,14 до 3,97?',
    source: ['PubMed · PMID 32956536', 'https://pubmed.ncbi.nlm.nih.gov/32956536/'],
    correct: 2,
    options: [
      ['Магній точно зменшує судоми.', 'Ні. Інтервал проходить через нуль, а нуль означає відсутність різниці.'],
      ['Магній шкодить: судом стає більше.', 'Ні. Інтервал не доводить і шкоди: він теж проходить через нуль.'],
      ['Інтервал вміщує і користь, і відсутність різниці, і трохи гірший результат. Тому чіткої переваги магнію не встановлено.', 'Так. Огляд стосується переважно літніх людей з ідіопатичними судомами; на судоми під час тренування це переносити не можна.']
    ]
  },
  {
    id: 'dose-compare',
    claim: 'Помірна доза краща за низьку?',
    facts: ['Низькі дози −0,27 (−0,44…−0,11)', 'Помірні дози −0,52 (−0,77…−0,28)'],
    question: 'Чи доводять ці числа, що помірна доза працює краще?',
    source: ['PubMed · PMID 42356375', 'https://pubmed.ncbi.nlm.nih.gov/42356375/'],
    correct: 0,
    options: [
      ['Ні. Для цього потрібне пряме порівняння двох доз; дві окремі оцінки самі по собі перевагу не доводять.', 'Так. Саме це сказано в досьє: порівняння двох оцінок саме по собі не доводить перевагу помірної дози.'],
      ['Так, бо число −0,52 більше за −0,27.', 'Ні. Більше число в одній оцінці не означає, що доза «краща» за іншу: різницю між дозами треба перевіряти окремо.'],
      ['Так, бо інтервал помірної дози не торкається нуля.', 'Ні. Обидва інтервали не торкаються нуля, але це говорить про різницю з плацебо, а не про різницю між дозами.']
    ]
  }
];

const LETTERS = ['А', 'Б', 'В'];
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };

export function buildTrainer() {
  const root = el('section', 'eua-trainer');
  root.setAttribute('aria-labelledby', 'eua-trainer-title');
  let index = 0;
  const head = el('div', 'eua-trainer-head');
  const title = el('h3', '', 'Спробуй сам: перевір твердження'); title.id = 'eua-trainer-title';
  const progress = el('p', 'eua-trainer-progress'); progress.setAttribute('aria-live', 'polite');
  head.append(title, progress);
  const body = el('div', 'eua-trainer-body');
  const note = el('p', 'eua-trainer-note', 'Це навчання читанню чисел, а не порада приймати добавки. Числа взято з досьє на цій сторінці.');
  root.append(head, body, note);

  function render() {
    body.replaceChildren();
    if (index >= CARDS.length) {
      progress.textContent = 'Усі три картки розібрано';
      const done = el('div', 'eua-trainer-done');
      done.append(el('p', '', 'Тепер ти знаєш три питання, які варто ставити до будь-якого числа: у чому воно виміряне, чи інтервал торкається нуля, чи порівняння пряме.'));
      const again = el('button', 'eua-trainer-btn', 'Пройти ще раз'); again.type = 'button';
      again.addEventListener('click', () => { index = 0; render(); title.focus?.(); });
      done.append(again); body.append(done); return;
    }
    const card = CARDS[index];
    progress.textContent = `Картка ${index + 1} з ${CARDS.length}`;
    body.append(el('h4', 'eua-trainer-claim', card.claim));
    const facts = el('ul', 'eua-trainer-facts'); card.facts.forEach(f => facts.append(el('li', '', f))); body.append(facts);
    body.append(el('p', 'eua-trainer-question', card.question));
    const list = el('div', 'eua-trainer-options'); list.setAttribute('role', 'group'); list.setAttribute('aria-label', card.question);
    const feedback = el('div', 'eua-trainer-feedback'); feedback.setAttribute('aria-live', 'polite');
    const buttons = card.options.map(([text], i) => {
      const b = el('button', 'eua-trainer-option'); b.type = 'button';
      b.append(el('span', 'eua-trainer-letter', LETTERS[i]), el('span', 'eua-trainer-text', text));
      b.addEventListener('click', () => answer(i)); list.append(b); return b;
    });
    body.append(list, feedback);

    function answer(chosen) {
      buttons.forEach((b, i) => {
        b.disabled = true;
        const mark = el('span', 'eua-trainer-mark', i === card.correct ? 'Правильно' : (i === chosen ? 'Не те' : ''));
        if (i === card.correct) b.classList.add('is-correct'); else if (i === chosen) b.classList.add('is-wrong');
        if (mark.textContent) b.querySelector('.eua-trainer-text').prepend(mark);
      });
      feedback.replaceChildren();
      const verdict = chosen === card.correct ? 'Так, ти прочитав(ла) це правильно.' : 'Не зовсім. Ось як це читається.';
      feedback.append(el('p', 'eua-trainer-verdict', verdict));
      card.options.forEach(([, why], i) => { const p = el('p', 'eua-trainer-why' + (i === card.correct ? ' is-correct' : '')); p.append(el('strong', '', LETTERS[i] + ' · '), why); feedback.append(p); });
      const src = el('a', 'eua-trainer-source', card.source[0] + ' ↗'); src.href = card.source[1]; src.target = '_blank'; src.rel = 'noopener'; feedback.append(src);
      const next = el('button', 'eua-trainer-btn', index + 1 < CARDS.length ? 'Наступна картка →' : 'Завершити'); next.type = 'button';
      next.addEventListener('click', () => { index += 1; render(); body.querySelector('.eua-trainer-claim, .eua-trainer-done p')?.setAttribute('tabindex', '-1'); body.querySelector('[tabindex="-1"]')?.focus(); });
      feedback.append(next); next.focus();
    }
  }
  render();
  return root;
}

export function mountTrainer(doc = document) {
  const guide = doc.querySelector('.evidence-guide');
  if (!guide || guide.querySelector('.eua-trainer')) return !!guide;
  const lead = guide.querySelector('h2 + p');
  const trainer = buildTrainer();
  if (lead) lead.after(trainer); else guide.prepend(trainer);
  return true;
}

if (typeof document !== 'undefined') {
  // navigation-v17.js builds the guide after load; wait for it instead of depending on script order.
  if (!mountTrainer()) {
    const watch = new MutationObserver(() => { if (mountTrainer()) watch.disconnect(); });
    watch.observe(document.body, {childList: true, subtree: true});
    setTimeout(() => watch.disconnect(), 8000);
  }
}
