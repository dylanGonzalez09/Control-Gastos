const controlIt = "control-it-v1"
const assets = [
  "/",
  "/index.html",
  "/style/index.css",
  "/src/index.js"
]

// Almacenar cache
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(controlIt).then(cache => {
      cache.addAll(assets)
    })
  )
})

// Recuperar nuestro cache
self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })