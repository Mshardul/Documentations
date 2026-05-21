import { state } from "./state.js";

/* ─── Zoom Overlay (shared by image lightbox + diagram zoom) ─── */
function getZoomOverlay() {
  let overlay = document.getElementById("zoom-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "zoom-overlay";
    overlay.className = "zoom-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Zoomed view");
    overlay.innerHTML = `
      <div class="zoom-overlay-backdrop"></div>
      <button class="zoom-overlay-close" aria-label="Close">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="zoom-overlay-content"></div>`;
    document.body.appendChild(overlay);
    overlay
      .querySelector(".zoom-overlay-backdrop")
      .addEventListener("click", closeZoomOverlay);
    overlay
      .querySelector(".zoom-overlay-close")
      .addEventListener("click", closeZoomOverlay);
  }
  return overlay;
}

function closeZoomOverlay() {
  document.getElementById("zoom-overlay")?.classList.remove("open");
}

function openZoomOverlay(node) {
  const overlay = getZoomOverlay();
  const contentEl = overlay.querySelector(".zoom-overlay-content");
  contentEl.innerHTML = "";
  contentEl.appendChild(node);
  overlay.classList.add("open");
}

/* ─── Clipboard helper with execCommand fallback for HTTP contexts ─── */
function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute(
      "style",
      "position:fixed;top:-9999px;left:-9999px;opacity:0"
    );
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

/* ─── Code Block Header (traffic lights + lang label + copy button) ─── */
function addCodeBlockHeader(contentEl, onCopyError = () => {}) {
  contentEl.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    const header = document.createElement("div");
    header.className = "code-header";

    // Traffic lights
    const lights = document.createElement("div");
    lights.className = "code-traffic-lights";
    lights.setAttribute("aria-hidden", "true");
    ["tl-red", "tl-yellow", "tl-green"].forEach((cls) => {
      const dot = document.createElement("span");
      dot.className = `tl ${cls}`;
      lights.appendChild(dot);
    });
    header.appendChild(lights);

    // Lang label (centered in header)
    const langMatch = code?.className.match(/language-(\w+)/);
    if (langMatch && langMatch[1] !== "mermaid") {
      const label = document.createElement("span");
      label.className = "code-lang-label";
      label.textContent = langMatch[1];
      header.appendChild(label);
    }

    pre.insertBefore(header, pre.firstChild);

    // Copy button — floats inside code body, hidden until hover
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.title = "Copy code";
    btn.setAttribute("aria-label", "Copy code");
    btn.textContent = "⧉";
    btn.addEventListener("click", () => {
      const text = code ? code.textContent : pre.textContent;
      writeToClipboard(text)
        .then(() => {
          btn.textContent = "✓";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "⧉";
            btn.classList.remove("copied");
          }, 2000);
        })
        .catch(() => onCopyError());
    });
    pre.appendChild(btn);
  });
}

/* Keep addCopyButtons as alias so existing tests referencing it still compile */
function addCopyButtons(contentEl, onCopyError = () => {}) {
  addCodeBlockHeader(contentEl, onCopyError);
}

/* ─── Callout Styling ─── */
function styleCallouts(contentEl) {
  contentEl.querySelectorAll("blockquote").forEach((bq) => {
    const text = bq.textContent.trim();
    let calloutClass = null;
    if (text.startsWith("🎯")) calloutClass = "callout-interview";
    else if (text.startsWith("⚠️") || text.startsWith("⚠"))
      calloutClass = "callout-warning";
    else if (text.startsWith("🧠")) calloutClass = "callout-thought";
    else if (text.startsWith("⚖️") || text.startsWith("⚖"))
      calloutClass = "callout-decision";
    if (!calloutClass) return;
    bq.classList.add("callout", calloutClass);

    // Strip leading emoji from first paragraph so CSS ::before doesn't duplicate it
    const firstP = bq.querySelector("p");
    if (firstP?.firstChild?.nodeType === Node.TEXT_NODE) {
      const t = firstP.firstChild.textContent;
      const chars = [...t];
      const skip = chars[1] === "️" ? 2 : 1;
      firstP.firstChild.textContent = chars.slice(skip).join("").trimStart();
    }
  });
}

