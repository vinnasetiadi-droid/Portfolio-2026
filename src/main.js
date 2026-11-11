import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { Curve } from "./curve.js";
import { splitLines } from "./split.js";
import { createAvatar3D } from "./avatar3d.js";
import { createCursor3D } from "./cursor3d.js";
import { splitChars, hideChars, charsIn, scramble, scrambleOnHover } from "./text-fx.js";
import { initPreviews } from "./preview.js";
import { createWorkGallery } from "./work.js";
import { createProjectPages } from "./detail.js";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------------------- */
/* Hero stage: scale the 1920×1080 Figma cover to cover the hero              */
/* -------------------------------------------------------------------------- */
const hero = $("[data-hero]");

// Every 3D object with its *visible* box in cover coordinates (PNG transparency excluded).
const fgObjs = $$(".stage--fg .obj").map((el) => {
  const [l, t, r, b] = (el.dataset.vis || "0 0 0 0").split(" ").map(Number);
  const x = el.offsetLeft + l;
  const y = el.offsetTop + t;
  const w = el.offsetWidth - l - r;
  const h = el.offsetHeight - t - b;
  return {
    el,
    cx: x + w / 2,
    cy: y + h / 2,
    hw: w / 2,
    hh: h / 2,
    tx: 0, // base translate (stage px) from fitStage
    ty: 0,
    sx0: 0, // visible centre on screen (px) at the base layout
    sy0: 0,
    sc: { x: 0, y: 0, r: 0 }, // extra offset (screen px) + tilt from the avatar bump
    fly: { x: 0, y: 0 }, // scroll-driven flight (the 3D cursor → About text)
  };
});
let stageScale = 1;

function placeObj(o) {
  const x = o.tx + (o.sc.x + o.fly.x) / stageScale;
  const y = o.ty + (o.sc.y + o.fly.y) / stageScale;
  o.el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
  o.el.style.rotate = `${o.sc.r.toFixed(2)}deg`;
}

const EDGE = 24; // px kept free at every screen edge
const SIZE = 1.0; // object size relative to the Figma cover fitted to the screen

/* Largest spread `a` (screen px per cover px) along one axis so that every object,
   drawn at scale s, stays within [EDGE, L - EDGE]. Positions map as a·c + b. */
function maxSpread(objs, c, half, L, s) {
  const feasible = (a) => {
    let lo = -Infinity;
    let hi = Infinity;
    for (const o of objs) {
      lo = Math.max(lo, EDGE + s * o[half] - a * o[c]);
      hi = Math.min(hi, L - EDGE - s * o[half] - a * o[c]);
    }
    return lo <= hi ? (lo + hi) / 2 : null;
  };
  let a0 = 0;
  let a1 = 4 * s;
  for (let i = 0; i < 30; i++) {
    const m = (a0 + a1) / 2;
    feasible(m) !== null ? (a0 = m) : (a1 = m);
  }
  return { a: a0, b: feasible(a0) };
}

function fitStage() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  // Paper texture: "cover" so it always fills the hero.
  hero.style.setProperty("--bg-scale", Math.max(w / 1920, h / 1080).toFixed(4));

  let s = Math.min(w / 1920, h / 1080) * SIZE;
  let X;
  let Y;
  if (w < h) {
    // Phones: keep the cover composition, zoomed so the objects stay readable.
    s = (h / 1080) * 0.78;
    X = { a: s, b: w / 2 - 960 * s };
    Y = { a: s, b: h / 2 - 540 * s };
  } else {
    // Objects keep their size but spread out to fill the whole screen. If the screen
    // can't hold them at their original spacing, shrink them a little.
    for (let i = 0; i < 40; i++) {
      X = maxSpread(fgObjs, "cx", "hw", w, s);
      Y = maxSpread(fgObjs, "cy", "hh", h, s);
      if (X.a >= s && Y.a >= s * 0.95) break;
      s *= 0.97;
    }
    // don't scatter them endlessly on very wide / tall screens
    X = clampSpread(X, s * 1.45, w, "cx");
    Y = clampSpread(Y, s * 1.3, h, "cy");
  }

  hero.style.setProperty("--stage-scale", s.toFixed(4));
  stageScale = s;
  for (const o of fgObjs) {
    // move the wrapper so its visible centre lands where the spread puts it
    o.sx0 = X.a * o.cx + X.b;
    o.sy0 = Y.a * o.cy + Y.b;
    o.tx = o.sx0 / s - o.cx;
    o.ty = o.sy0 / s - o.cy;
    placeObj(o);
  }
}

