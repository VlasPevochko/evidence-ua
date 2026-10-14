import fs from 'node:fs';
import {catalog} from '../src/platform/catalog.mjs';
import {homeLearningHTML} from '../src/platform/learning-ui.mjs';
for(const area of catalog.areas.filter(a=>a.available))for(const href of [area.href,...area.units.map(u=>u.href)]){
  const file='dist/'+href.replace(/^\.\//,'').split(/[?#]/)[0];
  if(!fs.existsSync(file))throw Error('Catalog page missing: '+file);
}
fs.writeFileSync('dist/platform-catalog.js',fs.readFileSync('src/platform/catalog.mjs','utf8').replace("'../evidence/core/entities.mjs'","'./evidence/entities.js?v=54'"));
const positions={muscle:'18.5%',nutrition:'34%',supplements:'50%',cell:'3%',movement:'3%'};
const homeTopics=catalog.areas.filter(a=>a.available).map(a=>({id:a.id,title:a.title,subtitle:a.lab,href:a.id==='supplements'?'#supplement-library':a.href,state:a.state,position:positions[a.id]||'50%'}));
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const homeDirectionsHTML='<div class="label"><span>П’ять напрямів Evidence UA</span><span>Обери тему · статус указано на картці</span></div><div class="cards" id="cards" aria-label="Тематичні напрями Evidence UA">'+homeTopics.map(topic=>`<a class="topic-card" data-area="${escapeHTML(topic.id)}" href="${escapeHTML(topic.href)}" style="--topic-x:${escapeHTML(topic.position)}"><strong>${escapeHTML(topic.title)}</strong><small>${escapeHTML(topic.subtitle)}</small><span class="topic-state">${escapeHTML(topic.state)} · Відкрити →</span></a>`).join('')+'</div>';
fs.writeFileSync('dist/home-catalog.js','// Generated from the shared catalog. Available pages only.\nwindow.EvidenceUAHomeTopics='+JSON.stringify(homeTopics)+';\n');
fs.writeFileSync('dist/home-feedback.js',fs.readFileSync('src/platform/home-feedback.mjs','utf8').replace("'./materials.mjs'","'./platform-materials.js?v=63'"));
fs.writeFileSync('dist/platform-materials.js',fs.readFileSync('src/platform/materials.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=59'").replace("'../evidence/core/entities.mjs'","'./evidence/entities.js?v=59'"));
fs.writeFileSync('dist/platform-tools.js',fs.readFileSync('src/platform/quick-tools.mjs','utf8').replace("'./materials.mjs'","'./platform-materials.js?v=63'"));
fs.writeFileSync('dist/platform-shell.js',fs.readFileSync('src/platform/shell.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=59'").replace("'./quick-tools.mjs'","'./platform-tools.js?v=63'"));
fs.writeFileSync('dist/platform-learning.js',fs.readFileSync('src/platform/learning-ui.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=59'"));
fs.writeFileSync('dist/directions.js',fs.readFileSync('src/platform/directory.mjs','utf8').replace("'./catalog.mjs'","'./platform-catalog.js?v=59'").replace("'./materials.mjs'","'./platform-materials.js?v=63'").replace("'./quick-tools.mjs'","'./platform-tools.js?v=63'").replace("'./learning-ui.mjs'","'./platform-learning.js?v=60'"));
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){const path='dist/'+file;const old=fs.readFileSync(path,'utf8'),next=old.replaceAll('platform-shell.js?v=54','platform-shell.js?v=59').replaceAll('nutrition-lab.js?v=55','nutrition-lab.js?v=59').replaceAll('cell-lab.js?v=56','cell-lab.js?v=59').replaceAll('muscle-lab.js?v=58','muscle-lab.js?v=59').replaceAll('home-feedback.js?v=57','home-feedback.js?v=59');if(next!==old)fs.writeFileSync(path,next);}
console.log('Shared catalog validated and copied. No scientific conclusions changed.');
const homeFile='dist/index.html';
const home=fs.readFileSync(homeFile,'utf8');
const withRoutes=home.replace(/<!-- EUA_HOME_LEARNING_START -->[\s\S]*?<!-- EUA_HOME_LEARNING_END -->/,'<!-- EUA_HOME_LEARNING_START -->'+homeLearningHTML()+'<!-- EUA_HOME_LEARNING_END -->').replace(/<!-- EUA_HOME_DIRECTIONS_START -->[\s\S]*?<!-- EUA_HOME_DIRECTIONS_END -->/,'<!-- EUA_HOME_DIRECTIONS_START -->'+homeDirectionsHTML+'<!-- EUA_HOME_DIRECTIONS_END -->');
if(withRoutes!==home)fs.writeFileSync(homeFile,withRoutes);
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){
 const path='dist/'+file,old=fs.readFileSync(path,'utf8');
 const next=old.replaceAll('platform-shell.js?v=59','platform-shell.js?v=60').replaceAll('home-feedback.js?v=59','home-feedback.js?v=60').replaceAll('home-entry.css?v=57','home-entry.css?v=60').replaceAll('directions.js?v=59','directions.js?v=60');
 if(next!==old)fs.writeFileSync(path,next);
}

// Cache references for the shared search experience.
for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){
 const path='dist/'+file,old=fs.readFileSync(path,'utf8');
 const next=old.replaceAll('platform-shell.js?v=60','platform-shell.js?v=63').replaceAll('home-feedback.js?v=60','home-feedback.js?v=63').replaceAll('directions.js?v=60','directions.js?v=63').replaceAll('platform.css?v=59','platform.css?v=63');
 if(next!==old)fs.writeFileSync(path,next);
}
