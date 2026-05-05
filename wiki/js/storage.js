import { state, WIKIS, escHtml } from "./state.js";

/* ═══════════════════════════════════════════════════════════════
   SCROLL CACHE EVICTION (WIKI-065)
   ═══════════════════════════════════════════════════════════════ */
const SCROLL_KEYS_MANIFEST = "wiki-scroll-keys";
const SCROLL_CACHE_MAX = 50;

function saveScrollPos(key, value) {
  let keys;
  try {
    keys = JSON.parse(localStorage.getItem(SCROLL_KEYS_MANIFEST) || "[]");
  } catch {
    keys = [];
  }
  keys = keys.filter((k) => k !== key);
  keys.unshift(key);
  while (keys.length > SCROLL_CACHE_MAX) {
    localStorage.removeItem(keys.pop());
  }
  localStorage.setItem(SCROLL_KEYS_MANIFEST, JSON.stringify(keys));
  localStorage.setItem(key, value);
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
      <button class="recents-clear-btn" onclick="confirmClearBookmarks('${
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

function saveRecents(arr) {
  localStorage.setItem(RECENTS_KEY, JSON.stringify(arr));
}

function clearRecents(wikiId) {
  const remaining = getRecents().filter((r) => r.wikiId !== wikiId);
  saveRecents(remaining);
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
      <button class="recents-clear-btn" onclick="confirmClearRecents('${
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
  btn.title = cached ? "Saved offline - click to remove" : "Save for offline";
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

const DARK_BACKGROUNDS = [
  {
    id: "dark-void",
    label: "Void",
    bg: "#0d1117",
    surface: "#151e2b",
    surface2: "#1c2640",
    surface3: "#232f4f",
    border: "#1e2d45",
    border2: "#27395a",
    translucent: "rgba(13,17,23,0.88)",
  },
  {
    id: "dark-slate",
    label: "Slate",
    bg: "#131929",
    surface: "#1a2236",
    surface2: "#222c44",
    surface3: "#2a3652",
    border: "#2a3652",
    border2: "#334060",
    translucent: "rgba(19,25,41,0.88)",
  },
  {
    id: "dark-dusk",
    label: "Dusk",
    bg: "#1a1528",
    surface: "#231d37",
    surface2: "#2c2545",
    surface3: "#352d53",
    border: "#352d53",
    border2: "#433860",
    translucent: "rgba(26,21,40,0.88)",
  },
];

const LIGHT_BACKGROUNDS = [
  {
    id: "light-white",
    label: "White",
    bg: "#f8fafc",
    surface: "#ffffff",
    surface2: "#f1f5f9",
    surface3: "#e2e8f0",
    border: "#e2e8f0",
    border2: "#cbd5e1",
    translucent: "rgba(248,250,252,0.92)",
  },
  {
    id: "light-cream",
    label: "Cream",
    bg: "#faf7f0",
    surface: "#ffffff",
    surface2: "#f5f0e6",
    surface3: "#ece5d8",
    border: "#e8e0d0",
    border2: "#d8ccbc",
    translucent: "rgba(250,247,240,0.92)",
  },
  {
    id: "light-fog",
    label: "Fog",
    bg: "#eef2f7",
    surface: "#f8fafc",
    surface2: "#e4eaf2",
    surface3: "#d6e0eb",
    border: "#c8d6e8",
    border2: "#b8c8d8",
    translucent: "rgba(238,242,247,0.92)",
  },
];

const DARK_TEXT_COLORS = [
  {
    id: "text-crisp-dark",
    label: "Crisp",
    heading: "#f1f5f9",
    body: "#cbd5e1",
  },
  { id: "text-soft-dark", label: "Soft", heading: "#b8cce0", body: "#8aa8c0" },
  { id: "text-warm-dark", label: "Warm", heading: "#e8d4b8", body: "#c4a882" },
];

const LIGHT_TEXT_COLORS = [
  {
    id: "text-crisp-light",
    label: "Crisp",
    heading: "#0f172a",
    body: "#334155",
  },
  { id: "text-soft-light", label: "Soft", heading: "#1e3050", body: "#476080" },
  { id: "text-warm-light", label: "Warm", heading: "#3d2c1e", body: "#6b503c" },
];

const DARK_ACCENTS = [
  {
    id: "indigo",
    label: "Indigo",
    value: "#6366f1",
    light: "#818cf8",
    dim: "rgba(99,102,241,0.12)",
    glow: "rgba(99,102,241,0.25)",
  },
  {
    id: "cyan",
    label: "Cyan",
    value: "#06b6d4",
    light: "#22d3ee",
    dim: "rgba(6,182,212,0.12)",
    glow: "rgba(6,182,212,0.25)",
  },
  {
    id: "emerald",
    label: "Emerald",
    value: "#10b981",
    light: "#34d399",
    dim: "rgba(16,185,129,0.12)",
    glow: "rgba(16,185,129,0.25)",
  },
];

const LIGHT_ACCENTS = [
  {
    id: "indigo-l",
    label: "Indigo",
    value: "#4f46e5",
    light: "#6366f1",
    dim: "rgba(79,70,229,0.1)",
    glow: "rgba(79,70,229,0.2)",
  },
  {
    id: "blue-l",
    label: "Blue",
    value: "#2563eb",
    light: "#3b82f6",
    dim: "rgba(37,99,235,0.1)",
    glow: "rgba(37,99,235,0.2)",
  },
  {
    id: "violet-l",
    label: "Violet",
    value: "#7c3aed",
    light: "#8b5cf6",
    dim: "rgba(124,58,237,0.1)",
    glow: "rgba(124,58,237,0.2)",
  },
];

const DEFAULT_SETTINGS = {
  backgroundId: "dark-void",
  textColorId: "text-crisp-dark",
  accentId: "indigo",
  font: "Inter",
  fontSize: "M",
  contentWidth: "Default",
};

function _isDark(backgroundId) {
  return !backgroundId.startsWith("light-");
}

function getSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (stored?.backgroundId) return { ...DEFAULT_SETTINGS, ...stored };
  } catch {}

  // First visit or unrecognized format: use OS preference
  const prefersLight = window.matchMedia?.(
    "(prefers-color-scheme: light)"
  ).matches;
  return prefersLight
    ? {
        ...DEFAULT_SETTINGS,
        backgroundId: "light-white",
        textColorId: "text-crisp-light",
        accentId: "indigo-l",
      }
    : { ...DEFAULT_SETTINGS };
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function applySettingsToDOM(s) {
  const dark = _isDark(s.backgroundId);
  const theme = dark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);

  document
    .querySelectorAll(".theme-icon-moon")
    .forEach((el) => (el.style.display = dark ? "" : "none"));
  document
    .querySelectorAll(".theme-icon-sun")
    .forEach((el) => (el.style.display = dark ? "none" : ""));

  const bgList = dark ? DARK_BACKGROUNDS : LIGHT_BACKGROUNDS;
  const bg = bgList.find((b) => b.id === s.backgroundId) || bgList[0];
  const root = document.documentElement.style;
  root.setProperty("--bg", bg.bg);
  root.setProperty("--surface", bg.surface);
  root.setProperty("--surface-2", bg.surface2);
  root.setProperty("--surface-3", bg.surface3);
  root.setProperty("--border", bg.border);
  root.setProperty("--border-2", bg.border2);
  root.setProperty("--bg-translucent", bg.translucent);

  const tcList = dark ? DARK_TEXT_COLORS : LIGHT_TEXT_COLORS;
  const tc = tcList.find((t) => t.id === s.textColorId) || tcList[0];
  root.setProperty("--text-heading", tc.heading);
  root.setProperty("--text-body", tc.body);

  const accentList = dark ? DARK_ACCENTS : LIGHT_ACCENTS;
  const accent = accentList.find((a) => a.id === s.accentId) || accentList[0];
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

  document.dispatchEvent(
    new CustomEvent("wiki:themechange", { detail: { theme } })
  );
}