function clampSpread(axis, max, L, c) {
  if (axis.a <= max) return axis;
  // keep the group centred on screen at the capped spread
  const vals = fgObjs.map((o) => o[c]);
  const mid = (Math.min(...vals) + Math.max(...vals)) / 2;
  return { a: max, b: L / 2 - max * mid };
}

/* -------------------------------------------------------------------------- */
/* Split paragraphs into curve-able lines                                     */
/* -------------------------------------------------------------------------- */
const splitTargets = $$("[data-split]");
const splitAll = () => splitTargets.forEach((el) => splitLines(el));

/* -------------------------------------------------------------------------- */
/* Smooth scroll + curve                                                      */
/* -------------------------------------------------------------------------- */
const lenis = new Lenis({ lerp: 0.085, anchors: true });
lenis.stop();

const curve = new Curve();
const work = createWorkGallery($("#work")); // project gallery: media slide in on scroll

/* -------------------------------------------------------------------------- */
/* Hero scrollytelling                                                        */
/* The hero is pinned (sticky) for a while. While you scroll, the 3D objects  */
/* sink back into the wall one by one — outermost first — then she ducks     */
/* down, and only then the next section scrolls in. Fully reversible.        */
/* -------------------------------------------------------------------------- */
const heroPin = $("[data-hero-pin]");
const heroScroll = $("[data-hero-scroll]");
const type3dEl = $("[data-type3d]");
const nav = $("[data-nav]");
const greet = $("[data-greet]");
const glowIn = $(".hero__glow-in");

// where her head + shoulders sit on screen (from the 3D layout) — for the greeting + the bump
const headLayout = { headTop: 0, halfWidth: 0 };
const type3d = createAvatar3D(type3dEl, {
  onLayout: (l) => {
    Object.assign(headLayout, l);
    hero.style.setProperty("--head-top", `${l.headTop.toFixed(1)}px`);
    if (bumped) bump(false);
  },
  onAvatarRise: ({ instant = false } = {}) => {
    bump(!instant);
    showGreeting(!instant);
  },
});
const cursor3d = createCursor3D($("[data-cursor3d]"));

/* -------------------------------------------------------------------------- */
/* The bump: when she pops up from below, EVERY object gets nudged up and     */
/* away from her — like loose things inside a rocket at lift-off — and they   */
/* settle around her, never covering her or the greeting above her head.     */
/* -------------------------------------------------------------------------- */
let bumped = false;

function bumpTargets() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  const headTop = headLayout.headTop || h * 0.46;
  const halfW = headLayout.halfWidth || h * 0.24;
  const diag = Math.hypot(w, h);
  // keep-out ellipse around her (centred low, on the bottom edge)
  const ex = w / 2;
  const ey = h * 1.02;
  const erx = Math.max(halfW * 1.2 + 30, 240);
  const ery = ey - headTop + 36;
  // …and the greeting above her head
  const hr = hero.getBoundingClientRect();
  const gr = greet.getBoundingClientRect();
  const g = { l: gr.left - hr.left - 36, r: gr.right - hr.left + 36, t: gr.top - hr.top - 30, b: gr.bottom - hr.top + 24 };
  const inEllipse = (t) => {
    const nx = (t.x - ex) / (erx + t.hw * 0.75);
    const ny = (t.y - ey) / (ery + t.hh * 0.75);
    return nx * nx + ny * ny < 1;
  };
  const inGreet = (t) => t.x + t.hw > g.l && t.x - t.hw < g.r && t.y + t.hh > g.t && t.y - t.hh < g.b;

  const targets = fgObjs.map((o) => {
    const hw = o.hw * stageScale;
    const hh = o.hh * stageScale;
    // everyone is pushed away from a point below the screen centre → outwards + up
    let dx = o.sx0 - w / 2;
    let dy = o.sy0 - h * 0.8;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const dist = Math.hypot(o.sx0 - ex, o.sy0 - headTop);
    const push = h * 0.04 + Math.max(0, 1 - dist / (diag * 0.6)) * h * 0.1; // closer = harder
    return { o, hw, hh, dx, dy, dist, x: o.sx0 + dx * push, y: o.sy0 + dy * push - h * 0.02 };
  });

  // objects that already overlapped in the cover composition stay as a pair
  const together = new Set();
  targets.forEach((a, i) =>
    targets.forEach((b, j) => {
      if (j > i && Math.abs(a.o.sx0 - b.o.sx0) < a.hw + b.hw && Math.abs(a.o.sy0 - b.o.sy0) < a.hh + b.hh) together.add(i * 100 + j);
    })
  );

  for (let it = 0; it < 24; it++) {
    for (const t of targets) {
      for (let k = 0; k < 400 && (inEllipse(t) || inGreet(t)); k++) {
        t.x += t.dx * 4;
        t.y += t.dy * 4;
      }
    }
    targets.forEach((a, i) =>
      targets.forEach((b, j) => {
        if (j <= i || together.has(i * 100 + j)) return;
        const ox = a.hw + b.hw + 14 - Math.abs(a.x - b.x);
        const oy = a.hh + b.hh + 14 - Math.abs(a.y - b.y);
        if (ox <= 0 || oy <= 0) return;
        if (ox < oy) {
          const d = ((a.x < b.x ? -1 : 1) * ox) / 2;
          a.x += d;
          b.x -= d;
        } else {
          const d = ((a.y < b.y ? -1 : 1) * oy) / 2;
          a.y += d;
          b.y -= d;
        }
      })
    );
    for (const t of targets) {
      t.x = Math.min(w - EDGE - t.hw, Math.max(EDGE + t.hw, t.x));
      t.y = Math.min(h - EDGE - t.hh, Math.max(EDGE + t.hh, t.y));
    }
  }
  return { targets, diag };
}

