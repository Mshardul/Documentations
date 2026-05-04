import { state } from "./state.js";
import {
  applySettingsToDOM,
  getSettings,
  Settings,
  Bookmarks,
  ReadToggle,
  Offline,
  Theme,
  clearRecents,
  markRead,
  updateReadBtn,
  saveScrollPos,
} from "./storage.js";
import {
  progressBar,
  navigate,
  route,
  navigateToContent,
  toggleSection,
} from "./render.js";
import { openGlobalSearch, closeGlobalSearch } from "./search.js";
import {
  closeZoomOverlay,
  rerenderMermaidDiagrams,
  toggleFocusMode,
} from "./content.js";

/* ═══════════════════════════════════════════════════════════════
   WINDOW GLOBALS - required for onclick strings in dynamically
   built innerHTML throughout the app (render.js, storage.js)
   ═══════════════════════════════════════════════════════════════ */
window.state = state;
window.Settings = Settings;
window.Bookmarks = Bookmarks;
window.navigate = navigate;
window.navigateToContent = navigateToContent;
window.toggleSection = toggleSection;
window.clearRecents = clearRecents;
window.closeGlobalSearch = closeGlobalSearch;

/* ═══════════════════════════════════════════════════════════════
   DATA-ACTION DELEGATION (WIKI-063)
   Handles all static button actions from index.html
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  switch (btn.dataset.action) {
    case "search-open":
      openGlobalSearch();
      break;
    case "theme-toggle":
      Theme.toggle();
      break;
    case "settings-open":
      Settings.open();
      break;
    case "settings-close":
      Settings.close();
      break;
    case "wiki-home":
      navigate("");
      break;
    case "read-toggle":
      ReadToggle.toggle();
      break;
    case "bookmark-toggle":
      Bookmarks.toggle();
      break;
    case "offline-toggle":
      Offline.toggle();
      break;
    case "settings-export":
      Settings.exportData();
      break;
    case "import-trigger":
      document.getElementById("import-upload").click();
      break;
  }
});

document
  .getElementById("import-upload")
  .addEventListener("change", (e) => Settings.importData(e));

/* ═══════════════════════════════════════════════════════════════
   TOC COLLAPSE & MOBILE TOC
   ═══════════════════════════════════════════════════════════════ */
document.getElementById("toc-collapse").addEventListener("click", () => {
  document.getElementById("toc-sidebar").classList.toggle("collapsed");
});

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
document.getElementById("toc-nav").addEventListener("click", (e) => {
  if (e.target.closest(".toc-item")) {
    tocSidebar.classList.remove("mobile-open");
    tocMobileOverlay.classList.remove("open");
  }
});

/* ═══════════════════════════════════════════════════════════════
   SCROLL TO TOP
   ═══════════════════════════════════════════════════════════════ */
const scrollTopBtn = document.getElementById("scroll-top");
let _scrollSaveTimer;
let _indexScrollTimer;

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
          saveScrollPos(`scroll-${state.currentFilePath}`, window.scrollY);
      }, 400);
    }

    if (state.currentView === "index" && state.currentWikiId) {
      clearTimeout(_indexScrollTimer);
      _indexScrollTimer = setTimeout(() => {
        saveScrollPos(
          `wiki-index-scroll-${state.currentWikiId}`,
          window.scrollY
        );
      }, 300);
    }
  },
  { passive: true }
);

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ═══════════════════════════════════════════════════════════════
   MODAL BACKDROP & GLOBAL KEYDOWN
   ═══════════════════════════════════════════════════════════════ */
document
  .getElementById("settings-backdrop")
  .addEventListener("click", () => Settings.close());

document.addEventListener("keydown", (e) => {
  // ⌘K: Global Search
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    openGlobalSearch();
  }

  // Escape: Close modals or navigate back from content
  if (e.key === "Escape") {
    if (document.getElementById("zoom-overlay")?.classList.contains("open")) {
      closeZoomOverlay();
    } else if (
      !document
        .getElementById("global-search-modal")
        .classList.contains("hidden")
    ) {
      closeGlobalSearch();
    } else if (Settings.isOpen()) {
      Settings.close();
    } else if (state.currentView === "content" && state.currentWikiId) {
      navigate(state.currentWikiId);
    }
  }

  // Keyboard shortcuts for content view (when not focused on input/textarea)
  if (state.currentView === "content") {
    const tag = document.activeElement.tagName;
    const isInput =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      document.activeElement.isContentEditable;
    if (!isInput) {
      if (e.key === "b" || e.key === "B") {
        Bookmarks.toggle();
        e.preventDefault();
      }
      if (e.key === ",") {
        Settings.isOpen() ? Settings.close() : Settings.open();
        e.preventDefault();
      }
      if (e.key === "f" || e.key === "F") {
        toggleFocusMode();
        e.preventDefault();
      }
    }
  }
});

/* ═══════════════════════════════════════════════════════════════
   DIAGRAM THEME SYNC (WIKI-039)
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("wiki:themechange", rerenderMermaidDiagrams);

/* ═══════════════════════════════════════════════════════════════
   HASH ROUTER EVENT WIRING
   ═══════════════════════════════════════════════════════════════ */
window.addEventListener("popstate", (e) => {
  const hash = e.state?.hash ?? location.hash.slice(1);
  route(hash);
});

window.addEventListener("hashchange", () => {
  route(location.hash.slice(1));
});

/* ═══════════════════════════════════════════════════════════════
   INIT - parse hash on load
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
