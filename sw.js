var CACHE = 'pwl-v6';
// File names must match the repository exactly (GitHub Pages is case-sensitive: .PNG not .png).
var FILES = ['./', './index.html', './cargo-record.html', './manifest.webmanifest', './icon-192.PNG', './icon-512.PNG'];
self.addEventListener('install', function (e) {
  // Each file is saved on its own, so one missing file can no longer stop the whole offline copy.
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(e.request).then(function (r) {
      if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () {
      if (hit) return hit;
      // Offline and not saved yet: open the matching app rather than always the Port Watch Log.
      return /cargo-record/.test(e.request.url) ? caches.match('./cargo-record.html') : caches.match('./index.html');
    });
    return hit || net;
  }));
});
