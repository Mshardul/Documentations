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

/* ─── Copy Buttons ─── */
function addCopyButtons(contentEl) {
  contentEl.querySelectorAll("pre").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.title = "Copy";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = copyIcon();

    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      const text = code ? code.textContent : pre.textContent;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.innerHTML = checkIcon();
          setTimeout(() => {
            btn.innerHTML = copyIcon();
          }, 2000);
        })
        .catch(() => {});
    });

    pre.appendChild(btn);
  });
}

function copyIcon() {
  return `<svg viewBox="0 0 16 16" fill="none">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
    <path d="M3 10V3h7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function checkIcon() {
  return `<svg viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3.5 3.5L13 4" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* ─── Callout Styling ─── */
function styleCallouts(contentEl) {
  contentEl.querySelectorAll("blockquote").forEach((bq) => {
    const text = bq.textContent.trim();
    if (text.startsWith("🎯")) bq.classList.add("callout", "callout-interview");
    else if (text.startsWith("⚠️") || text.startsWith("⚠"))
      bq.classList.add("callout", "callout-warning");
    else if (text.startsWith("🧠"))
      bq.classList.add("callout", "callout-thought");
    else if (text.startsWith("⚖️") || text.startsWith("⚖"))
      bq.classList.add("callout", "callout-decision");
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
function addAnchorLinks(contentEl) {
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
      navigator.clipboard
        .writeText(url.toString())
        .then(() => {
          btn.classList.add("copied");
          setTimeout(() => btn.classList.remove("copied"), 2000);
        })
        .catch(() => {});
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

/* ─── Image Lightbox (WIKI-044) ─── */
function addImageLightbox(contentEl) {
  contentEl.querySelectorAll("img").forEach((img) => {
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
    }
  }
}

/* ─── Diagram Zoom (WIKI-045) ─── */
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

/* ─── Mermaid Theme Sync (WIKI-039) ─── */
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

  let i = 0;
  for (const wrapper of diagrams) {
    const code = wrapper.dataset.mermaidSrc;
    try {
      const id = `mermaid-rerender-${Date.now()}-${i++}`;
      const { svg } = await mermaid.render(id, code);
      wrapper.innerHTML = svg;
    } catch (err) {
      console.warn("Mermaid re-render failed:", err);
    }
  }
}

/* ─── Table Scroll Cue (WIKI-053) ─── */
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
   COLLAPSIBLE LONG CODE BLOCKS (WIKI-085)
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
    });
    pre.appendChild(btn);
  });
}

/* ═══════════════════════════════════════════════════════════════
   CODE LANGUAGE LABELS
   ═══════════════════════════════════════════════════════════════ */
function addCodeLangLabels(contentEl) {
  contentEl.querySelectorAll("pre code[class]").forEach((code) => {
    const match = code.className.match(/language-(\w+)/);
    if (!match || match[1] === "mermaid") return;
    const label = document.createElement("span");
    label.className = "code-lang-label";
    label.textContent = match[1];
    code.parentElement.appendChild(label);
  });
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER FOCUS MODE (WIKI-087)
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

export {
  closeZoomOverlay,
  addCopyButtons,
  styleCallouts,
  renderPrerequisites,
  buildTOC,
  addAnchorLinks,
  renderMermaidDiagrams,
  addCollapsibleCodeBlocks,
  addCodeLangLabels,
  addImageLightbox,
  addDiagramZoom,
  rerenderMermaidDiagrams,
  addTableScrollCues,
  toggleFocusMode,
  cleanupFocusMode,
};
