/* Void Invaders service worker — offline-first.
 * - App-shell + assets are precached and runtime-cached so the game is
 *   fully playable with no network after the first visit.
 * - Navigations are network-first (fresh when online) with a cached
 *   fallback to the game route when offline.
 * - Hashed build assets use stale-while-revalidate.
 */
const VERSION = "void-invaders-v1";
const CORE = `${VERSION}-core`;
const RUNTIME = `${VERSION}-rt`;
const GAME_URL = "/work/space-invaders";

const PRECACHE = [
  GAME_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE);
      // best-effort: a single 404 must not abort installation
      await Promise.all(
        PRECACHE.map((u) =>
          cache.add(new Request(u, { cache: "reload" })).catch(() => {}),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|gif|ico|json)$/i.test(
      url.pathname,
    )
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // App navigations: network-first, fall back to cache / game route.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(RUNTIME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return (
            (await caches.match(req)) ||
            (await caches.match(GAME_URL)) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Build assets: stale-while-revalidate.
  if (isAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || (await network) || Response.error();
      })(),
    );
    return;
  }

  // Everything else same-origin: network-first with cache fallback.
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(RUNTIME);
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      } catch {
        return (await caches.match(req)) || Response.error();
      }
    })(),
  );
});
