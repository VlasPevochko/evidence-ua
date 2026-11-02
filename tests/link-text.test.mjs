// Головна, рішення власника 2026-11-02 (бриф T5): підписи кнопок-посилань називають, куди вони ведуть, і не повторюються.
// Було: «Відкрити →» у трьох питаннях угорі, «Відкрити →» у трьох картинках блоку «Нове», шість «Відкрити →» у меню напрямів, три «Почати маршрут →».
// Тест рахує підписи з розмітки (DOM), а не пошуком рядка: у питаннях угорі слово й стрілка стояли окремо (стрілка в aria-hidden), тому grep «Відкрити →» цього не бачив.
// Правила: (1) підпис не загальний; (2) однаковий підпис дозволений лише для однакового призначення; (3) підпис містить слово з призначення (його сторінки чи розділу);
// (4) стрілка в читабельному тексті відсутня (лише в aria-hidden); (5) підписи, що виводяться з каталогу, збігаються з каталогом.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog,learningHref} from '../src/platform/catalog.mjs';

const index=fs.readFileSync('dist/index.html','utf8');
function inspect(markup,script){return JSON.parse(execFileSync('python',['-c',script],{input:markup,encoding:'utf8'}));}

// Усі кнопки-посилання головної, які ведуть кудись із підписом-дією. Нове місце з підписом-дією додається сюди (і тест перевірить його так само).
const KINDS={
  'hero-question':'//a[contains(@class,"spectrum-question")]//*[contains(@class,"spectrum-question-open")]',
  'hero-route':'//a[contains(@class,"spectrum-route-start")]',
  'route-start':'//a[contains(@class,"path-start")]',
  'fresh':'//a[contains(@class,"home-fresh-card")]//*[contains(@class,"home-fresh-go")]',
  'direction':'//a[contains(@class,"topic-card")]//*[contains(@class,"topic-open")]',
  'catalog':'//a[contains(@class,"se-cta")]'
};
const script=`from lxml import html
import json,sys,copy
root=html.fromstring(sys.stdin.read())
KINDS=json.loads(${JSON.stringify(JSON.stringify(KINDS))})
out=[]
for kind,xp in KINDS.items():
    for el in root.xpath(xp):
        clone=copy.deepcopy(el)
        for hidden in clone.xpath('.//*[@aria-hidden="true"]'):
            if hidden.tail:
                prev=hidden.getprevious()
                if prev is not None: prev.tail=(prev.tail or '')+hidden.tail
                else: clone.text=(clone.text or '')+hidden.tail
            hidden.getparent().remove(hidden)
        a=el.xpath('ancestor-or-self::a[1]')
        out.append({'kind':kind,'label':' '.join(clone.text_content().split()),'selfHidden':el.get('aria-hidden')=='true','href':a[0].get('href') if a else None,'ariaLabel':a[0].get('aria-label') if a else None,'arrowHidden':len(el.xpath('.//*[@aria-hidden="true"]'))})
print(json.dumps(out,ensure_ascii=False))`;
const labels=inspect(index,script);
const of=kind=>labels.filter(item=>item.kind===kind);

// 0. Скільки кнопок кожного виду: якщо хтось додасть чи прибере, тест нагадає оновити перелік.
assert.deepEqual(Object.fromEntries(Object.keys(KINDS).map(kind=>[kind,of(kind).length])),{'hero-question':3,'hero-route':1,'route-start':catalog.paths.length,'fresh':3,'direction':catalog.areas.filter(area=>area.available).length,'catalog':1});

// 1. Загальних підписів немає.
const GENERIC=new Set(['відкрити','читати','дивитись','дивитися','докладніше','детальніше','перейти','більше','далі','натисніть тут','тут','почати','почати маршрут','розібрати']);
const stripArrow=text=>text.replace(/[\s→↗↘]+$/u,'').trim();
for(const item of labels){
  const text=stripArrow(item.label);
  assert(text.length>=10&&text.length<=48,`${item.kind}: the label «${text}» is a short phrase (10–48 characters)`);
  assert(!GENERIC.has(text.toLocaleLowerCase('uk')),`${item.kind}: «${text}» is a bare generic label`);
  assert(text.split(/\s+/).length>=2,`${item.kind}: «${text}» has an action and an object`);
}

// 2. Стрілка лише в aria-hidden: у читабельному тексті її немає (елемент, що сам aria-hidden, як «Нове», — декоративний).
for(const item of labels.filter(item=>!item.selfHidden))assert(!/[→↗↘]/u.test(item.label),`${item.kind}: the arrow of «${item.label}» sits in an aria-hidden span`);

// 3. Однаковий підпис лише для однакового призначення («однаково названо — однаково працює»).
const byLabel=new Map();
for(const item of labels){const key=stripArrow(item.label);byLabel.set(key,(byLabel.get(key)||new Set()).add(item.href));}
for(const [label,hrefs] of byLabel)assert.equal(hrefs.size,1,`«${label}» names more than one destination: ${[...hrefs].join(' , ')}`);
// Це ж означає: жодне слово дії не повторюється як ціле на різних призначеннях. Для видимих підписів, яких немає в переліку, див. пункт 7.

