/* ═══════════════════════════════════════════════════════════════
   WIKI DATA — add new wikis here
   ═══════════════════════════════════════════════════════════════ */
const WIKIS = [
  {
    id: "system-design",
    title: "System Design",
    description:
      "Interview-ready references covering components, algorithms, and end-to-end system walkthroughs.",
    icon: "⚙️",
    color: "#6366f1",
    indexPath: "../System Design/wiki/index.md",
    articleCount: 37,
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOWDOWN CONVERTER CONFIG
   ═══════════════════════════════════════════════════════════════ */
const mdConverter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  noHeaderId: false,
  tables: true,
  strikethrough: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: false,
  disableForced4SpacesIndentedSublists: true,
});

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
const state = {
  currentView: "home",
  currentWikiId: null,
  currentFilePath: null,
  indexSections: [], // parsed sections from index.md
  tocObserver: null,
};

/* ═══════════════════════════════════════════════════════════════
   VIEW MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */
function showView(id) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  state.currentView = id.replace("view-", "");
  window.scrollTo(0, 0);
}

/* ═══════════════════════════════════════════════════════════════
   HASH ROUTER
   url scheme: wiki.html  →  wiki.html#system-design  →  wiki.html#system-design/message-queues
   ═══════════════════════════════════════════════════════════════ */
function navigate(hash, pushHistory = true) {
  if (pushHistory) {
    const url = hash ? `wiki.html#${hash}` : "wiki.html";
    history.pushState({ hash }, "", url);
  }
  route(hash || "");
}

function route(hash) {
  const parts = hash.split("/").filter(Boolean);

  if (parts.length === 0) {
    renderHome();
    return;
  }

  const wikiId = parts[0];
  const wiki = WIKIS.find((w) => w.id === wikiId);
  if (!wiki) {
    renderHome();
    return;
  }

  if (parts.length === 1) {
    renderIndex(wiki);
    return;
  }

  // Content view: we need the full file path.
  // If we have it in history state, use it. Otherwise resolve from index.
  const slug = parts[1];
  const savedPath = history.state?.filePath;
  const savedTitle = history.state?.title;

  if (savedPath) {
    renderContent(wiki, savedPath, savedTitle || slug);
  } else {
    // Cold load: fetch index first to resolve slug → path
    resolveSlugAndRender(wiki, slug);
  }
}

async function resolveSlugAndRender(wiki, slug) {
  try {
    const md = await fetchText(wiki.indexPath);
    const basePath = dirOf(wiki.indexPath);
    const sections = parseIndexMd(md, basePath);
    for (const section of sections) {
      const card = section.cards.find((c) => c.slug === slug);
      if (card) {
        renderContent(wiki, card.path, card.title, false);
        return;
      }
    }
    // Fallback: construct path heuristically
    renderHome();
  } catch {
    renderHome();
  }
}

window.addEventListener("popstate", (e) => {
  const hash = e.state?.hash ?? location.hash.slice(1);
  route(hash);
});

/* ═══════════════════════════════════════════════════════════════
   VIEW 1 — HOME
   ═══════════════════════════════════════════════════════════════ */
function renderHome() {
  const grid = document.getElementById("wiki-grid");
  grid.innerHTML = WIKIS.map(
    (w) => `
    <div class="wiki-card" onclick="navigate('${w.id}')" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')navigate('${w.id}')">
      <div class="wiki-card-icon">${w.icon}</div>
      <div class="wiki-card-body">
        <h2 class="wiki-card-title">${w.title}</h2>
        <p class="wiki-card-desc">${w.description}</p>
      </div>
      <div class="wiki-card-footer">
        <span class="wiki-card-count">${w.articleCount} articles</span>
        <span class="wiki-card-arrow">→</span>
      </div>
    </div>
  `
  ).join("");

  showView("view-home");
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 2 — WIKI INDEX
   ═══════════════════════════════════════════════════════════════ */
async function renderIndex(wiki) {
  state.currentWikiId = wiki.id;

  // Breadcrumb & hero
  setBreadcrumb("index-breadcrumb", [
    { label: "Home", action: () => navigate("") },
    { label: wiki.title },
  ]);
  document.getElementById("index-title").textContent = wiki.title;
  document.getElementById("index-subtitle").textContent = wiki.description;

  // Back button
  document
    .getElementById("index-breadcrumb")
    .closest(".page-topbar")
    ?.querySelector(".back-btn")
    ?.addEventListener("click", () => navigate(""), { once: true });

  showView("view-index");

  const sectionsEl = document.getElementById("index-sections");
  sectionsEl.innerHTML =
    '<div class="loading" style="padding:3rem;text-align:center;color:var(--text-muted);font-size:.875rem">Loading…</div>';

  try {
    const md = await fetchText(wiki.indexPath);
    const basePath = dirOf(wiki.indexPath);
    state.indexSections = parseIndexMd(md, basePath);
    renderIndexSections(state.indexSections, wiki);
    setupSearch();
  } catch (err) {
    sectionsEl.innerHTML = `<p class="error">Failed to load index. (${err.message})</p>`;
  }
}

function renderIndexSections(sections, wiki) {
  const container = document.getElementById("index-sections");
  container.innerHTML = sections
    .map(
      (section) => `
    <div class="index-section" data-section="${section.heading}">
      <div class="section-header">
        <h2 class="section-title">${section.heading}</h2>
        <span class="section-count">${section.cards.length}</span>
      </div>
      <div class="index-card-grid">
        ${section.cards
          .map(
            (card) => `
          <div class="index-card"
               data-title="${escHtml(card.title)}"
               data-desc="${escHtml(card.description)}"
               onclick="navigateToContent('${wiki.id}', '${encodeURIComponent(
              card.path
            )}', '${encodeURIComponent(card.title)}', '${card.slug}')"
               role="button" tabindex="0"
               onkeydown="if(event.key==='Enter')this.click()">
            <div class="index-card-header">
              <span class="index-card-title">${escHtml(card.title)}</span>
              <span class="index-card-arrow">→</span>
            </div>
            <p class="index-card-desc">${escHtml(card.description)}</p>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");
}

