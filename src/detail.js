/**
 * Project pages, à la segerman.dev: clicking a project dims the page (it slides up a
 * little) while the project page rises from the bottom as a sheet. "← Index" (or Esc /
 * the browser back button) lowers it again. The home page stays alive underneath, so
 * going back is instant — no reload, the 3D and the scroll position are still there.
 *
 * URL: #work/<slug>. Content comes from src/projects.js: a header (title, summary,
 * facts) and a list of blocks — written-out text and the project's own pictures,
 * arranged and moving with the scroll (see the block list in projects.js).
 *
 * Motion inside the sheet: every block is watched while it is near the screen; its
 * progress p (0 = just entering at the bottom → 1 = leaving at the top) drives the
 * [data-scrub] elements in it. Blocks also get .is-in once, for their CSS reveal.
 */
import { gsap } from "gsap";
import { PROJECTS, SHOWCASE } from "./projects.js";
import { splitLines } from "./split.js";
import { buildMarquee, buildWall, browserTag, clamp01, ease, loadWhenNear, mediaTag, phoneTag } from "./showcase.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- blocks → markup ---------- */

// optional heading of a block: small label, title, short text
const head = (b) =>
  b.label || b.title || b.text
    ? `<header class="pb__head">
        ${b.label ? `<p class="pb__label">${esc(b.label)}</p>` : ""}
        ${b.title ? `<h2 class="pb__title">${esc(b.title)}</h2>` : ""}
        ${b.text ? `<p class="pb__text">${esc(b.text)}</p>` : ""}
      </header>`
    : "";

const lead = (b) => `<header class="pb__head">${b.label ? `<p class="pb__label">${esc(b.label)}</p>` : ""}${
  b.title ? `<h2 class="pb__title">${esc(b.title)}</h2>` : ""
}</header>`;

