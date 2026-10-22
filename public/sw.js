// Принудительное удаление устаревших кэшей и деактивация Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

// Прямой сетевой доступ ко всем ресурсам без кэширования
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
