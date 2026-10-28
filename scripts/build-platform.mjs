import fs from 'node:fs';
import {readBase} from './site-url.mjs';
const SITE_BASE=readBase();
import {learningNotesHTML} from '../src/platform/learning-notes.mjs';
import {catalog} from '../src/platform/catalog.mjs';
import {homeLearningHTML} from '../src/platform/learning-ui.mjs';
import {homeSpectrumHTML} from '../src/platform/home-spectrum.mjs';
import {homeDirectionsHTML} from '../src/platform/home-directions.mjs';
import {materials} from '../src/platform/materials.mjs';
for(const area of catalog.areas.filter(a=>a.available))for(const href of [area.href,...area.units.map(u=>u.href)]){
  const file='dist/'+href.replace(/^\.\//,'').split(/[?#]/)[0];
  if(!fs.existsSync(file))throw Error('Catalog page missing: '+file);
}
fs.writeFileSync('dist/platform-catalog.js',fs.readFileSync('src/platform/catalog.mjs','utf8').replace("'../evidence/core/entities.mjs'","'./evidence/entities.js?v=54'"));
const positions={muscle:'18.5%',nutrition:'34%',supplements:'50%',cell:'3%',movement:'3%',sleep:'75%'};
const homeTopics=catalog.areas.filter(a=>a.available).map(a=>({id:a.id,title:a.title,subtitle:a.lab,href:a.id==='supplements'?'#supplement-library':a.href,state:a.state,position:positions[a.id]||'50%'}));
const homeDirections=homeDirectionsHTML(homeTopics);
fs.writeFileSync('dist/home-catalog.js','// Generated from the shared catalog. Available pages only.\nwindow.EvidenceUAHomeTopics='+JSON.stringify(homeTopics)+';\n');
fs.writeFileSync('dist/home-feedback.js',fs.readFileSync('src/platform/home-feedback.mjs','utf8').replace("'./materials.mjs'","'./platform-materials.js?v=103'"));
fs.writeFileSync('dist/platform-materials.js',fs.readFileSync('src/platform/materials.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=100'").replace("'../evidence/core/entities.mjs'","'./evidence/entities.js?v=59'"));
fs.writeFileSync('dist/platform-tools.js',fs.readFileSync('src/platform/quick-tools.mjs','utf8').replace("'./materials.mjs'","'./platform-materials.js?v=103'"));
fs.writeFileSync('dist/platform-next-steps.js',fs.readFileSync('src/platform/next-steps.mjs','utf8'));
fs.writeFileSync('dist/platform-terms.js',fs.readFileSync('src/platform/terms.mjs','utf8'));
fs.writeFileSync('dist/platform-shell.js',fs.readFileSync('src/platform/shell.mjs','utf8').replace("'./next-steps.mjs'","'./platform-next-steps.js?v=4'").replace("'./terms.mjs'","'./platform-terms.js?v=2'").replace("'./catalog.mjs'","'./platform-catalog.js?v=100'").replace("'./quick-tools.mjs'","'./platform-tools.js?v=103'").replace("'./site-header.mjs'","'./site-header.js?v=11'"));
fs.writeFileSync('dist/platform-learning.js',fs.readFileSync('src/platform/learning-ui.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=100'"));
fs.writeFileSync('dist/directions.js',fs.readFileSync('src/platform/directory.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=100'").replace("'./materials.mjs'","'./platform-materials.js?v=103'").replace("'./quick-tools.mjs'","'./platform-tools.js?v=103'").replace("'./learning-ui.mjs'","'./platform-learning.js?v=86'").replace("'./site-header.mjs'","'./site-header.js?v=11'"));
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){const path='dist/'+file;const old=fs.readFileSync(path,'utf8'),next=old.replaceAll('platform-shell.js?v=54','platform-shell.js?v=59').replaceAll('nutrition-lab.js?v=55','nutrition-lab.js?v=59').replaceAll('cell-lab.js?v=56','cell-lab.js?v=59').replaceAll('muscle-lab.js?v=58','muscle-lab.js?v=59').replaceAll('home-feedback.js?v=57','home-feedback.js?v=59');if(next!==old)fs.writeFileSync(path,next);}
console.log('Shared catalog validated and copied. No scientific conclusions changed.');
const homeFile='dist/index.html';
const home=fs.readFileSync(homeFile,'utf8');
const withRoutes=home.replace(/<!-- EUA_HOME_SPECTRUM_START -->[\s\S]*?<!-- EUA_HOME_SPECTRUM_END -->/,'<!-- EUA_HOME_SPECTRUM_START -->'+homeSpectrumHTML()+'<!-- EUA_HOME_SPECTRUM_END -->').replace(/<!-- EUA_HOME_LEARNING_START -->[\s\S]*?<!-- EUA_HOME_LEARNING_END -->/,'<!-- EUA_HOME_LEARNING_START -->'+homeLearningHTML()+'<!-- EUA_HOME_LEARNING_END -->').replace(/<!-- EUA_HOME_DIRECTIONS_START -->[\s\S]*?<!-- EUA_HOME_DIRECTIONS_END -->/,'<!-- EUA_HOME_DIRECTIONS_START -->'+homeDirections+'<!-- EUA_HOME_DIRECTIONS_END -->');
if(withRoutes!==home)fs.writeFileSync(homeFile,withRoutes);
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){
 const path='dist/'+file,old=fs.readFileSync(path,'utf8');
 const next=old.replaceAll('platform-shell.js?v=59','platform-shell.js?v=60').replaceAll('home-feedback.js?v=59','home-feedback.js?v=60').replaceAll('home-entry.css?v=57','home-entry.css?v=60').replaceAll('directions.js?v=59','directions.js?v=60');
 if(next!==old)fs.writeFileSync(path,next);
}
const directoryPath='dist/directions.html';
const directorySource=fs.readFileSync(directoryPath,'utf8');
const materialNoun=({one:'матеріал',few:'матеріали',many:'матеріалів'})[new Intl.PluralRules('uk').select(materials.length)]||'матеріалів';
const directoryCounts=directorySource.replace(/(id="catalog-area-total">)\d+/,'$1'+homeTopics.length).replace(/(id="catalog-material-total">)\d+(<\/strong>)\s+матеріал(?:ів|и)?/,'$1'+materials.length+'$2 '+materialNoun).replace(/(id="catalog-path-total">)\d+/,'$1'+catalog.paths.length);
if(directoryCounts!==directorySource)fs.writeFileSync(directoryPath,directoryCounts);

// Cache references for the shared search experience.
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){
 const path='dist/'+file,old=fs.readFileSync(path,'utf8');
 const next=old.replaceAll('platform-shell.js?v=60','platform-shell.js?v=63').replaceAll('home-feedback.js?v=60','home-feedback.js?v=63').replaceAll('directions.js?v=60','directions.js?v=63').replaceAll('platform.css?v=59','platform.css?v=63');
 if(next!==old)fs.writeFileSync(path,next);
}
// The two learning pages use the existing static delivery and shared catalog.
fs.writeFileSync('dist/movement-model.js',fs.readFileSync('src/movement/model.mjs','utf8'));
fs.writeFileSync('dist/movement.js',fs.readFileSync('src/movement/page.mjs','utf8').replace("'./model.mjs'","'./movement-model.js?v=83'").replace("'./learning.mjs'","'./movement-learning.js?v=83'"));
fs.writeFileSync('dist/movement-learning.js',fs.readFileSync('src/movement/learning.mjs','utf8'));
fs.writeFileSync('dist/sleep.js',fs.readFileSync('src/sleep/page.mjs','utf8'));
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){
 const path='dist/'+file,old=fs.readFileSync(path,'utf8');
 let next=old.replace(/platform-shell\.js\?v=(?:63|81|82)/g,'platform-shell.js?v=83').replace(/directions\.js\?v=(?:63|70|82)/g,'directions.js?v=83') .replaceAll('home-catalog.js?v=82','home-catalog.js?v=83').replaceAll('home-feedback.js?v=82','home-feedback.js?v=83').replaceAll('home-coast.css?v=82','home-coast.css?v=83').replaceAll('home-catalog.js?v=57','home-catalog.js?v=83').replaceAll('home-feedback.js?v=63','home-feedback.js?v=83').replaceAll('home-coast.css?v=80','home-coast.css?v=83');
 if(file==='index.html')next=next.replace(/EVIDENCE UA \/ \d+ НАПРЯМІВ/g,'EVIDENCE UA / '+homeTopics.length+' НАПРЯМІВ').replace(/(class="home-direction-count" aria-hidden="true">)\d+</g,'$1'+homeTopics.length+'<').replace(/aria-label="(?:П’ять|Шість|\d+) напрямів Evidence UA"/g,'aria-label="'+homeTopics.length+' напрямів Evidence UA"');
 if(next!==old)fs.writeFileSync(path,next);
}

// Static explanatory notes remain readable without JavaScript. Only these marked fragments are regenerated.
fs.writeFileSync('dist/platform-glossary-data.js',fs.readFileSync('src/platform/glossary-data.mjs','utf8'));
fs.writeFileSync('dist/platform-glossary.js',fs.readFileSync('src/platform/glossary.mjs','utf8').replace("'./glossary-data.mjs'","'./platform-glossary-data.js?v=84'"));
for(const area of ['movement','sleep']){
 const file='dist/'+area+'.html',old=fs.readFileSync(file,'utf8');
 const marker=/<!-- EUA_LEARNING_NOTES_START -->[\s\S]*?<!-- EUA_LEARNING_NOTES_END -->/;
 if(!marker.test(old))throw Error('Learning notes marker missing: '+file);
 const next=old.replace(marker,'<!-- EUA_LEARNING_NOTES_START -->'+learningNotesHTML(area)+'<!-- EUA_LEARNING_NOTES_END -->');
 if(next!==old)fs.writeFileSync(file,next);
}

// Shared header assets and explicit cache versions on every document.
fs.copyFileSync('src/platform/site-header.mjs','dist/site-header.js');
fs.copyFileSync('src/platform/search.mjs','dist/platform-search.js');
fs.copyFileSync('src/platform/site-header.css','dist/site-header.css');
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=83','platform-shell.js?v=84').replaceAll('directions.js?v=83','directions.js?v=84');if(next!==old)fs.writeFileSync(file,next);}

// Geometry fix must reach returning visitors as well as fresh loads.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=84','platform-shell.js?v=85').replaceAll('./directions.js?v=84','./directions.js?v=85');if(next!==old)fs.writeFileSync(file,next);}

// The tools block folds into the one-line disclosure on the Atlas and Exercises pages too (pine theme rollout).
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=85','platform-shell.js?v=86');if(next!==old)fs.writeFileSync(file,next);}

// Every page with the pine theme (data-pine) folds the tools line, whatever its area.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=86','platform-shell.js?v=87');if(next!==old)fs.writeFileSync(file,next);}

// Study-UI pages (Nutrition, Cell Lab) keep their own compact tools row; only other pine pages fold it.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=87','platform-shell.js?v=88');if(next!==old)fs.writeFileSync(file,next);}

// Pages that keep their own compact tools row opt out of the fold with data-pine-tools (Muscle Lab).
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=88','platform-shell.js?v=89');if(next!==old)fs.writeFileSync(file,next);}

// Home: the share tool joins the folded «Про сайт» group (owner decision 2026-10-19), so the shell mounts it there.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=89','platform-shell.js?v=90');if(next!==old)fs.writeFileSync(file,next);}

// Home: «Продовжити з місця» (останній відкритий матеріал, лише в браузері відвідувача).
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=90','platform-shell.js?v=91');if(next!==old)fs.writeFileSync(file,next);}

// Вигляд сайту (тема й розмір тексту): модуль, стилі й ранній скрипт у <head> кожної сторінки (без мигання теми).
fs.copyFileSync('src/platform/appearance.mjs','dist/appearance.js');
const {earlyScript}=await import('../src/platform/appearance.mjs');
const appearanceHead=`<link rel="stylesheet" href="./appearance.css?v=1"><script>${earlyScript}</script><script type="module" src="./appearance.js?v=1"></script></head>`;
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');if(old.includes('eua-appearance-v1'))continue;const next=old.replace('</head>',appearanceHead);if(next!==old)fs.writeFileSync(file,next);}
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('appearance.css?v=1','appearance.css?v=3');if(next!==old)fs.writeFileSync(file,next);}
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('appearance.css?v=2','appearance.css?v=3');if(next!==old)fs.writeFileSync(file,next);}
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('appearance.css?v=3','appearance.css?v=4');if(next!==old)fs.writeFileSync(file,next);}

