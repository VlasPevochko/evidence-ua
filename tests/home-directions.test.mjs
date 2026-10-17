import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

assert.ok(fs.existsSync('dist/home-directions.js'), 'The compact direction picker needs its progressive enhancement');
const source = fs.readFileSync('dist/home-directions.js', 'utf8');
class Element extends EventTarget {
  children = []; attributes = new Map(); hidden = false; open = false; dataset = {};
  classList = {add: name => this.attributes.set('class', name)};
  constructor(name = '') {super(); this.name = name;}
  setAttribute(name, value) {this.attributes.set(name, String(value));}
  getAttribute(name) {return this.attributes.get(name);}
  append(...children) {this.children.push(...children);}
  querySelector(selector) {return this.children.find(child => child.name === selector) || null;}
  querySelectorAll(selector) {return selector === 'a' ? this.children : [];}
  cloneNode() {const copy = new Element(this.name); copy.href = this.href; copy.dataset = {...this.dataset}; copy.children = this.children.map(child => ({...child})); return copy;}
  matches(selector) {return selector === ':popover-open' && this.open;}
  contains(target) {return target === this || this.children.includes(target);}
  focus() {document.activeElement = this;}
  showPopover() {this.open = true; const event = new Event('toggle'); event.newState = 'open'; this.dispatchEvent(event);}
  hidePopover() {this.open = false; const event = new Event('toggle'); event.newState = 'closed'; this.dispatchEvent(event);}
}
let document;
function fixture(supported = true, hash = '') {
  const trigger = new Element('trigger'), navigation = new Element('navigation'), picker = new Element('picker');
  const list = new Element('list'), close = new Element('.home-picker-close'), cards = new Element('cards');
  picker.hidden = true; picker.children = [close, list];
  if (!supported) picker.showPopover = undefined;
  for (const [id, href] of [['muscle','./muscle-lab.html'], ['cell','./cell-lab.html'], ['nutrition','./nutrition.html'], ['supplements','#supplement-library'], ['movement','./movement.html'], ['sleep','./sleep.html']]) {
    const card = new Element('a'); card.href = href; card.dataset.area = id;
    card.children = [{textContent:id}, {textContent:'module'}, {textContent:'original readiness'}]; cards.append(card);
  }
  const window = new EventTarget(); window.location = {hash};
  document = {body:new Element('body'), activeElement:null, querySelector: selector => selector === '.copy .cta' ? trigger : null,
    getElementById: id => ({'home-directions-picker':picker,'home-picker-cards':list,cards})[id] || null,
    querySelectorAll: () => [navigation], createElement: name => new Element(name)};
  vm.runInNewContext(source, {document, window});
  const click = target => {const event = new Event('click', {cancelable:true}); target.dispatchEvent(event); return event;};
  return {trigger,navigation,picker,list,close,cards,window,click};
}
const fallback = fixture(false);
assert.equal(fallback.cards.hidden, false, 'Unsupported browsers retain all native direction links');
assert.equal(fallback.picker.hidden, true);
assert.equal(fallback.click(fallback.trigger).defaultPrevented, false, 'The native #start-here link must remain usable');

const f = fixture();
assert.equal(f.list.children.length, f.cards.children.length);
assert.equal(f.cards.hidden, true, 'Only the compact picker is visible after enhancement');
assert.equal(f.picker.open, false);
for (const [i, card] of f.list.children.entries()) {
  assert.equal(card.href, f.cards.children[i].href, 'Picker destinations must come from the canonical catalog cards');
  assert.equal(card.children[2].textContent, 'original readiness', 'Scientific readiness labels must be retained');
}
assert.equal(f.trigger.getAttribute('aria-expanded'), 'false');
assert.equal(f.click(f.trigger).defaultPrevented, true);
assert.equal(f.picker.open, true);
assert.equal(f.trigger.getAttribute('aria-expanded'), 'true');
assert.equal(document.activeElement, f.close, 'Keyboard users enter the opened panel');
// Without an exit transition, the browser may blur the hidden panel before toggle.
document.activeElement = document.body;
f.picker.hidePopover();
assert.equal(f.trigger.getAttribute('aria-expanded'), 'false');
assert.equal(document.activeElement, f.trigger, 'Closing the panel returns focus to the visible primary action');
f.click(f.navigation);
assert.equal(f.picker.open, true, 'The navigation entry opens the same picker');
f.window.dispatchEvent(new Event('hashchange'));
assert.equal(f.picker.open, false, 'Route changes must dismiss the panel');
const space = new Event('keydown', {cancelable:true}); space.key = ' ';
f.trigger.dispatchEvent(space);
assert.equal(space.defaultPrevented, true);
assert.equal(f.picker.open, true, 'The enhanced button supports Space as well as Enter/click');
const linked = fixture(true, '#cards');
assert.equal(linked.picker.open, true, 'Existing #cards links must open the directions on initial load');
linked.window.location.hash = '#supplement-library';
linked.window.dispatchEvent(new Event('hashchange'));
assert.equal(linked.picker.open, false);
linked.window.location.hash = '#start-here';
linked.window.dispatchEvent(new Event('hashchange'));
assert.equal(linked.picker.open, true, 'Later #start-here navigation must reach the same directions');
console.log('Compact directions: catalog destinations/readiness, native fallback, keyboard opening, focus restoration and route dismissal passed.');
