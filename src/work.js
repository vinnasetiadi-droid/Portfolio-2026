/**
 * Selected work gallery: every media slot slides into place as it scrolls into view
 * (from its own side: left / right / up), while the picture inside settles from a
 * slight zoom. Scrubbed by the scroll position, so scrolling back plays it backwards.
 *
 * Slots: <figure class="pw__media" data-slide="left|right|up" data-src="…">.
 * data-src → .mp4/.webm becomes a muted looping video, anything else an image.
 * data-showcase="<key>" instead → a moving piece from SHOWCASE (projects.js): a wall of
 * landing pages drifting up and down, or rows of posters (src/showcase.js).
 * data-zoom="0" → no zoom on the inside.
 */
import { SHOWCASE } from "./projects.js";
import { buildMarquee, buildWall, loadWhenNear } from "./showcase.js";

const VIDEO = /\.(mp4|webm|mov)(\?|$)/i;

// videos only play while on screen (saves decoding work + battery)
const videoIO =
  typeof IntersectionObserver !== "undefined" &&
  new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
    },
    { rootMargin: "120px" }
  );

/** Put the image / video from data-src into a slot (keeps the placeholder if empty).
 *  data-poster: a still shown until the video has loaded. */
export function fillMedia(el) {
  const src = el.dataset.src?.trim();
  if (!src) return;
  const inner = el.querySelector(".pw__in");
  let media;
  if (VIDEO.test(src)) {
    media = document.createElement("video");
    Object.assign(media, { src, muted: true, loop: true, playsInline: true, preload: "metadata" });
    if (el.dataset.poster) media.poster = el.dataset.poster;
    media.setAttribute("muted", ""); // (attribute too, for autoplay policies)
    if (videoIO) videoIO.observe(media);
    else media.autoplay = true;
  } else {
    media = document.createElement("img");
    // (lazy: the gallery's pictures only load as you scroll to them)
    Object.assign(media, { src, alt: el.dataset.alt || "", decoding: "async", loading: "lazy" });
  }
  inner.replaceChildren(media);
}

export function createWorkGallery(root) {
  const items = [...root.querySelectorAll(".pw__media")].map((el) => {
    const it = {
      el,
      inner: el.querySelector(".pw__in"),
      slide: el.dataset.slide || "up",
      zoom: el.dataset.zoom !== "0",
      top: 0,
      h: 0,
      last: -1,
    };
    const show = SHOWCASE[el.dataset.showcase];
    if (show) {
      if (show.kind === "wall") it.wall = buildWall(it.inner, show);
      else buildMarquee(it.inner, show);
      loadWhenNear(el); // (its pictures load as it gets close)
    } else fillMedia(el);
    return it;
  });

  // document positions, measured without our own transforms
  function measure() {
    const sy = window.scrollY;
    for (const it of items) {
      it.el.style.transform = "";
      const r = it.el.getBoundingClientRect();
      it.top = r.top + sy;
      it.h = r.height;
      it.last = -1;
    }
  }

  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function update(scroll) {
    const H = window.innerHeight;
    const W = window.innerWidth;
    for (const it of items) {
      const y = it.top - scroll; // its top edge on screen
      if (y > H + 200 || y + it.h < -200) continue; // far off screen
      // the wall keeps moving with the scroll all the way through
      if (it.wall) it.wall.update((H - y) / (H + it.h));
      // 0 when its top reaches the bottom of the screen → 1 once it is 25% up
      const p = Math.min(1, Math.max(0, (H - y) / (H * 0.75)));
      const e = +ease(p).toFixed(4);
      if (e === it.last) continue;
      it.last = e;
      const k = 1 - e;
      const move =
        it.slide === "left"
          ? `translate3d(${(-k * W * 0.35).toFixed(1)}px, 0, 0)`
          : it.slide === "right"
            ? `translate3d(${(k * W * 0.35).toFixed(1)}px, 0, 0)`
            : `translate3d(0, ${(k * H * 0.18).toFixed(1)}px, 0)`;
      it.el.style.transform = move;
      if (it.zoom) it.inner.style.transform = `scale(${(1 + k * 0.18).toFixed(4)})`;
    }
  }

  return { measure, update };
}
