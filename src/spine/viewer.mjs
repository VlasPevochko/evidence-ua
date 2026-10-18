// Schematic 3D spine viewer. Bundled with the used parts of three.js (MIT) by scripts/spine-viewer/build.mjs
// into dist/spine-viewer.js, which the Atlas loads only after an explicit click.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, CylinderGeometry, BoxGeometry, MeshStandardMaterial,
  HemisphereLight, DirectionalLight, Raycaster, Vector2, Color, MathUtils
} from 'three';
import {buildSpineLayout, REGION_COLORS} from './layout.mjs';

export function webglAvailable(doc = document) {
  try {
    const canvas = doc.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const DIMMED = new Color(0x34414f);
const DISC_COLOR = 0xdbe7f1;

export function mountSpineViewer(container, {onSelect, onError} = {}) {
  if (!webglAvailable(container.ownerDocument)) {
    onError?.(new Error('WebGL is not available'));
    return null;
  }

  const layout = buildSpineLayout();
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 1, 600);
  let renderer;
  try {
    renderer = new WebGLRenderer({antialias: true, alpha: true});
  } catch (error) {
    onError?.(error);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = 'spine-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Схематична 3D-модель хребта. Стрілки обертають модель, плюс і мінус змінюють масштаб, Home повертає початковий вигляд. Відділ можна вибрати кнопками поруч.');
  container.append(canvas);

  scene.add(new HemisphereLight(0xffffff, 0x223344, 1.1));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(40, 60, 80);
  scene.add(sun);

  const column = new Group();
  scene.add(column);

  // One material per region, so that highlighting changes only a few objects.
  const materials = {};
  for (const [region, color] of Object.entries(REGION_COLORS)) {
    materials[region] = new MeshStandardMaterial({color, roughness: 0.6, metalness: 0.05});
  }
  const discMaterial = new MeshStandardMaterial({color: DISC_COLOR, roughness: 0.9, transparent: true, opacity: 0.85});

  const tag = (mesh, region) => { mesh.userData.region = region; return mesh; };
  const part = (geometry, region, x, y, z) => {
    const mesh = tag(new Mesh(geometry, region === 'disc' ? discMaterial : materials[region]), region === 'disc' ? null : region);
    mesh.position.set(x, y, z);
    return mesh;
  };

  for (const v of layout.vertebrae) {
    const group = new Group();
    group.position.set(0, v.y, v.z);
    group.rotation.x = v.tilt;
    const body = part(new CylinderGeometry(v.width / 2, v.width / 2, v.height, 28), v.region, 0, 0, 0);
    body.scale.z = v.depth / v.width;
    const arch = part(new BoxGeometry(v.width * 0.8, v.height * 0.82, v.depth * 0.5), v.region, 0, 0, -(v.depth / 2 + v.depth * 0.12));
    const spinousZ = -(v.depth / 2 + v.depth * 0.3 + v.spineLength / 2);
    const spinous = part(new BoxGeometry(v.width * 0.2, v.height * 0.5, v.spineLength), v.region, 0, -v.spineDrop / 2, spinousZ);
    spinous.rotation.x = -Math.atan2(v.spineDrop, v.spineLength);
    const side = (v.transverseSpan - v.width) / 2;
    const left = part(new BoxGeometry(side, v.height * 0.28, v.depth * 0.3), v.region, -(v.width / 2 + side / 2), 0, -v.depth * 0.18);
    const right = part(new BoxGeometry(side, v.height * 0.28, v.depth * 0.3), v.region, v.width / 2 + side / 2, 0, -v.depth * 0.18);
    group.add(body, arch, spinous, left, right);
    column.add(group);
  }

  for (const d of layout.discs) {
    const disc = part(new CylinderGeometry(d.width / 2, d.width / 2, d.height, 28), 'disc', 0, d.y, d.z);
    disc.rotation.x = d.tilt;
    disc.scale.z = d.depth / d.width;
    column.add(disc);
  }

  const s = layout.sacrum;
  const sacrum = new Group();
  sacrum.position.set(0, s.y, s.z);
  sacrum.rotation.x = s.tilt;
  const sacralBody = part(new CylinderGeometry(s.widthTop / 2, s.widthBottom / 2, s.height, 28), 'sacral', 0, 0, 0);
  sacralBody.scale.z = s.depthTop / s.widthTop;
  sacrum.add(sacralBody);
  for (const sign of [-1, 1]) {
    sacrum.add(part(new BoxGeometry(1.6, s.height * 0.38, s.depthTop * 0.9), 'sacral', sign * (s.widthTop / 2 + 0.55), s.height * 0.28, 0));
  }
  column.add(sacrum);
  for (const c of layout.coccyx) {
    const segment = part(new CylinderGeometry(c.width / 2, c.width / 2 * 0.8, c.height, 16), 'sacral', 0, c.y, c.z);
    segment.scale.z = c.depth / c.width;
    column.add(segment);
  }

  // Highlighting: the selected region keeps its colour and glows slightly; the others fall back to a muted tone.
  let selected = null;
  function paint() {
    for (const [region, material] of Object.entries(materials)) {
      const base = new Color(REGION_COLORS[region]);
      const active = selected === null || selected === region;
      material.color.copy(active ? base : base.clone().lerp(DIMMED, 0.78));
      material.emissive.copy(selected === region ? base : new Color(0x000000));
      material.emissiveIntensity = selected === region ? 0.28 : 0;
    }
    discMaterial.opacity = selected === null ? 0.85 : 0.35;
    requestRender();
  }

  // View state: yaw around the vertical axis, pitch, distance.
  const home = {yaw: 1.1, pitch: 0.12, distance: 128};
  const view = {...home};
  function applyView() {
    view.pitch = MathUtils.clamp(view.pitch, -0.6, 0.6);
    view.distance = MathUtils.clamp(view.distance, 55, 230);
    column.rotation.set(view.pitch, view.yaw, 0);
    camera.position.set(0, 0, view.distance);
    camera.lookAt(0, 0, 0);
    requestRender();
  }

  let frame = 0;
  function requestRender() {
    if (frame || disposed) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!disposed) renderer.render(scene, camera);
    });
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  observer?.observe(container);

  // Pointer interaction: drag rotates, pinch/wheel zoom, a short press selects a region.
  const pointers = new Map();
  let pinchDistance = 0;
  let travelled = 0;
  const raycaster = new Raycaster();
  function pick(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    const ndc = new Vector2(((clientX - box.left) / box.width) * 2 - 1, -((clientY - box.top) / box.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(column.children, true).find(h => h.object.userData.region);
    return hit ? hit.object.userData.region : null;
  }
  canvas.addEventListener('pointerdown', event => {
    canvas.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    travelled = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    travelled += Math.abs(dx) + Math.abs(dy);
    if (pointers.size === 1) {
      view.yaw += dx * 0.01;
      view.pitch += dy * 0.005;
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance) view.distance *= pinchDistance / distance;
      pinchDistance = distance;
    }
    applyView();
  });
  const end = event => {
    const wasSingle = pointers.size === 1;
    pointers.delete(event.pointerId);
    pinchDistance = 0;
    if (event.type === 'pointerup' && wasSingle && travelled < 6) onSelect?.(pick(event.clientX, event.clientY));
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    view.distance *= event.deltaY > 0 ? 1.08 : 0.92;
    applyView();
  }, {passive: false});
  canvas.addEventListener('keydown', event => {
    const keys = {
      ArrowLeft: () => { view.yaw -= 0.15; },
      ArrowRight: () => { view.yaw += 0.15; },
      ArrowUp: () => { view.pitch -= 0.08; },
      ArrowDown: () => { view.pitch += 0.08; },
      '+': () => { view.distance *= 0.9; },
      '=': () => { view.distance *= 0.9; },
      '-': () => { view.distance *= 1.1; },
      Home: () => { Object.assign(view, home); }
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    applyView();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    onError?.(new Error('WebGL context lost'));
  });

  let disposed = false;
  resize();
  applyView();
  paint();

  return {
    setRegion(region) { selected = region || null; paint(); },
    resetView() { Object.assign(view, home); applyView(); },
    dispose() {
      disposed = true;
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      scene.traverse(object => { object.geometry?.dispose?.(); });
      Object.values(materials).forEach(m => m.dispose());
      discMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    }
  };
}
