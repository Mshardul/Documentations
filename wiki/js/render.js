import {
  WIKIS,
  state,
  indexCache,
  readTimeCache,
  STUB_THRESHOLD,
  mdConverter,
  escHtml,
  fuzzyMatch,
} from "./state.js";
import {
  addToRecents,
  updateBookmarkBtn,
  updateReadBtn,
  updateOfflineBtn,
  renderBookmarksSection,
  renderRecentsSection,
  isRead,
} from "./storage.js";
import {
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
  addTableScrollCues,
  cleanupFocusMode,
} from "./content.js";

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

  if (id !== "view-index") window.scrollTo(0, 0);

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
    updatePageTitle("Home");
    renderHome();
    return;
  }

  const wikiId = parts[0];
  const wiki = WIKIS.find((w) => w.id === wikiId);
  if (!wiki) {
    updatePageTitle("Not Found");
    // If history is shallow, strip bad hash to prevent back-button traps
    if (history.length <= 2) history.replaceState(null, "", location.pathname);
    renderHome();
    return;
  }

  if (parts.length === 1) {
    updatePageTitle(wiki.title);
    renderIndex(wiki);
    return;
  }

  // Content view
  const slug = parts[1];
  const savedPath = history.state?.filePath;
  const savedTitle = history.state?.title;
  if (savedPath) {
    renderContent(wiki, savedPath, savedTitle || slug);
  } else {
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
  } catch {}

  // Slug not found fallback
  updatePageTitle("Not Found");
  if (history.length <= 2) history.replaceState(null, "", location.pathname);
  renderHome();
}

/* ═══════════════════════════════════════════════════════════════
   VIEW 1 - HOME
   ═══════════════════════════════════════════════════════════════ */
function renderHome() {
  const grid = document.getElementById("wiki-grid");
  grid.innerHTML = WIKIS.map(
    (w) => `
    <div class="wiki-card" data-wiki-id="${w.id}" onclick="navigate('${w.id}')" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navigate('${w.id}')}">
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
   VIEW 2 - WIKI INDEX
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

    sectionsEl.classList.add("index-sections--loading");
    await populateIndexReadTimes();
    sectionsEl.classList.remove("index-sections--loading");

    const savedScroll = localStorage.getItem(`wiki-index-scroll-${wiki.id}`);
    if (savedScroll)
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
  } catch (err) {
    sectionsEl.innerHTML = `<p class="error">Failed to load index. (${err.message})</p>`;
  }
}

function renderIndexSections(sections, wiki) {
  const container = document.getElementById("index-sections");
  container.innerHTML = sections
    .map((section) => {
      const collapseKey = `wiki-section-collapsed-${wiki.id}-${section.heading}`;
      const isCollapsed = !!localStorage.getItem(collapseKey);
      const escapedHeading = section.heading
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
      return `
    <div class="index-section${
      isCollapsed ? " section--collapsed" : ""
    }" data-section="${escHtml(section.heading)}">
      <div class="section-header"
           role="button" tabindex="0"
           onclick="toggleSection(this,'${wiki.id}','${escapedHeading}')"
           onkeydown="if(event.key==='Enter'||event.key===' '){toggleSection(this,'${
             wiki.id
           }','${escapedHeading}');event.preventDefault()}">
        <h2 class="section-title">${escHtml(section.heading)}</h2>
        <span class="section-count">${section.cards.length}</span>
        <span class="section-chevron">›</span>
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
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">
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
  `;
    })
    .join("");
}

function toggleSection(headerEl, wikiId, heading) {
  const section = headerEl.closest(".index-section");
  const isCollapsed = section.classList.toggle("section--collapsed");
  const key = `wiki-section-collapsed-${wikiId}-${heading}`;
  if (isCollapsed) {
    localStorage.setItem(key, "1");
  } else {
    localStorage.removeItem(key);
  }
}

/* ─── Reading time ─── */
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

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
async function fetchWikiIndex(wiki) {
  if (indexCache[wiki.id]) return indexCache[wiki.id];
  const ssKey = `wiki-index-${wiki.id}`;
  try {
    const hit = sessionStorage.getItem(ssKey);
    if (hit) {
      indexCache[wiki.id] = JSON.parse(hit);
      return indexCache[wiki.id];
    }
  } catch {}
  const md = await fetchText(wiki.indexPath);
  const basePath = dirOf(wiki.indexPath);
  const sections = parseIndexMd(md, basePath);
  indexCache[wiki.id] = sections;
  try {
    sessionStorage.setItem(ssKey, JSON.stringify(sections));
  } catch {}
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

/* ═══════════════════════════════════════════════════════════════
   VIEW 3 - CONTENT
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

  updatePageTitle(title);

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

  // Clear old observers and modes
  if (state.tocObserver) {
    state.tocObserver.disconnect();
    state.tocObserver = null;
  }
  cleanupFocusMode();
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

    // Code language labels + collapsible long blocks
    addCodeLangLabels(body);
    addCollapsibleCodeBlocks(body);

    // Image lightbox + diagram zoom + table scroll cues
    addImageLightbox(body);
    addDiagramZoom(body);
    addTableScrollCues(body);

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

    // Wait for images to settle layout before restoring scroll
    const imgs = [...body.querySelectorAll("img")];
    if (imgs.length) {
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((r) => {
                img.onload = r;
                img.onerror = r;
              })
        )
      );
    }

    const anchor = new URLSearchParams(location.search).get("a");
    if (anchor) {
      const target = body.querySelector(`[id="${CSS.escape(anchor)}"]`);
      if (target)
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            target.scrollIntoView({ behavior: "smooth", block: "start" })
          )
        );
    } else {
      const saved = localStorage.getItem(`scroll-${filePath}`);
      if (saved)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)))
        );
    }
  } catch (err) {
    body.innerHTML = `<p class="error">Failed to load content. (${err.message})</p>`;
  }
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

/* ─── Dynamic Page Title ─── */
function updatePageTitle(title) {
  document.title = `${title} | Wiki App`;
}

/* ─── Robust Relative Path Resolver ─── */
function resolvePath(baseDir, relHref) {
  const baseParts = baseDir.split("/");
  const relParts = relHref.split("/");
  const stack = [];

  for (const p of baseParts) if (p) stack.push(p);
  for (const p of relParts) {
    if (p === "..") stack.pop();
    else if (p && p !== ".") stack.push(p);
  }
  return stack.join("/");
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
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">
            <span class="related-card-title">${escHtml(card.title)}</span>
            <span class="related-card-arrow">→</span>
          </div>`
          )
          .join("")}
      </div>`;
  } catch {}
}

export {
  progressBar,
  showView,
  navigate,
  route,
  resolveSlugAndRender,
  renderHome,
  renderIndex,
  renderIndexSections,
  readingTime,
  populateIndexReadTimes,
  fetchWikiIndex,
  updateArticleCounts,
  parseIndexMd,
  navigateToContent,
  renderContent,
  interceptMdLinks,
  showHoverPreview,
  setBreadcrumb,
  fetchText,
  dirOf,
  updatePageTitle,
  resolvePath,
  renderRelatedArticles,
  toggleSection,
};
