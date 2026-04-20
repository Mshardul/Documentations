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

if (typeof mermaid !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
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
  });
}

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
const state = {
  currentView: "home",
  currentWikiId: null,
  currentFilePath: null,
  currentTitle: null,
  indexSections: [],
  tocObserver: null,
};

/* ═══════════════════════════════════════════════════════════════
   VIEW MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */
const progressBar = document.getElementById("reading-progress");

function showView(id) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  state.currentView = id.replace("view-", "");
  window.scrollTo(0, 0);

  const isContent = id === "view-content";
  progressBar.classList.toggle("visible", isContent);
  if (isContent) progressBar.style.width = "0%";
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
    <div class="wiki-card" data-wiki-id="${w.id}" onclick="navigate('${w.id}')" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')navigate('${w.id}')">
      <div class="wiki-card-icon">${w.icon}</div>
      <div class="wiki-card-body">
        <h2 class="wiki-card-title">${w.title}</h2>
        <p class="wiki-card-desc">${w.description}</p>
      </div>
      <div class="wiki-card-footer">
        <span class="wiki-card-count">… articles</span>
        <span class="wiki-card-arrow">→</span>
      </div>
    </div>
  `
  ).join("");

  showView("view-home");
  updateArticleCounts();
  renderBookmarksSection();
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
    populateIndexReadTimes();
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
            <div class="index-card-meta">
              <span class="index-card-read-time" data-path="${escHtml(
                card.path
              )}">…</span>
              <span class="index-card-read-dot ${
                isRead(card.path) ? "visible" : ""
              }" title="Read"></span>
            </div>
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

/* ─── Reading time ─── */
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

const readTimeCache = {};

async function populateIndexReadTimes() {
  const badges = document.querySelectorAll(".index-card-read-time[data-path]");
  for (const badge of badges) {
    const path = badge.dataset.path;
    if (!path) continue;
    try {
      if (!readTimeCache[path]) {
        const md = await fetchText(path);
        readTimeCache[path] = readingTime(md);
      }
      badge.textContent = readTimeCache[path];
    } catch {
      badge.textContent = "";
    }
  }
}

/* ─── Shared index cache (used by article counts + global search) ─── */
const indexCache = {};

async function fetchWikiIndex(wiki) {
  if (indexCache[wiki.id]) return indexCache[wiki.id];
  const md = await fetchText(wiki.indexPath);
  const basePath = dirOf(wiki.indexPath);
  const sections = parseIndexMd(md, basePath);
  indexCache[wiki.id] = sections;
  return sections;
}

async function updateArticleCounts() {
  for (const wiki of WIKIS) {
    try {
      const sections = await fetchWikiIndex(wiki);
      const count = sections.reduce((sum, s) => sum + s.cards.length, 0);
      const el = document.querySelector(
        `[data-wiki-id="${wiki.id}"] .wiki-card-count`
      );
      if (el) el.textContent = `${count} articles`;
    } catch {}
  }
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
  state.currentTitle = title;

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

  const readTimeBadge = document.getElementById("content-read-time");
  if (readTimeBadge) readTimeBadge.textContent = "";

  try {
    const markdown = await fetchText(filePath);

    // Set reading time immediately after fetch
    if (readTimeBadge) {
      readTimeBadge.textContent =
        readTimeCache[filePath] || readingTime(markdown);
      readTimeCache[filePath] = readTimeBadge.textContent;
    }

    const bodyContent = markdown
      .trim()
      .replace(/^#{1,6}\s+[^\n]*\n?/, "")
      .trim();
    if (!bodyContent) {
      body.innerHTML = `
        <div class="content-stub">
          <div class="content-stub-icon">✦</div>
          <h2 class="content-stub-title">${escHtml(title)}</h2>
          <p class="content-stub-msg">This article hasn't been written yet.</p>
        </div>`;
      if (readTimeBadge) readTimeBadge.textContent = "";
      buildTOC(body);
      return;
    }
    body.innerHTML = mdConverter.makeHtml(markdown);

    // Mermaid must run before hljs so it claims those blocks first
    await renderMermaidDiagrams(body);

    // Syntax highlighting
    body
      .querySelectorAll("pre code")
      .forEach((block) => hljs.highlightElement(block));

    // Post-processing
    addCopyButtons(body);
    styleCallouts(body);
    interceptMdLinks(body, wiki, filePath);
    addAnchorLinks(body);

    // TOC
    buildTOC(body);

    // Code language labels
    addCodeLangLabels(body);

    // Related articles
    renderRelatedArticles(wiki, filePath);

    // Topbar button states
    updateBookmarkBtn();
    updateOfflineBtn();

    // Scroll to heading anchor if ?a= param present
    const anchor = new URLSearchParams(location.search).get("a");
    if (anchor) {
      const target = body.querySelector(`[id="${CSS.escape(anchor)}"]`);
      if (target)
        setTimeout(
          () => target.scrollIntoView({ behavior: "smooth", block: "start" }),
          150
        );
    }
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

    if (state.currentView === "content") {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? scrolled / total : 0;
      progressBar.style.width = `${pct * 100}%`;

      // Auto-mark as read at 85%
      if (pct > 0.85 && state.currentFilePath) {
        markRead(state.currentFilePath);
      }
    }
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
   GLOBAL SEARCH (⌘K)
   ═══════════════════════════════════════════════════════════════ */
const gSearchModal = document.getElementById("global-search-modal");
const gSearchInput = document.getElementById("gsearch-input");
const gSearchResults = document.getElementById("gsearch-results");
const gSearchBackdrop = document.getElementById("gsearch-backdrop");

const allSearchCache = { loaded: false, loading: false, entries: [] };

async function loadAllSearchEntries() {
  if (allSearchCache.loaded || allSearchCache.loading) return;
  allSearchCache.loading = true;
  gSearchResults.innerHTML = '<div class="gsearch-loading">Loading…</div>';

  for (const wiki of WIKIS) {
    try {
      const sections = await fetchWikiIndex(wiki);
      for (const section of sections) {
        for (const card of section.cards) {
          allSearchCache.entries.push({
            wiki,
            section: section.heading,
            ...card,
          });
        }
      }
    } catch {}
  }

  allSearchCache.loaded = true;
  allSearchCache.loading = false;
  applyGlobalSearch(gSearchInput.value);
}

function openGlobalSearch() {
  gSearchModal.classList.remove("hidden");
  gSearchModal.setAttribute("aria-hidden", "false");
  gSearchInput.value = "";
  gSearchResults.innerHTML =
    '<div class="gsearch-empty">Start typing to search…</div>';
  gSearchInput.focus();
  loadAllSearchEntries();
}

function closeGlobalSearch() {
  gSearchModal.classList.add("hidden");
  gSearchModal.setAttribute("aria-hidden", "true");
}

function scoreMatch(q, entry) {
  const ql = q.toLowerCase();
  const title = entry.title.toLowerCase();
  const desc = entry.description.toLowerCase();
  const short = ql.length <= 4;

  if (title === ql) return 100;
  if (title.startsWith(ql)) return 90;
  if (title.includes(ql)) return 80;
  if (fuzzyMatch(ql, title)) return 60;
  // For short queries, stop here — avoid false positives from desc/section fuzzy
  if (short) return 0;
  if (desc.includes(ql)) return 40;
  if (fuzzyMatch(ql, desc)) return 20;
  if (fuzzyMatch(ql, entry.section.toLowerCase())) return 10;
  return 0;
}

function applyGlobalSearch(query) {
  if (!allSearchCache.loaded) return;

  const q = query.trim();
  if (!q) {
    gSearchResults.innerHTML =
      '<div class="gsearch-empty">Start typing to search…</div>';
    return;
  }

  const scored = allSearchCache.entries
    .map((e) => ({ entry: e, score: scoreMatch(q, e) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry);

  if (!scored.length) {
    gSearchResults.innerHTML = `<div class="gsearch-no-results">No results for "<strong>${escHtml(
      q
    )}</strong>"</div>`;
    return;
  }

  // Group by wiki, preserving score order within each group
  const grouped = {};
  for (const m of scored) {
    if (!grouped[m.wiki.id]) grouped[m.wiki.id] = { wiki: m.wiki, items: [] };
    grouped[m.wiki.id].items.push(m);
  }

  gSearchResults.innerHTML = Object.values(grouped)
    .map(
      (group) => `
    <div class="gsearch-group-label">${escHtml(group.wiki.title)}</div>
    ${group.items
      .map(
        (item) => `
      <div class="gsearch-result"
           onclick="closeGlobalSearch(); navigateToContent('${
             item.wiki.id
           }', '${encodeURIComponent(item.path)}', '${encodeURIComponent(
          item.title
        )}', '${item.slug}')"
           role="button" tabindex="0"
           onkeydown="if(event.key==='Enter')this.click()">
        <span class="gsearch-result-title">${highlightMatch(
          item.title,
          q
        )}</span>
        <span class="gsearch-result-meta">${escHtml(item.section)} · ${escHtml(
          item.description.slice(0, 90)
        )}${item.description.length > 90 ? "…" : ""}</span>
      </div>
    `
      )
      .join("")}
  `
    )
    .join("");
}

