
// nb. SW needs a delta change on every site update.

const disabled = true;

const VERSION = 'pwacompat-3';
const CACHE_NAME = 'cache';
const PRECACHE = ['/', '/styles.css', '/manifest.json', 'https://cdn.rawgit.com/GoogleChrome/pwacompat/v1.0.3/pwacompat.min.js', 'https://cdn.rawgit.com/richtr/NoSleep.js/v0.5.0/NoSleep.min.js'];

self.addEventListener('activate', ev => {
  // Claim all clients immediately.
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('install', ev => {
  const precache = caches.open(CACHE_NAME).then(cache => {
    const requests = PRECACHE.map(url => {
      // TODO: do we need cors to cache rawgit correctly?
      return fetch(url, {mode: 'cors'}).then(response => {
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
  if (ev.request.method === 'POST') {
    ev.request.text().then(text => {
      console.info('got text', text);
    });
  }

  if (disabled || ev.request.method !== 'GET') {
    return;
  }
  const url = new URL(ev.request.url);
  ev.respondWith(caches.open(CACHE_NAME)
      .then(cache => cache.match(url))
      .then(response => {
        if (!response) {
          if (!url.hostname.match(/google-analytics\.com$/)) {
            console.debug('can\'t serve from cache', ev.request.url);
          }
          return fetch(ev.request);
        }
        return response;
      }));
});

self.addEventListener('message', ev => {
  if (ev.data === 'version') {
    ev.ports[0].postMessage(VERSION);
  }
});
