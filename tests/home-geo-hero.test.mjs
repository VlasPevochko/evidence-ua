import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('dist/index.html', 'utf8');
const css = fs.readFileSync('dist/home-geo-hero.css', 'utf8');
const js = fs.readFileSync('dist/home-geo-hero.js', 'utf8');
const type = fs.readFileSync('dist/home-typography.css', 'utf8');

// The geometric hero replaces the coast photo and is wired into the home page.
assert(html.includes('./home-geo-hero.css'), 'home must load the hero stylesheet');
assert(html.includes('./home-geo-hero.js'), 'home must load the hero script');
assert(html.includes('./home-typography.css'), 'home must load the heading typography');

// Static fallback without JS: the canvas sits over a gradient, not over the old photo.
assert(/page::before/.test(css) && /gradient/.test(css), 'static gradient fallback is required');
assert(!/home-coast\.jpg/.test(css), 'the hero stylesheet must not bring the photo back');

// Motion is optional: reduced-motion users get one still frame, off-screen hero is paused.
assert(js.includes('prefers-reduced-motion'), 'reduced motion must be respected');
assert(js.includes('IntersectionObserver'), 'animation must pause off screen');
assert(js.includes('aria-hidden'), 'decorative canvas must be hidden from assistive tech');

// Project rule: no third-party requests before an explicit user click.
for (const [name, text] of [['home-geo-hero.js', js], ['home-geo-hero.css', css], ['home-typography.css', type]]) {
  assert(!/https?:\/\//.test(text), `${name} must not make third-party requests`);
}
assert(!html.includes('fonts.googleapis.com'), 'home must not load fonts from a third party');

// Heading font is self-hosted (SIL OFL); both subsets and the licence must ship with the site.
const typography=fs.readFileSync('dist/home-typography.css','utf8');
for(const f of ['source-serif-4-cyrillic-wght-normal.woff2','source-serif-4-latin-wght-normal.woff2','SourceSerif4-OFL.txt'])assert(fs.existsSync('dist/fonts/'+f),'Missing dist/fonts/'+f);
assert(/@font-face\{font-family:"Source Serif 4"/.test(typography)&&typography.includes('./fonts/'),'Self-hosted Source Serif 4 must be declared');
assert(/font-display:swap/.test(typography),'Text stays visible while the font loads');
console.log('home geometric hero: wiring, fallback, reduced motion and no third-party requests verified');