gSearchInput.addEventListener("input", () =>
  applyGlobalSearch(gSearchInput.value)
);
gSearchBackdrop.addEventListener("click", closeGlobalSearch);

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    openGlobalSearch();
  }
  if (e.key === "Escape" && !gSearchModal.classList.contains("hidden")) {
    closeGlobalSearch();
  }
});

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
   RELATED ARTICLES
   ═══════════════════════════════════════════════════════════════ */
async function renderRelatedArticles(wiki, currentPath) {
  const container = document.getElementById("related-articles");
  if (!container) return;
  container.innerHTML = "";

  try {
    const sections = await fetchWikiIndex(wiki);
    let related = [];
    let sectionName = "";

    for (const section of sections) {
      const idx = section.cards.findIndex((c) => c.path === currentPath);
      if (idx !== -1) {
        sectionName = section.heading;
        related = section.cards
          .filter((c) => c.path !== currentPath)
          .slice(0, 3);
        break;
      }
    }

    if (!related.length) return;

    container.innerHTML = `
      <div class="related-header">
        <span class="related-label">More in ${escHtml(sectionName)}</span>
      </div>
      <div class="related-grid">
        ${related
          .map(
            (card) => `
          <div class="related-card"
               onclick="navigateToContent('${wiki.id}','${encodeURIComponent(
              card.path
            )}','${encodeURIComponent(card.title)}','${card.slug}')"
               role="button" tabindex="0"
               onkeydown="if(event.key==='Enter')this.click()">
            <span class="related-card-title">${escHtml(card.title)}</span>
            <span class="related-card-arrow">→</span>
          </div>`
          )
          .join("")}
      </div>`;
  } catch {}
}

