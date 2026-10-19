import assert from 'node:assert/strict';
import fs from 'node:fs';

// The home carousel was replaced by one entry into supplements.html (owner decision 2026-10-19).
// Dossiers themselves stay on this page and keep their anchors; the chips only point to them.
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/home-supplement-entry.css','utf8'),nav=fs.readFileSync('dist/navigation-v17.js','utf8');
for(const gone of ['id="supplement-carousel"','class="supplement-rail"','id="supplement-search"','id="supplement-prev"','id="supplement-next"','const aliases = ['])assert(!html.includes(gone),`Retired carousel piece is back: ${gone}`);
assert(html.includes('id="supplement-library"')&&html.includes('Що відомо про добавки'),'The library heading and its anchor stay');
assert(html.includes('<a class="se-cta" href="./supplements.html">'),'Entry leads to the catalogue');
const chips=[...html.matchAll(/<ul class="se-list"[^>]*>([\s\S]*?)<\/ul>/g)][0][1].match(/<a href="#[^"]+"/g);
assert.equal(chips.length,10);
for(const c of chips){const id=c.match(/href="#([^"]+)"/)[1];assert(html.includes(`id="${id}"`),`Dossier ${id} still exists on the home page`);}
assert(html.includes('home-supplement-entry.css?v=')&&nav.includes("document.querySelector('.supplement-entry')"),'Styles and the guide placement use the entry');
// Chips grew from 44px to 60px (48px thumbnails) so the artwork reads; touch target stays well above 44px.
for(const key of ['max-width:760px','min-height:60px','.se-cta'])assert(css.includes(key),`CSS missing ${key}`);
assert(/\.se-thumb\{[^}]*width:48px/.test(css),'Chip thumbnails are large enough to read (48px)');
for(const dead of ['.supplement-rail','.supplement-tile','.preview-tile','.supplement-edge-arrow','.supplement-search-box','.supplement-carousel-shell'])assert(!html.includes(dead),`Dead carousel style left in index.html: ${dead}`);
assert(!/https?:\/\//.test(css),'No third-party requests');
console.log('Home supplement entry: carousel retired, one catalogue entry, ten chips to existing dossiers passed.');
