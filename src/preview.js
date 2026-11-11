/**
 * Hover preview for the highlighted words in the About text (Web3, LMS, landing pages):
 * a small card pops up above the word with a laptop mockup of that project.
 *
 * Images: slides from the project pages (the card is 4:3, so they're cropped to fit).
 */
import { gsap } from "gsap";

const PREVIEWS = {
  web3: { src: "/assets/work/web3/collage.webp", label: "Web3 Landing Pages" },
  landing: { src: "/assets/work/accomy-lp/showcase.webp", label: "Accomy Landing Page" },
  lms: { src: "/assets/work/learnxpert/laptop.webp", label: "LearnXpert" },
};

export function initPreviews(scope) {
  if (!scope || !window.matchMedia("(hover: hover)").matches) return;

  const card = document.createElement("div");
  card.className = "preview";
  card.setAttribute("aria-hidden", "true");
  card.innerHTML = `
    <div class="preview__in">
      <div class="preview__ph"><span class="preview__label"></span></div>
      <img class="preview__img" alt="" decoding="async" />
    </div>`;
  document.body.append(card);
  const img = card.querySelector(".preview__img");
  const label = card.querySelector(".preview__label");

  // missing image → keep the placeholder visible
  const loaded = {};
  img.addEventListener("load", () => (loaded[img.dataset.key] = true) && card.classList.add("has-img"));
  img.addEventListener("error", () => card.classList.remove("has-img"));

  // centred above the word; it simply appears / disappears in place (no slide, no tilt)
  gsap.set(card, { xPercent: -50, yPercent: -100, opacity: 0 });

  let word = null; // the hovered .w-b
  let key = null;
  let hideTimer;

  const place = () => {
    const r = word.getBoundingClientRect();
    const w = card.offsetWidth;
    const x = Math.min(window.innerWidth - w / 2 - 16, Math.max(w / 2 + 16, r.left + r.width / 2));
    gsap.set(card, { x, y: r.top - 12 });
  };

  function show(el) {
    clearTimeout(hideTimer);
    const k = el.dataset.preview;
    word = el;
    if (k !== key) {
      key = k;
      label.textContent = PREVIEWS[k].label;
      card.classList.toggle("has-img", !!loaded[k]);
      img.dataset.key = k;
      img.src = PREVIEWS[k].src;
    }
    place();
    gsap.to(card, { opacity: 1, duration: 0.12, ease: "none", overwrite: "auto" });
  }

  function hide() {
    word = null;
    gsap.to(card, { opacity: 0, duration: 0.12, ease: "none", overwrite: "auto" });
  }

  scope.addEventListener("pointerover", (e) => {
    const el = e.target.closest?.(".w-b[data-preview]");
    if (el && PREVIEWS[el.dataset.preview]) show(el);
  });
  scope.addEventListener("pointerout", (e) => {
    const from = e.target.closest?.(".w-b[data-preview]");
    const to = e.relatedTarget?.closest?.(".w-b[data-preview]");
    // (a short grace period: crossing the space inside "landing pages" doesn't flicker)
    if (from && (!to || to.dataset.preview !== from.dataset.preview)) hideTimer = setTimeout(hide, 90);
  });
  // keep it on the word while the page scrolls
  window.addEventListener("scroll", () => word && place(), { passive: true });
}
