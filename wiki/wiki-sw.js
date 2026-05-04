const SHELL_CACHE = "wiki-shell-v3";
const ARTICLE_CACHE = "wiki-articles-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        cache
          .addAll([
            "./index.html",
            "./css/wiki.css",
            "./js/wiki.js",
            "./404.html",
          ])
          .catch(() => {})
      )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((k) => k !== SHELL_CACHE && k !== ARTICLE_CACHE)
              .map((k) => caches.delete(k))
          )
        ),
    ])
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== location.origin) return;

  // Markdown files: serve from article cache if user downloaded, else network
  if (url.pathname.endsWith(".md")) {
    e.respondWith(
      caches
        .open(ARTICLE_CACHE)
        .then((cache) =>
          cache.match(request).then((hit) => hit || fetch(request))
        )
    );
    return;
  }

  // Shell assets: network-first, cache as fallback for offline
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