/* ═══════════════════════════════════════════════════════════════
   BOOKMARKS
   ═══════════════════════════════════════════════════════════════ */
const BOOKMARKS_KEY = "wiki-bookmarks";

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBookmarks(arr) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(arr));
}

function isBookmarked(path) {
  return getBookmarks().some((b) => b.path === path);
}

function updateBookmarkBtn() {
  const btn = document.getElementById("content-bookmark-btn");
  if (!btn) return;
  const bookmarked = isBookmarked(state.currentFilePath);
  btn.classList.toggle("active", bookmarked);
  btn.title = bookmarked ? "Remove bookmark" : "Bookmark";
}

function renderBookmarksSection() {
  const section = document.getElementById("bookmarks-section");
  const grid = document.getElementById("bookmarks-grid");
  if (!section || !grid) return;

  const bookmarks = getBookmarks();
  if (!bookmarks.length) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  grid.innerHTML = bookmarks
    .map((b) => {
      const wiki = WIKIS.find((w) => w.id === b.wikiId);
      return `
      <div class="bookmark-card"
           onclick="navigateToContent('${b.wikiId}','${encodeURIComponent(
        b.path
      )}','${encodeURIComponent(b.title)}','${b.slug}')"
           role="button" tabindex="0"
           onkeydown="if(event.key==='Enter')this.click()">
        <span class="bookmark-card-title">${escHtml(b.title)}</span>
        <span class="bookmark-card-wiki">${escHtml(
          wiki?.title || b.wikiId
        )}</span>
      </div>`;
    })
    .join("");
}

