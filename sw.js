const CACHE_NAME = 'restaurante360-v1';
const ASSETS = [
    './',
    './index.html',
    './Admin.html',
    './Caja.html',
    './Despacho.html',
    './Gestion.html',
    './Mozo.html',
    './cocina.html'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
                );
            })
        ])
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    // Network-First for HTML and JS
    if (e.request.mode === 'navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
        e.respondWith(
            fetch(e.request).then(res => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
                return res;
            }).catch(() => caches.match(e.request))
        );
        return;
    }
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
