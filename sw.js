const CACHE_NAME = 'trasporti-v2';
const ASSETS = [
  './',
  './index.html',
  './route.html',
  './style.css',
  './manifest.json',
  './routes.json',
  './js/components.js',
  './js/atac.js'
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
