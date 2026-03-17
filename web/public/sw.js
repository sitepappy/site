self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("pappy-v1").then((cache) => cache.addAll(["/", "/manifest.webmanifest"]))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        const copy = res.clone()
        caches.open("pappy-v1").then((cache) => {
          const url = new URL(req.url)
          if (url.origin === location.origin) cache.put(req, copy)
        })
        return res
      }).catch(() => caches.match("/"))
    })
  )
})

