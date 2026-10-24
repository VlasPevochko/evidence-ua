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
// Owner decision 2026-10-19 (the home page may be changed): hero joins the pine palette of the whole site,
// no empty third under the buttons, and no second «Знайти матеріал» right below the hero.
assert(/hsl\(' \+ \(158/.test(js)&&!js.includes('105,217,245')&&!js.includes('196 +'),'hero triangles are pine green, not the old blue');
assert(!/#1b5566|#082635/.test(css),'static fallback is pine as well');
assert(/\.hero\{min-height:min\(calc\(100svh - 110px\),620px\)\}/.test(css),'hero height follows its content');
assert(/data-eua-tool="search"\]\{display:none\}/.test(css),'duplicate search button is hidden on home');
assert(html.includes('home-geo-hero.css?v=2')&&html.includes('home-geo-hero.js?v=3'),'cache versions bumped');
console.log('home geometric hero: wiring, fallback, reduced motion and no third-party requests verified');
