/**
 * The 3D avatar in the hero (Tripo model → public/models/me.glb).
 *
 * Once the cover objects are in, she rises from below the bottom edge and stays:
 * only her head + eyes follow the cursor, she blinks, and a soft shadow falls on
 * the wall behind her. Cel-shaded (flat light bands, no gloss), like an illustration.
 *
 * Rendering is on demand: an idle frame (cursor still, eyes open) is skipped, so
 * the canvas costs nothing while nothing moves.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { gsap } from "gsap";

const MODEL = "/models/me.glb";
const HEIGHT = 0.54; // share of the visible height
// chest fade, in model units (feet of the bust ≈ 0, neck ≈ 0.33, top of the head ≈ 0.98)
const FADE_FROM = 0.27; // fully visible above this
const FADE_TO = 0.04; // gone below this

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Avatar: head turn, eye follow, blink — all in the vertex shader             */
/* (the Tripo model is one static mesh: no rig, no blendshapes)                */
/* -------------------------------------------------------------------------- */
// Cel-shaded ("2D-3D" illustration look): three flat light bands, no gloss, no reflections
const TOON_RAMP = new THREE.DataTexture(new Uint8Array([196, 196, 196, 255, 232, 232, 232, 255, 255, 255, 255, 255]), 3, 1);
TOON_RAMP.minFilter = TOON_RAMP.magFilter = THREE.NearestFilter;
TOON_RAMP.colorSpace = THREE.NoColorSpace;
TOON_RAMP.needsUpdate = true;

function enhanceAvatar(mesh, u) {
  const src = mesh.material;
  const mat = new THREE.MeshToonMaterial({ map: src.map, gradientMap: TOON_RAMP });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader =
      /* glsl */ `
      uniform float uBlink;
      uniform mat3 uHeadRot;
      uniform vec2 uLook;
      varying float vBodyY;
      const vec3 NECK = vec3(0.0, 0.33, 0.0);
      const vec3 EYE_L = vec3(-0.105, 0.617, 0.205);
      const vec3 EYE_R = vec3(0.1, 0.617, 0.205);
      float headW(vec3 p) { return smoothstep(0.29, 0.40, p.y); }
      vec3 eyeFx(vec3 p, vec3 c) {
        // the iris slides towards the cursor (only inside the white of the eye)
        vec3 di = (p - c) / vec3(0.042, 0.03, 0.06);
        p.xy += uLook * (1.0 - smoothstep(0.35, 1.0, dot(di, di)));
        // blink: squeeze the eye into a soft, relaxed line
        vec3 d = (p - c) / vec3(0.065, 0.055, 0.06);
        float w = (1.0 - smoothstep(0.55, 1.0, dot(d, d))) * uBlink;
        float lid = c.y - 0.006 - 0.008 * (1.0 - d.x * d.x);
        p.y = mix(p.y, lid, w * 0.94);
        return p;
      }
    ` +
      shader.vertexShader
        .replace(
          "#include <beginnormal_vertex>",
          `#include <beginnormal_vertex>
          objectNormal = normalize(mix(objectNormal, uHeadRot * objectNormal, headW(position)));`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vBodyY = position.y;
          transformed = eyeFx(eyeFx(transformed, EYE_L), EYE_R);
          transformed = mix(transformed, NECK + uHeadRot * (transformed - NECK), headW(position));`
        );
    // ink-like darkening on the silhouette, like a drawn outline; and the chest
    // melts softly into the wall below the collar (no hard cut at the screen edge)
    shader.fragmentShader =
      "varying float vBodyY;\n" +
      shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float rimF = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 5.0);
        gl_FragColor.rgb *= 1.0 - rimF * 0.22;
        gl_FragColor.a *= smoothstep(${FADE_TO.toFixed(3)}, ${FADE_FROM.toFixed(3)}, vBodyY);`
      );
  };
  mat.transparent = true; // (for the chest fade)
  mesh.material = mat;
}

