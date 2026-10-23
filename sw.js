// שומר את קבצי האפליקציה בטלפון, כדי שתיפתח מהר וגם בלי קליטה.
// קודם מנסים להביא גרסה עדכנית מהרשת, ורק אם אין רשת משתמשים בעותק השמור.
const CACHE = 'overload-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png?v=2', './icon-192.png?v=2', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // הבקשות לגיליון לא עוברות כאן
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