/* ─── Index.md Parser ─── */
function parseIndexMd(markdown, basePath) {
  const sections = [];
  const skipHeadings = ["how to use", "contributing"];

  // Split on H2 headings (## )
  const chunks = markdown.split(/\n(?=## )/);

  for (const chunk of chunks) {
    const firstLine = chunk.split("\n")[0];
    if (!firstLine.startsWith("## ")) continue;

    const heading = firstLine.replace(/^## /, "").trim();
    if (skipHeadings.some((s) => heading.toLowerCase().includes(s))) continue;

    const cards = [];
    const lines = chunk.split("\n");

    for (const line of lines) {
      // Match table data rows: | [Title](./path.md) | Description text |
      const m = line.match(
        /^\|\s*\[([^\]]+)\]\(([^)]+\.md)\)\s*\|\s*([^|]+?)\s*\|/
      );
      if (m) {
        const title = m[1].trim();
        const relPath = m[2].trim();
        const description = m[3].trim();

        // Resolve relative path: ./components/foo.md → basePath/components/foo.md
        const fullPath = basePath + "/" + relPath.replace(/^\.\//, "");
        const slug = relPath.split("/").pop().replace(/\.md$/, "");

        cards.push({ title, path: fullPath, slug, description });
      }
    }

    if (cards.length) sections.push({ heading, cards });
  }

  return sections;
}

/* ─── Fuzzy Search ─── */
function fuzzyMatch(query, text) {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  // Check substring first (fast path)
  if (t.includes(q)) return true;
  // Fuzzy: all chars of query appear in order in text
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function setupSearch() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear");

  input.value = "";
  clearBtn.classList.remove("visible");

  input.addEventListener("input", () => {
    const q = input.value.trim();
    clearBtn.classList.toggle("visible", q.length > 0);
    applySearch(q);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.classList.remove("visible");
    applySearch("");
    input.focus();
  });
}

function applySearch(query) {
  const cards = document.querySelectorAll(".index-card");
  const sections = document.querySelectorAll(".index-section");
  const noResults = document.getElementById("no-results");
  let visible = 0;

  cards.forEach((card) => {
    const matches =
      fuzzyMatch(query, card.dataset.title || "") ||
      fuzzyMatch(query, card.dataset.desc || "");
    card.classList.toggle("hidden", !matches);
    if (matches) visible++;
  });

  sections.forEach((sec) => {
    const anyVisible =
      sec.querySelectorAll(".index-card:not(.hidden)").length > 0;
    sec.classList.toggle("hidden", !anyVisible);
  });

  const showNo = visible === 0 && query.length > 0;
  noResults.classList.toggle("hidden", !showNo);
  if (showNo) document.getElementById("no-results-query").textContent = query;
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 3 — CONTENT
   ═══════════════════════════════════════════════════════════════ */
function navigateToContent(wikiId, encodedPath, encodedTitle, slug) {
  const filePath = decodeURIComponent(encodedPath);
  const title = decodeURIComponent(encodedTitle);
  const wiki = WIKIS.find((w) => w.id === wikiId);
  renderContent(wiki, filePath, title, true, slug);
}

async function renderContent(
  wiki,
  filePath,
  title,
  pushNav = true,
  slug = null
) {
  state.currentWikiId = wiki.id;
  state.currentFilePath = filePath;

  const derivedSlug = slug || filePath.split("/").pop().replace(/\.md$/, "");

  if (pushNav) {
    history.pushState(
      { hash: `${wiki.id}/${derivedSlug}`, filePath, title },
      "",
      `wiki.html#${wiki.id}/${derivedSlug}`
    );
  }

  // Breadcrumb
  setBreadcrumb("content-breadcrumb", [
    { label: "Home", action: () => navigate("") },
    { label: wiki.title, action: () => navigate(wiki.id) },
    { label: title },
  ]);

  // Back button → return to index
  const backBtn = document.getElementById("content-back-btn");
  backBtn.onclick = () => navigate(wiki.id);

  showView("view-content");

  const body = document.getElementById("markdown-body");
  body.innerHTML = '<div class="loading">Loading…</div>';

  // Clear old observer
  if (state.tocObserver) {
    state.tocObserver.disconnect();
    state.tocObserver = null;
  }
  document.getElementById("toc-nav").innerHTML = "";

  try {
    const markdown = await fetchText(filePath);
    const bodyContent = markdown
      .trim()
      .replace(/^#{1,6}\s+[^\n]*\n?/, "")
      .trim();
    if (!bodyContent) {
      window.location.href = `./404.html?title=${encodeURIComponent(title)}`;
      return;
    }
    body.innerHTML = mdConverter.makeHtml(markdown);

    // Syntax highlighting
    body
      .querySelectorAll("pre code")
      .forEach((block) => hljs.highlightElement(block));

    // Post-processing
    addCopyButtons(body);
    styleCallouts(body);
    interceptMdLinks(body, wiki, filePath);

    // TOC
    buildTOC(body);
  } catch (err) {
    body.innerHTML = `<p class="error">Failed to load content. (${err.message})</p>`;
  }
}

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

/* ─── Internal .md link interception ─── */
function interceptMdLinks(contentEl, wiki, currentFilePath) {
  const baseDir = dirOf(currentFilePath);

  contentEl.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.endsWith(".md") || href.startsWith("http")) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const resolvedPath = resolvePath(baseDir, href);
      const title = link.textContent.trim();
      renderContent(wiki, resolvedPath, title);
    });
  });
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