function bump(animate = true) {
  if (hero.clientWidth < hero.clientHeight) return; // phones keep the cover layout
  bumped = true;
  const { targets, diag } = bumpTargets();
  for (const t of targets) {
    const o = t.o;
    const to = { x: t.x - o.sx0, y: t.y - o.sy0 };
    gsap.killTweensOf(o.sc);
    if (!animate || reduceMotion) {
      Object.assign(o.sc, to);
      placeObj(o);
      continue;
    }
    // one smooth wave outwards from her head: closest ones first, a firm start that
    // matches her rise, then a long soft settle (no bounce, only a slight tilt)
    gsap
      .timeline({ delay: (t.dist / diag) * 0.35, onUpdate: () => placeObj(o) })
      .to(o.sc, { x: to.x, y: to.y, duration: gsap.utils.random(2.2, 2.6), ease: "power3.out" }, 0)
      .to(o.sc, { r: gsap.utils.random(-3, 3), duration: 2.6, ease: "power2.out" }, 0);
  }
}

/* "Hello, I'm Vinna / Welcome to my portfolio" — letter by letter, above her head */
function showGreeting(animate = true) {
  const lines = $$(".line__in", greet);
  if (!animate || reduceMotion) {
    gsap.set(lines, { yPercent: 0 });
    gsap.set($$(".ch", greet), { yPercent: 0, rotate: 0, opacity: 1 });
    gsap.set(glowIn, { opacity: 1 });
    return;
  }
  gsap.to(glowIn, { opacity: 1, duration: 1.6, ease: "power2.out", delay: 0.3 });
  // letter by letter, the second line following the first
  lines.forEach((line, i) => charsIn(line.querySelectorAll(".ch"), { delay: 1.05 + i * 0.32, stagger: 0.028, duration: 1.1 }));
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
let pinDistance = 1;
let navShown = false;
let exitSteps = [];

function buildExitSteps() {
  const objs = rippleOrder()
    .reverse()
    .map((inEl) => inEl.closest(".obj"))
    .filter((el, i, all) => el !== cursorFly.o.el && all.indexOf(el) === i); // once per object
  const OBJ_START = 0.05;
  const OBJ_END = 0.74;
  const WIN = 0.13; // share of the pinned scroll each object takes to disappear
  const step = (OBJ_END - WIN - OBJ_START) / Math.max(1, objs.length - 1);
  exitSteps = objs.map((el, i) => ({ el, from: OBJ_START + i * step, to: OBJ_START + i * step + WIN, last: -1 }));
  exitSteps.push({ el: greet, from: 0.7, to: 0.84, last: -1 });
  exitSteps.push({ el: $("[data-hero-glow]"), from: 0.76, to: 0.94, last: -1 });
  exitSteps.push({ el: type3dEl, from: 0.76, to: 0.94, last: -1, isType: true });
}

function measurePin() {
  pinDistance = Math.max(1, heroPin.offsetHeight - window.innerHeight);
}

function scrollytell(scroll) {
  const p = clamp01(scroll / pinDistance);
  heroScroll.style.opacity = (1 - clamp01(p / 0.04)).toFixed(3);
  nav.classList.toggle("is-visible", scroll > 24);
  if (scroll > 24 && !navShown) {
    navShown = true;
    if (!reduceMotion) $$(".nav__links a").forEach((a, i) => scramble(a, { delay: 0.15 + i * 0.08, duration: 0.7 }));
  }

  for (const s of exitSteps) {
    const e = +smooth(clamp01((p - s.from) / (s.to - s.from))).toFixed(4);
    if (e === s.last) continue;
    s.last = e;
    s.el.style.visibility = e === 1 ? "hidden" : "";
    if (s.isType) {
      // she ducks back down below the screen
      s.el.style.translate = `0 ${(e * 80).toFixed(2)}vh`;
      type3d?.setActive(e < 1);
    } else {
      s.el.style.opacity = 1 - e;
      // sinks back into the wall: shrinks a little as it fades
      s.el.style.scale = 1 - e * 0.22;
    }
  }
}

/* The glass cursor comes along: while you scroll out of the hero it floats    */
/* over and lands at the end of the first About sentence, then stays there.   */
const cursorFly = { o: null, start: 0, end: 1 };
const FLY_SCALE = 0.7; // the cursor's size once it has landed below the text
cursorFly.o = fgObjs.find((o) => o.el.classList.contains("obj--cursor"));

function flyTarget() {
  // lands in the empty space below the About text, on the left (under "into…")
  const lines = $$(".about__text .big-text:last-child .line");
  const last = lines[lines.length - 1];
  if (!last) return null;
  const box = last.getBoundingClientRect();
  const text = $(".line__in", last).getBoundingClientRect();
  const o = cursorFly.o;
  const s = stageScale * FLY_SCALE;
  return { x: text.left + o.hw * s * 0.9, y: box.bottom + o.hh * s + 8 };
}

function measureFly() {
  const t = flyTarget();
  if (!t) return;
  const docY = t.y + window.scrollY; // target's page position
  cursorFly.start = pinDistance * 0.3;
  // it has landed once the target sits at 60% of the screen height
  cursorFly.end = Math.max(cursorFly.start + 400, docY - window.innerHeight * 0.6);
}

// Keeps v inside [lo, hi]; within `k` px of an edge it eases in instead of stopping dead.
function softClamp(v, lo, hi, k = 70) {
  if (hi - lo < 2 * k) return Math.min(hi, Math.max(lo, v));
  if (v > hi - k) return hi - k + k * Math.tanh((v - (hi - k)) / k);
  if (v < lo + k) return lo + k - k * Math.tanh((lo + k - v) / k);
  return v;
}

/* Flight: from its spot in the hero straight to below the About text, following the
   scroll — but always kept on screen (it never drifts out of view on the way). */
function updateFly(scroll) {
  const o = cursorFly.o;
  const m = smooth(clamp01((scroll - cursorFly.start) / (cursorFly.end - cursorFly.start)));
  if (m === 0 && o.fly.x === 0 && o.fly.y === 0) return;
  const hr = hero.getBoundingClientRect();
  const fromX = hr.left + o.sx0 + o.sc.x; // where it would be without the flight (screen px)
  const fromY = hr.top + o.sy0 + o.sc.y;
  const t = m > 0 ? flyTarget() : null;
  if (!t) {
    o.fly.x = o.fly.y = 0;
    o.el.style.scale = "1";
    placeObj(o);
    return;
  }
  const scale = 1 - (1 - FLY_SCALE) * m;
  const hw = o.hw * stageScale * scale + 16; // its visible half size + a margin
  const hh = o.hh * stageScale * scale + 16;
  let x = fromX + (t.x - fromX) * m;
  let y = fromY + (t.y - fromY) * m;
  if (scroll < cursorFly.end) {
    // on the way: kept on screen. Once landed it simply scrolls along with the text.
    x = softClamp(x, hw, window.innerWidth - hw);
    y = softClamp(y, hh + 52, window.innerHeight - hh); // (52: below the nav)
  }
  o.fly.x = x - fromX;
  o.fly.y = y - fromY;
  o.el.style.scale = scale.toFixed(3);
  placeObj(o);
}

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
  updateHaze();
  updateFly(lenis.scroll);
  scrollytell(lenis.scroll);
  cursor3d?.setScrollProgress(Math.min(1, lenis.scroll / cursorFly.end));
  if (!reduceMotion) {
    curve.update(lenis.scroll, lenis.velocity);
    work.update(lenis.scroll);
  }
});
gsap.ticker.lagSmoothing(0);

