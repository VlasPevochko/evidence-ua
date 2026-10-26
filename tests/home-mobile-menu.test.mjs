import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

assert.ok(fs.existsSync('dist/home-mobile-header.js'), 'Mobile navigation must have an accessible disclosure controller');
const markup = fs.readFileSync('dist/index.html', 'utf8');
const nativeMenu = markup.match(/<nav id="home-primary-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
assert.ok(nativeMenu, 'Essential destinations must remain available before JavaScript loads');
for (const destination of ['./directions.html', './nutrition.html', '#pubmed-live']) {
  assert.ok(nativeMenu.includes(`href="${destination}"`), `Native navigation must retain ${destination}`);
}
// The topic picker remains the hero action; the primary menu has one catalog destination.
assert.ok(markup.includes('<a class="cta" href="#start-here">'));
assert.equal((nativeMenu.match(/href="\.\/directions\.html"/g)||[]).length,1);
class Element extends EventTarget {
  hidden = false;
  attributes = new Map();
  classes = new Set();
  classList = {add: value => this.classes.add(value), toggle: (value, enabled) => enabled ? this.classes.add(value) : this.classes.delete(value)};
  setAttribute(key, value) {this.attributes.set(key, String(value));}
  getAttribute(key) {return this.attributes.get(key);}
  focus() {document.activeElement = this;}
  contains(target) {return target === this || target === link || target === toggle || target === navigation || target === project;}
}
const header = new Element(), toggle = new Element(), navigation = new Element(), project = new Element(), link = new Element();
const media = new EventTarget(); media.matches = true;
const document = new EventTarget(); document.body = {dataset: {platformArea: 'home'}};
document.querySelector = () => header;
header.querySelector = selector => selector === '.home-menu-toggle' ? toggle : selector === 'nav' ? navigation : selector === '.headbtn' ? project : null;
document.getElementById = () => null;
vm.runInNewContext(fs.readFileSync('dist/home-mobile-header.js','utf8'), {document, matchMedia: () => media});
assert.equal(navigation.hidden, true, 'Mobile navigation starts collapsed');
assert.equal(toggle.hidden, false);
toggle.dispatchEvent(new Event('click'));
assert.equal(navigation.hidden, false);
assert.equal(project.hidden, false);
assert.equal(toggle.getAttribute('aria-expanded'), 'true');
const escape = new Event('keydown'); escape.key = 'Escape';
document.dispatchEvent(escape);
assert.equal(navigation.hidden, true, 'Escape closes the disclosure');
assert.equal(document.activeElement, toggle, 'Escape returns focus to the trigger');
toggle.dispatchEvent(new Event('click'));
link.closest = selector => selector === 'a' ? link : null;
const navigate = new Event('click'); Object.defineProperty(navigate, 'target', {value: link});
navigation.dispatchEvent(navigate);
assert.equal(navigation.hidden, true, 'Selecting a destination closes the menu');
media.matches = false; media.dispatchEvent(new Event('change'));
assert.equal(toggle.hidden, true, 'Desktop navigation has no mobile trigger');
assert.equal(navigation.hidden, false, 'Desktop destinations remain visible');
assert.equal(project.hidden, false);
