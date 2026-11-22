/**
 * Service Worker for Farmer Decision Dashboard (PWA Support)
 * High-performance mobile caching strategy:
 * - Stale-While-Revalidate & Cache-First for vendor CDNs (Tailwind, FontAwesome, Leaflet, Chart.js)
 * - Fast-timeout fallback for mobile API requests
 * - Zero-CLS pre-cached shell
 */

const CACHE_NAME = "farmer-dashboard-v5.0-turbo";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/static/css/styles.css",
  "/static/js/app.js",
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("SW precache partial warning:", err);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Cache-First for external vendor CDNs (Tailwind, Chart.js, Leaflet, FontAwesome)
  if (
    url.hostname.includes("cdn.tailwindcss.com") ||
    url.hostname.includes("jsdelivr.net") ||
    url.hostname.includes("cdnjs.cloudflare.com") ||
    url.hostname.includes("unpkg.com")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((resp) => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {});
          }
          return resp;
        }).catch(() => cached);
      })
    );
    return;
  }

  // 2. Fast timeout for mobile API queries: try network for 2.5s, fall back to cached API data
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      Promise.race([
        fetch(event.request).then((resp) => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {});
          }
          return resp;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
      ]).catch(() => {
        return caches.match(event.request).then((cached) => cached || fetch(event.request));
      })
    );
    return;
  }

  // 3. Stale-While-Revalidate for app assets (HTML, CSS, JS)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((resp) => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