/* -------------------------------------------------------------------------- */
/* Cursor haze: every cover object gets a blurred twin, masked to a soft      */
/* circle at the cursor. So only the part of an object within reach of the    */
/* cursor goes hazy — the background stays sharp and clean.                   */
/* -------------------------------------------------------------------------- */
const HAZE_R = 130; // screen px
const hazeObjs = $$(".stage--fg .obj")
  .filter((obj) => !obj.querySelector("[data-cursor3d]")) // the WebGL cursor can't be cloned
  .map((obj) => {
    const inEl = $(".in", obj);
    // wrap the object's own content (so it can be cut away under the cursor)…
    const src = document.createElement("div");
    src.className = "haze-src";
    src.append(...inEl.children);
    // …and give it a blurred, wavy twin
    const copy = document.createElement("div");
    copy.className = "haze-copy";
    copy.setAttribute("aria-hidden", "true");
    // (the twin's box is padded all round, so the blur that spills past the object's
    // edge isn't cut off square by the box its mask is painted in)
    const pad = document.createElement("div");
    pad.className = "haze-pad";
    for (const child of [...src.children]) pad.appendChild(child.cloneNode(true));
    copy.appendChild(pad);
    inEl.append(src, copy);
    return { obj, inEl, src, copy, h: 0, shown: false };
  });