// «Куди далі» внизу сторінок (модуль підключає shell): нова версія оболонки.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=91','platform-shell.js?v=92');if(next!==old)fs.writeFileSync(file,next);}

// «Мій список» і підказки до термінів: нова версія оболонки та модуля «Куди далі».
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=92','platform-shell.js?v=93').replaceAll('platform-next-steps.js?v=1','platform-next-steps.js?v=4');if(next!==old)fs.writeFileSync(file,next);}

// Словник термінів: підказки отримали посилання «У словнику», тож модуль термінів і оболонка змінили версії.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=93','platform-shell.js?v=94').replaceAll('platform-terms.js?v=1','platform-terms.js?v=2');if(next!==old)fs.writeFileSync(file,next);}

// Картки для поширення й друк: у кожної сторінки своє превʼю (dist/og/<назва>.jpg, див. scripts/make-og-cards.mjs) і print.css.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
  const file='dist/'+name,page=name.replace('.html',''),old=fs.readFileSync(file,'utf8');let next=old;
  if(fs.existsSync(`dist/og/${page}.jpg`)){
    next=next.replaceAll(SITE_BASE+'og-image.png',`${SITE_BASE}og/${page}.jpg`);
    const title=(next.match(/<title>([^<]+)<\/title>/)||[])[1];
    if(title)next=next.replace(/(<meta property="og:image:alt" content=")[^"]*(")/,`$1Картка сторінки: ${title.replaceAll('"','&quot;')}$2`);
  }
  if(!next.includes('print.css'))next=next.replace('</head>','<link rel="stylesheet" href="./print.css?v=1" media="print"></head>');
  if(next!==old)fs.writeFileSync(file,next);
}

// Модуль «Куди далі» отримав кнопку друку: нова версія модуля й оболонки.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-next-steps.js?v=2','platform-next-steps.js?v=4').replaceAll('platform-shell.js?v=94','platform-shell.js?v=95');if(next!==old)fs.writeFileSync(file,next);}

// Шапка отримала кнопку пошуку: нова версія модуля шапки.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('site-header.js?v=2','site-header.js?v=3');if(next!==old)fs.writeFileSync(file,next);}

// Досьє на головній: тонка смуга «← Усі добавки» замість старого блоку інструментів (рішення власника 21.10.2026).
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('platform-shell.js?v=95','platform-shell.js?v=96');if(next!==old)fs.writeFileSync(file,next);}

