
// nb. SW needs a delta change on every site update.

const VERSION = 'lollerskates';
const CACHE_NAME = 'cache';
const PRECACHE = ['/', '/styles.css', '/manifest.json'];

self.addEventListener('activate', ev => {
  // Claim all clients immediately.
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('install', ev => {
  const precache = caches.open(CACHE_NAME).then(cache => {
    const requests = PRECACHE.map(url => {
      return fetch(url).then(response => {
        if (response.status === 200) {
          cache.put(new Request(url), response);
        } else {
          return Promise.reject('couldn\'t cache: ' + url);
        }
      });
    });
    return Promise.all(requests);
  });
  ev.waitUntil(precache.then(self.skipWaiting()));
});

self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') {
    return;
  }
  const url = new URL(ev.request.url);
  ev.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(url)));
});

self.addEventListener('message', ev => {
  if (ev.data === 'version') {
    ev.ports[0].postMessage(VERSION);
  }
});
