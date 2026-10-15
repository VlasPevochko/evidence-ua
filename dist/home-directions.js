/* Native catalog links remain available without popover support. */
(() => {
  const picker = document.getElementById('home-directions-picker');
  const list = document.getElementById('home-picker-cards');
  const cards = document.getElementById('cards');
  const trigger = document.querySelector('.copy .cta');
  if (!picker || !list || !cards || !trigger || typeof picker.showPopover !== 'function') return;
  for (const card of cards.querySelectorAll('a')) {
    const copy = card.cloneNode(true), visual = document.createElement('span');
    visual.className = 'home-picker-visual'; visual.setAttribute('aria-hidden', 'true');
    copy.append(visual); list.append(copy);
  }
  if (!list.children.length) return;
  const close = picker.querySelector('.home-picker-close');
  let navigating = false;
  picker.hidden = false; cards.hidden = true;
  document.body.classList.add('home-directions-ready');
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-controls', 'home-directions-picker');
  trigger.setAttribute('aria-expanded', 'false');
  function show() {
    navigating = false;
    if (!picker.matches(':popover-open')) picker.showPopover();
    close.focus({preventScroll:true});
  }
  function open(event) {
    event.preventDefault();
    if (picker.matches(':popover-open')) picker.hidePopover();
    else show();
  }
  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', event => {if (event.key === ' ') open(event);});
  document.querySelectorAll('.home-header nav a[href="#start-here"]').forEach(link => link.addEventListener('click', open));
  picker.addEventListener('toggle', event => {
    const expanded = event.newState === 'open';
    trigger.setAttribute('aria-expanded', String(expanded));
    // A zero-duration close can blur the panel before the asynchronous toggle event.
    if (!expanded && !navigating && (picker.contains(document.activeElement) || document.activeElement === document.body)) {
      trigger.focus({preventScroll:true});
    }
  });
  list.addEventListener('click', event => {
    if (event.target.closest('a')) {navigating = true; picker.hidePopover();}
  });
  function followHash() {
    if (['#cards', '#start-here'].includes(window.location.hash)) show();
    else if (picker.matches(':popover-open')) {navigating = true; picker.hidePopover();}
  }
  window.addEventListener('hashchange', followHash);
  followHash();
})();
