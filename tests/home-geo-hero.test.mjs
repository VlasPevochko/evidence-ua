import fs from 'node:fs';
import assert from 'node:assert/strict';

// Owner decision 2026-10-27: the selected cosmic Spectrum replaces the green
// geometric hero. Keep the old renderer/assets as history; test the active wiring.
const html=fs.readFileSync('dist/index.html','utf8');
const css=fs.readFileSync('dist/home-spectrum.css','utf8');
const entry=fs.readFileSync('dist/home-spectrum.js','utf8');
const motion=fs.readFileSync('dist/home-spectrum-wave.mjs','utf8');
assert(html.includes('home-spectrum.css?v=2')&&html.includes('home-spectrum.js?v=1'),'selected hero assets are wired');
for(const name of ['home-geo-hero.js','home-mobile-header.js','home-directions.js'])assert(!html.includes('src="./'+name),'obsolete home controllers are detached');
assert(entry.includes('home-spectrum-wave.mjs?v=1'),'the active controller imports the tested ribbon renderer');
assert(css.includes('home-spectrum-ribbon.webp')&&css.includes('radial-gradient'),'decorative static fallback survives missing Canvas/JavaScript');
assert(motion.includes('prefers-reduced-motion')&&motion.includes('IntersectionObserver'),'the active wave supports reduced motion and visibility');
assert(/<canvas[^>]+id="spectrum-wave"[^>]+aria-hidden="true"/.test(html),'decorative canvas is hidden from assistive technology');
for(const text of [css,entry,motion])assert(!/https?:\/\//.test(text),'no third-party resources in new home assets');
assert(!html.includes('fonts.googleapis.com'),'no third-party font load');
for(const f of ['source-serif-4-cyrillic-wght-normal.woff2','source-serif-4-latin-wght-normal.woff2','SourceSerif4-OFL.txt'])assert(fs.existsSync('dist/fonts/'+f),'self-hosted font/licence retained: '+f);
assert(css.includes('@font-face')&&css.includes('font-display:swap'),'local heading text stays visible during font load');
assert(fs.statSync('dist/home-spectrum-ribbon.webp').size<180000,'static ribbon stays under180KB');
for(const file of ['home-geo-hero.js','home-geo-hero.css','home-typography.css'])assert(fs.existsSync('dist/'+file),'previous assets remain available for rollback');
console.log('Spectrum home: active wiring, static fallback, local fonts, bounded asset and retained history passed.');
