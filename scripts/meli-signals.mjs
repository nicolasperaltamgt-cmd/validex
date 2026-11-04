// Guarda una foto, con fecha, de las señales públicas de Mercado Libre Argentina para cada producto del catálogo:
// tendencias de búsqueda, categoría con su cantidad de publicaciones y los más vendidos de esa categoría.
// Solo lecturas (GET) con el token de la aplicación. No muestra ni guarda el token ni el secreto.
// Uso: npm run meli:signals   (escribe src/data/meli-signals.json)
import { readFileSync, writeFileSync, existsSync } from "node:fs";

function loadEnv(file) {
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnv(".env.local"), ...process.env };
if (!env.MELI_CLIENT_ID || !env.MELI_CLIENT_SECRET) {
  console.log("Faltan MELI_CLIENT_ID y/o MELI_CLIENT_SECRET en .env.local. No se hizo ninguna consulta.");
  process.exit(1);
}

const API = "https://api.mercadolibre.com";
const SITE = "MLA";

/**
 * Por cada producto: con qué texto se busca su categoría y qué palabras buscamos dentro de las tendencias.
 * Las palabras de tendencia son nuestras: el cruce es una pista de demanda, no una medición de ventas.
 */
const PRODUCTOS = {
  // esperada: palabra que TIENE que aparecer en la ruta de la categoría; si no, el dato no se guarda (control contra categorías equivocadas).
  // match: "exacta" si la categoría es la del producto; "aproximada" si Mercado Libre no tiene una categoría propia (se avisa en la ficha).
  "tws-basicos": { query: "auriculares bluetooth tws", trendWords: ["auricular", "tws"], esperada: /Auriculares/i, match: "exacta" },
  "pava-electrica": { query: "pava electrica", trendWords: ["pava"], esperada: /Jarras El|Pava|Hervidor/i, match: "exacta" },
  "fuente-agua-gatos": { query: "bebedero gato", trendWords: ["fuente para gato", "bebedero"], esperada: /Gatos/i, match: "exacta" },
  "cama-gatos": { query: "cama para gatos", trendWords: ["cama para gato", "cama gato"], esperada: /Gatos/i, match: "exacta" },
  "cortina-roller-blackout": { query: "cortina roller blackout", trendWords: ["cortina"], esperada: /Cortinas/i, match: "exacta" },
  "horno-pizza-portatil": { query: "horno de pizza portatil", trendWords: ["horno de pizza", "horno pizza"], esperada: /Horno/i, match: "aproximada" },
  "afeitadora-usb": { query: "afeitadora electrica recargable", trendWords: ["afeitadora"], esperada: /Afeitadora/i, match: "exacta" },
  "power-bank-10000": { query: "power bank 10000 mah", trendWords: ["power bank", "cargador portatil"], esperada: /Cargadores|Bater/i, match: "aproximada" },
  "smartwatch-generico": { query: "smartwatch llamadas bluetooth", trendWords: ["smartwatch", "reloj inteligente"], esperada: /Smartwatch/i, match: "exacta" },
  "maquina-soda": { query: "maquina de soda hogar", trendWords: ["soda"], esperada: /Soda/i, match: "exacta" },
  "robot-aspirador-wifi": { query: "robot aspirador wifi", trendWords: ["robot aspirador", "aspiradora robot"], esperada: /Aspiradoras?/i, match: "exacta" },
  "camara-wifi-ptz": { query: "camara de seguridad wifi", trendWords: ["camara de seguridad", "camara wifi"], esperada: /C[aá]maras/i, match: "exacta" },
  "freidora-aire-4l": { query: "freidora de aire digital", trendWords: ["freidora"], esperada: /Freidoras/i, match: "exacta" },
  "ventilador-mano-recargable": { query: "ventilador de mano recargable", trendWords: ["ventilador"], esperada: /Ventiladores/i, match: "exacta" },
  "termo-acero-1l": { query: "termo acero inoxidable 1 litro", trendWords: ["termo"], esperada: /Termos/i, match: "exacta" },
};

const tr = await fetch(`${API}/oauth/token`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
  body: new URLSearchParams({ grant_type: "client_credentials", client_id: env.MELI_CLIENT_ID, client_secret: env.MELI_CLIENT_SECRET }),
});
if (!tr.ok) {
  console.log(`No se pudo obtener el token de la aplicación (HTTP ${tr.status}).`);
  process.exit(1);
}
const auth = { authorization: `Bearer ${(await tr.json()).access_token}`, accept: "application/json" };

async function get(path) {
  const r = await fetch(API + path, { headers: auth });
  if (!r.ok) return null;
  try {
    return await r.json();
  } catch {
    return null;
  }
}

const trendsRaw = await get(`/trends/${SITE}`);
if (!Array.isArray(trendsRaw)) {
  console.log("No se pudieron leer las tendencias. No se escribió nada.");
  process.exit(1);
}
const trends = trendsRaw.map((t, i) => ({ position: i + 1, keyword: String(t.keyword) }));

const products = {};
for (const [id, cfg] of Object.entries(PRODUCTOS)) {
  const found = await get(`/sites/${SITE}/domain_discovery/search?q=${encodeURIComponent(cfg.query)}`);
  const first = Array.isArray(found) ? found[0] : null;
  const entry = { query: cfg.query, trendWords: cfg.trendWords, categoryId: null, categoryName: null, categoryPath: null, categoryMatch: cfg.match, totalItems: null, bestSellers: [] };
  const cat = first?.category_id ? await get(`/categories/${first.category_id}`) : null;
  const ruta = Array.isArray(cat?.path_from_root) ? cat.path_from_root.map((c) => c.name).join(" > ") : "";
  if (first?.category_id && !cfg.esperada.test(ruta || first.category_name || "")) {
    console.log(`REVISAR  ${id}: la categoría sugerida ("${ruta || first.category_name}") no parece la del producto. No se guardó.`);
    first.category_id = null;
  }
  if (first?.category_id) {
    entry.categoryId = first.category_id;
    entry.categoryName = first.category_name ?? null;
    if (cat) {
      entry.categoryName = cat.name ?? entry.categoryName;
      entry.totalItems = cat.total_items_in_this_category ?? null;
      entry.categoryPath = ruta || null;
    }
    const hl = await get(`/highlights/${SITE}/category/${first.category_id}`);
    const top = Array.isArray(hl?.content) ? hl.content.slice(0, 5) : [];
    for (const c of top) {
      const p = c.type === "PRODUCT" ? await get(`/products/${c.id}`) : null;
      if (p?.name) entry.bestSellers.push({ position: c.position, name: String(p.name) });
    }
  }
  products[id] = entry;
  console.log(`${entry.categoryId ? "OK   " : "SIN CATEGORÍA"} ${id}: ${entry.categoryName ?? "-"} (${entry.totalItems ?? "?"} publicaciones, ${entry.bestSellers.length} más vendidos)`);
}

const out = { source: "Mercado Libre Argentina (API oficial)", site: SITE, fetchedAt: new Date().toISOString(), trends, products };
writeFileSync("src/data/meli-signals.json", JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\nListo: ${trends.length} tendencias y ${Object.keys(products).length} productos guardados en src/data/meli-signals.json`);
