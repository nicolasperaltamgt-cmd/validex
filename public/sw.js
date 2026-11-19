// Service worker de Validex.
//  1. Permite que Chrome ofrezca instalar la app.
//  2. Guarda lo esencial para abrir la demo sin internet después de haberla abierto una vez con conexión.
//  3. Con internet, siempre pide primero la versión nueva a la red; solo usa lo guardado si la red falla.
// El dólar del día viene de una consulta externa y no se guarda: sin internet se ve la última versión de la página que se abrió.
const CACHE = "validex-offline-v2";
const SCOPE = self.registration.scope;
// Relativa al alcance del service worker: funciona igual en Netlify (raíz) y en GitHub Pages (/validex/).
const OFFLINE_URL = new URL("offline.html", SCOPE).pathname;
// Páginas que se guardan al instalar: las de la demo.
const PAGINAS = ["", "demo/", "presentacion/", "buscar/", "tantear/", "comparar/", "hoy/", "metodologia/"].map((p) => new URL(p, SCOPE).pathname);

const esEstatico = (url) => url.pathname.includes("/_next/static/");

async function guardarConArchivos(cache, ruta) {
  const res = await fetch(ruta, { cache: "reload" });
  if (!res.ok) return;
  const copia = res.clone();
  await cache.put(ruta, res);
  // Guarda también los archivos de código que usa la página, para que funcione sin conexión.
  const html = await copia.text();
  const archivos = new Set();
  for (const m of html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)) archivos.add(m[1]);
  await Promise.all(
    [...archivos].map(async (a) => {
      try {
        if (!(await cache.match(a))) {
          const r = await fetch(a);
          if (r.ok) await cache.put(a, r);
        }
      } catch {
        // Si un archivo no baja ahora, se guardará la primera vez que se use.
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.add(OFFLINE_URL);
      // Una página que falle no impide instalar el resto.
      await Promise.all(PAGINAS.map((p) => guardarConArchivos(cache, p).catch(() => undefined)));
    })(),
  );
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
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // el dólar y otras consultas externas no se tocan

  // Archivos de código con nombre único: primero lo guardado; si no está, la red (y se guarda).
  if (esEstatico(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copia = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copia));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Páginas y datos de navegación: primero la red; si falla, lo último guardado; si no hay nada, la pantalla de "sin conexión".
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === "navigate" || url.pathname.endsWith(".txt"))) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") return (await caches.match(OFFLINE_URL)) ?? Response.error();
        return Response.error();
      }),
  );
});
