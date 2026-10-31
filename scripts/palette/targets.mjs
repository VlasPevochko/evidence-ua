// Стилі, що слідують за палітрою (космічна за замовчуванням, зелена як варіант). Головна сторінка має власні стилі (home-*.css) і сюди не входить.
// «src/…» — джерела, з яких збірка копіює файл у dist; решта — авторські файли в dist.
export const CSS_TARGETS=[
  'dist/platform.css','dist/atlas.css','dist/page-pine.css','dist/knee-pain-map.css','dist/shoulder-pain-map.css','dist/atlas-coordinate-map.css',
  'dist/cell-lab.css','dist/study-ui.css','dist/cell-vcard.css','dist/changes-page.css','dist/compare-page.css','dist/directions-pine.css',
  'dist/exercises.css','dist/fat-burning.css','dist/fat-burning-pine.css','dist/glossary-page.css','dist/map-page.css','dist/mechanisms-page.css',
  'dist/movement.css','dist/learning-notes.css','dist/muscle-lab.css','dist/digestion.css','dist/nutrition-lab.css','dist/nutrition-diets.css',
  'dist/nutrition-fat-burning.css','dist/nutrition-navigation.css','dist/research-page.css','dist/sleep.css','dist/supplements.css','dist/videos-page.css',
  'dist/next-steps.css','dist/terms.css','dist/appearance.css','dist/experience.css','dist/nutrition-timeline.css',
  'src/platform/site-header.css','src/evidence/evidence.css'
];
// Авторські HTML-сторінки з вбудованим <style>.
export const HTML_TARGETS=['dist/protein-meta.html'];
export const EXTRAS='src/palette/cosmic-extras.css';
export const OUTPUT='dist/palette-cosmic.css';
// Стилі головної: у токени не переводяться, файл палітри на головній не підключається.
export const isHomeOnlyCss=file=>/^dist\/(home-[^/]*|desktop|evidence-trainer)\.css$/.test(file);
// Інші стилі, які навмисно не переводяться в токени, і чому. tests/palette.test.mjs вимагає, щоб кожен стиль у dist був ціллю, стилем головної або тут.
export const EXCLUDED_CSS={
  'dist/navigation-v17.css':'вантажиться лише з navigation-v17.js, який підключає тільки головна',
  'dist/directions.css':'залишок до нової головної: жодна сторінка його не підключає',
  'dist/print.css':'друк на білому папері, палітра екрана не потрібна',
  'dist/fonts.css':'лише підключення шрифтів',
  'dist/palette-cosmic.css':'сам згенерований файл палітри',
  'dist/site-header.css':'копія src/platform/site-header.css (ціль палітри там)',
  'dist/evidence/evidence.css':'копія src/evidence/evidence.css (ціль палітри там)'
};