/* ─── Prerequisites Chips ─── */
function renderPrerequisites(contentEl) {
  const ps = Array.from(contentEl.querySelectorAll("p"));
  const prereqP = ps.find((p) =>
    p.textContent.trim().startsWith("Prerequisites:")
  );
  if (!prereqP) return;

  const links = Array.from(prereqP.querySelectorAll("a"));
  if (!links.length) return;

  const container = document.createElement("div");
  container.className = "prereqs-container";
  container.innerHTML = `<span class="prereqs-label">Prerequisites:</span>`;

  links.forEach((link) => {
    const chip = document.createElement("a");
    chip.className = "prereq-chip";
    chip.href = link.getAttribute("href");
    chip.innerHTML = link.innerHTML;
    container.appendChild(chip);
  });

  const h1 = contentEl.querySelector("h1");
  if (h1 && h1.nextSibling) {
    contentEl.insertBefore(container, h1.nextSibling);
  } else {
    contentEl.prepend(container);
  }
  prereqP.remove();
}

/* ─── TOC Builder ─── */
function buildTOC(contentEl) {
  const tocNav = document.getElementById("toc-nav");
  const sidebar = document.getElementById("toc-sidebar");
  const headings = Array.from(contentEl.querySelectorAll("h2, h3"));

  if (headings.length === 0) {
    sidebar.style.display = "none";
    return;
  }
  sidebar.style.display = "";
  tocNav.innerHTML = "";

  headings.forEach((h) => {
    const a = document.createElement("a");
    a.className = `toc-item ${h.tagName === "H3" ? "toc-h3" : "toc-h2"}`;
    a.textContent = h.textContent.replace(/[#]+$/, "").trim();
    a.href = `#${h.id}`;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: "smooth", block: "start" });

      // Visual pulse on target heading
      h.classList.add("toc-heading-pulse");
      setTimeout(() => h.classList.remove("toc-heading-pulse"), 600);

      const url = new URL(location.href);
      url.searchParams.set("a", h.id);
      history.replaceState(history.state, "", url.toString());
    });

    tocNav.appendChild(a);
  });

  // IntersectionObserver for active highlight
  const tocLinks = tocNav.querySelectorAll(".toc-item");

  state.tocObserver = new IntersectionObserver(
    (entries) => {
      let topmost = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (
            !topmost ||
            entry.boundingClientRect.top < topmost.boundingClientRect.top
          ) {
            topmost = entry;
          }
        }
      });
      if (topmost) {
        tocLinks.forEach((l) => l.classList.remove("active"));
        const active = tocNav.querySelector(`a[href="#${topmost.target.id}"]`);
        if (active) {
          active.classList.add("active");
          // Scroll active TOC item into view within sidebar
          active.scrollIntoView({ block: "nearest" });
        }
      }
    },
    { rootMargin: "0px 0px -60% 0px", threshold: 0 }
  );

  headings.forEach((h) => state.tocObserver.observe(h));
}

/* ─── Heading Anchor Links ─── */
function addAnchorLinks(
  contentEl,
  onCopyError = () => {},
  onCopySuccess = () => {}
) {
  contentEl.querySelectorAll("h2, h3, h4").forEach((h) => {
    if (!h.id) return;
    const btn = document.createElement("button");
    btn.className = "anchor-btn";
    btn.title = "Copy link";
    btn.setAttribute("aria-label", "Copy link to section");
    btn.innerHTML = anchorIcon();
    btn.addEventListener("click", () => {
      const url = new URL(location.href);
      url.searchParams.set("a", h.id);
      writeToClipboard(url.toString())
        .then(() => {
          btn.classList.add("copied");
          setTimeout(() => btn.classList.remove("copied"), 2000);
          onCopySuccess();
        })
        .catch(() => onCopyError());
    });
    h.appendChild(btn);
  });
}

