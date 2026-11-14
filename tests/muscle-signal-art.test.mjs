// Схема шляху сигналу в розділі «Нерв → кальцій → скорочення» і плитки «М’яз за 30 секунд» як посилання (2026-11-14, апгрейд сторінки).
// Перевіряємо: малюнок без тексту, кожен крок ланцюга має свою частину й своє правило світла в CSS,
// плитки молекул ведуть у розділи, а ЗБІРКА справді вставила це в сторінку (а не лише модуль).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {signalArt, signalLightSelectors, SIGNAL_PARTS} from '../src/muscle-lab/signal-art.mjs';
import {signalChain, molecules, chapters, renderQuick} from '../src/muscle-lab/guide.mjs';

const svg = signalArt();
assert.ok(!/<text[\s>]/.test(svg), 'малюнок без тексту: підписи це HTML-список поруч');
assert.ok(/aria-hidden="true"/.test(svg), 'малюнок декоративний для читача з екрана: той самий зміст дає список кроків');
assert.equal(SIGNAL_PARTS, signalChain.length, 'частин малюнка стільки, скільки кроків у ланцюгу');
const used = new Set([...svg.matchAll(/data-chain-part="(\d+)"/g)].map(m => Number(m[1])));
assert.deepEqual([...used].sort((a, b) => a - b), signalChain.map((_, i) => i), 'кожен крок має хоча б одну частину малюнка');

const css = fs.readFileSync('dist/muscle-lab.css', 'utf8');
for (let n = 0; n < SIGNAL_PARTS; n++) {
  assert.ok(css.includes(signalLightSelectors(n)), `CSS має правило світла для кроку ${n}`);
}
assert.ok(/data-chain-step="7"\] \.sg-l\{transform:translateX\(14px\)\}/.test(css), 'на останньому кроці нитки зсуваються');
assert.ok(/prefers-reduced-motion:reduce\)\{[^}]*\.mg-signal/.test(css.replace(/\n/g, '')), 'зменшений рух вимикає анімації малюнка');

// Плитки молекул: назва місця береться з даних розділів, а не пишеться вручну.
const quick = renderQuick();
for (const m of molecules) {
  const ch = chapters.find(c => c.id === m.chapter);
  assert.ok(ch, `молекула ${m.name} веде в існуючий розділ`);
  assert.ok(quick.includes(`href="#${ch.id}"`) && quick.includes(`Докладніше: ${ch.title}`), `плитка ${m.name} називає, куди веде`);
}

// Збірка вставила все в сторінку.
const html = fs.readFileSync('dist/muscle-lab.html', 'utf8');
assert.ok(html.includes('class="mg-signal"'), 'сторінка містить схему сигналу');
assert.equal((html.match(/class="mg-mol"/g) || []).length, molecules.length, 'сторінка містить чотири плитки-посилання');
for (const ch of ['signal', 'why-grow', 'why-shrink']) assert.ok(html.includes(`id="${ch}"`), `розділ ${ch} існує на сторінці`);
const cssVersion = html.match(/muscle-lab\.css\?v=(\d+)/)?.[1];
assert.ok(Number(cssVersion) >= 78, 'версію стилів піднято, інакше браузер покаже кеш');

// Цілі дотику й дрібний текст, які виправлено в аудиті.
assert.ok(/\.step-dot\{width:44px;height:44px\}/.test(css.replace(/\n/g, '')) && !/\.step-dot\{width:40px/.test(css), 'кружки кроків 44 × 44 і на телефоні');
assert.ok(/\.eyebrow\{[^}]*font-size:12px/.test(css), 'підписи-«брови» не менші за 12 px');
console.log('muscle-signal-art: ok');
