// Guarda la app en el celular para que funcione sin internet.
// Si cambiás index.html, subí el número de versión (v1 -> v2) para forzar la actualización.
const CACHE = 'balanza-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde rápido con lo guardado y, si hay internet, actualiza en segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(hit => {
        const net = fetch(e.request)
          .then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