const hazePointer = { x: -9999, y: -9999, on: false };
let hazeLast = performance.now();

window.addEventListener("pointermove", (e) => {
  hazePointer.x = e.clientX;
  hazePointer.y = e.clientY;
  hazePointer.on = e.pointerType === "mouse";
});
document.documentElement.addEventListener("pointerleave", () => (hazePointer.on = false));

let hazeSettled = true;
let hazeReady = reduceMotion; // (switched on by the intro)
const hazeAt = { x: 0, y: 0, scroll: 0 };

function updateHaze() {
  const now = performance.now();
  const k = 1 - Math.exp(-((now - hazeLast) / 1000) * 8);
  hazeLast = now;
  // nothing moved and every haze has finished fading → no reads, no writes this frame
  const moved = hazePointer.x !== hazeAt.x || hazePointer.y !== hazeAt.y || lenis.scroll !== hazeAt.scroll;
  if (!moved && hazeSettled) return;
  Object.assign(hazeAt, { x: hazePointer.x, y: hazePointer.y, scroll: lenis.scroll });
  hazeSettled = true;
  const live = hazeReady && hazePointer.on && lenis.scroll < pinDistance;

  // pass 1 — reads only
  for (const o of hazeObjs) {
    o.rect = null;
    if ((live && o.obj.style.visibility !== "hidden") || o.h >= 0.01) {
      o.rect = o.inEl.getBoundingClientRect();
      o.scale = o.rect.width / (o.inEl.offsetWidth || 1); // stage scale × bump (rotation is small)
    }
  }

  // pass 2 — writes only
  for (const o of hazeObjs) {
    const r = o.rect;
    let target = 0;
    if (live && r && o.obj.style.visibility !== "hidden") {
      const near =
        hazePointer.x > r.left - HAZE_R && hazePointer.x < r.right + HAZE_R && hazePointer.y > r.top - HAZE_R && hazePointer.y < r.bottom + HAZE_R;
      target = near ? 1 : 0;
    }
    o.h += (target - o.h) * k;
    if (Math.abs(target - o.h) > 0.004) hazeSettled = false;
    if (o.h < 0.01 && target === 0) {
      if (o.shown) {
        o.copy.style.display = "none";
        o.src.classList.remove("is-hazed");
        o.shown = false;
      }
      continue;
    }
    if (!o.shown) {
      o.copy.style.display = "block";
      o.src.classList.add("is-hazed");
      o.shown = true;
    }
    if (!r) continue;
    // custom properties inherit, so setting them on .in drives both the cut-out and the twin
    const st = o.inEl.style;
    st.setProperty("--hx", `${((hazePointer.x - r.left) / o.scale).toFixed(1)}px`);
    st.setProperty("--hy", `${((hazePointer.y - r.top) / o.scale).toFixed(1)}px`);
    st.setProperty("--hr", `${(HAZE_R / o.scale).toFixed(1)}px`);
    st.setProperty("--ha", (1 - o.h * 0.92).toFixed(3));
    st.setProperty("--hs", (1 + o.h * 0.14).toFixed(3));
    o.copy.style.opacity = o.h.toFixed(3);
  }
}

