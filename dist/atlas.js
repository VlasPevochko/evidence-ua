const zoneMeta={
 brain:{title:'Мозок',summary:'Сон, стрес, когнітивні функції, фізична активність і фактори, що впливають на роботу нервової системи.'},
 shoulder:{title:'Плечовий комплекс',summary:'Анатомія, найпоширеніші стани, навантаження, реабілітація та спосіб читати наукові дані без спрощення до «працює / не працює».'},
 spine:{title:'Хребет',summary:'Біль, навантаження, рух, адаптація та сучасний погляд на структурні знахідки.'},
 muscles:{title:'М’язова система',summary:'Сила, гіпертрофія, відновлення, адаптація до навантаження та тренувальні змінні.'},
 gut:{title:'ШКТ',summary:'Травлення, мікробіом, харчування та взаємодія способу життя з шлунково-кишковою системою.'},
 knee:{title:'Коліно',summary:'Навантаження, травми, біль, повернення до активності та силове тренування.'}
};

const shoulderTopics=[
 {title:'Ротаторна манжета',copy:'Функції, поширені проблеми, навантаження, реабілітація та доказові підходи.',tag:'Анатомія · Біль · Навантаження'},
 {title:'Субакроміальний біль',copy:'Чому один лише простір під акроміоном не пояснює симптоми та як мислити про навантаження.',tag:'Симптоми · Реабілітація'},
 {title:'Нестабільність плеча',copy:'Типи нестабільності, фактори ризику та логіка повернення до навантаження.',tag:'Стабільність · Травми'},
 {title:'Біцепс',copy:'Довга головка біцепса, сухожилок, провокація симптомів і силове навантаження.',tag:'Анатомія · Сухожилки'},
 {title:'AC-суглоб',copy:'Акроміально-ключичний суглоб: навантаження, біль і контекст травми.',tag:'Біль · Травми'}
];

const tabContent={
 overview:()=>`<div class="atlas-copy-card"><h3>Як читати цей модуль</h3><p>Плече — перша повністю розгорнута область Atlas v0.1. Тут ми не намагаємося поставити діагноз за точкою болю. Мета — показати структуру знань: що це за область, які питання виникають найчастіше, що варто перевіряти і де закінчується впевненість доказів.</p></div>${shoulderTopics.map((topic,index)=>`<article class="atlas-topic"><div class="atlas-topic-icon" aria-hidden="true">${String(index+1).padStart(2,'0')}</div><div><h3>${topic.title}</h3><p>${topic.copy}</p></div><span class="atlas-topic-tag">${topic.tag}</span></article>`).join('')}`,
 anatomy:()=>`<div class="atlas-copy-card"><h3>Анатомія як карта, а не діагноз</h3><p>Плечовий комплекс включає гленогумеральний, акроміально-ключичний і грудино-ключичний суглоби, лопатково-грудну взаємодію, ротаторну манжету та велику кількість м’язів і сухожиль.</p><ul><li>Структура допомагає зрозуміти функцію.</li><li>Зміни на візуалізації не завжди пояснюють біль.</li><li>Оцінка руху й навантаження потребує контексту.</li></ul></div>`,
 symptoms:()=>`<div class="atlas-copy-card"><h3>Симптоми — це початок питання</h3><p>Локалізація болю, провокуючі рухи, травматичний механізм, слабкість, нічний біль та зміни функції можуть спрямувати оцінку, але не замінюють клінічного обстеження.</p><ul><li>Гостра травма з вираженою втратою функції потребує окремої оцінки.</li><li>Одна провокативна проба рідко дає надійний діагноз сама по собі.</li><li>Навантажувальна толерантність змінюється з часом.</li></ul></div>`,
 training:()=>`<div class="atlas-copy-card"><h3>Тренування плеча</h3><p>Evidence UA розглядає тренування через кероване навантаження, доступний діапазон руху, прогресію обсягу та інтенсивності, а не через універсальний список «безпечних» і «небезпечних» вправ.</p><ul><li>Силові вправи можуть бути частиною профілактики й відновлення.</li><li>Біль під час руху оцінюється разом із реакцією після навантаження.</li><li>Прогресія залежить від задачі людини та попереднього рівня.</li></ul></div>`,
 rehab:()=>`<div class="atlas-copy-card"><h3>Реабілітація</h3><p>Базова логіка — повернути функцію й толерантність до необхідних навантажень. Конкретний план залежить від стану, тяжкості, часу після травми, вимог спорту чи роботи та супутніх факторів.</p><ul><li>Освіта та керування навантаженням.</li><li>Поступова силова робота.</li><li>Відновлення специфічних для задачі рухів.</li></ul></div>`,
 research:()=>`<div class="atlas-copy-card"><h3>Як тут з’являтимуться докази</h3><p>Кожен завершений матеріал Atlas має розділяти висновок, рівень впевненості, практичну інтерпретацію та першоджерела. Ми не використовуємо декоративний «відсоток ефективності».</p><ul><li>Систематичні огляди та клінічні рекомендації — для широкої картини.</li><li>RCT та спостережні роботи — для конкретних питань.</li><li>Обмеження й невизначеність показуються поруч із висновком.</li></ul></div>`
};

const zoneButtons=[...document.querySelectorAll('[data-zone]')];
const tabs=[...document.querySelectorAll('[data-atlas-tab]')];
const title=document.getElementById('atlas-zone-title');
const summary=document.getElementById('atlas-zone-summary');
const status=document.getElementById('atlas-zone-status');
const content=document.getElementById('atlas-content');
let selectedZone='shoulder';
let selectedTab='overview';

function render(){
 const meta=zoneMeta[selectedZone];title.textContent=meta.title;summary.textContent=meta.summary;
 zoneButtons.forEach(button=>{const active=button.dataset.zone===selectedZone;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
 const shoulder=selectedZone==='shoulder';
 tabs.forEach(button=>{button.disabled=!shoulder;button.hidden=!shoulder;button.setAttribute('aria-selected',String(shoulder&&button.dataset.atlasTab===selectedTab));});
 if(shoulder){status.textContent='Перший повний модуль';content.innerHTML=tabContent[selectedTab]();return;}
 status.textContent='Розділ у розробці';
 content.innerHTML=`<div class="atlas-coming"><strong>Розділ у розробці</strong><h3>${meta.title}: каркас уже в Атласі</h3><p>У v0.1 ця область доступна для навігації та демонструє майбутню структуру, але науковий модуль ще не заповнений. Ми не підміняємо відсутні матеріали загальними медичними порадами.</p></div>`;
}

zoneButtons.forEach(button=>button.addEventListener('click',()=>{selectedZone=button.dataset.zone;selectedTab='overview';render();}));
tabs.forEach((button,index)=>{
 button.addEventListener('click',()=>{if(selectedZone!=='shoulder')return;selectedTab=button.dataset.atlasTab;render();});
 button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const step=event.key==='ArrowRight'?1:-1;tabs[(index+step+tabs.length)%tabs.length].focus();});
});
render();