// Пошук знаходить добавки за темами (судоми, тиск, сон…) — нові ключові слова в platform-materials (22.10.2026). Каскад версій.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){const file='dist/'+name;const old=fs.readFileSync(file,'utf8');const next=old.replaceAll('site-header.js?v=3','site-header.js?v=5').replaceAll('platform-shell.js?v=96','platform-shell.js?v=97').replaceAll('home-feedback.js?v=83','home-feedback.js?v=84').replaceAll('directions.js?v=85','directions.js?v=86').replaceAll('directions.js?v=84','directions.js?v=86').replaceAll('fat-burning.js?v=3','fat-burning.js?v=4');if(next!==old)fs.writeFileSync(file,next);}

// Nutrition architecture (2026-10-25): shared discovery points to the separated physiology page.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const next=old.replaceAll('platform-shell.js?v=97','platform-shell.js?v=98').replaceAll('directions.js?v=86','directions.js?v=98').replaceAll('home-feedback.js?v=84','home-feedback.js?v=98').replaceAll('site-header.js?v=4','site-header.js?v=5');
 if(next!==old)fs.writeFileSync(file,next);
}

// Muscle Lab guide (2026-10-26): new muscle units and search words in catalog/materials → cascade of versions.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const next=old.replaceAll('platform-shell.js?v=98','platform-shell.js?v=99').replaceAll('directions.js?v=98','directions.js?v=99').replaceAll('home-feedback.js?v=98','home-feedback.js?v=99').replaceAll('site-header.js?v=5','site-header.js?v=6').replaceAll('platform-learning.js?v=83','platform-learning.js?v=84');
 if(next!==old)fs.writeFileSync(file,next);
}

