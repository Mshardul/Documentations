import {
  WIKIS,
  allSearchCache,
  readTimeCache,
  STUB_THRESHOLD,
  escHtml,
  fuzzyMatch,
} from "./state.js";
import {
  fetchWikiIndex,
  fetchText,
  readingTime,
  navigateToContent,
} from "./render.js";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL SEARCH (⌘K)
   ═══════════════════════════════════════════════════════════════ */
const gSearchModal = document.getElementById("global-search-modal");
const gSearchInput = document.getElementById("gsearch-input");
const gSearchResults = document.getElementById("gsearch-results");
const gSearchBackdrop = document.getElementById("gsearch-backdrop");

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

export { openGlobalSearch, closeGlobalSearch };