const Bookmarks = {
  toggle() {
    const path = state.currentFilePath;
    if (!path) return;
    const bookmarks = getBookmarks();
    const idx = bookmarks.findIndex((b) => b.path === path);
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
    } else {
      const wiki = WIKIS.find((w) => w.id === state.currentWikiId);
      bookmarks.unshift({
        wikiId: state.currentWikiId,
        path,
        slug: path.split("/").pop().replace(/\.md$/, ""),
        title: state.currentTitle || path.split("/").pop().replace(/\.md$/, ""),
        wikiTitle: wiki?.title || "",
      });
    }
    saveBookmarks(bookmarks);
    updateBookmarkBtn();
  },
  clearAll() {
    saveBookmarks([]);
    renderBookmarksSection();
  },
};

/* ═══════════════════════════════════════════════════════════════
   MARK AS READ
   ═══════════════════════════════════════════════════════════════ */
const READ_KEY = "wiki-read";

function getReadSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function isRead(path) {
  return getReadSet().has(path);
}

function markRead(path) {
  const read = getReadSet();
  if (read.has(path)) return;
  read.add(path);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
  // Update any visible read dots for this article
  document.querySelectorAll(`.index-card-read-dot`).forEach((dot) => {
    const card = dot.closest(".index-card");
    const timeBadge = card?.querySelector(".index-card-read-time");
    if (timeBadge?.dataset.path === path) dot.classList.add("visible");
  });
}

/* ═══════════════════════════════════════════════════════════════
   OFFLINE / PWA
   ═══════════════════════════════════════════════════════════════ */
async function downloadArticle(filePath) {
  if (!("caches" in window)) return;
  const cache = await caches.open("wiki-articles-v1");
  const res = await fetch(filePath);
  if (res.ok) await cache.put(filePath, res);
}

async function removeArticleDownload(filePath) {
  if (!("caches" in window)) return;
  const cache = await caches.open("wiki-articles-v1");
  await cache.delete(filePath);
}

async function isArticleCached(filePath) {
  if (!("caches" in window)) return false;
  const cache = await caches.open("wiki-articles-v1");
  return !!(await cache.match(filePath));
}

async function updateOfflineBtn() {
  const btn = document.getElementById("content-offline-btn");
  if (!btn || !state.currentFilePath) return;
  const cached = await isArticleCached(state.currentFilePath);
  const dlIcon = btn.querySelector(".offline-icon-download");
  const chkIcon = btn.querySelector(".offline-icon-check");
  btn.classList.toggle("active", cached);
  if (dlIcon) dlIcon.style.display = cached ? "none" : "";
  if (chkIcon) chkIcon.style.display = cached ? "" : "none";
  btn.title = cached ? "Saved offline — click to remove" : "Save for offline";
}

const Offline = {
  async toggle() {
    const path = state.currentFilePath;
    if (!path) return;
    const btn = document.getElementById("content-offline-btn");
    const cached = await isArticleCached(path);
    if (cached) {
      await removeArticleDownload(path);
    } else {
      btn?.classList.add("loading");
      await downloadArticle(path);
      btn?.classList.remove("loading");
    }
    updateOfflineBtn();
  },
};

/* ─── Search result highlight ─── */
function highlightMatch(text, query) {
  if (!query) return escHtml(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escHtml(text);
  return (
    escHtml(text.slice(0, idx)) +
    `<mark class="gsearch-highlight">${escHtml(
      text.slice(idx, idx + query.length)
    )}</mark>` +
    escHtml(text.slice(idx + query.length))
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEME (light / dark)
   ═══════════════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  document
    .querySelectorAll(".theme-icon-moon")
    .forEach((el) => (el.style.display = isDark ? "" : "none"));
  document
    .querySelectorAll(".theme-icon-sun")
    .forEach((el) => (el.style.display = isDark ? "none" : ""));
  localStorage.setItem("wiki-theme", theme);
}

const Theme = {
  toggle() {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  },
};

/* Public API for onclick handlers in HTML */
const Wiki = { goHome: () => navigate("") };
const GlobalSearch = { open: openGlobalSearch, close: closeGlobalSearch };

/* ═══════════════════════════════════════════════════════════════
   INIT — parse hash on load
   ═══════════════════════════════════════════════════════════════ */
(function init() {
  applyTheme(localStorage.getItem("wiki-theme") || "dark");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./wiki-sw.js").catch(() => {});
  }

  const hash = location.hash.slice(1);
  route(hash);
})();

// Re-route when restored from BFcache (e.g. history.back() from 404 page)
window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    const hash = location.hash.slice(1);
    route(hash);
  }
});