// Review corrections: refresh shared UI parents after changing their imports.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const next=old.replaceAll('platform-shell.js?v=99','platform-shell.js?v=100').replaceAll('directions.js?v=99','directions.js?v=100').replaceAll('home-feedback.js?v=99','home-feedback.js?v=100').replaceAll('platform-learning.js?v=84','platform-learning.js?v=85').replaceAll('site-header.js?v=6','site-header.js?v=7').replaceAll('navigation-v17.js?v=75','navigation-v17.js?v=76').replaceAll('cell-lab.js?v=73','cell-lab.js?v=74').replaceAll('muscle-lab.js?v=70','muscle-lab.js?v=71').replaceAll('muscle-guide.js?v=2','muscle-guide.js?v=3').replaceAll('digestion-viewer.js?v=2','digestion-viewer.js?v=3').replaceAll('nutrition-lab.js?v=63','nutrition-lab.js?v=64').replaceAll('fat-burning.js?v=4','fat-burning.js?v=5');
 if(next!==old)fs.writeFileSync(file,next);
}

// Research page (2026-10-27): new material in the catalog and search → cascade of versions for everything that imports it.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const next=old.replaceAll('platform-shell.js?v=100','platform-shell.js?v=101').replaceAll('directions.js?v=100','directions.js?v=101').replaceAll('home-feedback.js?v=100','home-feedback.js?v=101').replaceAll('site-header.js?v=7','site-header.js?v=8').replaceAll('page-pine.css?v=17','page-pine.css?v=18');
 if(next!==old)fs.writeFileSync(file,next);
}

