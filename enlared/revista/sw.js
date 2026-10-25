/* Service worker de En La Red (revista).
   Al publicar una edición nueva, cambia el número de VERSION para que
   los lectores descarguen los archivos actualizados.
   PREFIJO separa las copias de esta app de las de otras apps en el mismo dominio. */
var PREFIJO = 'en-la-red-revista-';
var VERSION = PREFIJO + 'ed3-v1';
var FONTS = 'en-la-red-fuentes';

var CORE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "img/abdias.jpg",
  "img/cover.jpg",
  "img/curso-au.jpg",
  "img/digital.jpg",
  "img/elaine.jpg",
  "img/eliseo.jpg",
  "img/gears.jpg",
  "img/igualdad-1.jpg",
  "img/igualdad-2.jpg",
  "img/jayguer.jpg",
  "img/kelkyra.jpg",
  "img/leydis.jpg",
  "img/miguel.jpg",
  "img/nayreth.jpg",
  "img/poster-21abr.jpg",
  "img/poster-22abr.jpg",
  "img/prevencion.jpg",
  "img/staycy.jpg",
  "img/sumate.jpg",
  "img/zueline-jd.jpg",
  "img/zueline.jpg"
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(CORE); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf(PREFIJO) === 0 && k !== VERSION;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  /* Tipografías de Google: se guardan la primera vez y quedan para uso sin conexión. */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONTS).then(function (cache) {
        return cache.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* Páginas: primero la red, y si no hay conexión, la copia guardada. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put('index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('index.html').then(function (hit) { return hit || caches.match('./'); });
      })
    );
    return;
  }

  /* Imágenes y demás archivos: primero la copia guardada. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
