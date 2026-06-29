/* Service Worker — Pedidos Lucciano's Europa
   Objetivo: que la app se actualice SOLA en los celulares ya instalados,
   sin tener que subir a mano el número de versión cada vez que cambia el index.

   Estrategia:
   - HTML / navegación  -> NETWORK-FIRST: con internet trae siempre la última
     versión del index; sin internet, usa la copia cacheada (offline OK).
   - Íconos / logo / etc -> STALE-WHILE-REVALIDATE: carga al toque desde cache
     y refresca en segundo plano para la próxima vez.
   Nada de esto toca localStorage: los pedidos guardados no se borran. */

const CACHE = 'pedidos-luccianos-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Logo_app.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

// Instala y precachea el shell; toma control de una sin esperar
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Limpia caches de versiones anteriores y reclama los clientes
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function esDocumento(req) {
  return req.mode === 'navigate' ||
         req.destination === 'document' ||
         (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // ---- HTML: network-first (siempre lo último si hay internet) ----
  if (esDocumento(req)) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // ---- Resto (íconos, logo, manifest): stale-while-revalidate ----
  e.respondWith(
    caches.match(req).then(hit => {
      const red = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || red;
    })
  );
});