/* -------------------------------------------------------------------------- */
/* Mouse parallax on hero objects                                             */
/* -------------------------------------------------------------------------- */
const parallax = $$(".stage--fg .obj").map((obj) => {
  const depth = parseFloat(obj.dataset.depth || "1");
  const par = $(".par", obj);
  // objects that "float" higher (more parallax) cast a softer, further shadow
  $(".in", obj).style.setProperty("--d", (0.55 + depth * 0.3).toFixed(2));
  return {
    depth,
    x: gsap.quickTo(par, "x", { duration: 1.2, ease: "power3.out" }),
    y: gsap.quickTo(par, "y", { duration: 1.2, ease: "power3.out" }),
  };
});

window.addEventListener("pointermove", (e) => {
  if (reduceMotion) return;
  const mx = e.clientX / window.innerWidth - 0.5;
  const my = e.clientY / window.innerHeight - 0.5;
  for (const p of parallax) {
    p.x(-mx * p.depth * 6);
    p.y(-my * p.depth * 4);
  }
});

/* -------------------------------------------------------------------------- */
/* Loader                                                                     */
/* -------------------------------------------------------------------------- */
function load() {
  const imgs = $$("img").filter((img) => img.loading !== "lazy"); // (gallery pictures load on demand)
  const MIN_MS = 1500; // the bar never completes faster than this
  const start = performance.now();
  // The text fade + the bar's run to 92% are CSS animations (style.css), so they stay
  // smooth while the 3D setup blocks the main thread. Here we wait for everything heavy:
  // 3D models (+ their shaders compiled and textures on the GPU, see type3d.ready),
  // the glass cursor, fonts, and every image downloaded AND decoded — so nothing is
  // left to do once the page shows.
  const loaded = (img) =>
    img.complete
      ? Promise.resolve()
      : new Promise((res) => {
          img.addEventListener("load", res, { once: true });
          img.addEventListener("error", res, { once: true });
        });
  const waits = [
    type3d ? type3d.ready.catch(() => {}) : null,
    cursor3d ? cursor3d.ready.catch(() => {}) : null,
    document.fonts.ready,
    ...imgs.map((img) => loaded(img).then(() => img.decode?.().catch(() => {}))),
  ];
  return Promise.all(waits).then(
    () => new Promise((res) => setTimeout(res, Math.max(0, MIN_MS - (performance.now() - start))))
  );
}

/* Wait until the browser has caught its breath: a run of smooth frames (or 2.5 s at
   most), so the intro never starts while it is still busy behind the loader. */
