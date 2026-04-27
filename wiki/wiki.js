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
    indexPath: "../content/system-design/index.md",
    articleCount: 37,
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOWDOWN CONVERTER CONFIG
   ═══════════════════════════════════════════════════════════════ */
const mathExtension = () => {
  return [
    {
      type: "lang",
      regex: /\$\$([\s\S]+?)\$\$/g, // Block math
      replace: (match, content) =>
        "¨D" + btoa(unescape(encodeURIComponent(content))) + "¨D",
    },
    {
      type: "lang",
      // Inline math: requires non-space characters next to the $ signs to avoid matching bash prompts
      regex: /\$(?!\s)([^$\n]*?\S)\$/g,
      replace: (match, content) =>
        "¨d" + btoa(unescape(encodeURIComponent(content))) + "¨d",
    },
    {
      type: "output",
      regex: /¨D([A-Za-z0-9+/=]+)¨D/g,
      replace: (match, content) =>
        "$$" + decodeURIComponent(escape(atob(content))) + "$$",
    },
    {
      type: "output",
      regex: /¨d([A-Za-z0-9+/=]+)¨d/g,
      replace: (match, content) =>
        "$" + decodeURIComponent(escape(atob(content))) + "$",
    },
  ];
};

const mdConverter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  noHeaderId: false,
  tables: true,
  strikethrough: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: false,
  disableForced4SpacesIndentedSublists: true,
  extensions: [mathExtension],
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
  titleObserver: null,
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
    // Explicitly reconstruct URL with pathname to strip away location.search query params
    const url = location.pathname + (hash ? `#${hash}` : "");
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

