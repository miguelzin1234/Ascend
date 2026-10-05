// Troque o número da versão quando publicar uma atualização
const CACHE = 'ascend-v1';
const ARQUIVOS = ['./', 'index.html', 'manifest.json', 'icone.jpg', 'firebase-config.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Tenta a internet primeiro (para pegar atualizações) e usa o cache se estiver offline.
// Pedidos para outros sites (Firebase, Google) passam direto, sem cache.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copia));
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match('index.html')))
  );
});