function settle({ frames = 10, budget = 24, max = 2500 } = {}) {
  return new Promise((resolve) => {
    const start = performance.now();
    let last = start;
    let calm = 0;
    const tick = (now) => {
      calm = now - last < budget ? calm + 1 : 0;
      last = now;
      if (calm >= frames || now - start > max) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(resolve, max + 100); // (no animation frames in a background tab)
  });
}

// the bar runs to 100% (handed over from its CSS animation without a jump)
function finishBar() {
  const barEl = $("[data-loader-bar]");
  const textEl = $("[data-loader-text]");
  const from = new DOMMatrix(getComputedStyle(barEl).transform).a;
  barEl.style.animation = "none";
  barEl.style.transform = `scaleX(${from})`;
  textEl.style.opacity = getComputedStyle(textEl).opacity;
  textEl.style.animation = "none";
  gsap.set(textEl, { opacity: 1 });
  return barEl
    .animate([{ transform: `scaleX(${from})` }, { transform: "scaleX(1)" }], {
      duration: 450,
      easing: "cubic-bezier(0.3, 0, 0.2, 1)",
      fill: "forwards",
    })
    .finished.then(() => new Promise((res) => setTimeout(res, 250)));
}

/* -------------------------------------------------------------------------- */
/* Intro + reveals                                                            */
/* -------------------------------------------------------------------------- */
const objIns = $$(".stage--fg .obj .in");
const hud = $$("[data-hud]");

function setInitialStates() {
  if (reduceMotion) return;
  gsap.set(objIns, { opacity: 0.001 }); // (not 0: their layers get painted behind the loader)
  gsap.set(hud, { opacity: 0, y: -12 });
  $$(".line__in", greet).forEach((l) => hideChars(splitChars(l)));
  setRevealStates();
}

// Order objects as a ripple from the centre of the cover outwards.
function rippleOrder() {
  return [...objIns].sort((a, b) => dist(a) - dist(b));
  function dist(el) {
    const o = el.closest(".obj");
    const x = o.offsetLeft + o.offsetWidth / 2 - 960;
    const y = o.offsetTop + o.offsetHeight / 2 - 540;
    return Math.hypot(x, y * 1.4);
  }
}

/* An object "rises out of the wall": it first shows as a faint flat imprint,
   then lifts up — growing to full size while its shadow spreads underneath. */
/* An object rises out of the wall: fades in while it grows and lifts a touch.
   (Only opacity + transform are animated → smooth; the shadow stays static.) */
// an object rises into place from below the bottom edge of the screen
function emerge(el) {
  const r = el.getBoundingClientRect();
  const below = (window.innerHeight - r.top + 40) / stageScale; // (.in lives in the scaled stage)
  return gsap.timeline().fromTo(el, { y: below, opacity: 1 }, { y: 0, duration: 1.5, ease: "power3.out" });
}

/* One continuous choreography: loader → the design words float up while the
   objects rise in from below → she pops up as the last ones land. */
function intro() {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

  // the design words (CSS-animated in) are handed to GSAP where they are, then float up
  // and away together with the bar
  const words = $$(".loader__word");
  for (const w of words) {
    const o = getComputedStyle(w).opacity;
    w.style.animation = "none";
    w.style.opacity = o;
  }
  tl.to(
    words,
    {
      y: () => -(window.innerHeight * 0.6 + Math.random() * 220),
      opacity: 0,
      duration: reduceMotion ? 0.4 : 1.1,
      ease: "power3.in",
      stagger: { each: 0.03, from: "random" },
    },
    0
  )
    .to("[data-loader-text]", { y: -48, opacity: 0, duration: 0.8, ease: "power3.in" }, 0.15)
    .add(() => document.body.classList.remove("is-loading"), 0.5)
    .set(".loader", { display: "none" });

  if (reduceMotion) {
    tl.add(() => {
      type3d?.start({ instant: true });
      lenis.start();
    });
    return tl;
  }

  // …while the words leave, the 3D objects rise up from below the screen, centre first
  const objStart = 0.6;
  rippleOrder().forEach((el, i) => {
    // (an object can have several layers — e.g. the paper + the "m" printed on it — but it floats once)
    const first = el === $(".in", el.closest(".obj"));
    tl.add(emerge(el).eventCallback("onComplete", first ? () => float(el) : null), objStart + i * 0.075);
  });

  // the cursor haze only wakes up once everything has landed
  const landed = objStart + objIns.length * 0.075 + 1.5;
  tl.add(() => (hazeReady = true), landed);

  // she pops up once most objects are in
  tl.add(() => type3d?.start(), objStart + 1.2)
    .to(hud, { opacity: 1, y: 0, duration: 1 }, "<0.4")
    .add(() => lenis.start(), "<");

  return tl;
}

function float(el) {
  // a barely-there bob of the whole object as a CSS animation → runs on the
  // compositor (no JS per frame); each object gets its own pace + phase
  const obj = el.closest(".obj");
  obj.style.setProperty("--fd", `${gsap.utils.random(4.5, 6.5).toFixed(2)}s`);
  obj.style.setProperty("--fdel", `${(-Math.random() * 6).toFixed(2)}s`);
  obj.classList.add("is-floating");
}

// Scroll reveals for everything outside the hero
let revealObserver;

function revealTargets() {
  return [
    ...$$(".section .line").map((el) => ({ el, kind: "line" })),
    ...$$("[data-reveal]").map((el) => ({ el, kind: el.dataset.reveal || "fade" })),
  ];
}

function setRevealStates() {
  for (const { el, kind } of revealTargets()) {
    if (kind === "line") hideChars(splitChars($(".line__in", el)));
    else if (kind === "card") {
      gsap.set(el.firstElementChild, { opacity: 0, y: 70, scale: 0.94 });
      $$(".pw__title", el).forEach((t) => hideChars(splitChars(t)));
      gsap.set($$(".pw__tags", el), { opacity: 0 });
    } else if (kind === "scramble") gsap.set(scrambleParts(el), { opacity: 0 });
    else if (kind === "stagger") gsap.set(el.children, { opacity: 0, y: 24 });
    else if (kind === "row") {
      // (the <li> itself carries the scroll-curve transform → animate what's inside)
      gsap.set(el.children, { opacity: 0, y: 28 });
      gsap.set($(".xp__date", el), { opacity: 0 });
    }
    else gsap.set(el, { opacity: 0, clipPath: "inset(0 0 100% 0)" });
  }
}

// a label decodes itself; a row of labels (footer) decodes part by part
const scrambleParts = (el) => (el.children.length ? [...el.children] : [el]);

function observeReveals() {
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        revealObserver.unobserve(el);
        reveal(el);
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  for (const { el } of revealTargets()) revealObserver.observe(el);
}

function reveal(el) {
  const kind = el.classList.contains("line") ? "line" : el.dataset.reveal || "fade";
  if (kind === "line") {
    const chars = el.querySelectorAll(".ch");
    // long lines don't take longer than short ones
    charsIn(chars, { stagger: Math.min(0.022, 0.75 / Math.max(1, chars.length)) });
  } else if (kind === "card") {
    gsap.to(el.firstElementChild, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "expo.out" });
    $$(".pw__title", el).forEach((t) => charsIn(t.querySelectorAll(".ch"), { delay: 0.15, stagger: 0.03 }));
    $$(".pw__tags", el).forEach((t, i) => scramble(t, { delay: 0.25 + i * 0.12, duration: 0.8 }));
  } else if (kind === "scramble") {
    scrambleParts(el).forEach((t, i) => scramble(t, { delay: i * 0.12 }));
  } else if (kind === "stagger") {
    gsap.to(el.children, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 });
  } else if (kind === "row") {
    gsap.to(el.children, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.1 });
    scramble($(".xp__date", el), { delay: 0.2, duration: 0.8 });
  } else {
    gsap.to(el, { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1, ease: "power3.out" });
  }
}

