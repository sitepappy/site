const CACHE = "pappy-v8"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  )
})

self.addEventListener("fetch", (event) => {
  // Простая стратегия: сетевой запрос в первую очередь
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})
