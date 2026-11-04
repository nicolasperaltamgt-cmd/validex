// Actualiza los datos de Mercado Libre y publica el sitio, todo en un solo paso.
// Uso:
//   npm run actualizar                 -> actualiza datos, prueba, compila, publica y verifica
//   npm run actualizar -- --solo-datos -> solo actualiza src/data/meli-signals.json (no publica nada)
// Necesita tener iniciada la sesión de Netlify (netlify login) y el archivo .env.local con las claves de Mercado Libre.
// No muestra ni guarda claves. Cada paso se detiene si falla: nunca publica algo que no pasó las pruebas.
import { execSync } from "node:child_process";

const SITIO = "validex-prueba.netlify.app";
const SOLO_DATOS = process.argv.includes("--solo-datos");

function paso(titulo, comando, opciones = {}) {
  console.log(`\n▶ ${titulo}`);
  try {
    return execSync(comando, { stdio: opciones.capturar ? ["ignore", "pipe", "inherit"] : "inherit", encoding: "utf8", env: { ...process.env, ...opciones.env } });
  } catch {
    console.log(`\n✖ Falló: ${titulo}. No se publicó nada.`);
    process.exit(1);
  }
}

paso("1/6 Actualizando los datos de Mercado Libre", "node scripts/meli-signals.mjs");

if (SOLO_DATOS) {
  console.log("\n✔ Datos actualizados en src/data/meli-signals.json. No se publicó (opción --solo-datos).");
  process.exit(0);
}

paso("2/6 Corriendo las pruebas", "npm test");

const entorno = {
  NEXT_PUBLIC_SITE_URL: `https://${SITIO}`,
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
};
const salida = paso("3/6 Compilando y subiendo una versión de prueba", "npx netlify deploy --build --json", { capturar: true, env: entorno });
const id = /"deploy_id"\s*:\s*"([a-f0-9]+)"/.exec(salida ?? "")?.[1];
if (!id) {
  console.log("\n✖ No pude leer el número de la versión subida. No se publicó nada.");
  process.exit(1);
}

paso(
  "4/6 Publicando en producción",
  `npx netlify api restoreSiteDeploy --data "${JSON.stringify({ site_id: SITIO, deploy_id: id }).replace(/"/g, '\\"')}"`,
  { capturar: true },
);

console.log("\n▶ 5/6 Esperando unos segundos…");
await new Promise((r) => setTimeout(r, 6000));

console.log("\n▶ 6/6 Verificando el sitio publicado");
let falla = false;
for (const ruta of ["/", "/hoy", "/tantear", "/evitar", "/catalogo", "/analisis/termo-acero-1l"]) {
  const r = await fetch(`https://${SITIO}${ruta}`).catch(() => null);
  const ok = r?.ok === true;
  if (!ok) falla = true;
  console.log(`${ok ? "✔" : "✖"} ${ruta} (HTTP ${r?.status ?? "sin respuesta"})`);
}
console.log(falla ? "\n⚠ Alguna página no respondió bien. Revisá el sitio." : `\n✔ Listo: https://${SITIO} está actualizado.`);
process.exit(falla ? 1 : 0);
