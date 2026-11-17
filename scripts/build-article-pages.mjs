// Сторінки розборів добавок: кожна вирізається зі спільного документа dist/index.html (src/platform/article-pages.mjs).
// Запускається після всіх скриптів, що пишуть у dist/index.html, і перед картою сайту та індексом розділів.
// Етап 1 (docs/HOME_SPLIT_PLAN.md): сторінки вже є й перевіряються, але на них ще ніхто не посилається,
// тому вони закриті від пошукових систем (noindex) і не входять у карту сайту та пошук по сайту.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readBase} from './site-url.mjs';
import {ARTICLES,articlePageHTML} from '../src/platform/article-pages.mjs';

export function buildArticlePages(root=process.cwd()){
  const base=readBase(root),combined=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
  // navigation-v17.js на головній сам додає свій файл стилів; на сторінці розбору цього скрипта немає (він будує блоки головної),
  // але його стилі розборам потрібні. Адресу з версією беремо з самого скрипта, щоб вона не розійшлася.
  const navigation=fs.readFileSync(path.join(root,'dist/navigation-v17.js'),'utf8').match(/stylesheet\.href = '(\.\/navigation-v17\.css\?v=\d+)'/);
  if(!navigation)throw Error('navigation-v17.js no longer names its stylesheet');
  for(const article of ARTICLES){
    const file=path.join(root,'dist',article.file),next=articlePageHTML(combined,article.id,{base,indexable:false,styles:[navigation[1]]});
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==next)fs.writeFileSync(file,next);
  }
  return ARTICLES.length;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(`Review pages written: ${buildArticlePages()}.`);
