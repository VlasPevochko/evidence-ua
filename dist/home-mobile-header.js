(() => {
  if (document.body.dataset.platformArea !== 'home') return;
  const header = document.querySelector('.page > header');
  const toggle = header?.querySelector('.home-menu-toggle');
  const navigation = header?.querySelector('nav');
  const project = header?.querySelector('.headbtn');
  if (!toggle || !navigation || !project) return;
  const mobile = matchMedia('(max-width:1024px)');
  let expanded = false;

  function render() {
    const open = mobile.matches && expanded;
    toggle.hidden = !mobile.matches;
    navigation.hidden = project.hidden = mobile.matches && !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    header.classList.toggle('home-menu-open', open);
  }
  function close(returnFocus = false) {
    expanded = false;
    render();
    if (returnFocus && mobile.matches) toggle.focus();
  }
  header.classList.add('home-menu-ready');
  toggle.addEventListener('click', () => {expanded = !expanded; render();});
  navigation.addEventListener('click', event => {if (event.target.closest('a')) close();});
  project.addEventListener('click', () => close());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) {event.preventDefault(); close(true);}
  });
  document.addEventListener('click', event => {if (expanded && !header.contains(event.target)) close();});
  document.getElementById('about')?.addEventListener('close', () => {if (mobile.matches) toggle.focus();});
  mobile.addEventListener('change', () => close());
  render();
})();
