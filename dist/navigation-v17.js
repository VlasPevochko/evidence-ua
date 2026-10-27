(() => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './navigation-v17.css?v=57';
  document.head.append(stylesheet);
  // Owner-selected Spectrum home owns its header and native catalog HTML.
  // Retain the evidence guide/footer below without rebuilding its new DOM.
  if (!document.querySelector('.spectrum-home')) {
  const nav = document.querySelector('header nav');
  const logo = document.querySelector('header .logo');
  const tagline = logo.querySelector('small');
  const logoGroup = document.createElement('div'); logoGroup.className = logo.className;
  logo.before(logoGroup); logoGroup.append(logo, tagline); logo.className = 'brand-home';
  const movement = document.createElement('a'); movement.href = './movement.html';
  movement.textContent = 'РУХ'; movement.className = 'movement-link';
  movement.setAttribute('aria-label', 'Відкрити розділ Рух');
  tagline.lastElementChild.replaceWith(movement);
  nav.replaceChildren();
  [['Напрями', './directions.html'], ['Харчування', './nutrition.html'], ['Дослідження', '#pubmed-live']].forEach(([text, href]) => {
    const a = document.createElement('a'); a.textContent = text; a.href = href; nav.append(a);
  });
  const cards = document.getElementById('cards');
  const topics = window.EvidenceUAHomeTopics || [
    {id:'muscle',title:'М’язи та тренування',subtitle:'Muscle Lab',href:'./muscle-lab.html',state:'Навчальний модуль',position:'18.5%'},
    {id:'nutrition',title:'Харчування',subtitle:'Nutrition Lab',href:'./nutrition.html',state:'Перша навчальна версія',position:'34%'},
    {id:'supplements',title:'Добавки',subtitle:'Наукові досьє',href:'#supplement-library',state:'Огляди з джерелами',position:'50%'}
  ];
  cards.replaceChildren();
  cards.setAttribute('aria-label', 'Тематичні напрями Evidence UA');
  topics.forEach(({id,title,subtitle,position,href,state:readiness}) => {
    const card = document.createElement('a');
    card.className = 'topic-card'; card.dataset.area=id; card.style.setProperty('--topic-x', position);card.href=href;
    const strong = document.createElement('strong'); strong.textContent = title;
    const small = document.createElement('small'); small.textContent = subtitle;
    const state = document.createElement('span'); state.className = 'topic-state'; state.textContent = readiness+' · Відкрити →';
    card.append(strong, small, state); cards.append(card);
  });
  document.querySelector('.supplement-heading').id = 'supplement-library';
  document.querySelector('.copy .cta').href = '#start-here';
  }
  const carousel = document.querySelector('.supplement-entry');
  const mobile = matchMedia('(max-width:1024px)');
  const guide = document.createElement('section');
  guide.className = 'evidence-guide';
  guide.setAttribute('aria-labelledby', 'evidence-guide-title');
  const guideTitle = document.createElement('h2');
  guideTitle.id = 'evidence-guide-title';
  guideTitle.textContent = 'Як читати докази';
  const guideLead = document.createElement('p');
  guideLead.textContent = 'Метааналіз об’єднує результати досліджень, а не перетворює будь-який висновок на істину. РКД — рандомізоване контрольоване дослідження. Три кроки, щоб перевірити, що насправді стоїть за висновком.';
  guide.append(guideTitle, guideLead);
  [
    ['01 · Що означає висновок метааналізу?', [
      'Почни з питання: які люди, яке втручання, з чим його порівнювали й що вимірювали? Відкрий Methods, таблицю характеристик і Results, а не лише Abstract або Conclusions. Перевір критерії включення, дату й повноту пошуку: що могло залишитися за межами огляду?',
      'На forest plot дивись на оцінку ефекту, 95% довірчий інтервал і вагу дослідження. Для різниці середніх нуль означає відсутність різниці, для відношення ризиків — одиниця. Стандартизована різниця середніх не вимірюється в кілограмах.',
      'Не голосуй «два позитивні проти одного негативного». Підрахунок статистично значущих результатів не замінює синтез величин ефекту й невизначеності. Статистична значущість також не відповідає на питання, чи ефект практично важливий.'
    ], [[4,'Пошук та відбір'],[6,'Величина ефекту'],[12,'Чому не рахуємо «позитивні»']]],
    ['02 · Що приховано за «+5 кг, +3 кг, без змін»?', [
      'Умовний приклад нижче — вигадані навчальні числа, не результати досліджень і не обіцянка ефекту. Уяви, що всі три публікації повідомили зміну безжирової маси. Заголовок уже назвав її «м’язовою»: спочатку звір, чи це справді той показник, який вимірювали.',
      'Перевір кожне РКД: вік і досвід учасників, кількість людей, тривалість, дозу, тренування, харчування та метод вимірювання. Чи умови були зіставними між групами всередині дослідження? Чи близькі дослідження між собою? Різні умови не доводять помилку, але можуть обмежувати спільний висновок.',
      'Для метааналізу оцінюй неоднорідність результатів і аналізи чутливості. I² — показник статистичної неоднорідності, не «відсоток поганих досліджень»; низьке I² не гарантує однакових умов. Чи зберігається висновок після виключення досліджень із високим ризиком упередженості?'
    ], [[6,'Порівняння груп'],[10,'Неоднорідність і чутливість']]],
    ['03 · Наскільки надійні докази й хто фінансував роботу?', [
      'У РКД перевір рандомізацію та приховування розподілу, відхилення від втручань, вибуття учасників, вимірювання результату й вибір того, що опублікували. Засліплення оцінюй з урахуванням можливостей конкретного дослідження. Сам напис «рандомізоване» не гарантує низького ризику упередженості.',
      'Відкрий Funding і Conflicts of interest у самому огляді та включених дослідженнях. Хто оплатив роботу? Яка роль спонсора в дизайні, аналізі та публікації? Фінансовий зв’язок — сигнал перевіряти ретельніше, а не автоматичний доказ обману. Відсутність заявленого конфлікту теж не гарантує бездоганності.',
      'Перевір протокол або реєстрацію: чи збігаються заплановані й опубліковані результати? Чи враховані відсутні або неопубліковані дані? Для конкретного результату GRADE оцінює впевненість у доказах: ризик упередженості, неузгодженість, непрямість, неточність і публікаційне упередження. Це не рейтинг «добавки загалом».',
      'Висновок формулюй з межами: «У таких учасників, за таких умов, порівняно з таким контролем спостерігали такий ефект; впевненість обмежена ось чим». Якщо даних бракує, чесна відповідь — «поки не можемо зробити певний висновок».'
    ], [[8,'Ризик упередженості РКД'],[7,'Фінансування та конфлікти'],[14,'Впевненість у доказах']]]
  ].forEach(([question, paragraphs, sources], index) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = question;
    details.append(summary);
    paragraphs.forEach((text, i) => {
      const p = document.createElement('p'); p.textContent = text; details.append(p);
      if(index === 1 && i === 0) {
        const example = document.createElement('div'); example.className = 'guide-example';
        example.innerHTML = '<div class="guide-table-scroll" role="region" aria-label="Умовні дані трьох досліджень" tabindex="0"><table><caption>Навчальний приклад · зміна від початкового рівня</caption><thead><tr><th scope="col">РКД</th><th scope="col">Втручання</th><th scope="col">Контроль</th><th scope="col">Умови</th></tr></thead><tbody><tr><th scope="row">А · 20 людей</th><td>+5 кг</td><td>+4,5 кг</td><td>Новачки · 24 тижні</td></tr><tr><th scope="row">Б · 80 людей</th><td>+3 кг</td><td>+2,8 кг</td><td>Треновані · 12 тижнів</td></tr><tr><th scope="row">В · 24 людини</th><td>0 кг</td><td>0 кг</td><td>Літні учасники · 4 тижні</td></tr></tbody></table></div><details class="example-reveal"><summary>Що змінює контрольна група?</summary><p>У прикладі А проста різниця змін: 5 − 4,5 = +0,5 кг; у Б: 3 − 2,8 = +0,2 кг; у В: 0 кг. Це ще не повний статистичний аналіз. Без оцінки невизначеності й перевірки методів не можна стверджувати, що ефект доведений або відсутній, чи обчислювати спільний ефект. «Два з трьох спрацювали» — недостатній висновок.</p></details>';
        details.append(example);
      }
    });
    const links = document.createElement('div'); links.className = 'guide-sources';
    sources.forEach(([chapter, title]) => { const a=document.createElement('a');a.href='https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-'+String(chapter).padStart(2,'0');a.target='_blank';a.rel='noopener';a.textContent='Cochrane · '+title+' ↗';links.append(a); });
    details.append(links); guide.append(details);
  });
  const guideNote = document.createElement('p');
  guideNote.className = 'guide-note';
  guideNote.textContent = 'Evidence UA допомагає перейти від короткого висновку до першоджерел і ставити перевірочні запитання. Цей посібник не означає, що всі наші досьє вже пройшли повну оцінку RoB 2 чи GRADE. Методологічні джерела перевірено 09.10.2026.';
  guide.append(guideNote);
  carousel.after(guide);
  if (['#supplement-library', '#evidence-guide-title'].includes(location.hash)) {
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
  }
  // Keep the guide beside the library when switching between mobile and desktop.
  mobile.addEventListener('change', () => carousel.after(guide));
  document.querySelectorAll('.bottom > a[href="#creatine"]').forEach(a => a.hidden = true);
  const footer = document.querySelector('.mission');
  footer.replaceChildren();
  const brand = document.createElement('span'); brand.textContent = 'Evidence UA · Наука, здоров’я та рух';
  const note = document.createElement('span'); note.textContent = 'Інформаційні матеріали, не індивідуальна медична рекомендація';
  const catalogLink = document.createElement('a'); catalogLink.href = './directions.html'; catalogLink.textContent = 'Каталог матеріалів →';
  footer.append(brand, note, catalogLink);
})();
