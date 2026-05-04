/* ═══════════════════════════════════════════════════════════════
   WIKI DATA - add new wikis here
   ═══════════════════════════════════════════════════════════════ */
const WIKIS = [
  {
    id: "system-design",
    title: "System Design",
    description:
      "Interview-ready references covering components, algorithms, and end-to-end system walkthroughs.",
    icon: "⚙️",
    color: "#6366f1",
    indexPath: "./content/system-design/index.md",
    articleCount: 38,
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

/* ─── Shared caches (mutated by render.js and search.js - must live here) ─── */
const readTimeCache = {};
const indexCache = {};
const allSearchCache = { loaded: false, loading: false, entries: [] };
const STUB_THRESHOLD = 200; // bytes - stubs are just "# Title\n---"

/* ─── Pure utilities (placed here to avoid circular deps between storage/render) ─── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

export {
  WIKIS,
  state,
  indexCache,
  readTimeCache,
  allSearchCache,
  STUB_THRESHOLD,
  mdConverter,
  escHtml,
  fuzzyMatch,
};
