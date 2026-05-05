import { state, WIKIS } from "./state.js";
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
  getRecents,
  saveRecents,
  getBookmarks,
  saveBookmarks,
  renderRecentsSection,
  renderBookmarksSection,
} from "./storage.js";
import {
  progressBar,
  navigate,
  route,
  navigateToContent,
  toggleSection,
  showToast,
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

window.confirmClearRecents = (wikiId) => {
  const snapshot = getRecents().filter((r) => r.wikiId === wikiId);
  clearRecents(wikiId);
  showToast("Recents cleared", 4000, () => {
    saveRecents([...snapshot, ...getRecents()]);
    const wiki = WIKIS.find((w) => w.id === wikiId);
    if (wiki) renderRecentsSection(wiki);
  });
};

window.confirmClearBookmarks = (wikiId) => {
  const snapshot = getBookmarks().filter((b) => b.wikiId === wikiId);
  Bookmarks.clearWiki(wikiId);
  showToast("Bookmarks cleared", 4000, () => {
    saveBookmarks([...snapshot, ...getBookmarks()]);
    const wiki = WIKIS.find((w) => w.id === wikiId);
    if (wiki) renderBookmarksSection(wiki);
  });
};

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
    case "focus-toggle":
      toggleFocusMode();
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

  // ?: Help modal (when not focused on input/textarea)
  if (e.key === "?") {
    const tag = document.activeElement.tagName;
    const isInput =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      document.activeElement.isContentEditable;
    if (!isInput) {
      e.preventDefault();
      const helpModal = document.getElementById("help-modal");
      if (helpModal && !helpModal.classList.contains("hidden")) {
        closeHelp();
      } else {
        openHelp();
      }
    }
  }

  // Escape: Close modals or navigate back from content
  if (e.key === "Escape") {
    const helpModal = document.getElementById("help-modal");
    if (helpModal && !helpModal.classList.contains("hidden")) {
      closeHelp();
    } else if (
      document.getElementById("zoom-overlay")?.classList.contains("open")
    ) {
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
      if (e.key === "t" || e.key === "T") {
        const firstItem = document.querySelector("#toc-nav .toc-item");
        if (firstItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
      if (e.key === "=" || e.key === "+") {
        const sizes = ["S", "M", "L"];
        const cur = getSettings().fontSize;
        const next = sizes[Math.min(sizes.indexOf(cur) + 1, 2)];
        if (next !== cur) {
          Settings._setSize(next);
          e.preventDefault();
        }
      }
      if (e.key === "-") {
        const sizes = ["S", "M", "L"];
        const cur = getSettings().fontSize;
        const next = sizes[Math.max(sizes.indexOf(cur) - 1, 0)];
        if (next !== cur) {
          Settings._setSize(next);
          e.preventDefault();
        }
      }
      if (e.key === "d" || e.key === "D") {
        toggleDistractionFree();
        e.preventDefault();
      }
    }
  }
});

/* ═══════════════════════════════════════════════════════════════
   DISTRACTION-FREE MODE (WIKI-103)
   ═══════════════════════════════════════════════════════════════ */
let _distractionFree = false;
function toggleDistractionFree() {
  _distractionFree = !_distractionFree;
  document.body.classList.toggle("distraction-free", _distractionFree);
}

/* ═══════════════════════════════════════════════════════════════
   HELP MODAL (WIKI-021)
   ═══════════════════════════════════════════════════════════════ */
let _helpOpener = null;
let _helpFocusTrapHandler = null;

function openHelp() {
  const modal = document.getElementById("help-modal");
  if (!modal) return;
  _helpOpener = document.activeElement;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  const closeBtn = document.getElementById("help-close-btn");
  closeBtn?.focus();

  _helpFocusTrapHandler = (e) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      modal.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")
    ).filter((el) => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  if (_helpFocusTrapHandler)
    modal.removeEventListener("keydown", _helpFocusTrapHandler);
  modal.addEventListener("keydown", _helpFocusTrapHandler);
}

function closeHelp() {
  const modal = document.getElementById("help-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  if (_helpFocusTrapHandler) {
    modal.removeEventListener("keydown", _helpFocusTrapHandler);
    _helpFocusTrapHandler = null;
  }
  _helpOpener?.focus();
  _helpOpener = null;
}

document.getElementById("help-close-btn")?.addEventListener("click", closeHelp);
document
  .querySelector("#help-modal .help-backdrop")
  ?.addEventListener("click", closeHelp);

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