/* ─── TOC Collapse ─── */
document.getElementById("toc-collapse").addEventListener("click", () => {
  document.getElementById("toc-sidebar").classList.toggle("collapsed");
});

/* ─── Mobile TOC ─── */
const tocMobileBtn = document.getElementById("toc-mobile-btn");
const tocMobileOverlay = document.getElementById("toc-mobile-overlay");
const tocSidebar = document.getElementById("toc-sidebar");

tocMobileBtn.addEventListener("click", () => {
  tocSidebar.classList.add("mobile-open");
  tocMobileOverlay.classList.add("open");
});
tocMobileOverlay.addEventListener("click", () => {
  tocSidebar.classList.remove("mobile-open");
  tocMobileOverlay.classList.remove("open");
});

/* ═══════════════════════════════════════════════════════════════
   SCROLL TO TOP
   ═══════════════════════════════════════════════════════════════ */
const scrollTopBtn = document.getElementById("scroll-top");

window.addEventListener(
  "scroll",
  () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
  },
  { passive: true }
);

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ═══════════════════════════════════════════════════════════════
   BREADCRUMB HELPER
   ═══════════════════════════════════════════════════════════════ */
function setBreadcrumb(elId, items) {
  const el = document.getElementById(elId);
  el.innerHTML = "";
  items.forEach((item, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "breadcrumb-sep";
      sep.textContent = "›";
      el.appendChild(sep);
    }
    const isLast = i === items.length - 1;
    if (isLast || !item.action) {
      const span = document.createElement("span");
      span.textContent = item.label;
      el.appendChild(span);
    } else {
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = item.label;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        item.action();
      });
      el.appendChild(a);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */
async function fetchText(path) {
  const res = await fetch(encodeURI(path));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function dirOf(filePath) {
  return filePath.substring(0, filePath.lastIndexOf("/"));
}

function resolvePath(baseDir, relHref) {
  if (relHref.startsWith("./")) return baseDir + "/" + relHref.slice(2);
  if (relHref.startsWith("../")) {
    const parent = baseDir.substring(0, baseDir.lastIndexOf("/"));
    return parent + "/" + relHref.slice(3);
  }
  return baseDir + "/" + relHref;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Public API for onclick handlers in HTML */
const Wiki = { goHome: () => navigate("") };

/* ═══════════════════════════════════════════════════════════════
   INIT — parse hash on load
   ═══════════════════════════════════════════════════════════════ */
(function init() {
  const hash = location.hash.slice(1); // strip leading #
  route(hash);
})();
