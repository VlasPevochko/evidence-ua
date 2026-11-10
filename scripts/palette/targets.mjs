import fs from 'node:fs';
import path from 'node:path';

// Схеми, намальовані SVG-атрибутами fill/stroke/stop-color у скриптах і сторінках: токенів у них немає, тому темні плити під схемами перефарбовують
// правила за атрибутом (scripts/build-palette.mjs). Головна сюди не входить: вона файл палітри не підключає.
export const SVG_ATTR=/\b(fill|stroke|stop-color)="(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)"/g;
const isHomeOnlyScript=name=>name==='index.html'||/^home-/.test(name)||name==='navigation-v17.js';
export const plateSources=root=>fs.readdirSync(path.join(root,'dist')).filter(f=>/\.(js|html)$/.test(f)&&!isHomeOnlyScript(f)).sort().map(f=>'dist/'+f);

// Стилі, що слідують за палітрою (космічна за замовчуванням, зелена як варіант). Головна сторінка має власні стилі (home-*.css) і сюди не входить.
// «src/…» — джерела, з яких збірка копіює файл у dist; решта — авторські файли в dist.
export const CSS_TARGETS=[
  'dist/platform.css','dist/atlas.css','dist/page-pine.css','dist/knee-pain-map.css','dist/shoulder-pain-map.css','dist/atlas-coordinate-map.css',
  'dist/cell-lab.css','dist/study-ui.css','dist/cell-vcard.css','dist/changes-page.css','dist/compare-page.css','dist/directions-pine.css',
  'dist/exercises.css','dist/fat-burning.css','dist/fat-burning-pine.css','dist/glossary-page.css','dist/map-page.css','dist/about-page.css','dist/mechanisms-page.css',
  'dist/movement.css','dist/learning-notes.css','dist/muscle-lab.css','dist/digestion.css','dist/nutrition-lab.css','dist/nutrition-diets.css',
  'dist/nutrition-fat-burning.css','dist/nutrition-navigation.css','dist/research-page.css','dist/sleep.css','dist/supplements.css','dist/videos-page.css',
  'dist/next-steps.css','dist/terms.css','dist/appearance.css','dist/experience.css','dist/nutrition-timeline.css',
  'src/platform/site-header.css','src/evidence/evidence.css'
];
// Авторські HTML-сторінки з вбудованим <style>.
export const HTML_TARGETS=['dist/protein-meta.html'];
export const EXTRAS='src/palette/cosmic-extras.css';
// Режим «стаття» на головній (розбір добавки в index.html): файл палітри головна не вантажить (див. нижче), тож токени для карток розбору дає окремий згенерований файл.
// Він діє лише під body[data-route-view="article"] і лише тоді, коли обрано не зелений варіант. Токени беруться зі стилів, які режим «стаття» реально підтягує.
export const ARTICLE_CSS=['src/evidence/evidence.css','dist/experience.css','dist/appearance.css','dist/platform.css','dist/terms.css','dist/next-steps.css','src/platform/site-header.css'];
export const ARTICLE_EXTRAS='src/palette/cosmic-article-extras.css';
export const ARTICLE_OUTPUT='dist/home-article-cosmic.css';
export const ARTICLE_SCOPE='html:not([data-palette="green"]) body[data-route-view="article"]';
// Префікс для копій старих правил розбору (scripts/palette/article-overrides.mjs, позначка «@p»). Повний ARTICLE_SCOPE додав би до кожної копії силу селектора (0,2,2) і
// зробив би її сильнішою за ті правила розбору, які раніше перемагали (приклад: `#creatine.eua-module a.eua-primary` мав темний текст на лавандовій кнопці, а копія
// `#creatine a{color:лаванда}` стала сильнішою й дала лавандовий текст на лавандовому тлі). Тому :where() не додає сили, а :not(x-eua) додає рівно одну одиницю
// (як ще один елемент): копія перемагає власний оригінал за будь-якого порядку файлів, але не правила, що були сильнішими за нього. Ручні доповнення (позначка «@s»)
// лишаються під повним ARTICLE_SCOPE: вони навмисно сильні (!important для заголовків, тло сторінки, кнопка меню в шапці проти стилів home-controls.css).
export const ARTICLE_PARITY=`:where(${ARTICLE_SCOPE}):not(x-eua)`;
export const OUTPUT='dist/palette-cosmic.css';
// Стилі головної: у токени не переводяться, файл палітри на головній не підключається.
export const isHomeOnlyCss=file=>/^dist\/(home-[^/]*|desktop|evidence-trainer)\.css$/.test(file);
// Інші стилі, які навмисно не переводяться в токени, і чому. tests/palette.test.mjs вимагає, щоб кожен стиль у dist був ціллю, стилем головної або тут.
export const EXCLUDED_CSS={
  'dist/atlas-redesign.css':'окрема палітра атласу за референсом: темно-синя, зелена та світла теми задані локальними змінними',
  'dist/navigation-v17.css':'вантажиться лише з navigation-v17.js, який підключає тільки головна',
  'dist/directions.css':'залишок до нової головної: жодна сторінка його не підключає',
  'dist/print.css':'друк на білому папері, палітра екрана не потрібна',
  'dist/fonts.css':'лише підключення шрифтів',
  'dist/palette-cosmic.css':'сам згенерований файл палітри',
  'dist/site-header.css':'копія src/platform/site-header.css (ціль палітри там)',
  'dist/evidence/evidence.css':'копія src/evidence/evidence.css (ціль палітри там)',
  'dist/site-notice.css':'лише currentColor і прозорість (колір береться від тексту сторінки, а той уже слідує палітрі); власних кольорів немає',
  'dist/eua-stamp.css':'лише currentColor (колір береться від тексту рядка, а той уже слідує палітрі) і запасний сірий для браузерів без color-mix; власних кольорів палітри немає'
};