const Settings = {
  _lastFocus: null,
  _focusTrapHandler: null,

  open() {
    this._lastFocus = document.activeElement;
    this._render();
    const panel = document.getElementById("settings-panel");
    panel.classList.remove("hidden");
    panel.setAttribute("aria-hidden", "false");

    const focusable = this._getFocusable();
    if (focusable.length) focusable[0].focus();

    this._focusTrapHandler = (e) => {
      if (e.key !== "Tab") return;
      const els = this._getFocusable();
      if (!els.length) return;
      if (e.shiftKey) {
        if (document.activeElement === els[0]) {
          e.preventDefault();
          els[els.length - 1].focus();
        }
      } else {
        if (document.activeElement === els[els.length - 1]) {
          e.preventDefault();
          els[0].focus();
        }
      }
    };
    panel.addEventListener("keydown", this._focusTrapHandler);
  },

  close() {
    const panel = document.getElementById("settings-panel");
    if (this._focusTrapHandler) {
      panel.removeEventListener("keydown", this._focusTrapHandler);
      this._focusTrapHandler = null;
    }
    panel.classList.add("hidden");
    panel.setAttribute("aria-hidden", "true");
    if (this._lastFocus && typeof this._lastFocus.focus === "function") {
      this._lastFocus.focus();
      this._lastFocus = null;
    }
  },

  isOpen() {
    return !document
      .getElementById("settings-panel")
      .classList.contains("hidden");
  },

  _getFocusable() {
    const panel = document.getElementById("settings-panel");
    return [
      ...panel.querySelectorAll(
        "button:not([disabled]), input:not([disabled])"
      ),
    ].filter((el) => el.offsetParent !== null && el.style.display !== "none");
  },

  _render() {
    const s = getSettings();
    this._renderBackgrounds(s);
    this._renderTextColors(s);
    this._renderAccents(s);
    this._renderFonts(s);
    this._renderSizes(s);
    this._renderWidths(s);
  },

  _renderBackgrounds(s) {
    const mkSwatch = (bg) =>
      `<button class="settings-bg-swatch${
        s.backgroundId === bg.id ? " active" : ""
      }"` +
      ` style="background:${bg.bg}" title="${bg.label}" aria-label="${bg.label} background"` +
      ` onclick="Settings._setBackground('${bg.id}')"></button>`;
    document.getElementById("settings-backgrounds").innerHTML =
      DARK_BACKGROUNDS.map(mkSwatch).join("") +
      `<div class="settings-bg-separator" aria-hidden="true"></div>` +
      LIGHT_BACKGROUNDS.map(mkSwatch).join("");
  },

  _renderTextColors(s) {
    const options = _isDark(s.backgroundId)
      ? DARK_TEXT_COLORS
      : LIGHT_TEXT_COLORS;
    document.getElementById("settings-text-colors").innerHTML = options
      .map(
        (tc) =>
          `<button class="settings-text-swatch${
            s.textColorId === tc.id ? " active" : ""
          }"` +
          ` title="${tc.label}" aria-label="${tc.label} text"` +
          ` onclick="Settings._setTextColor('${tc.id}')">` +
          `<div class="settings-text-swatch-head" style="background:${tc.heading}"></div>` +
          `<div class="settings-text-swatch-body" style="background:${tc.body}"></div>` +
          `</button>`
      )
      .join("");
  },

  _renderAccents(s) {
    const accents = _isDark(s.backgroundId) ? DARK_ACCENTS : LIGHT_ACCENTS;
    document.getElementById("settings-accents").innerHTML = accents
      .map(
        (a) =>
          `<button class="settings-accent-swatch${
            s.accentId === a.id ? " active" : ""
          }"` +
          ` style="background:${a.value}" title="${a.label}" aria-label="${a.label} accent"` +
          ` onclick="Settings._setAccent('${a.id}')"></button>`
      )
      .join("");
  },

  _renderFonts(s) {
    document.getElementById("settings-fonts").innerHTML = FONT_OPTIONS.map(
      (f) =>
        `<button class="settings-font-chip${
          s.font === f.id ? " active" : ""
        }"` +
        ` style="font-family:'${f.id}',sans-serif"` +
        ` onclick="Settings._setFont('${f.id}')">${f.label}</button>`
    ).join("");
  },

  _renderSizes(s) {
    document.getElementById("settings-sizes").innerHTML = ["S", "M", "L"]
      .map(
        (sz) =>
          `<button class="settings-size-btn${
            s.fontSize === sz ? " active" : ""
          }"` + ` onclick="Settings._setSize('${sz}')">${sz}</button>`
      )
      .join("");
  },

  _renderWidths(s) {
    document.getElementById("settings-widths").innerHTML = [
      "Narrow",
      "Default",
      "Wide",
    ]
      .map(
        (w) =>
          `<button class="settings-size-btn${
            s.contentWidth === w ? " active" : ""
          }"` + ` onclick="Settings._setWidth('${w}')">${w}</button>`
      )
      .join("");
  },

  _setBackground(backgroundId) {
    const s = getSettings();
    const wasDark = _isDark(s.backgroundId);
    const nowDark = _isDark(backgroundId);
    let { textColorId, accentId } = s;
    if (wasDark !== nowDark) {
      textColorId = nowDark ? "text-crisp-dark" : "text-crisp-light";
      accentId = nowDark ? "indigo" : "indigo-l";
    }
    const updated = { ...s, backgroundId, textColorId, accentId };
    saveSettings(updated);
    applySettingsToDOM(updated);
    this._render();
  },

  _setTextColor(textColorId) {
    const s = { ...getSettings(), textColorId };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setAccent(accentId) {
    const s = { ...getSettings(), accentId };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setFont(font) {
    const s = { ...getSettings(), font };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setSize(fontSize) {
    const s = { ...getSettings(), fontSize };
    saveSettings(s);
    applySettingsToDOM(s);
    this._render();
  },

  _setWidth(contentWidth) {
    const s = { ...getSettings(), contentWidth };
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
   THEME (quick dark / light toggle)
   ═══════════════════════════════════════════════════════════════ */
const Theme = {
  toggle() {
    const s = getSettings();
    const next = _isDark(s.backgroundId)
      ? {
          backgroundId: "light-white",
          textColorId: "text-crisp-light",
          accentId: "indigo-l",
        }
      : {
          backgroundId: "dark-void",
          textColorId: "text-crisp-dark",
          accentId: "indigo",
        };
    saveSettings({ ...s, ...next });
    applySettingsToDOM({ ...s, ...next });
  },
};

export {
  saveScrollPos,
  getBookmarks,
  saveBookmarks,
  isBookmarked,
  updateBookmarkBtn,
  renderBookmarksSection,
  Bookmarks,
  getRecents,
  saveRecents,
  addToRecents,
  clearRecents,
  renderRecentsSection,
  getReadSet,
  isRead,
  markRead,
  markUnread,
  updateReadBtn,
  ReadToggle,
  downloadArticle,
  removeArticleDownload,
  isArticleCached,
  updateOfflineBtn,
  Offline,
  getSettings,
  saveSettings,
  applySettingsToDOM,
  Settings,
  Theme,
};
