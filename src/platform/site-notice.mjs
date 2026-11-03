// Спільне застереження внизу кожної сторінки (2026-11-03, «Довіра 2»). Єдине джерело тексту: збірка (scripts/build-platform.mjs) вставляє його у dist/*.html,
// а tests/site-notice.test.mjs перевіряє, що на кожній сторінці воно одне й дослівно таке. Речення вже вживається в рядку під картками добавок («Матеріал освітній і не є
// персональною медичною рекомендацією»), тому тут воно те саме, без нових тверджень. Посилання веде на сторінку «Про проєкт».
export const SITE_NOTICE_TEXT='Матеріал освітній і не є персональною медичною рекомендацією.';
export const SITE_NOTICE_LINK={text:'Про проєкт',href:'./about.html'};
export const siteNoticeHTML=()=>`<div class="eua-site-notice" role="note"><p>${SITE_NOTICE_TEXT}</p><a href="${SITE_NOTICE_LINK.href}">${SITE_NOTICE_LINK.text}</a></div>`;
// Вставка в готову сторінку: стара вставка прибирається, свіжа ставиться перед порожніми <script src></script> наприкінці сторінки, тобто останнім видимим елементом.
// Так вирішено тому, що збірки карток добавок (scripts/build-protein.mjs, build-berberine.mjs, build-supplement-cards.mjs) щоразу дописують свої скрипти перед </body>:
// якби застереження стояло безпосередньо перед </body>, ці збірки зсували б його, і tests/dossiers.test.mjs («Build must be idempotent») падав би.
// Стилі підключаються один раз. Повторний запуск нічого не змінює.
export function withSiteNotice(html){
  const end=html.lastIndexOf('</body>');
  if(end<0)return html;
  let head=html.slice(0,end).replace(/<div class="eua-site-notice"[\s\S]*?<\/div>\n?/,'');
  const run=head.match(/(?:<script\b[^>]*><\/script>\s*)*$/)[0];
  head=head.slice(0,head.length-run.length)+siteNoticeHTML()+'\n'+run;
  if(!head.includes('site-notice.css'))head=head.replace('</head>','<link rel="stylesheet" href="./site-notice.css?v=1"></head>');
  return head+html.slice(end);
}
