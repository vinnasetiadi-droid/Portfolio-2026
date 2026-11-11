/**
 * Splits a paragraph into visual lines:
 *   <span class="line" data-curve><span class="line__in">…</span></span>
 * so each line can bend independently with the scroll curve and be revealed
 * with a mask. Inline <b> children become underlined words (.w-b), keeping
 * their data-preview key.
 * Re-run on resize — the original markup is kept on the element.
 */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function tokenize(el) {
  const tokens = [];
  let glue = false; // next chunk attaches to the previous token (e.g. punctuation after </b>)

  const push = (text, cls, attrs = "") => {
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        glue = false;
        continue;
      }
      const html = cls ? `<span class="${cls}"${attrs}>${esc(part)}</span>` : esc(part);
      if (glue && tokens.length) tokens[tokens.length - 1] += html;
      else tokens.push(html);
      glue = true;
    }
  };

  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) push(node.textContent, null);
    else if (node.nodeType === Node.ELEMENT_NODE) {
      // <b data-preview="key"> keeps its key on every word (hover preview, see preview.js)
      const key = node.dataset?.preview;
      push(node.textContent, "w-b", key ? ` data-preview="${esc(key)}"` : "");
    }
  }
  return tokens;
}

export function splitLines(el) {
  if (!el.dataset.original) el.dataset.original = el.innerHTML;
  el.innerHTML = el.dataset.original;
  const tokens = tokenize(el);

  el.innerHTML = tokens.map((t) => `<span class="w">${t}</span>`).join(" ");
  const lines = [];
  let lastTop = null;
  for (const w of el.querySelectorAll(".w")) {
    const top = w.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(w.innerHTML);
  }

  el.innerHTML = lines
    .map((words) => `<span class="line" data-curve><span class="line__in">${words.join(" ")}</span></span>`)
    .join("");
  return el.querySelectorAll(".line");
}
