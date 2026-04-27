import { state } from "./state.js";

/* ─── Copy Buttons ─── */
function addCopyButtons(contentEl) {
  contentEl.querySelectorAll("pre").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.title = "Copy";
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
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch (err) {
      console.warn("Mermaid render failed:", err);
    }
  }
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

export {
  addCopyButtons,
  styleCallouts,
  renderPrerequisites,
  buildTOC,
  addAnchorLinks,
  renderMermaidDiagrams,
  addCodeLangLabels,
};
