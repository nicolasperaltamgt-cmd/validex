// Service worker mínimo de Validex. Hace dos cosas:
//  1. Permite que Chrome ofrezca instalar la app.
//  2. Si no hay internet al abrir una página, muestra /offline.html en vez del error del navegador.
// No guarda páginas ni datos: todo se pide siempre a la red, así nunca se muestra información vieja.
const CACHE = "validex-offline-v1";
// Relativa al alcance del service worker: funciona igual en Netlify (raíz) y en GitHub Pages (/validex/).
const OFFLINE_URL = new URL("offline.html", self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
