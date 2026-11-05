import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHANGES,TAGS,SCIENCE} from '../dist/changes-data.js';

// Записи журналу про картки дієт (рішення власника 32, 2026-11-05). PR #163 (картинка для Stories, виділений перший результат, більші малюнки) і PR #164 (карусель)
// вийшли на сайт 4 листопада без записів у журналі. Цей тест тримає записи правдивими: кожне твердження в них має відповідник у справжній сторінці й скриптах, а нових
// наукових тверджень немає (змінилось оформлення й спосіб користування, а не зміст карток).
const read=f=>fs.readFileSync(f,'utf8');
const page=read('dist/nutrition.html'),css=read('dist/nutrition-diets.css'),carousel=read('dist/nutrition-diets-carousel.js'),share=read('dist/nutrition-diets-share.js');
const day=CHANGES.find(d=>d.date==='2026-11-04');
assert(day,'the day the cards went live (2026-11-04) has its group');
const titles={
  carousel:'Картки дієт у каруселі',
  story:'Картка дієти як картинка для Stories',
  hierarchy:'Картки дієт: більші малюнки й виділений результат'
};
const entry=key=>day.items.find(i=>i.title===titles[key]);
for(const key of Object.keys(titles)){
  const it=entry(key);
  assert(it,`${key}: the journal has a record`);
  assert.equal(it.science,'none',`${key}: only the look and the way of use changed, not the content, so there is no new science`);
  assert(TAGS[it.tag]&&SCIENCE[it.science],`${key}: known tag and science marker`);
  assert.equal(it.href,'./nutrition.html#nutrition-diets',`${key}: the record leads to the diet cards`);
  assert(page.includes('id="nutrition-diets"'),'the section the records lead to exists');
  assert(it.text.length>20&&it.text.length<200,`${key}: a short plain description`);
}

// Карусель: «вісім карток», «свайпом, стрілками чи клавішами», «видно номер картки».
const cards=(page.match(/<details class="nd-card"/g)||[]).length;
assert.equal(cards,8,'the journal says eight cards');
assert(entry('carousel').text.includes('Вісім карток'),'the record says eight cards');
assert(css.includes('overflow-x:auto')&&css.includes('scroll-snap-type:x mandatory'),'the cards can be swiped: a horizontal scroll with snapping');
assert(page.includes('data-diet-previous')&&page.includes('data-diet-next'),'the carousel has arrow buttons');
assert(carousel.includes('ArrowLeft')&&carousel.includes('ArrowRight'),'the carousel answers the arrow keys');
assert(/data-diet-count[^>]*>\d\d \/ 08</.test(page),'the card number is shown');

// Картинка для Stories: вертикальна, перший наведений результат, джерело й застереження, створюється в браузері й нікуди не надсилається.
assert(/STORY_SIZE=\{width:1080,height:1920/.test(share),'the picture is vertical, 1080 × 1920');
assert((page.match(/data-story-share/g)||[]).length===8&&(page.match(/data-story-download/g)||[]).length===8,'every card can share or save the picture');
assert(share.includes('story.finding')&&share.includes('story.sourceLabel')&&share.includes('STORY_NOTE'),'the picture has the first cited result, its source and the caution');
assert(share.includes("getContext('2d')")&&!/fetch\(|XMLHttpRequest|sendBeacon/.test(share),'the picture is drawn in the browser and nothing is sent anywhere');
assert(entry('story').text.includes('Її створює ваш браузер'),'the record says the browser creates it');

// Виділений перший результат із посиланням на джерело.
assert(css.includes('"КЛЮЧОВИЙ РЕЗУЛЬТАТ"'),'the first cited result is highlighted');
assert(entry('hierarchy').text.includes('Тексти не змінились'),'the record promises that the texts are the same');

// Версії журналу: сторінка журналу піднята, адреса модуля даних збігається з нею (браузер не покаже кеш).
const importVersion=Number((read('dist/changes-page.js').match(/changes-data\.js\?v=(\d+)/)||[])[1]);
const pageVersion=Number((read('dist/changes.html').match(/changes-page\.js\?v=(\d+)/)||[])[1]);
assert(importVersion>=29&&pageVersion>=29,'the journal carries a version after this change (cache busting)');
console.log('Diet cards journal: three records match the real page and scripts, no new science, cache versions bumped passed.');
