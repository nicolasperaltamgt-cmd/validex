// Prueba de conexión con la API oficial de Mercado Libre. Solo hace consultas de LECTURA.
// Uso: npm run meli:check
// Lee MELI_CLIENT_ID y MELI_CLIENT_SECRET de .env.local. No muestra ni guarda el token ni el secreto.
import { readFileSync, existsSync } from "node:fs";

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
const id = env.MELI_CLIENT_ID;
const secret = env.MELI_CLIENT_SECRET;
const SITE = env.MELI_SITE || "MLA"; // MLA = Argentina

if (!id || !secret) {
  console.log("Faltan MELI_CLIENT_ID y/o MELI_CLIENT_SECRET en .env.local.");
  console.log("Seguí docs/MERCADOLIBRE.md para crearlos. No se hizo ninguna consulta.");
  process.exit(1);
}

const API = "https://api.mercadolibre.com";

async function call(label, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* respuesta que no es JSON */
    }
    return { label, status: res.status, ok: res.ok, json };
  } catch (e) {
    return { label, status: 0, ok: false, json: null, error: String(e.message || e) };
  }
}

function line(r, extra = "") {
  const mark = r.ok ? "OK    " : "FALLÓ ";
  console.log(`${mark} ${r.label}  (HTTP ${r.status || "sin respuesta"}) ${extra}`);
  if (!r.ok && r.json) console.log("       motivo:", r.json.message || r.json.error || JSON.stringify(r.json).slice(0, 160));
  if (!r.ok && r.error) console.log("       error de red:", r.error);
}

console.log(`Probando Mercado Libre (sitio ${SITE})…\n`);

// 1) Token de aplicación (sin usuario)
const tokenRes = await call("Token de la aplicación (client_credentials)", `${API}/oauth/token`, {
  method: "POST",
  headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
});
line(tokenRes);
const token = tokenRes.ok ? tokenRes.json?.access_token : null;
const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

// 2) Consultas de lectura, con y sin token, para saber qué exige cada una
const tests = [
  ["Categorías del sitio", `${API}/sites/${SITE}/categories`, (j) => `${Array.isArray(j) ? j.length : "?"} categorías`],
  ["Tendencias de búsqueda", `${API}/trends/${SITE}`, (j) => `${Array.isArray(j) ? j.length : "?"} tendencias`],
  [
    "Búsqueda de productos",
    `${API}/sites/${SITE}/search?q=${encodeURIComponent("botella termica")}&limit=3`,
    (j) => `${j?.paging?.total ?? "?"} resultados en total`,
  ],
];

for (const [label, url, summary] of tests) {
  const withToken = await call(`${label} (con token)`, url, auth);
  line(withToken, withToken.ok ? `→ ${summary(withToken.json)}` : "");
  const noToken = await call(`${label} (sin token)`, url);
  line(noToken, noToken.ok ? `→ ${summary(noToken.json)}` : "");
}

console.log("\nListo. Pasame este resultado completo (no incluye claves) para decidir qué datos podemos mostrar.");