/* -------------------------------------------------------------------------- */
export function createAvatar3D(container, opts = {}) {
  if (!supportsWebGL()) return null;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap; // supports a real blur radius
  renderer.shadowMap.autoUpdate = false; // re-rendered only when she moves (see render())
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  camera.updateMatrixWorld();

  // Key light from the upper right (same as the cover) → shadow falls down-left.
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(1.6, 2.6, 10);
  key.castShadow = true;
  // (a small map is plenty for a shadow this blurry — 4× cheaper to redraw)
  key.shadow.mapSize.set(512, 512);
  key.shadow.radius = 11; // (texels) wide, soft penumbra like daylight through a window
  key.shadow.blurSamples = 14;
  key.shadow.bias = -0.0006;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 4, bottom: -4, near: 1, far: 30 });
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e4ee, 1.1));
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));

  // Invisible wall that only receives the shadow.
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.ShadowMaterial({ opacity: 0.08 }));
  wall.position.z = -0.6;
  wall.receiveShadow = true;
  scene.add(wall);

  const u = {
    uBlink: { value: 0 },
    uHeadRot: { value: new THREE.Matrix3() },
    uLook: { value: new THREE.Vector2() },
  };

  // pivot (rise in / out) > model, centred on its bounding box
  const pivot = new THREE.Group();
  pivot.visible = false;
  scene.add(pivot);
  let size = new THREE.Vector3(1, 1, 1);
  let base = 1; // scale
  let restY = 0; // standing on the bottom edge
  let offY = 0; // how far below to start

  const pointer = { x: 0, y: 0, on: false };
  const look = { yaw: 0, pitch: 0 };
  let running = false;
  let active = true;
  let timeline;
  const clock = new THREE.Clock();

  const loader = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("/draco/"));
  const ready = loader.loadAsync(MODEL).then(async (gltf) => {
    const model = gltf.scene;
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      enhanceAvatar(o, u);
    });
    const box = new THREE.Box3().setFromObject(model);
    size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    pivot.add(model);
    resize();
    // Warm-up behind the loader: compile her shaders + upload her texture now, so she
    // doesn't hitch the first time she appears (the canvas stays invisible meanwhile).
    container.style.opacity = "0";
    pivot.visible = true;
    pivot.position.y = restY;
    await renderer.compileAsync(scene, camera).catch(() => {});
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    pivot.visible = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    container.style.opacity = "";
  });

  function resize() {
    dirty = true;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * camera.aspect;
    base = Math.min((HEIGHT * vh) / size.y, (0.8 * vw) / size.x);
    pivot.scale.setScalar(base);
    // in front of the shadow wall, standing on the bottom edge like a portrait
    const z = (size.z * base) / 2 + 0.1;
    const vhAtZ = vh * ((camera.position.z - z) / camera.position.z);
    pivot.position.z = z;
    restY = -vhAtZ / 2 + (size.y * base) / 2 - 0.04 * vhAtZ;
    // start just below the bottom edge (not a whole screen lower): a short, calm rise
    offY = size.y * base + 0.06 * vhAtZ;
    if (running && !gsap.isTweening(pivot.position)) pivot.position.y = restY;
    // where her head and shoulders land on screen (px) — for the greeting + the bump
    const top = new THREE.Vector3(0, restY + (size.y * base) / 2, z).project(camera);
    const side = new THREE.Vector3((size.x * base) / 2, restY, z).project(camera);
    opts.onLayout?.({ headTop: ((1 - top.y) / 2) * h, halfWidth: (side.x / 2) * w });
  }

  // she rises from just below the screen (firm start, soft landing); the cover
  // objects get pushed the moment her head comes into view
  function rise() {
    pivot.visible = true;
    pivot.position.y = restY - offY;
    timeline = gsap
      .timeline({ onComplete: startBlinking })
      .to(pivot.position, { y: restY, duration: 1.7, ease: "power3.out" })
      .add(() => opts.onAvatarRise?.(), 0.2);
  }

  function blink(double = false) {
    const b = u.uBlink;
    const tl = gsap
      .timeline()
      .to(b, { value: 1, duration: 0.07, ease: "power2.in" })
      .to(b, { value: 0, duration: 0.14, ease: "power2.out" }, "+=0.05");
    if (double) tl.to(b, { value: 1, duration: 0.07, yoyo: true, repeat: 1 }, "+=0.08");
  }

  function startBlinking() {
    const next = () =>
      setTimeout(() => {
        if (active) blink(Math.random() < 0.2);
        next();
      }, gsap.utils.random(1800, 4800));
    next();
  }

  const headRot = new THREE.Matrix4();
  const euler = new THREE.Euler();
  let lastShadowY = -1e9;
  let lastSig = "";
  let dirty = true; // forces the next frame to draw (resize, re-activation)
  // adaptive resolution: if the page can't keep up, draw her at 1× instead of 1.5×
  let slowFrames = 0;

  function render() {
    requestAnimationFrame(render);
    if (!active) return;
    const dt = Math.min(clock.getDelta(), 0.25);
    if (renderer.getPixelRatio() > 1 && document.visibilityState === "visible") {
      slowFrames = dt > 1 / 40 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45) {
        renderer.setPixelRatio(1);
        resize();
      }
    }
    // frame-rate independent smoothing: only the head turns (the eyes lead a little)
    const ease = (rate) => 1 - Math.exp(-rate * dt);
    look.yaw += (pointer.x * 0.38 - look.yaw) * ease(4);
    look.pitch += (pointer.y * 0.2 - look.pitch) * ease(4);
    euler.set(look.pitch, look.yaw, -look.yaw * 0.15);
    u.uHeadRot.value.setFromMatrix4(headRot.makeRotationFromEuler(euler));
    u.uLook.value.set(pointer.x * 0.011, -pointer.y * 0.007);

    // draw only when something changed
    const sig =
      `${+pivot.visible}|${look.yaw.toFixed(4)}|${look.pitch.toFixed(4)}|` +
      `${u.uBlink.value.toFixed(3)}|${pivot.position.y.toFixed(4)}|${pivot.scale.x.toFixed(4)}`;
    if (!dirty && sig === lastSig) return;
    lastSig = sig;
    dirty = false;

    // the (soft, blurry) shadow only needs refreshing when she actually moves
    const y = pivot.visible ? pivot.position.y : -999;
    if (Math.abs(y - lastShadowY) > 0.008) {
      renderer.shadowMap.needsUpdate = true;
      lastShadowY = y;
    }
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.on = true;
  });
  document.documentElement.addEventListener("pointerleave", () => (pointer.on = false));

  return {
    ready,
    /** She rises in (once the cover objects are in). `instant`: already standing (reduced motion). */
    start({ instant = false } = {}) {
      if (running) return;
      running = true;
      resize();
      render();
      if (!instant) return rise();
      pivot.visible = true;
      pivot.position.y = restY;
      opts.onAvatarRise?.({ instant: true });
    },
    /** Pause rendering while the hero is scrolled out of view. */
    setActive(v) {
      if (active === v) return;
      active = v;
      dirty = true;
      if (timeline) v ? timeline.resume() : timeline.pause();
    },
  };
}
