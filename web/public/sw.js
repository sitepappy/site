const CACHE = "pappy-v4"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/manifest.webmanifest", "/pwa-icon.svg", "/maskable-icon.svg", "/offline.html"]))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
      self.clients.claim()
    ])
  )
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)
  const isSameOrigin = url.origin === self.location.origin
  const isNavigation = req.mode === "navigate"
  const dest = req.destination

  if (isNavigation) {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")))
    return
  }

  if (!isSameOrigin) {
    event.respondWith(fetch(req))
    return
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    dest === "style" ||
    dest === "script" ||
    dest === "image" ||
    dest === "font"

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
          return res
        })
      })
    )
    return
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)))
})
