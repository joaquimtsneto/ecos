const CACHE_NAME = 'ecos-de-louvor-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/estilos.css',
  '/app.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Evento de Instalação: Guarda os ficheiros em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Interceta os pedidos e serve a partir da cache se disponível
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar na cache, retorna a resposta da cache
        if (response) {
          return response;
        }
        // Caso contrário, faz o pedido à rede
        return fetch(event.request);
      }
    )
  );
});
