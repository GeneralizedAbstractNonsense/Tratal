const CACHE_NAME = 'trasporti-v1';
const ASSETS = [
  './',
  './index.html',
  './universita-casa.html',
  './casa-scuola.html',
  './scuola-casa.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