// 4. Підписи, що виводяться з каталогу, збігаються з каталогом (нічого не вигадано вручну).
const paths=catalog.paths;
for(const [i,path] of paths.entries()){
  const first=catalog.resolveStep(path.steps[0]).title,item=of('route-start')[i];
  assert.equal(stripArrow(item.label),`Почати маршрут: ${first}`,`route ${path.id}: the start button names its first step`);
  assert.equal(item.href,learningHref(path.id,0),`route ${path.id}: the start button leads to its first step`);
  assert.equal(item.ariaLabel,null,`route ${path.id}: no aria-label that differs from the visible text (WCAG 2.5.3 label in name)`);
}
const energy=paths.find(path=>path.id==='energy');
assert.equal(stripArrow(of('hero-route')[0].label),`Почати маршрут: ${catalog.resolveStep(energy.steps[0]).title}`,'the hero route button names the first step of its route');
assert.equal(of('hero-route')[0].href,of('route-start')[paths.indexOf(energy)].href,'the hero route button and the route card lead to the same place and carry the same text');
const areas=catalog.areas.filter(area=>area.available);
for(const [i,area] of areas.entries())assert.equal(stripArrow(of('direction')[i].label),`Відкрити «${area.title}»`,`direction ${area.id}: the card action names the direction`);

// 5. Підписи, написані вручну, містять слово з призначення: його назви, опису, заголовків або розділу, на який веде кнопка.
const STOP=new Set(['про','із','та','й','і','або']),VERBS=new Set(['відкрити','читати','дивитись','розібрати','почати']);
const stems=label=>stripArrow(label).toLocaleLowerCase('uk').split(/\s+/).filter(word=>!STOP.has(word)&&!VERBS.has(word)).map(word=>word.slice(0,Math.max(3,Math.min(4,word.length-1))));
const destinationScript=`from lxml import html
import json,sys
file,anchor=sys.argv[1],sys.argv[2]
root=html.fromstring(open('dist/'+file,encoding='utf-8').read())
# Окрема сторінка: назва, опис, заголовки й увесь текст сторінки (розділ-якір може малюватись скриптом, тож його статичний текст не показник).
# Сама головна: лише розділ-якір (текст усієї головної нічого не доводить, там є все).
if file=='index.html':
    el=root.xpath('//*[@id="'+anchor+'"]')
    parts=[el[0].text_content()] if el else []
else:
    parts=[(root.xpath('//title/text()') or [''])[0],(root.xpath('//meta[@name="description"]/@content') or [''])[0]]+[h.text_content() for h in root.xpath('//h1|//h2')]+[root.xpath('//body')[0].text_content()]
print(json.dumps(' '.join(' '.join(parts).split()).lower(),ensure_ascii=False))`;
const destinationText=href=>{const [file,anchor='']=href.replace(/^\.\//,'').split('#');return JSON.parse(execFileSync('python',['-c',destinationScript,file.split('?')[0],anchor],{encoding:'utf8'}));};
for(const item of [...of('hero-question'),...of('fresh')]){
  assert(item.href.startsWith('./')&&fs.existsSync('dist/'+item.href.slice(2).split('#')[0].split('?')[0]),`${item.kind}: «${item.label}» leads to an existing page`);
  const where=destinationText(item.href);
  for(const stem of stems(item.label))assert(where.includes(stem),`${item.kind}: «${stripArrow(item.label)}» promises «${stem}…», which the destination ${item.href} does not mention`);
}

// 6. Підписи в одному місці різні між собою й від сусідів (видимий підпис у кожному блоці унікальний).
for(const kind of ['hero-question','fresh','route-start','direction']){
  const set=of(kind).map(item=>stripArrow(item.label));
  assert.equal(new Set(set).size,set.length,`${kind}: labels in the block are all different: ${set.join(' | ')}`);
}

// 7. Решта видимих посилань-дій головної теж не загальні: ловимо нові «Відкрити →», додані без цього переліку.
const everyAction=inspect(index,`from lxml import html
import json,sys,copy
root=html.fromstring(sys.stdin.read())
out=[]
for a in root.xpath('//body/*[contains(@class,"page")]//a[@href]'):
    clone=copy.deepcopy(a)
    for hidden in clone.xpath('.//*[@aria-hidden="true"]'):
        hidden.getparent().remove(hidden)
    out.append(' '.join(clone.text_content().split()))
print(json.dumps(out,ensure_ascii=False))`);
for(const label of everyAction){
  const bare=stripArrow(label).toLocaleLowerCase('uk');
  assert(!GENERIC.has(bare),`a link on the home reads «${label}», a bare generic label`);
}

// 8. Документ і журнал.
const doc=fs.readFileSync('docs/LINK_TEXT.md','utf8');
for(const part of ['Правила','Що змінено','Як перевірено','Як відкотити'])assert(doc.includes(part),`docs/LINK_TEXT.md has the section «${part}»`);
const journal=fs.readFileSync('dist/changes-data.js','utf8');
assert(journal.includes('Кнопки-посилання на головній називають, куди ведуть'),'The change log has a record about the labels');
console.log('Link text: every home call-to-action names its destination, labels are unique per destination, arrows are decorative passed.');
