const CACHE_NAME = 'smartwaste-mvp-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icon-192.svg', '/icon-512.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }

          return Promise.resolve()
        }),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const { request } = event
  const requestUrl = new URL(request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (
    requestUrl.pathname.startsWith('/api/') ||
    requestUrl.pathname.startsWith('/src/') ||
    requestUrl.pathname.includes('/@vite/') ||
    requestUrl.pathname.includes('/node_modules/')
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')))
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse
        }

        const clonedResponse = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clonedResponse))
        return networkResponse
      })
    }),
  )
})