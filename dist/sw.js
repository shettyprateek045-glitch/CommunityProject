/**
 * Self-Purging Service Worker
 * Ensures all previous caches are completely deleted and unregisters immediately.
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url && "navigate" in client) {
          client.navigate(client.url);
        }
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Always fetch fresh from network, never cache
  event.respondWith(fetch(event.request));
});
