import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dietCards} from '../src/nutrition-diets/catalog.mjs';
import {evidence} from '../src/nutrition-diets/evidence.mjs';
import {dietCatalogHTML} from '../src/nutrition-diets/render.mjs';

const html=dietCatalogHTML();
const css=fs.readFileSync('dist/nutrition-diets.css','utf8');
const carousel=fs.readFileSync('src/nutrition-diets/carousel.mjs','utf8');

assert(html.includes('data-diet-carousel role="region" aria-label="Карусель дієт"'),'the carousel is an accessible region');
assert(html.includes('data-diet-previous')&&html.includes('data-diet-next'),'previous and next controls are rendered');
assert(html.includes('data-diet-count aria-live="polite"'),'the active card counter is announced');
assert.equal((html.match(/class="nd-card"/g)||[]).length,dietCards.length,'all existing cards remain in the carousel');
for(const diet of dietCards){
 assert(html.includes(`id="diet-${diet.id}"`),`${diet.id}: card anchor remains stable`);
 assert(html.includes(`diet-art.svg?v=87#view-${diet.id}`),`${diet.id}: updated original artwork is cache-busted`);
 assert(html.includes(`diet-art-cosmic.svg?v=2#view-${diet.id}`),`${diet.id}: updated cosmic artwork is cache-busted`);
}
assert(html.includes('nutrition-diets-carousel.js?v=1'),'the carousel controller is loaded');
assert(css.includes('.nd-grid[data-diet-carousel]{--nd-slide-width:38%;display:flex'),'desktop cards use a horizontal rail');
assert(css.includes('.nd-grid[data-diet-carousel]>.nd-card[open]{flex-basis:100%'),'the selected card expands within the rail');
assert(css.includes('--nd-slide-width:82%'),'the phone layout keeps the next card in view');
assert(css.includes('scroll-snap-type:x mandatory')&&css.includes('scroll-behavior:auto'),'the rail snaps and respects reduced motion');
assert(carousel.includes("event.key==='ArrowLeft'")&&carousel.includes("event.key==='ArrowRight'"),'focused carousel supports keyboard navigation');
assert(carousel.includes('if(cards[index].open)cards[index].open=false'),'arrow navigation closes the expanded card');
assert(html.includes('data-story-share')&&html.includes('data-diet-story'),'existing scientific story cards remain available');
for(const diet of dietCards)assert(html.includes(`data-story-finding="${evidence[diet.id].findings[0][0]}"`),`${diet.id}: the reviewed story finding is retained`);

const page=fs.readFileSync('dist/nutrition.html','utf8');
assert(page.includes('nutrition-diets.css?v=94'),'the redesigned cards load the current stylesheet');
assert(page.includes('nutrition-diets-carousel.js?v=1'),'the generated page loads the carousel controller');

console.log(`Diet carousel: accessible controls, ${dietCards.length} stable cards, artwork pairs, expanded details and keyboard navigation passed.`);