// Mechanisms page (2026-10-27): new material in the catalog and search → cascade of versions for everything that imports it.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const next=old.replaceAll('platform-shell.js?v=101','platform-shell.js?v=102').replaceAll('directions.js?v=101','directions.js?v=102').replaceAll('home-feedback.js?v=101','home-feedback.js?v=102').replaceAll('site-header.js?v=8','site-header.js?v=9').replaceAll('fat-burning.js?v=6','fat-burning.js?v=7').replaceAll('page-pine.css?v=18','page-pine.css?v=19');
 if(next!==old)fs.writeFileSync(file,next);
}

// Follow-up audit fixes, synchronized with research/mechanisms on main.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const updates={'platform-shell.js?v=102':'platform-shell.js?v=103','directions.js?v=102':'directions.js?v=103','home-feedback.js?v=102':'home-feedback.js?v=103','site-header.js?v=9':'site-header.js?v=11','cell-lab.js?v=74':'cell-lab.js?v=75','muscle-lab.js?v=71':'muscle-lab.js?v=72','muscle-guide.js?v=3':'muscle-guide.js?v=4','digestion-viewer.js?v=3':'digestion-viewer.js?v=4','nutrition-lab.js?v=64':'nutrition-lab.js?v=65','fat-burning.js?v=7':'fat-burning.js?v=8','appearance.js?v=1':'appearance.js?v=2','compare-page.js?v=2':'compare-page.js?v=3'};
 let next=old;for(const [from,to] of Object.entries(updates))next=next.replaceAll(from,to);
 if(next!==old)fs.writeFileSync(file,next);
}

// Owner-selected Spectrum homepage (2026-10-27): shared header/search behavior is refreshed, other pages keep their design.
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.html'))){
 const file='dist/'+name,old=fs.readFileSync(file,'utf8');
 const next=old.replaceAll('platform-shell.js?v=103','platform-shell.js?v=104').replaceAll('directions.js?v=103','directions.js?v=104').replaceAll('site-header.js?v=10','site-header.js?v=11').replaceAll('navigation-v17.js?v=76','navigation-v17.js?v=77').replaceAll('fat-burning.js?v=8','fat-burning.js?v=9');
 if(next!==old)fs.writeFileSync(file,next);
}

// Owner 2026-10-28: lower-home route outlines changed; refresh the module import parent.
{const path="dist/directions.html",old=fs.readFileSync(path,"utf8"),next=old.replaceAll("directions.js?v=104","directions.js?v=105");if(next!==old)fs.writeFileSync(path,next);}
