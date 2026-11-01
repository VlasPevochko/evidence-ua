import assert from 'node:assert/strict';
import fs from 'node:fs';

// Верх сторінки «Харчування» (рішення власника 2026-10-25): без порожньої смуги зі швами, кнопка «Інструменти» в банері, банер нижчий.
const html=fs.readFileSync('dist/nutrition.html','utf8'),css=fs.readFileSync('dist/nutrition-navigation.css','utf8');
assert(html.includes('<h1 id="nutrition-title">Світ харчування.</h1>'),'the title is one line (no forced break)');
assert(html.includes('nutrition-navigation.css?v=4'),'the stylesheet version was bumped'); // 2026-10-31: версія піднята, бо стилі/оболонка переведені на токени кольору (палітра «космос / зелений»); зміст сторінки той самий
const rule=css.slice(css.indexOf('@media(min-width:761px)'));
assert(rule.includes('height:0')&&rule.includes('background:none!important')&&rule.includes('border:0!important'),'on wide screens the strip takes no space and has no seams');
assert(rule.includes('position:absolute')&&rule.includes('top:18px')&&rule.includes('calc((100% - 1180px)/2)'),'the tools button sits in the banner, aligned with its content edge');
assert(rule.includes('.pb-inner{padding:34px 0 30px}'),'the banner is lower');
// The phone layout is unchanged: the rule only applies from 761px.
assert(!/@media\(max-width:760px\)[^}]*height:0/.test(css),'the phone layout keeps the strip');
// The tools stay reachable and keep their own panel styling.
assert(css.includes('.eua-nutrition-menu-content{position:absolute')&&html.includes('data-nutrition-tools="menu"'),'the tools panel is still the same disclosure');
console.log('Nutrition top: no seams strip, tools button in the banner, lower banner, phone layout kept passed.');