function anchorIcon() {
  return `<svg viewBox="0 0 16 16" fill="none">
    <path d="M6.5 9.5l3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M4.5 11.5a2.5 2.5 0 010-3.54L6 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.5 4.5a2.5 2.5 0 010 3.54L10 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* ─── Image Lightbox ─── */
function addImageLightbox(contentEl) {
  contentEl.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const placeholder = document.createElement("div");
        placeholder.className = "img-error-placeholder";
        placeholder.setAttribute("role", "img");
        const altText = img.alt || "Image failed to load";
        placeholder.setAttribute("aria-label", altText);
        const icon = document.createElement("span");
        icon.className = "img-error-icon";
        icon.textContent = "🖼";
        const label = document.createElement("span");
        label.className = "img-error-text";
        label.textContent = altText;
        placeholder.appendChild(icon);
        placeholder.appendChild(label);
        img.replaceWith(placeholder);
      },
      { once: true }
    );
    img.classList.add("zoomable-img");
    img.addEventListener("click", () => {
      const clone = img.cloneNode();
      clone.style.cursor = "";
      openZoomOverlay(clone);
    });
  });
}

/* ─── Mermaid Diagrams ─── */
async function renderMermaidDiagrams(contentEl) {
  if (typeof mermaid === "undefined") return;
  const blocks = contentEl.querySelectorAll("pre code.language-mermaid");
  let i = 0;
  for (const block of blocks) {
    const pre = block.parentElement;
    const code = block.textContent.trim();
    try {
      const id = `mermaid-${Date.now()}-${i++}`;
      const { svg } = await mermaid.render(id, code);
      const wrapper = document.createElement("div");
      wrapper.className = "mermaid-diagram";
      wrapper.dataset.mermaidSrc = code;
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch (err) {
      console.warn("Mermaid render failed:", err);
      const errEl = document.createElement("div");
      errEl.className = "mermaid-error";
      errEl.textContent = "Diagram syntax error — could not render";
      pre.replaceWith(errEl);
    }
  }
}

/* ─── Diagram Zoom ─── */
function addDiagramZoom(contentEl) {
  contentEl.querySelectorAll(".mermaid-diagram").forEach((diagram) => {
    diagram.addEventListener("click", () => {
      const svgEl = diagram.querySelector("svg");
      if (!svgEl) return;
      const clone = svgEl.cloneNode(true);
      // Preserve viewBox so CSS can size it; set explicit 100% dims so
      // the element has a non-zero bounding box inside the flex overlay.
      clone.removeAttribute("width");
      clone.removeAttribute("height");
      clone.setAttribute("width", "100%");
      clone.setAttribute("height", "100%");
      clone.classList.add("zoom-diagram-svg");
      openZoomOverlay(clone);
    });
  });
}

/* ─── Mermaid Theme Sync ─── */
function getMermaidThemeConfig(theme) {
  if (theme === "light") {
    return {
      theme: "default",
      themeVariables: {
        darkMode: false,
        primaryColor: "#6366f1",
        primaryTextColor: "#1e293b",
        primaryBorderColor: "#e2e8f0",
        lineColor: "#94a3b8",
      },
    };
  }
  return {
    theme: "dark",
    themeVariables: {
      darkMode: true,
      background: "#161b27",
      primaryColor: "#6366f1",
      primaryTextColor: "#f1f5f9",
      primaryBorderColor: "#252d42",
      lineColor: "#64748b",
      secondaryColor: "#1e2537",
      tertiaryColor: "#252d42",
    },
  };
}

async function rerenderMermaidDiagrams() {
  if (typeof mermaid === "undefined") return;
  const contentEl = document.getElementById("markdown-body");
  if (!contentEl) return;
  const diagrams = contentEl.querySelectorAll(
    ".mermaid-diagram[data-mermaid-src]"
  );
  if (!diagrams.length) return;

  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  mermaid.initialize({ startOnLoad: false, ...getMermaidThemeConfig(theme) });

  const inViewport = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  };

  let i = 0;
  for (const wrapper of diagrams) {
    if (!inViewport(wrapper)) continue;
    const code = wrapper.dataset.mermaidSrc;
    try {
      const id = `mermaid-rerender-${Date.now()}-${i++}`;
      const { svg } = await mermaid.render(id, code);
      wrapper.innerHTML = svg;
    } catch (err) {
      console.warn("Mermaid re-render failed:", err);
      const errEl = document.createElement("div");
      errEl.className = "mermaid-error";
      errEl.textContent = "Diagram syntax error — could not render";
      wrapper.replaceChildren(errEl);
    }
  }
}

/* ─── Table Scroll Cue ─── */
function addTableScrollCues(contentEl) {
  contentEl.querySelectorAll("table").forEach((table) => {
    const wrap = document.createElement("div");
    wrap.className = "table-scroll-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);

    const updateCue = () => {
      const overflows = wrap.scrollWidth > wrap.clientWidth + 4;
      const atEnd = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 4;
      wrap.classList.toggle("scroll-cue", overflows && !atEnd);
    };

    wrap.addEventListener("scroll", updateCue, { passive: true });
    new ResizeObserver(updateCue).observe(wrap);
    updateCue();
  });
}

/* ═══════════════════════════════════════════════════════════════
   COLLAPSIBLE LONG CODE BLOCKS
   ═══════════════════════════════════════════════════════════════ */
function addCollapsibleCodeBlocks(contentEl) {
  contentEl.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    const lineCount = (code || pre).textContent.split("\n").length;
    if (lineCount <= 20) return;

    pre.classList.add("pre--collapsible");

    const btn = document.createElement("button");
    btn.className = "code-expand-btn";
    btn.textContent = "Show more";
    btn.addEventListener("click", () => {
      const expanded = pre.classList.toggle("pre--expanded");
      btn.textContent = expanded ? "Show less" : "Show more";
      if (!expanded) pre.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    pre.appendChild(btn);
  });
}

/* ═══════════════════════════════════════════════════════════════
   CODE BLOCK LINE NUMBERS
   ═══════════════════════════════════════════════════════════════ */
function addLineNumbers(contentEl) {
  contentEl.querySelectorAll("pre code").forEach((code) => {
    if (code.classList.contains("language-mermaid")) return;
    const lines = code.innerHTML.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();
    if (lines.length < 3) return;
    code.innerHTML = lines
      .map((line) => `<span class="code-line">${line}</span>`)
      .join("\n");
    code.parentElement.classList.add("has-line-numbers");
  });
}

/* ═══════════════════════════════════════════════════════════════
   CODE LANGUAGE LABELS
   ═══════════════════════════════════════════════════════════════ */
/* Label is now rendered inside code-header by addCodeBlockHeader */
function addCodeLangLabels(_contentEl) {}

/* ═══════════════════════════════════════════════════════════════
   COLLAPSIBLE CALLOUT BLOCKS
   ═══════════════════════════════════════════════════════════════ */
const CALLOUT_COLLAPSE_LINES_DESKTOP = 10;
const CALLOUT_COLLAPSE_LINES_MOBILE = 5;
const APPROX_LINE_HEIGHT_PX = 24;

function addCollapsibleCallouts(contentEl) {
  const isMobile = window.innerWidth < 768;
  const lineLimit = isMobile
    ? CALLOUT_COLLAPSE_LINES_MOBILE
    : CALLOUT_COLLAPSE_LINES_DESKTOP;
  const heightThreshold = lineLimit * APPROX_LINE_HEIGHT_PX;

  contentEl.querySelectorAll("blockquote.callout").forEach((bq) => {
    if (bq.scrollHeight <= heightThreshold) return;

    bq.classList.add("callout--collapsible");

    const btn = document.createElement("button");
    btn.className = "callout-expand-btn";
    btn.textContent = "Show more";
    btn.addEventListener("click", () => {
      const expanded = bq.classList.toggle("callout--expanded");
      btn.textContent = expanded ? "Show less" : "Show more";
    });
    bq.insertAdjacentElement("afterend", btn);
  });
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER FOCUS MODE
   ═══════════════════════════════════════════════════════════════ */
let _focusMode = false;
let _focusObserver = null;

const FOCUS_SELECTORS = "p, li, blockquote, pre, h2, h3";

function _syncFocusBtn() {
  const btn = document.getElementById("content-focus-btn");
  if (!btn) return;
  btn.classList.toggle("active", _focusMode);
  btn.title = _focusMode ? "Exit focus mode (F)" : "Focus mode (F)";
}

function toggleFocusMode() {
  const contentEl = document.getElementById("markdown-body");
  if (!contentEl) return;
  _focusMode = !_focusMode;
  contentEl.classList.toggle("focus-mode", _focusMode);
  _syncFocusBtn();

  if (_focusMode) {
    _focusObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("focus-para", entry.isIntersecting);
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    contentEl.querySelectorAll(FOCUS_SELECTORS).forEach((el) => {
      _focusObserver.observe(el);
    });
  } else {
    _cleanupFocusObserver(contentEl);
  }
}

function cleanupFocusMode() {
  if (!_focusMode) return;
  _focusMode = false;
  _syncFocusBtn();
  const contentEl = document.getElementById("markdown-body");
  if (contentEl) {
    contentEl.classList.remove("focus-mode");
    _cleanupFocusObserver(contentEl);
  }
}

function _cleanupFocusObserver(contentEl) {
  if (_focusObserver) {
    _focusObserver.disconnect();
    _focusObserver = null;
  }
  contentEl.querySelectorAll(".focus-para").forEach((el) => {
    el.classList.remove("focus-para");
  });
}

/* ═══════════════════════════════════════════════════════════════
   STICKY CURRENT SECTION HEADER
   ═══════════════════════════════════════════════════════════════ */
function addStickySection(contentEl) {
  const h2s = Array.from(contentEl.querySelectorAll("h2"));
  const banner = document.getElementById("sticky-section-header");
  if (!banner || h2s.length === 0) return;

  const TOPBAR_H = 44;

  const update = () => {
    const scrollY = window.scrollY + TOPBAR_H + 2;
    let current = null;
    for (const h of h2s) {
      if (h.getBoundingClientRect().top + window.scrollY <= scrollY) {
        current = h;
      }
    }
    if (current) {
      banner.textContent = current.textContent.replace(/#+\s*$/, "").trim();
      banner.classList.add("visible");
    } else {
      banner.classList.remove("visible");
    }
  };

  state.stickySectionHandler = update;
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function cleanupStickySection() {
  if (state.stickySectionHandler) {
    window.removeEventListener("scroll", state.stickySectionHandler);
    state.stickySectionHandler = null;
  }
  const banner = document.getElementById("sticky-section-header");
  if (banner) banner.classList.remove("visible");
}

export {
  closeZoomOverlay,
  addCodeBlockHeader,
  addCopyButtons,
  styleCallouts,
  renderPrerequisites,
  buildTOC,
  addAnchorLinks,
  renderMermaidDiagrams,
  addLineNumbers,
  addCollapsibleCodeBlocks,
  addCollapsibleCallouts,
  addCodeLangLabels,
  addImageLightbox,
  addDiagramZoom,
  rerenderMermaidDiagrams,
  addTableScrollCues,
  toggleFocusMode,
  cleanupFocusMode,
  addStickySection,
  cleanupStickySection,
};
