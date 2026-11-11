/**
 * Building blocks shared by the home gallery and the project pages:
 *  - a wall of long landing pages (or screen tiles) drifting up / down in alternating
 *    columns (with an optional picture in front); scrolling pushes the columns further
 *    apart and fades them out, so the picture in front is what stays
 *  - marquees: rows of posts gliding sideways, every other row the other way
 *  - browser windows and phones around a picture or video
 * Continuous motion runs as CSS animations (compositor only); the scroll-driven parts
 * take p = 0 → 1 while the element crosses the screen.
 * Pictures carry data-src and load when their block gets close (loadWhenNear).
 */
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const ease = (t) => 1 - Math.pow(1 - t, 3);

const VIDEO = /\.(mp4|webm|mov)(\?|$)/i;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** <img> / <video> markup with a deferred source (see loadWhenNear) */
export function mediaTag(src, { poster = "", cls = "", alt = "" } = {}) {
  if (VIDEO.test(src))
    return `<video class="${cls}" data-src="${esc(src)}"${poster ? ` poster="${esc(poster)}"` : ""} muted loop playsinline preload="none"></video>`;
  return `<img class="${cls}" data-src="${esc(src)}" alt="${esc(alt)}" decoding="async" />`;
}

// videos only play while on screen
const playing =
  typeof IntersectionObserver !== "undefined" &&
  new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
    },
    { rootMargin: "80px" }
  );

/** Give the deferred pictures / videos inside `el` their source once it comes within
 *  a screen of the viewport (root: the scrolling element, null = the page). */
export function loadWhenNear(el, root = null) {
  const load = () => {
    for (const m of el.querySelectorAll("[data-src]")) {
      if (m.tagName === "VIDEO") {
        m.src = m.dataset.src;
        m.setAttribute("muted", "");
        m.muted = true;
        if (playing) playing.observe(m);
        else m.autoplay = true;
      } else m.src = m.dataset.src;
      m.removeAttribute("data-src");
    }
  };
  if (typeof IntersectionObserver === "undefined") return load();
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      load();
    },
    { root, rootMargin: "100% 0px" }
  );
  io.observe(el);
  return io;
}

/** Wall of long landing pages (or, with tiles, screen shots): columns drift up / down
 *  (CSS), the scroll adds to it. per: pictures per column; dur: the slowest loop (s). */
export function buildWall(el, { pages, front, cols = 6, per = 2, tiles = false, dur = 64, bg = "" }) {
  const html = [];
  for (let c = 0; c < cols; c++) {
    const set = [...Array(per)]
      .map((_, k) => `<img class="wall__page" data-src="${esc(pages[(c * per + k) % pages.length])}" alt="" decoding="async" />`)
      .join("");
    // (two copies: the track loops by sliding exactly one copy)
    html.push(
      `<div class="wall__col" data-dir="${c % 2 ? "down" : "up"}"><div class="wall__track" style="--dur: ${dur + (c % 3) * 12}s">${set}${set}</div></div>`
    );
  }
  el.classList.add("wall");
  if (tiles) el.classList.add("wall--tiles");
  if (bg) el.style.background = bg;
  el.style.setProperty("--cols", cols);
  el.innerHTML = `<div class="wall__cols">${html.join("")}</div>${
    front ? `<img class="wall__front" data-src="${esc(front)}" alt="" decoding="async" />` : ""
  }`;
  const colEls = [...el.querySelectorAll(".wall__col")];
  const wrap = el.querySelector(".wall__cols");
  const frontEl = el.querySelector(".wall__front");
  let last = -1;
  return {
    update(p) {
      p = Math.round(clamp01(p) * 1000) / 1000;
      if (p === last) return;
      last = p;
      const s = (p - 0.5) * 2; // -1 → 1
      // up columns climb, down columns sink (in % of the column's own height: no layout reads)
      colEls.forEach((c, i) => (c.style.transform = `translate3d(0, ${(i % 2 ? 1 : -1) * s * 12}%, 0)`));
      // …and the pages behind fade away as you scroll on; the front picture stays
      wrap.style.opacity = (1 - ease(clamp01((p - 0.56) / 0.3))).toFixed(3);
      if (frontEl) frontEl.style.transform = `translate3d(-50%, ${((0.5 - p) * 10).toFixed(2)}%, 0)`;
    },
  };
}

/** Rows of pictures gliding sideways (alternating directions). */
export function buildMarquee(el, { rows }) {
  el.classList.add("marquee");
  el.innerHTML = rows
    .map((r, i) => {
      const set = r.items.map((src) => `<img class="marquee__item" data-src="${esc(src)}" alt="" decoding="async" />`).join("");
      const label = r.label
        ? `<span class="marquee__label">${r.logo ? `<img src="${esc(r.logo)}" alt="${esc(r.label)}" />` : esc(r.label)}</span>`
        : "";
      return `<div class="marquee__row" data-dir="${i % 2 ? "right" : "left"}">${label}<div class="marquee__track" style="--dur: ${r.dur || 80}s">${set}${set}</div></div>`;
    })
    .join("");
  // a row only shows (and starts gliding) once all its pictures are in → never a gap
  for (const row of el.querySelectorAll(".marquee__row")) {
    const imgs = row.querySelectorAll(".marquee__item");
    let left = imgs.length;
    const done = () => --left === 0 && row.classList.add("is-ready");
    for (const img of imgs) {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }
}

/** A browser window around a picture / video (the page name in its bar). */
export function browserTag(src, { poster = "", name = "", cls = "" } = {}) {
  return `<figure class="browser ${cls}">
      <div class="browser__bar"><i></i><i></i><i></i>${name ? `<span class="browser__name">${esc(name)}</span>` : ""}</div>
      <div class="browser__view">${mediaTag(src, { poster, cls: "browser__page" })}</div>
    </figure>`;
}

/** A phone around a screen (a long screen scrolls inside it). */
export function phoneTag(src, { cls = "" } = {}) {
  return `<figure class="phone ${cls}"><div class="phone__screen">${mediaTag(src, { cls: "phone__page" })}</div></figure>`;
}