window.addEventListener("hashchange", () => {
  route(location.hash.slice(1));
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
        <span class="wiki-card-count">0 articles</span>
        <span class="wiki-card-arrow">→</span>
      </div>
    </div>
  `
  ).join("");

  showView("view-home");
  updateArticleCounts();
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 2 — WIKI INDEX
   ═══════════════════════════════════════════════════════════════ */
async function renderIndex(wiki) {
  state.currentWikiId = wiki.id;

  // Breadcrumb & hero
  setBreadcrumb("index-breadcrumb", [
    { label: "Home", href: "#" },
    { label: wiki.title },
  ]);
  document.getElementById("index-title").textContent = wiki.title;
  document.getElementById("index-subtitle").textContent = wiki.description;

  showView("view-index");
  renderRecentsSection(wiki);
  renderBookmarksSection(wiki);

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

const STUB_THRESHOLD = 200; // bytes — stubs are just "# Title\n---"

async function populateIndexReadTimes() {
  const badges = Array.from(
    document.querySelectorAll(".index-card-read-time[data-path]")
  );

  await Promise.all(
    badges.map(async (badge) => {
      const path = badge.dataset.path;
      if (!path) return;
      try {
        if (readTimeCache[path] === undefined) {
          const md = await fetchText(path);
          readTimeCache[path] =
            md.length < STUB_THRESHOLD ? null : readingTime(md);
        }
        const isStub = readTimeCache[path] === null;
        const card = badge.closest(".index-card");
        if (isStub && card) {
          card.classList.add("index-card--unavailable");
          card.removeAttribute("onclick");
          card.removeAttribute("tabindex");
          card.setAttribute("aria-disabled", "true");
          const dot = card.querySelector(".index-card-read-dot");
          if (dot) dot.remove();
        }
        badge.textContent = isStub ? "Coming soon" : readTimeCache[path];
      } catch {
        badge.textContent = "";
      }
    })
  );
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
    const url = location.pathname + `#${wiki.id}/${derivedSlug}`;
    history.pushState(
      { hash: `${wiki.id}/${derivedSlug}`, filePath, title },
      "",
      url
    );
  }

  // Breadcrumb
  setBreadcrumb("content-breadcrumb", [
    { label: "Home", href: "#" },
    { label: wiki.title, href: `#${wiki.id}` },
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

    // Only track successful loads.
    addToRecents({ wikiId: wiki.id, path: filePath, title, slug: derivedSlug });

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

    // DOMPurify (XSS Protection)
    const rawHtml = mdConverter.makeHtml(markdown);
    body.innerHTML =
      typeof DOMPurify !== "undefined" ? DOMPurify.sanitize(rawHtml) : rawHtml;

    // KaTeX rendering
    if (typeof renderMathInElement !== "undefined") {
      renderMathInElement(body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }

    // Mermaid must run before hljs so it claims those blocks first
    await renderMermaidDiagrams(body);

    // Syntax highlighting
    body
      .querySelectorAll("pre code")
      .forEach((block) => hljs.highlightElement(block));

    // Post-processing
    addCopyButtons(body);
    styleCallouts(body);

    // Prerequisites Chips
    renderPrerequisites(body);

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
    updateReadBtn();
    updateOfflineBtn();

    // Topbar Title Observer
    if (state.titleObserver) {
      state.titleObserver.disconnect();
      state.titleObserver = null;
    }
    const topbarTitle = document.getElementById("topbar-title");
    if (topbarTitle) {
      topbarTitle.textContent = title;
      topbarTitle.classList.remove("visible");
      const h1 = body.querySelector("h1");
      if (h1) {
        state.titleObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            // Show title if h1 is scrolled ABOVE the viewport
            topbarTitle.classList.toggle(
              "visible",
              !entry.isIntersecting && entry.boundingClientRect.top < 0
            );
          },
          { rootMargin: "-44px 0px 0px 0px" }
        );
        state.titleObserver.observe(h1);
      }
    }

    const anchor = new URLSearchParams(location.search).get("a");
    if (anchor) {
      const target = body.querySelector(`[id="${CSS.escape(anchor)}"]`);
      if (target)
        setTimeout(
          () => target.scrollIntoView({ behavior: "smooth", block: "start" }),
          150
        );
    } else {
      const saved = localStorage.getItem(`scroll-${filePath}`);
      if (saved) setTimeout(() => window.scrollTo(0, parseInt(saved, 10)), 150);
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

/* ─── Internal .md link interception & Hover Previews ─── */
let hoverPreviewTimer;

function interceptMdLinks(contentEl, wiki, currentFilePath) {
  const baseDir = dirOf(currentFilePath);
  const previewEl = document.getElementById("hover-preview");

  contentEl.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    // Anchor links
    if (href.startsWith("#")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = href.slice(1);

        // CSS.escape handles IDs with special characters
        const target = document.querySelector(`[id="${CSS.escape(targetId)}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });

          // Update the URL with the deep-link query param without breaking the hash route
          const url = new URL(location.href);
          url.searchParams.set("a", targetId);
          history.replaceState(history.state, "", url.toString());
        }
      });
      return;
    }

    // External links navigate away in new tab
    if (href.startsWith("http")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      return;
    }

    // Ignore missing or non-md links
    if (!href.endsWith(".md")) return;

    // Handle internal markdown links
    const resolvedPath = resolvePath(baseDir, href);

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const title = link.textContent.trim();
      renderContent(wiki, resolvedPath, title);
      if (previewEl) previewEl.classList.remove("visible");
    });

    // Hover logic
    link.addEventListener("mouseenter", () => {
      hoverPreviewTimer = setTimeout(
        () => showHoverPreview(link, resolvedPath),
        400
      );
    });

    link.addEventListener("mouseleave", () => {
      clearTimeout(hoverPreviewTimer);
      if (previewEl) previewEl.classList.remove("visible");
    });
  });
}

async function showHoverPreview(link, path) {
  const previewEl = document.getElementById("hover-preview");

  // Position the preview
  const rect = link.getBoundingClientRect();
  previewEl.style.top = `${window.scrollY + rect.bottom + 8}px`;

  // Keep it inside viewport bounds
  let leftPos = rect.left;
  if (leftPos + 340 > window.innerWidth) leftPos = window.innerWidth - 360;
  previewEl.style.left = `${leftPos}px`;

  previewEl.innerHTML = '<div class="loading">Loading preview...</div>';
  previewEl.classList.add("visible");

  try {
    const md = await fetchText(path);
    let extract = "";

    // Match TLDR section first
    const tldrMatch = md.match(/##\s*TL;?DR\s*\n([\s\S]*?)(?=\n##|$)/i);
    if (tldrMatch && tldrMatch[1].trim()) {
      extract = tldrMatch[1].trim();
    } else {
      // Fallback to first paragraph
      const textWithoutTitle = md.replace(/^#+ .*/gm, "").trim();
      extract = textWithoutTitle.split("\n\n")[0];
    }

    if (!extract) throw new Error("Empty");
    if (extract.length > 350) extract = extract.slice(0, 350) + "...";

    const rawHtml = mdConverter.makeHtml(extract);
    previewEl.innerHTML =
      typeof DOMPurify !== "undefined" ? DOMPurify.sanitize(rawHtml) : rawHtml;

    if (typeof renderMathInElement !== "undefined") {
      renderMathInElement(previewEl, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  } catch {
    previewEl.innerHTML =
      '<p style="color:var(--text-muted)">Preview not available.</p>';
  }
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
let _scrollSaveTimer;

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
        updateReadBtn();
      }

      // Persist scroll position (debounced)
      clearTimeout(_scrollSaveTimer);
      _scrollSaveTimer = setTimeout(() => {
        if (state.currentFilePath)
          localStorage.setItem(
            `scroll-${state.currentFilePath}`,
            window.scrollY
          );
      }, 400);
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
  if (!el) return;
  el.innerHTML = "";
  items.forEach((item, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "breadcrumb-sep";
      sep.textContent = "›";
      el.appendChild(sep);
    }
    const isLast = i === items.length - 1;
    if (isLast || !item.href) {
      const span = document.createElement("span");
      span.textContent = item.label;
      el.appendChild(span);
    } else {
      const a = document.createElement("a");
      a.className = "breadcrumb-link";
      a.href = item.href;
      a.textContent = item.label;
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
      const entries = [];
      for (const section of sections) {
        for (const card of section.cards) {
          entries.push({ wiki, section: section.heading, ...card });
        }
      }
      // Detect stubs concurrently — reuse readTimeCache if already populated
      await Promise.all(
        entries.map(async (entry) => {
          if (readTimeCache[entry.path] === undefined) {
            try {
              const md = await fetchText(entry.path);
              readTimeCache[entry.path] =
                md.length < STUB_THRESHOLD ? null : readingTime(md);
            } catch {
              readTimeCache[entry.path] = "";
            }
          }
        })
      );
      for (const entry of entries) {
        if (readTimeCache[entry.path] !== null) {
          allSearchCache.entries.push(entry);
        }
      }
    } catch {}
  }

  allSearchCache.loaded = true;
  allSearchCache.loading = false;
  applyGlobalSearch(gSearchInput.value);
}

let gSearchSelectedIdx = -1;

function gSearchItems() {
  return [...gSearchResults.querySelectorAll(".gsearch-result")];
}

function gSearchSelect(idx) {
  const items = gSearchItems();
  items.forEach((el) => el.classList.remove("selected"));
  if (idx < 0 || idx >= items.length) {
    gSearchSelectedIdx = -1;
    return;
  }
  gSearchSelectedIdx = idx;
  items[idx].classList.add("selected");
  items[idx].scrollIntoView({ block: "nearest" });
}

function openGlobalSearch() {
  gSearchModal.classList.remove("hidden");
  gSearchModal.setAttribute("aria-hidden", "false");
  gSearchInput.value = "";
  gSearchSelectedIdx = -1;
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
  gSearchSelectedIdx = -1;
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

gSearchInput.addEventListener("keydown", (e) => {
  const items = gSearchItems();
  if (!items.length) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    gSearchSelect(
      gSearchSelectedIdx < items.length - 1 ? gSearchSelectedIdx + 1 : 0
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    gSearchSelect(
      gSearchSelectedIdx > 0 ? gSearchSelectedIdx - 1 : items.length - 1
    );
  } else if (e.key === "Enter" && gSearchSelectedIdx >= 0) {
    e.preventDefault();
    items[gSearchSelectedIdx].click();
  }
});

gSearchBackdrop.addEventListener("click", closeGlobalSearch);
document
  .getElementById("settings-backdrop")
  .addEventListener("click", () => Settings.close());

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    openGlobalSearch();
  }
  if (e.key === "Escape") {
    if (!gSearchModal.classList.contains("hidden")) {
      closeGlobalSearch();
    } else if (Settings.isOpen()) {
      Settings.close();
    } else if (state.currentView === "content" && state.currentWikiId) {
      navigate(state.currentWikiId);
    }
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

function renderBookmarksSection(wiki) {
  const section = document.getElementById("bookmarks-section");
  if (!section) return;
  const bookmarks = getBookmarks().filter((b) => b.wikiId === wiki.id);
  if (!bookmarks.length) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");
  section.innerHTML = `
    <div class="recents-header">
      <span class="recents-label">Bookmarked</span>
      <button class="recents-clear-btn" onclick="Bookmarks.clearWiki('${
        wiki.id
      }')" title="Clear all">
        <svg viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="recents-strip">
      ${bookmarks
        .map(
          (b) => `
        <button class="recent-chip"
          onclick="navigateToContent('${b.wikiId}','${encodeURIComponent(
            b.path
          )}','${encodeURIComponent(b.title)}','${b.slug}')">
          ${escHtml(b.title)}
        </button>`
        )
        .join("")}
    </div>`;
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
    const wiki = WIKIS.find((w) => w.id === state.currentWikiId);
    if (wiki) renderBookmarksSection(wiki);
  },
  clearWiki(wikiId) {
    saveBookmarks(getBookmarks().filter((b) => b.wikiId !== wikiId));
    document.getElementById("bookmarks-section")?.classList.add("hidden");
  },
};

/* ═══════════════════════════════════════════════════════════════
   RECENTLY VISITED
   ═══════════════════════════════════════════════════════════════ */
const RECENTS_KEY = "wiki-recents";
const RECENTS_MAX = 6;

function getRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function addToRecents(entry) {
  let recents = getRecents().filter((r) => r.path !== entry.path);
  recents.unshift(entry);
  if (recents.length > RECENTS_MAX) recents = recents.slice(0, RECENTS_MAX);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}

function clearRecents(wikiId) {
  const remaining = getRecents().filter((r) => r.wikiId !== wikiId);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(remaining));
  document.getElementById("recents-section")?.classList.add("hidden");
}

function renderRecentsSection(wiki) {
  const section = document.getElementById("recents-section");
  if (!section) return;
  const recents = getRecents().filter((r) => r.wikiId === wiki.id);
  if (!recents.length) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");
  section.innerHTML = `
    <div class="recents-header">
      <span class="recents-label">Recently visited</span>
      <button class="recents-clear-btn" onclick="clearRecents('${
        wiki.id
      }')" title="Clear all">
        <svg viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="recents-strip">
      ${recents
        .map(
          (r) => `
        <button class="recent-chip"
          onclick="navigateToContent('${r.wikiId}','${encodeURIComponent(
            r.path
          )}','${encodeURIComponent(r.title)}','${r.slug}')">
          ${escHtml(r.title)}
        </button>`
        )
        .join("")}
    </div>`;
}

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
  document.querySelectorAll(`.index-card-read-dot`).forEach((dot) => {
    const card = dot.closest(".index-card");
    const timeBadge = card?.querySelector(".index-card-read-time");
    if (timeBadge?.dataset.path === path) dot.classList.add("visible");
  });
}

function markUnread(path) {
  const read = getReadSet();
  if (!read.has(path)) return;
  read.delete(path);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
  document.querySelectorAll(`.index-card-read-dot`).forEach((dot) => {
    const card = dot.closest(".index-card");
    const timeBadge = card?.querySelector(".index-card-read-time");
    if (timeBadge?.dataset.path === path) dot.classList.remove("visible");
  });
}

function updateReadBtn() {
  const btn = document.getElementById("content-read-btn");
  if (!btn || !state.currentFilePath) return;
  const read = isRead(state.currentFilePath);
  btn.classList.toggle("active", read);
  btn.title = read ? "Mark as unread" : "Mark as read";
}

const ReadToggle = {
  toggle() {
    const path = state.currentFilePath;
    if (!path) return;
    if (isRead(path)) {
      markUnread(path);
    } else {
      markRead(path);
    }
    updateReadBtn();
  },
};

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
   SETTINGS
   ═══════════════════════════════════════════════════════════════ */
const SETTINGS_KEY = "wiki-settings";

const FONT_OPTIONS = [
  { id: "Inter", label: "Inter" },
  { id: "Geist", label: "Geist" },
  { id: "IBM Plex Sans", label: "IBM Plex" },
  { id: "Lora", label: "Lora" },
  { id: "Source Serif 4", label: "Source Serif" },
  { id: "JetBrains Mono", label: "Mono" },
];

const ACCENT_OPTIONS = [
  {
    id: "indigo",
    value: "#6366f1",
    light: "#818cf8",
    dim: "rgba(99,102,241,0.12)",
    glow: "rgba(99,102,241,0.25)",
  },
  {
    id: "violet",
    value: "#8b5cf6",
    light: "#a78bfa",
    dim: "rgba(139,92,246,0.12)",
    glow: "rgba(139,92,246,0.25)",
  },
  {
    id: "blue",
    value: "#3b82f6",
    light: "#60a5fa",
    dim: "rgba(59,130,246,0.12)",
    glow: "rgba(59,130,246,0.25)",
  },
  {
    id: "cyan",
    value: "#06b6d4",
    light: "#22d3ee",
    dim: "rgba(6,182,212,0.12)",
    glow: "rgba(6,182,212,0.25)",
  },
  {
    id: "emerald",
    value: "#10b981",
    light: "#34d399",
    dim: "rgba(16,185,129,0.12)",
    glow: "rgba(16,185,129,0.25)",
  },
  {
    id: "amber",
    value: "#f59e0b",
    light: "#fbbf24",
    dim: "rgba(245,158,11,0.12)",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    id: "matrix",
    value: "#00ff41",
    light: "#39ff14",
    dim: "rgba(0,255,65,0.12)",
    glow: "rgba(0,255,65,0.3)",
  },
  {
    id: "neon-green",
    value: "#22c55e",
    light: "#4ade80",
    dim: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.25)",
  },
];

const SETTINGS_PRESETS = [
  {
    id: "dark",
    label: "Dark",
    theme: "dark",
    accentId: "indigo",
    font: "Inter",
    fontSize: "M",
  },
  {
    id: "light",
    label: "Light",
    theme: "light",
    accentId: "indigo",
    font: "Inter",
    fontSize: "M",
  },
  {
    id: "midnight",
    label: "Midnight",
    theme: "dark",
    accentId: "violet",
    font: "Geist",
    fontSize: "M",
  },
  {
    id: "warm",
    label: "Warm",
    theme: "dark",
    accentId: "amber",
    font: "Lora",
    fontSize: "M",
  },
  {
    id: "ocean",
    label: "Ocean",
    theme: "dark",
    accentId: "cyan",
    font: "IBM Plex Sans",
    fontSize: "M",
  },
  {
    id: "forest",
    label: "Forest",
    theme: "light",
    accentId: "emerald",
    font: "Source Serif 4",
    fontSize: "M",
  },
  {
    id: "matrix",
    label: "Matrix",
    theme: "matrix",
    accentId: "matrix",
    font: "JetBrains Mono",
    fontSize: "M",
  },
  {
    id: "terminal",
    label: "Terminal",
    theme: "terminal",
    accentId: "neon-green",
    font: "JetBrains Mono",
    fontSize: "M",
  },
  {
    id: "amber-crt",
    label: "Amber CRT",
    theme: "amber-term",
    accentId: "amber",
    font: "JetBrains Mono",
    fontSize: "M",
  },
];

const DEFAULT_SETTINGS = {
  preset: "dark",
  theme: "dark",
  accentId: "indigo",
  font: "Inter",
  fontSize: "M",
  contentWidth: "Default",
};

function getSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (stored) return { ...DEFAULT_SETTINGS, ...stored };
  } catch {}

  const oldTheme = localStorage.getItem("wiki-theme");
  if (oldTheme) {
    return {
      ...DEFAULT_SETTINGS,
      theme: oldTheme,
      preset: oldTheme === "dark" ? "dark" : "light",
    };
  }

  // OS theme detection on first visit
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  const theme = prefersLight ? "light" : "dark";
  return { ...DEFAULT_SETTINGS, theme, preset: theme };
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function accentById(id) {
  return ACCENT_OPTIONS.find((a) => a.id === id) || ACCENT_OPTIONS[0];
}

function applySettingsToDOM(s) {
  const theme = s.theme || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme !== "light";
  document
    .querySelectorAll(".theme-icon-moon")
    .forEach((el) => (el.style.display = isDark ? "" : "none"));
  document
    .querySelectorAll(".theme-icon-sun")
    .forEach((el) => (el.style.display = isDark ? "none" : ""));

  const accent = accentById(s.accentId);
  const root = document.documentElement.style;
  root.setProperty("--accent", accent.value);
  root.setProperty("--accent-light", accent.light);
  root.setProperty("--accent-dim", accent.dim);
  root.setProperty("--accent-glow", accent.glow);

  const font = s.font || "Inter";
  const isSerif = font === "Lora" || font === "Source Serif 4";
  const isMono = font === "JetBrains Mono";
  const fallback = isSerif
    ? "Georgia, serif"
    : isMono
    ? "monospace"
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  root.setProperty("--font", `"${font}", ${fallback}`);

  const sizes = { S: "14px", M: "16px", L: "18px" };
  document.documentElement.style.fontSize = sizes[s.fontSize] || "16px";

  const widths = { Narrow: "68ch", Default: "80ch", Wide: "120ch" };
  root.setProperty("--content-width", widths[s.contentWidth] || "80ch");
}

const Settings = {
  open() {
    this._render();
    const panel = document.getElementById("settings-panel");
    panel.classList.remove("hidden");
    panel.setAttribute("aria-hidden", "false");
  },

  close() {
    const panel = document.getElementById("settings-panel");
    panel.classList.add("hidden");
    panel.setAttribute("aria-hidden", "true");
  },

  isOpen() {
    return !document
      .getElementById("settings-panel")
      .classList.contains("hidden");
  },

  _render() {
    const s = getSettings();
    this._renderPresets(s);
    this._renderTheme(s);
    this._renderFonts(s);
    this._renderSizes(s);
    this._renderWidths(s);
    this._renderAccents(s);
  },

  _renderPresets(s) {
    document.getElementById("settings-presets").innerHTML =
      SETTINGS_PRESETS.map((p) => {
        const accent = accentById(p.accentId);
        const active = s.preset === p.id ? " active" : "";
        return `<button class="settings-preset-card${active}" onclick="Settings._applyPreset('${p.id}')">
        <span class="settings-preset-swatch" style="background:${accent.value}"></span>
        <span class="settings-preset-name">${p.label}</span>
      </button>`;
      }).join("");
  },

  _renderTheme(s) {
    document.getElementById("settings-themes").innerHTML = ["light", "dark"]
      .map((t) => {
        const active = s.theme === t ? " active" : "";
        return `<button class="settings-size-btn${active}" onclick="Settings._setTheme('${t}')">${
          t === "light" ? "Light" : "Dark"
        }</button>`;
      })
      .join("");
  },

  _setTheme(theme) {
    const s = { ...getSettings(), theme, preset: "custom" };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _renderFonts(s) {
    document.getElementById("settings-fonts").innerHTML = FONT_OPTIONS.map(
      (f) => {
        const active = s.font === f.id ? " active" : "";
        return `<button class="settings-font-chip${active}" style="font-family:'${f.id}',sans-serif" onclick="Settings._setFont('${f.id}')">${f.label}</button>`;
      }
    ).join("");
  },

  _renderSizes(s) {
    document.getElementById("settings-sizes").innerHTML = ["S", "M", "L"]
      .map((sz) => {
        const active = s.fontSize === sz ? " active" : "";
        return `<button class="settings-size-btn${active}" onclick="Settings._setSize('${sz}')">${sz}</button>`;
      })
      .join("");
  },

  _renderWidths(s) {
    document.getElementById("settings-widths").innerHTML = [
      "Narrow",
      "Default",
      "Wide",
    ]
      .map((w) => {
        const active = s.contentWidth === w ? " active" : "";
        return `<button class="settings-size-btn${active}" onclick="Settings._setWidth('${w}')">${w}</button>`;
      })
      .join("");
  },

  _setWidth(contentWidth) {
    const s = { ...getSettings(), contentWidth, preset: "custom" };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _renderAccents(s) {
    document.getElementById("settings-accents").innerHTML = ACCENT_OPTIONS.map(
      (a) => {
        const active = s.accentId === a.id ? " active" : "";
        return `<button class="settings-accent-swatch${active}" style="background:${a.value}" title="${a.id}" onclick="Settings._setAccent('${a.id}')"></button>`;
      }
    ).join("");
  },

  _applyPreset(presetId) {
    const preset = SETTINGS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const s = {
      preset: presetId,
      theme: preset.theme,
      accentId: preset.accentId,
      font: preset.font,
      fontSize: preset.fontSize,
    };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setFont(font) {
    const s = { ...getSettings(), font, preset: "custom" };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setSize(fontSize) {
    const s = { ...getSettings(), fontSize, preset: "custom" };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setAccent(accentId) {
    const s = { ...getSettings(), accentId, preset: "custom" };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  exportData() {
    const data = {
      bookmarks: localStorage.getItem("wiki-bookmarks"),
      recents: localStorage.getItem("wiki-recents"),
      read: localStorage.getItem("wiki-read"),
      settings: localStorage.getItem("wiki-settings"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wiki-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.bookmarks)
          localStorage.setItem("wiki-bookmarks", data.bookmarks);
        if (data.recents) localStorage.setItem("wiki-recents", data.recents);
        if (data.read) localStorage.setItem("wiki-read", data.read);
        if (data.settings) localStorage.setItem("wiki-settings", data.settings);

        alert("Data imported successfully! The app will now reload.");
        location.reload();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
    // Reset input so it can be triggered again
    event.target.value = "";
  },
};

/* ═══════════════════════════════════════════════════════════════
   THEME (light / dark)
   ═══════════════════════════════════════════════════════════════ */
const Theme = {
  toggle() {
    const s = getSettings();
    const newTheme = s.theme === "dark" ? "light" : "dark";
    const updated = { ...s, theme: newTheme, preset: "custom" };
    saveSettings(updated);
    applySettingsToDOM(updated);
  },
};

/* Public API for onclick handlers in HTML */
const Wiki = { goHome: () => navigate("") };
const GlobalSearch = { open: openGlobalSearch, close: closeGlobalSearch };

/* ═══════════════════════════════════════════════════════════════
   INIT — parse hash on load
   ═══════════════════════════════════════════════════════════════ */
(function init() {
  applySettingsToDOM(getSettings());

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
