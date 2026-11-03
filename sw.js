// MECA AI — service worker. Muda o número de VERSAO sempre que publicares uma versão nova.
const VERSAO = 'meca-v1';
const BASE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(BASE)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primeiro tenta a internet (versão nova do GitHub); só usa a cópia guardada se estiveres sem rede.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r, { cache: 'no-cache' })
      .then((res) => { const c = res.clone(); caches.open(VERSAO).then((x) => x.put(r, c)); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match('./index.html')))
  );
});
