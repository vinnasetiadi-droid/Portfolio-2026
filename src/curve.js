/**
 * "Inside a sphere" scroll curve.
 *
 * Every [data-curve] element is mapped onto the inner wall of a drum whose
 * axis runs horizontally through the viewport centre. Elements in the middle
 * of the screen sit flat; towards the top/bottom edges they tilt (rotateX),
 * come closer to the camera (translateZ) and get magnified — so the page
 * looks like it is rolling around you. Scroll velocity tightens the radius,
 * so fast scrolling bends harder.
 *
 * Each element gets its own perspective() so we never rely on preserve-3d
 * (which breaks with overflow/opacity/filters on ancestors).
 */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export class Curve {
  constructor({ radius = 1.9, perspective = 1.6, velocityBoost = 0.5 } = {}) {
    this.radius = radius; // drum radius as a multiple of viewport height (smaller = rounder)
    this.perspective = perspective; // camera distance as a multiple of viewport height
    this.velocityBoost = velocityBoost; // extra bend at high scroll speed
    this.items = [];
    this.vel = 0;
    this.H = window.innerHeight;
    this.dirty = true;
  }

  refresh() {
    this.items = [...document.querySelectorAll("[data-curve]")].map((el) => ({ el, top: 0, h: 0, k: 1, on: false }));
    this.measure();
  }

  // Cache untransformed document positions (and any ancestor scale, e.g. the hero stage).
  measure() {
    const sy = window.scrollY;
    const cx = window.innerWidth / 2;
    for (const it of this.items) it.el.style.transform = "";
    for (const it of this.items) {
      const r = it.el.getBoundingClientRect();
      it.top = r.top + sy;
      it.h = r.height;
      it.k = it.el.offsetHeight ? r.height / it.el.offsetHeight : 1;
      it.on = false;
      // Put the vanishing point on the viewport's vertical centre line, so
      // everything bulges out from the middle of the screen like a lens.
      it.el.style.transformOrigin = `${((cx - r.left) / it.k).toFixed(1)}px 50%`;
    }
    this.H = window.innerHeight;
    this.dirty = true; // transforms were cleared above → redraw next frame
  }

  update(scrollY, velocity = 0) {
    const H = this.H;
    const half = H / 2;

    this.vel += (clamp(velocity, -80, 80) - this.vel) * 0.1;
    // page at rest → every line is already where it should be
    if (scrollY === this.lastY && Math.abs(this.vel) < 0.01 && !this.dirty) return;
    this.lastY = scrollY;
    this.dirty = false;
    const bend = 1 + Math.min(Math.abs(this.vel) / 30, 1) * this.velocityBoost;
    const R = (H * this.radius) / bend;
    const P = H * this.perspective;

    for (const it of this.items) {
      const d = it.top + it.h / 2 - scrollY - half; // distance from viewport centre
      if (Math.abs(d) > half + it.h / 2 + 120) {
        it.on = false;
        continue;
      }
      it.on = true;

      const theta = clamp(d / R, -1.3, 1.3);
      const y = R * Math.sin(theta);
      const z = R * (1 - Math.cos(theta)); // towards the viewer
      const projected = (y * P) / (P - z);
      const k = it.k;

      it.el.style.transform =
        `translate3d(0, ${((projected - d) / k).toFixed(2)}px, 0) ` +
        `perspective(${(P / k).toFixed(1)}px) translateZ(${(z / k).toFixed(2)}px) rotateX(${theta.toFixed(4)}rad)`;
    }
  }

  reset() {
    for (const it of this.items) it.el.style.transform = "";
  }
}
