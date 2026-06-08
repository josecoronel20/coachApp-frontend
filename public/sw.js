const CACHE_NAME = "impruv-coach-v1";

const urlsToCache = [
  "/",
  "/auth/login",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/pwa-96.png",
  "/pwa-192.png",
  "/pwa-512.png",
  "/pwa-maskable-192.png",
  "/pwa-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

/**
 * Cache conservador para GET same-origin.
 * No intercepta API, assets de Next ni datos privados del coach.
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/")) return;
  if (url.pathname === "/sw.js") return;

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req)).catch(() => {
      if (req.mode === "navigate") return caches.match("/");
      return Response.error();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
          return undefined;
        })
      )
    )
  );
});
