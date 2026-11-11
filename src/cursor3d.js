/**
 * The 3D cursor of the hero (Tripo model → public/models/cursor.glb).
 * It lives in its own small canvas inside the cover object, so it keeps all the
 * DOM behaviour (rise-in, float, parallax, scroll exit, drop shadow).
 * Clear glass. It rests still and turns with the scroll position (a full turn over
 * the pinned hero), so scrolling back turns it back — part of the scrollytelling.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function createCursor3D(container) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "cursor3d__canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 3, 4);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 4.2);

  const spinner = new THREE.Group();
  scene.add(spinner);

  const loader = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("/draco/"));
  const ready = loader.loadAsync("/models/cursor.glb").then((gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    model.traverse((o) => {
      if (!o.isMesh) return;
      const src = o.material;
      o.material = new THREE.MeshPhysicalMaterial({
        map: src.map, // keeps the soft blue → yellow tint of the original
        normalMap: src.normalMap,
        color: new THREE.Color(0xffffff),
        transmission: 1,
        thickness: 0.6,
        ior: 1.45,
        roughness: 0.06,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        iridescence: 0.35,
        iridescenceIOR: 1.3,
        specularIntensity: 1,
        envMapIntensity: 1.4,
        attenuationColor: new THREE.Color(0xdbe8ff),
        attenuationDistance: 1.5,
      });
    });
    const holder = new THREE.Group();
    holder.add(model);
    holder.scale.setScalar(1.55 / Math.max(size.x, size.y));
    spinner.add(holder);
    dirty = true;
  });

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  let dirty = true; // only redraw when something actually changed
  new ResizeObserver(() => {
    resize();
    dirty = true;
  }).observe(container);
  resize();

  let target = 0; // rotation from the scroll position
  let last = performance.now();
  let active = true;
  spinner.rotation.set(0.12, -0.35, 0); // resting pose: a slight 3/4 view

  (function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!active) return;
    // follow the scroll smoothly; no rotation of its own
    const delta = target - spinner.rotation.y;
    if (Math.abs(delta) > 1e-4) {
      spinner.rotation.y += delta * (1 - Math.exp(-8 * dt));
      dirty = true;
    }
    if (!dirty) return; // still glass at rest → nothing to draw (saves the transmission pass)
    dirty = false;
    renderer.render(scene, camera);
  })();

  return {
    ready,
    /** 0 → 1 over the pinned hero = one full turn. */
    setScrollProgress(p) {
      target = -0.35 + p * Math.PI * 2;
    },
    setActive(v) {
      active = v;
    },
  };
}
