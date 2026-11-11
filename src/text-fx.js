/**
 * Text animations used across the page:
 *  - splitChars(): wraps every letter in <span class="ch"> (words stay unbreakable),
 *    so headings / paragraphs can rise in letter by letter inside their line mask.
 *  - scramble(): the mono labels "decode" from random glyphs into their text.
 * Only transform + opacity are animated (cheap, GPU-composited).
 */
import { gsap } from "gsap";

/** Wrap each character of `root`'s text in .ch spans (inside .wd word spans). */
export function splitChars(root) {
  if (root.dataset.chars) return root.querySelectorAll(".ch");
  root.dataset.chars = "1";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    // gradient text (background-clip: text) can't be split per letter → it moves as one piece
    const grad = node.parentElement.closest(".grad");
    if (grad) {
      grad.classList.add("ch");
      continue;
    }
    const frag = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(" ");
        continue;
      }
      const word = document.createElement("span");
      word.className = "wd";
      for (const c of part) {
        const ch = document.createElement("span");
        ch.className = "ch";
        ch.textContent = c;
        word.append(ch);
      }
      frag.append(word);
    }
    node.replaceWith(frag);
  }
  return root.querySelectorAll(".ch");
}

/** Hidden state for letters that will rise in. */
export function hideChars(chars) {
  gsap.set(chars, { yPercent: 115, rotate: 6, opacity: 0 });
}

/** Letters rise into place one after another. */
export function charsIn(chars, { delay = 0, stagger = 0.022, duration = 0.95 } = {}) {
  return gsap.to(chars, {
    yPercent: 0,
    rotate: 0,
    opacity: 1,
    duration,
    delay,
    ease: "expo.out",
    stagger: { each: stagger },
  });
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+×/<>";

/**
 * Decode `el`'s text from random glyphs, left → right.
 * Spaces and punctuation stay put so the label keeps its shape.
 */
export function scramble(el, { delay = 0, duration = 0.9 } = {}) {
  if (!el.dataset.text) el.dataset.text = el.textContent;
  const text = el.dataset.text;
  const state = { p: 0 };
  gsap.killTweensOf(state);
  return gsap.to(state, {
    p: 1,
    delay,
    duration,
    ease: "none",
    onStart: () => gsap.set(el, { opacity: 1 }),
    onUpdate: () => {
      const shown = Math.floor(state.p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        out += i < shown || !/[A-Za-z0-9]/.test(c) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    },
    onComplete: () => (el.textContent = text),
  });
}

/** Scramble again on hover (nav links, buttons, footer). */
export function scrambleOnHover(el) {
  let busy = false;
  el.addEventListener("pointerenter", () => {
    if (busy) return;
    busy = true;
    scramble(el, { duration: 0.5 }).eventCallback("onComplete", () => {
      el.textContent = el.dataset.text;
      busy = false;
    });
  });
}
