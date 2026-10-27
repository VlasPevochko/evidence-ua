// «Шлях їжі» — 3D viewer. Browser-only; build rewrites import specifiers for dist.
import * as THREE from './vendor/three/three.module.js';
import {OrbitControls} from './vendor/three/addons/controls/OrbitControls.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {ClaimCard, mountEvidenceDrawer, escapeHTML} from './evidence/components.js?v=2.2';
import {digestionBase, digestionModule} from './digestion-data.js?v=1';
import {foodPathSteps as STEPS, foodPathTract as TRACT, organNamesUA as NAMES} from './digestion-steps.js?v=2';

const e = escapeHTML;
const pad = n => String(n).padStart(2, '0');

export function mountFoodPath(root, {modelUrl = './' + digestionModule.model.file} = {}) {
  const win = root.ownerDocument.defaultView;
  const stage = root.querySelector('[data-fp-stage]');
  const status = root.querySelector('[data-fp-status]');
  const rail = root.querySelector('[data-fp-rail]');
  const stepEl = root.querySelector('[data-fp-step]');
  const prevBtn = root.querySelector('[data-fp-prev]');
  const nextBtn = root.querySelector('[data-fp-next]');
  const reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  // ---------- Panel (works without WebGL) ----------
  rail.innerHTML = STEPS.map((s, i) => `<li><button type="button" data-fp-goto="${i}" aria-label="${e(s.title)}">${pad(i)}</button></li>`).join('');

  function renderPanel() {
    const step = STEPS[current];
    rail.querySelectorAll('[data-fp-goto]').forEach((b, i) => {
      if (i === current) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('done', i < current);
    });
    const tag = (id, kind) => `<span class="fp-organ fp-organ-${kind}">${e(NAMES[id])}</span>`;
    const tags = step.focus[0] === '*'
      ? TRACT.map(id => tag(id, 'focus')).join('') + ['liver', 'gallbladder', 'pancreas'].map(id => tag(id, 'context')).join('')
      : step.focus.map(id => tag(id, 'focus')).join('') + step.context.map(id => tag(id, 'context')).join('');
    stepEl.innerHTML = `
      <p class="fp-count">${pad(current)} / ${pad(STEPS.length - 1)}</p>
      <h2 id="fp-step-title">${e(step.title)}</h2>
      <p class="fp-lead">${e(step.lead)}</p>
      <div class="fp-organs" aria-label="Органи на цьому етапі">${tags}</div>
      <ul class="fp-points">${step.points.map(p => `<li>${e(p)}</li>`).join('')}</ul>
      ${step.claimId ? ClaimCard(step.claimId, digestionBase) : ''}
      ${step.zoom ? `<a class="fp-zoom" href="${e(step.zoom.href)}">${e(step.zoom.label)} →</a>` : ''}`;
    stepEl.scrollTop = 0;
    prevBtn.disabled = current === 0;
    nextBtn.textContent = current === STEPS.length - 1 ? 'Спочатку' : 'Далі';
  }

  // ---------- 3D scene ----------
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  } catch (error) {
    status.textContent = 'Ваш браузер не показує 3D-графіку. Текстові пояснення й докази доступні праворуч.';
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  const organs = new Map();
  const anchors = {};
  const camGoal = {target: new THREE.Vector3(), dist: 5, active: false};
  let controls = null, bolus = null, modelSize = 1, pathCurve = null, pathStart = 0, raf = 0;
  const css = name => win.getComputedStyle(root).getPropertyValue(name).trim();

  if (renderer) {
    renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.prepend(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.addEventListener('start', () => { camGoal.active = false; });
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 4, 5);
    scene.add(key);
    new win.ResizeObserver(resize).observe(stage);
    status.textContent = 'Завантаження 3D-моделі…';
    new GLTFLoader().load(modelUrl, onModel, undefined, () => {
      status.textContent = '3D-модель не завантажилась. Текстові пояснення й докази доступні праворуч.';
    });
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function onModel(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.updateMatrixWorld(true);
    for (const node of model.children) {
      const id = node.name.split('__')[0];
      const materials = [];
      node.traverse(o => {
        if (!o.isMesh) return;
        // DoubleSide closes a source-model gap with inverted normals in the stomach.
        o.material = new THREE.MeshStandardMaterial({roughness: 0.62, metalness: 0, transparent: true, side: THREE.DoubleSide});
        materials.push(o.material);
      });
      organs.set(id, {materials, box: new THREE.Box3().setFromObject(node)});
    }
    const all = new THREE.Box3().setFromObject(model);
    modelSize = all.getSize(new THREE.Vector3()).length();
    camera.near = modelSize / 200;
    camera.far = modelSize * 20;
    controls.minDistance = modelSize * 0.15;
    controls.maxDistance = modelSize * 3;
    const center = id => organs.get(id).box.getCenter(new THREE.Vector3());
    const oes = organs.get('oesophagus').box, oc = oes.getCenter(new THREE.Vector3());
    Object.assign(anchors, {
      oesTop: new THREE.Vector3(oc.x, oes.max.y, oc.z), oesBottom: new THREE.Vector3(oc.x, oes.min.y, oc.z),
      stomach: center('stomach'), duodenum: center('small-intestine-duodenum'), jejunum: center('small-intestine-jejunum'),
      ascending: center('large-intestine-ascending-colon'), transverse: center('large-intestine-transverse-colon'),
      descending: center('large-intestine-descending-colon'), sigmoid: center('large-intestine-sigmoid-colon')
    });
    anchors.pylorus = anchors.stomach.clone().lerp(anchors.duodenum, 0.6);
    bolus = new THREE.Mesh(new THREE.SphereGeometry(modelSize * 0.012, 24, 16), new THREE.MeshBasicMaterial({depthTest: false, transparent: true}));
    bolus.renderOrder = 10;
    scene.add(bolus);
    status.textContent = '';
    status.hidden = true;
    resize();
    show(true);
    raf = win.requestAnimationFrame(tick);
  }

  function paint() {
    if (!organs.size) return;
    const step = STEPS[current];
    const accent = new THREE.Color(css('--fp-gold')), organ = new THREE.Color(css('--fp-organ')), helper = new THREE.Color(css('--fp-blue'));
    const overview = step.focus[0] === '*';
    organs.forEach((o, id) => {
      let color = organ, opacity = 0.16, glow = 0;
      if (overview) { const isHelper = !TRACT.includes(id); color = isHelper ? helper : organ; opacity = isHelper ? 0.55 : 0.95; }
      else if (step.focus.includes(id)) { color = accent; opacity = 1; glow = 0.15; }
      else if (step.context.includes(id)) { color = helper; opacity = 0.7; }
      for (const m of o.materials) { m.color.copy(color); m.emissive.copy(color).multiplyScalar(glow); m.opacity = opacity; m.depthWrite = opacity > 0.9; }
    });
    bolus.material.color.set(css('--fp-bolus'));
  }

  function frame(ids, instant) {
    const box = new THREE.Box3();
    ids.forEach(id => box.union(organs.get(id).box));
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fit = Math.max(sphere.radius / Math.sin(fov / 2), sphere.radius / Math.sin(Math.atan(Math.tan(fov / 2) * camera.aspect)));
    camGoal.target.copy(sphere.center);
    camGoal.dist = THREE.MathUtils.clamp(fit * 1.08, controls.minDistance, controls.maxDistance);
    camGoal.active = !instant;
    if (instant) { camera.position.copy(sphere.center).add(new THREE.Vector3(0, 0, camGoal.dist)); controls.target.copy(sphere.center); }
  }

  function show(instant = false) {
    if (!organs.size) return;
    const step = STEPS[current];
    paint();
    frame(step.focus[0] === '*' ? [...organs.keys()] : [...step.focus, ...step.context], instant);
    pathCurve = step.path ? new THREE.CatmullRomCurve3(step.path.map(k => anchors[k]), false, 'centripetal') : null;
    pathStart = win.performance.now();
    bolus.visible = Boolean(pathCurve);
  }

  const tmp = new THREE.Vector3();
  function tick(now) {
    if (camGoal.active) {
      controls.target.lerp(camGoal.target, 0.08);
      const d = camera.position.distanceTo(controls.target);
      const dir = tmp.copy(camera.position).sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, d + (camGoal.dist - d) * 0.08);
      if (controls.target.distanceTo(camGoal.target) < modelSize * 0.001 && Math.abs(d - camGoal.dist) < modelSize * 0.002) camGoal.active = false;
    }
    if (pathCurve) {
      const t = reduceMotion ? 1 : Math.min(((now - pathStart) % 3500) / 2600, 1);
      bolus.position.copy(pathCurve.getPoint(t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
    }
    controls.update();
    renderer.render(scene, camera);
    raf = win.requestAnimationFrame(tick);
  }

  // ---------- Navigation ----------
  function go(index) {
    current = Math.max(0, Math.min(STEPS.length - 1, index));
    renderPanel();
    show();
    try { win.history.replaceState(null, '', '#' + STEPS[current].id); } catch { /* history may be unavailable */ }
  }
  const fromHash = () => Math.max(0, STEPS.findIndex(s => '#' + s.id === win.location.hash));

  rail.addEventListener('click', ev => { const b = ev.target.closest('[data-fp-goto]'); if (b) go(Number(b.dataset.fpGoto)); });
  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current === STEPS.length - 1 ? 0 : current + 1));
  stage.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowRight') go(current + 1);
    if (ev.key === 'ArrowLeft') go(current - 1);
  });
  win.addEventListener('hashchange', () => go(fromHash()));
  const unbindDrawer = mountEvidenceDrawer(root, digestionBase);

  current = fromHash();
  renderPanel();
  return {
    go, state: () => ({index: current, id: STEPS[current].id}),
    destroy() { win.cancelAnimationFrame(raf); unbindDrawer?.(); renderer?.dispose(); }
  };
}

const page = typeof document !== 'undefined' && document.querySelector('[data-food-path]');
if (page) mountFoodPath(page);