/* -------------------------------------------------------------------------- */
/* Boot                                                                       */
/* -------------------------------------------------------------------------- */
fitStage();
measurePin();
window.scrollTo(0, 0);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

if (!reduceMotion) $$(".nav__links a, .footer a").forEach(scrambleOnHover);
initPreviews($(".about__text")); // hover Web3 / LMS / landing pages → mockup card

/* Project pages: click a project (its title or any of its pictures) → its page rises
   over the home page, which waits underneath (scroll + 3D paused) */
const pages = createProjectPages({
  page: $("#top"),
  onOpen: () => {
    lenis.stop();
    type3d?.setActive(false);
  },
  onClose: () => {
    lenis.start();
    for (const s of exitSteps) s.last = -1; // re-apply the hero state (wakes the 3D if it's in view)
  },
});
if (import.meta.env.DEV) window.__pages = pages;
// the highlighted words in the About text open their project too
const WORD_PROJECTS = { web3: "web3-landing-pages", landing: "accomy-landing-page" };
$(".about__text").addEventListener("click", (e) => {
  const w = e.target.closest(".w-b[data-preview]");
  if (w && WORD_PROJECTS[w.dataset.preview]) pages.open(WORD_PROJECTS[w.dataset.preview]);
});
$("#work").addEventListener("click", (e) => {
  const hit = e.target.closest(".pw__head, .pw__media");
  // (a picture can belong to its own project — e.g. Accomy inside the landing pages)
  if (hit) pages.open(hit.dataset.project || hit.closest(".pw").dataset.project);
});


load()
  .then(() => {
    // all the page set-up happens while the loader still covers everything
    splitAll();
    setInitialStates();
    buildExitSteps();
    curve.refresh();
    work.measure();
    measureFly();
    if (!reduceMotion) observeReveals();
    return settle(); // …and only once the browser is calm again
  })
  .then(finishBar)
  .then(intro)
  .then(() => pages.route()); // opened with #work/<slug> → straight to that project

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    fitStage();
    if (bumped) bump(false);
    measurePin();
    splitAll(); // new line elements are shown immediately (no re-reveal on resize)
    curve.refresh();
    work.measure();
    measureFly();
  }, 150);
});
