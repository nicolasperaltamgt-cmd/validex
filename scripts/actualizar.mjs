// Actualiza los datos de Mercado Libre y publica el sitio en GitHub Pages, todo en un solo paso.
// Uso:
//   npm run actualizar                 -> actualiza datos, prueba, guarda, sube a GitHub y verifica el sitio publicado
//   npm run actualizar -- --solo-datos -> solo actualiza src/data/meli-signals.json (no guarda ni publica nada)
// Necesita: el archivo .env.local con las claves de Mercado Libre, y la herramienta `gh` con la sesión de GitHub iniciada.
// No muestra ni guarda claves. Cada paso se detiene si falla: nunca publica algo que no pasó las pruebas.
import { execSync } from "node:child_process";

const SITIO = "https://nicolasperaltamgt-cmd.github.io/validex";
const SOLO_DATOS = process.argv.includes("--solo-datos");

function paso(titulo, comando, { capturar = false } = {}) {
  console.log(`\n▶ ${titulo}`);
  try {
    return execSync(comando, { stdio: capturar ? ["ignore", "pipe", "inherit"] : "inherit", encoding: "utf8" });
  } catch {
    console.log(`\n✖ Falló: ${titulo}. No se publicó nada.`);
    process.exit(1);
  }
}

paso("1/6 Actualizando los datos de Mercado Libre", "node scripts/meli-signals.mjs");

if (SOLO_DATOS) {
  console.log("\n✔ Datos actualizados en src/data/meli-signals.json. No se guardó ni se publicó (opción --solo-datos).");
  process.exit(0);
}

paso("2/6 Corriendo las pruebas", "npm test");

const hayCambios = execSync("git status --porcelain src/data/meli-signals.json", { encoding: "utf8" }).trim() !== "";
if (hayCambios) {
  paso("3/6 Guardando los datos nuevos", 'git add src/data/meli-signals.json && git commit -m "Datos de Mercado Libre actualizados"');
  paso("4/6 Subiendo a GitHub (esto lanza la publicación)", "git push");
} else {
  console.log("\n▶ 3/6 y 4/6: los datos no cambiaron desde la última vez. Se vuelve a publicar igual.");
  paso("   Lanzando la publicación a mano", "gh workflow run pages.yml");
}

console.log("\n▶ 5/6 Esperando que GitHub publique (1 a 3 minutos)…");
await new Promise((r) => setTimeout(r, 8000));
const id = execSync("gh run list --workflow pages.yml --limit 1 --json databaseId -q .[0].databaseId", { encoding: "utf8" }).trim();
paso(`   Siguiendo la publicación n.º ${id}`, `gh run watch ${id} --exit-status`);

console.log("\n▶ 6/6 Verificando el sitio publicado");
let falla = false;
for (const ruta of ["/", "/hoy/", "/tantear/", "/evitar/", "/catalogo/", "/analisis/termo-acero-1l/"]) {
  const r = await fetch(`${SITIO}${ruta}`).catch(() => null);
  const ok = r?.ok === true;
  if (!ok) falla = true;
  console.log(`${ok ? "✔" : "✖"} ${ruta} (HTTP ${r?.status ?? "sin respuesta"})`);
}
console.log(falla ? "\n⚠ Alguna página no respondió bien. Revisá el sitio." : `\n✔ Listo: ${SITIO}/ está actualizado.`);
process.exit(falla ? 1 : 0);
