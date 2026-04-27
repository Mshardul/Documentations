import { state, WIKIS, escHtml } from "./state.js";

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

export {
  getBookmarks,
  saveBookmarks,
  isBookmarked,
  updateBookmarkBtn,
  renderBookmarksSection,
  Bookmarks,
  getRecents,
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
  accentById,
  applySettingsToDOM,
  Settings,
  Theme,
};
