self.addEventListener("install", e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open("liga-cache-v1").then(cache => {
            return cache.addAll([
                "index.html",
                "styles.css",
                "script.js",
                "manifest.json",
                "img/icon-192.png",
                "img/icon-512.png",
                "img/logo.png",
                "icons/painel.svg",
                "icons/desafios.svg",
                "icons/ranking.svg",
                "icons/perfil.svg"
            ]);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(resp => {
            return resp || fetch(e.request);
        })
    );
});