const BLOCKS = {
  media: (b) => `
    <figure class="pb__frame${b.fit === "contain" ? " is-contain" : ""}" style="--r: ${b.ratio}${b.bg ? `; --bg: ${b.bg}` : ""}">
      <div class="pb__zoom" data-scrub="zoom">${mediaTag(b.src, { poster: b.poster })}</div>
    </figure>`,

  text: (b) => `
    <p class="pb__label">${esc(b.label || "")}</p>
    <div class="pb__body">
      ${b.title ? `<h2 class="pb__title">${esc(b.title)}</h2>` : ""}
      ${b.body ? `<p class="pb__p">${esc(b.body)}</p>` : ""}
      ${b.list ? `<ul class="pb__list">${b.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>` : ""}
    </div>`,

  columns: (b) =>
    b.items.map((it) => `<div class="pb__col"><p class="pb__label">${esc(it.label)}</p><p class="pb__p pb__p--lg">${esc(it.text)}</p></div>`).join(""),

  // long pages in browser windows: each page scrolls inside its window as you scroll
  browsers: (b) => `${head(b)}
    <div class="pb__browsers">
      ${b.items
        .map(
          (it, i) =>
            `<div class="pb__drift" data-scrub="drift" data-amp="${[36, -28, 44][i % 3]}">${browserTag(it.src, { name: it.name, cls: "is-long" })
              .replace('class="browser is-long"', `class="browser is-long" data-scrub="page" data-lag="${i * 0.05}"`)}</div>`
        )
        .join("")}
    </div>`,

  // phones: "row" (a few, side by side), "track" (many, sliding sideways with the
  // scroll) or "split" (text on one side, phones on the other)
  phones: (b) => {
    const phones = b.items
      .map(
        (src, i) =>
          `<div class="pb__drift" data-scrub="drift" data-amp="${i % 2 ? -40 : 40}">${phoneTag(src).replace(
            'class="phone "',
            `class="phone" data-scrub="page" data-lag="${(i % 3) * 0.05}"`
          )}</div>`
      )
      .join("");
    if (b.layout === "track")
      return `${head(b)}<div class="pb__track-view"><div class="pb__track" data-scrub="track">${phones}</div></div>`;
    if (b.layout === "split") return `${head(b)}<div class="pb__phones">${phones}</div>`;
    return `${head(b)}<div class="pb__phones">${phones}</div>`;
  },

  cards: (b) => `${lead(b)}
    <div class="pb__cards" style="--cols: ${b.cols || 3}">
      ${b.items
        .map(
          (it, i) => `<article class="card" style="--i: ${i}">
            ${it.img ? `<div class="card__img">${mediaTag(it.img)}</div>` : ""}
            <h3 class="card__title">${esc(it.title)}</h3>
            ${it.text ? `<p class="card__text">${esc(it.text)}</p>` : ""}
            ${it.list ? `<ul class="card__list">${it.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>` : ""}
          </article>`
        )
        .join("")}
    </div>`,

  // a process: steps joined by a line that fills as you scroll (no numbers)
  steps: (b) => `${lead(b)}
    <div class="pb__steps" style="--n: ${b.items.length}">
      <div class="pb__line"><span data-scrub="fill"></span></div>
      ${b.items
        .map(
          (it, i) => `<div class="step" style="--i: ${i}"><span class="step__dot"></span><h3 class="step__title">${esc(it.title)}</h3><p class="step__text">${esc(
            it.text
          )}</p></div>`
        )
        .join("")}
    </div>`,

  // screens in order; a step with several screens shows them as a small stack whose
  // screens drift apart a little
  flow: (b) => `${head(b)}
    <ol class="pb__flow" style="--n: ${b.items.length}">
      ${b.items
        .map(
          (it, i) => `<li class="flow" style="--i: ${i}">
            ${
              Array.isArray(it.src)
                ? `<div class="flow__stack">${it.src
                    .map((src, k) => `<div class="pb__drift" data-scrub="drift" data-amp="${k % 2 ? -36 : 18}">${mediaTag(src, { cls: "flow__img" })}</div>`)
                    .join("")}</div>`
                : `<div class="pb__drift" data-scrub="drift" data-amp="${i % 2 ? -30 : 30}">${mediaTag(it.src, { cls: "flow__img" })}</div>`
            }
            <h3 class="flow__title">${esc(it.title)}</h3>
            <p class="flow__text">${esc(it.text)}</p>
          </li>`
        )
        .join("")}
    </ol>`,

  diagram: (b) => `${lead(b)}
    <div class="pb__diagram">
      ${b.items
        .map(
          (it, i) =>
            `${i ? `<span class="diagram__link" style="--i: ${i}"><i></i></span>` : ""}<div class="diagram__node${
              i === 1 ? " is-core" : ""
            }" style="--i: ${i}"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`
        )
        .join("")}
    </div>`,

  // pictures floating at different depths (x / y / w in % of the stage); card: a UI card
  // with the deck's blue shadow, rot: its tilt; d: 0 → it stays put. kit: a tidy board of
  // UI pieces that rise in one after another
  stage: (b) => `${head(b)}
    <div class="pb__stage${b.kit ? " pb__stage--kit" : ""}" style="--r: ${b.ratio || "16/9"}${b.bg ? `; --bg: ${b.bg}` : ""}">
      ${b.items
        .map(
          (it, i) =>
            `<div class="stage__item${it.card ? " is-card" : ""}" style="left: ${it.x}%; top: ${it.y}%; width: ${it.w}%${
              it.rot ? `; --rot: ${it.rot}deg` : ""
            }; --i: ${i}"${it.d === 0 ? "" : ` data-scrub="depth" data-d="${it.d || 1}"`}>${it.phone ? phoneTag(it.src) : mediaTag(it.src)}</div>`
        )
        .join("")}
    </div>`,

  pair: (b) => `${lead(b)}
    <div class="pb__pair${b.bg ? " has-bg" : ""}"${b.bg ? ` style="--bg: ${b.bg}"` : ""}>
      ${b.items
        .map(
          (it, i) =>
            `<div class="pb__drift" data-scrub="drift" data-amp="${i ? -50 : 50}">${
              it.browser ? browserTag(it.src, { name: it.name }) : `<div class="pair__img">${mediaTag(it.src)}</div>`
            }</div>`
        )
        .join("")}
    </div>`,

  wall: (b) => `${lead(b)}<div class="pb__wall" data-scrub="wall" data-key="${esc(b.key)}"></div>`,
  marquee: (b) => `${lead(b)}<div class="pb__marquee" data-key="${esc(b.key)}"></div>`,

  reel: (b) => {
    const r = SHOWCASE[b.key];
    return `<div class="pb__reel">
      <div class="pb__drift reel__phone" data-scrub="drift" data-amp="30">${mediaTag(r.phone.src, { poster: r.phone.poster })}</div>
      <div class="reel__stack">
        ${r.browsers
          .map((w, i) => `<div class="pb__drift" data-scrub="drift" data-amp="${i ? -36 : -14}">${browserTag(w.src, { poster: w.poster, name: w.name })}</div>`)
          .join("")}
      </div>
    </div>`;
  },

  grid: (b) => `${lead(b)}
    <div class="pb__grid" style="--cols: ${b.cols || 3}">
      ${[...Array(b.cols || 3)]
        .map(
          (_, c) =>
            `<div class="grid__col" data-scrub="drift" data-amp="${c % 2 ? -60 : 30}">${b.items
              .filter((_, i) => i % (b.cols || 3) === c)
              .map((src) => `<div class="grid__item">${mediaTag(src)}</div>`)
              .join("")}</div>`
        )
        .join("")}
    </div>`,
};

/* ---------- the sheet ---------- */

export function createProjectPages({ page, onOpen, onClose }) {
  const root = document.createElement("div");
  root.className = "pd";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="pd__shade"></div>
    <div class="pd__sheet" role="dialog" aria-modal="true" aria-labelledby="pd-title" tabindex="-1" data-lenis-prevent>
      <header class="pd__bar">
        <span class="pd__brand">VINNAWATI<span>.DESIGN</span></span>
        <button class="pd__back" type="button">← Index</button>
        <span class="pd__where"></span>
      </header>
      <article class="pd__content"></article>
    </div>`;
  document.body.append(root);
  const shade = root.querySelector(".pd__shade");
  const sheet = root.querySelector(".pd__sheet");
  const content = root.querySelector(".pd__content");
  const where = root.querySelector(".pd__where");

  let current = null;
  let busy = false; // (only guards the project → project swap)
  let anim = null; // the running open / close timeline — either can interrupt the other
  let pushed = false; // did we add the history entry (so "back" can undo it)?

  /* scroll-driven motion: blocks near the screen, and their [data-scrub] parts */
  let blocks = [];
  const active = new Set();
  let observers = [];
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const b = blocks.find((x) => x.el === e.target);
        if (b) e.isIntersecting ? active.add(b) : active.delete(b);
      }
      queue();
    },
    { root: sheet, rootMargin: "15% 0px" }
  );
  // one-off reveal (.is-in) as a block scrolls into view
  const shown = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        shown.unobserve(e.target);
        e.target.classList.add("is-in");
      }
    },
    { root: sheet, rootMargin: "0px 0px -12% 0px" }
  );

  function setupBlocks() {
    blocks = [...content.querySelectorAll(".pb")].map((el) => ({
      el,
      p: -1,
      items: [...el.querySelectorAll("[data-scrub]")].map((t) => ({
        t,
        kind: t.dataset.scrub,
        amp: +t.dataset.amp || 0,
        lag: +t.dataset.lag || 0,
        d: +t.dataset.d || 1,
        dirty: true,
      })),
    }));
    for (const b of blocks) {
      near.observe(b.el);
      shown.observe(b.el);
      observers.push(loadWhenNear(b.el, sheet));
    }
    // walls / marquees from the shared SHOWCASE data (filled before their block's
    // loader fires, so their pictures load with it)
    for (const el of content.querySelectorAll(".pb__marquee")) buildMarquee(el, SHOWCASE[el.dataset.key]);
    for (const b of blocks)
      for (const it of b.items) if (it.kind === "wall") it.wall = buildWall(it.t, SHOWCASE[it.t.dataset.key]);
  }

  function teardown() {
    near.disconnect();
    shown.disconnect();
    for (const o of observers) o?.disconnect?.();
    observers = [];
    blocks = [];
    active.clear();
  }

  // pictures arriving / the window resizing change what can scroll inside what
  const dirty = () => {
    for (const b of blocks) for (const it of b.items) it.dirty = true;
    queue();
  };
  content.addEventListener("load", dirty, true);
  window.addEventListener("resize", dirty);

  let raf = 0;
  function queue() {
    if (!raf && !reduceMotion) raf = requestAnimationFrame(tick);
  }
  sheet.addEventListener("scroll", queue, { passive: true });

  function tick() {
    raf = 0;
    const vh = sheet.clientHeight;
    // read everything first…
    for (const b of active) {
      const r = b.el.getBoundingClientRect();
      b.p = (vh - r.top) / (vh + r.height);
      for (const it of b.items) {
        if (!it.dirty) continue;
        it.dirty = false;
        if (it.kind === "page") {
          const pageEl = it.t.querySelector(".browser__page, .phone__page");
          const view = it.t.querySelector(".browser__view, .phone__screen");
          it.page = pageEl;
          it.max = pageEl && view ? Math.max(0, pageEl.offsetHeight - view.clientHeight) : 0;
        } else if (it.kind === "track") it.max = Math.max(0, it.t.scrollWidth - it.t.parentElement.clientWidth);
      }
    }
    // …then write
    for (const b of active) {
      const p = b.p;
      for (const it of b.items) {
        const k = it.kind;
        if (k === "zoom") it.t.style.transform = `scale(${(1 + 0.1 * (1 - ease(clamp01(p / 0.5)))).toFixed(4)})`;
        else if (k === "drift") it.t.style.transform = `translate3d(0, ${((0.5 - p) * it.amp).toFixed(1)}px, 0)`;
        else if (k === "depth") it.t.style.transform = `translate3d(0, ${((0.5 - p) * it.d * 120).toFixed(1)}px, 0)`;
        else if (k === "fill") it.t.style.transform = `scaleX(${clamp01((p - 0.3) / 0.35).toFixed(3)})`;
        else if (k === "page" && it.page && it.max)
          it.page.style.transform = `translate3d(0, ${(-it.max * clamp01((p - 0.18 - it.lag) / 0.6)).toFixed(1)}px, 0)`;
        else if (k === "track" && it.max) it.t.style.transform = `translate3d(${(-it.max * clamp01((p - 0.2) / 0.6)).toFixed(1)}px, 0, 0)`;
        else if (k === "wall") it.wall?.update(p);
      }
    }
  }

  function render(p) {
    const i = PROJECTS.indexOf(p);
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    where.textContent = p.tags || "";
    const facts = (p.facts || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v).replace(/\n/g, "<br />")}</dd></div>`);
    if (p.link) facts.push(`<div><dt>Visit</dt><dd><a href="${esc(p.link)}" target="_blank" rel="noopener">Live site ↗</a></dd></div>`);
    teardown();
    content.innerHTML = `
      <header class="pd__hero">
        <p class="pd__tags">${esc(p.tags || "")}</p>
        <h1 class="pd__title" id="pd-title">${esc(p.title)}</h1>
        <div class="pd__intro">
          <p class="pd__summary">${esc(p.summary)}</p>
          <dl class="pd__facts">${facts.join("")}</dl>
        </div>
      </header>
      ${p.blocks.map((b) => `<section class="pb pb--${b.type}${b.flip ? " is-flip" : ""}${b.layout ? ` is-${b.layout}` : ""}">${BLOCKS[b.type](b)}</section>`).join("")}
      <button class="pd__next" type="button" data-next="${esc(next.slug)}">
        <span class="pd__next-label">Next project</span>
        <span class="pd__next-title">${esc(next.title)} →</span>
      </button>`;
    // masked lines for the title + summary (not part of the home page's scroll curve)
    for (const el of content.querySelectorAll(".pd__title, .pd__summary")) {
      splitLines(el).forEach((l) => l.removeAttribute("data-curve"));
    }
    setupBlocks();
    current = p;
  }

  // the header rises line by line; the blocks reveal themselves as they come into view
  function reveal() {
    const titleLines = content.querySelectorAll(".pd__title .line__in");
    const summaryLines = content.querySelectorAll(".pd__summary .line__in");
    const facts = content.querySelectorAll(".pd__tags, .pd__facts > div");
    gsap.set([titleLines, summaryLines], { yPercent: 110 });
    gsap.set(facts, { opacity: 0, y: 16 });
    gsap.to(titleLines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 });
    gsap.to(summaryLines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.05, delay: 0.15 });
    gsap.to(facts, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.3 });
    content.classList.add("is-live"); // (blocks may now reveal — see .pd__content.is-live .pb.is-in)
    queue();
  }

  function open(slug, { push = true } = {}) {
    const p = PROJECTS.find((x) => x.slug === slug);
    if (!p || busy) return;
    if (current && root.classList.contains("is-open") && !closing) return swap(p, push);
    anim?.kill();
    closing = false;
    // (shown first, still below the screen: the text has to be laid out to be split into lines)
    if (!root.classList.contains("is-open")) gsap.set(sheet, { yPercent: 100 });
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    content.classList.remove("is-live");
    render(p);
    sheet.scrollTop = 0;
    if (push) {
      history.pushState({ project: slug }, "", `#work/${slug}`);
      pushed = true;
    }
    onOpen?.();
    anim = gsap
      .timeline()
      .to(shade, { opacity: 1, duration: 0.9, ease: "power2.inOut" }, 0)
      .to(page, { y: -90, duration: 1, ease: "power3.inOut" }, 0)
      .to(sheet, { yPercent: 0, duration: 1, ease: "power3.inOut" }, 0)
      .add(reveal, 0.55);
    sheet.focus({ preventScroll: true });
  }

  // already open → the current project slides away up, the next one rises in its place
  function swap(p, push) {
    busy = true;
    if (push) history.pushState({ project: p.slug }, "", `#work/${p.slug}`);
    gsap.to(content, {
      y: -80,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        content.classList.remove("is-live");
        render(p);
        sheet.scrollTop = 0;
        gsap.set(content, { y: 0, opacity: 1 });
        reveal();
        busy = false;
      },
    });
  }

  let closing = false;

  function close() {
    if (!root.classList.contains("is-open") || closing) return;
    anim?.kill(); // (closing straight from a half-open sheet is fine)
    gsap.killTweensOf(content);
    busy = false;
    closing = true;
    anim = gsap
      .timeline({
        onComplete: () => {
          root.classList.remove("is-open");
          root.setAttribute("aria-hidden", "true");
          gsap.set(page, { clearProps: "transform" });
          gsap.set(content, { clearProps: "transform,opacity" });
          teardown();
          content.innerHTML = "";
          content.classList.remove("is-live");
          current = null;
          closing = false;
          onClose?.();
        },
      })
      .to(sheet, { yPercent: 100, duration: 0.85, ease: "power3.inOut" }, 0)
      .to(shade, { opacity: 0, duration: 0.85, ease: "power2.inOut" }, 0)
      .to(page, { y: 0, duration: 0.85, ease: "power3.inOut" }, 0);
  }

  // "← Index", Esc and the browser's back button all close it
  function back() {
    if (pushed) {
      pushed = false;
      history.back(); // → popstate → close()
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      close();
    }
  }

  root.querySelector(".pd__back").addEventListener("click", back);
  shade.addEventListener("click", back);
  content.addEventListener("click", (e) => {
    const next = e.target.closest(".pd__next");
    if (next) open(next.dataset.next);
  });
  window.addEventListener("keydown", (e) => e.key === "Escape" && root.classList.contains("is-open") && back());
  window.addEventListener("popstate", () => {
    const slug = location.hash.match(/^#work\/(.+)$/)?.[1];
    if (slug) open(slug, { push: false });
    else {
      pushed = false;
      close();
    }
  });

  return {
    open,
    /** Open the project in the URL, if any (call once the page is ready). */
    route() {
      const slug = location.hash.match(/^#work\/(.+)$/)?.[1];
      if (slug) open(slug, { push: false });
    },
  };
}
