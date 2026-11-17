// Спільний документ «головна + 11 розборів добавок» (docs/HOME_SPLIT_PLAN.md, етап 3).
// Скрипти збірки, як і раніше, пишуть у dist/index.html так, ніби в ньому лежить усе разом. Але на сайт іде лише головна:
//   на початку збірки restoreCombined() кладе в dist/index.html спільний документ із src/site/index.combined.html;
//   наприкінці (scripts/build-article-pages.mjs) stripToHome() зберігає спільний документ назад у src/site/ і лишає в dist/index.html тільки головну.
// Авторську розмітку головної та розборів правити в src/site/index.combined.html, а не в dist/index.html:
// правка в dist/index.html зупиняє збірку (щоб вона не зникла мовчки).
import fs from 'node:fs';
import path from 'node:path';
import {homePageHTML,ARTICLES} from '../src/platform/article-pages.mjs';

export const COMBINED='src/site/index.combined.html';
const hasReviews=html=>ARTICLES.every(article=>new RegExp(`<section\\b[^>]*\\bid="${article.id}"`).test(html));

// Повертає спільний документ у dist/index.html. Нічого не робить, якщо він уже там (збірку перервано посередині).
export function restoreCombined(root=process.cwd()){
  const homeFile=path.join(root,'dist/index.html'),sourceFile=path.join(root,COMBINED);
  const current=fs.readFileSync(homeFile,'utf8');
  if(hasReviews(current))return current;
  // Немає ні розборів у dist, ні спільного документа: збирати розбори нема з чого (так буває лише в порожній фікстурі контракту збірки).
  // Справжню збірку тоді зупинить scripts/build-article-pages.mjs, якій потрібні всі 11 розборів.
  if(!fs.existsSync(sourceFile))return current;
  const combined=fs.readFileSync(sourceFile,'utf8');
  if(!hasReviews(combined))throw Error(`${COMBINED} does not carry all the reviews`);
  if(homePageHTML(combined)!==current)throw Error(`dist/index.html was edited by hand. Move the change into ${COMBINED} (the build cuts the home from it) and restore dist/index.html with: git checkout dist/index.html`);
  fs.writeFileSync(homeFile,combined);
  return combined;
}
// Зберігає спільний документ у src/site/ й лишає в dist/index.html лише головну.
export function stripToHome(root=process.cwd()){
  const homeFile=path.join(root,'dist/index.html'),sourceFile=path.join(root,COMBINED);
  const combined=fs.readFileSync(homeFile,'utf8');
  if(!hasReviews(combined))throw Error('dist/index.html must hold the combined document before it is cut down to the home');
  fs.mkdirSync(path.dirname(sourceFile),{recursive:true});
  if(!fs.existsSync(sourceFile)||fs.readFileSync(sourceFile,'utf8')!==combined)fs.writeFileSync(sourceFile,combined);
  const home=homePageHTML(combined);
  fs.writeFileSync(homeFile,home);
  return {combined,home};
}
// Для тих, хто лише читає розбори (таблиця для рецензента, стилі розборів для палітри): спільний документ без зміни dist/.
export function combinedHTML(root=process.cwd()){
  const current=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
  if(hasReviews(current))return current;
  const sourceFile=path.join(root,COMBINED);
  if(!fs.existsSync(sourceFile))throw Error(`${COMBINED} is missing`);
  return fs.readFileSync(sourceFile,'utf8');
}
