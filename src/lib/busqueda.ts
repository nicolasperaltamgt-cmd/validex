import type { MeliDiscoveryCategory, MeliTrend } from "./meli-signals";

/**
 * Buscador de ideas de producto. Corre en el navegador (el sitio no tiene servidor) sobre tres fuentes:
 *  1. los productos que Validex ya analizó,
 *  2. las búsquedas en alza de Mercado Libre,
 *  3. los más vendidos de cada categoría de Mercado Libre.
 * Entiende acentos, mayúsculas, plurales, varias palabras (todas tienen que aparecer) y algunos sinónimos de uso común.
 */

const STOPWORDS = new Set(["de", "del", "la", "el", "los", "las", "un", "una", "para", "con", "sin", "y", "en", "por", "x", "a", "al", "o", "mi", "tu"]);

/** Grupos de palabras que significan lo mismo para quien busca. Se aplica en las dos direcciones. */
const SINONIMOS: string[][] = [
  ["auricular", "audifono", "headphone", "earbud", "tws"],
  ["termo", "matero"],
  ["cargador", "powerbank", "bateria"],
  ["celular", "telefono", "smartphone", "movil"],
  ["aspiradora", "aspirador"],
  ["reloj", "smartwatch", "watch"],
  ["camara", "webcam"],
  ["ventilador", "abanico"],
  ["freidora", "airfryer"],
  ["notebook", "laptop", "portatil"],
  ["zapatilla", "championes", "tenis"],
  ["heladera", "refrigerador", "nevera"],
  ["tv", "televisor", "television", "smarttv"],
  ["mochila", "bolso"],
  ["remera", "camiseta", "playera"],
];

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Quita el plural simple ("termos" → "termo", "freidoras" → "freidora", "pantallas" → "pantalla"). */
function raiz(palabra: string): string {
  if (palabra.length > 4 && palabra.endsWith("es")) return palabra.slice(0, -2);
  if (palabra.length > 3 && palabra.endsWith("s")) return palabra.slice(0, -1);
  return palabra;
}

export function palabras(texto: string): string[] {
  return normalizar(texto)
    .split(" ")
    .filter((p) => p.length > 0 && !STOPWORDS.has(p));
}

const mapaSinonimos: Map<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const grupo of SINONIMOS) {
    const raices = grupo.map(raiz);
    for (const r of raices) m.set(r, raices);
  }
  return m;
})();

/** Todas las formas aceptadas de una palabra buscada: ella misma, su raíz y sus sinónimos. */
function variantes(palabra: string): string[] {
  const r = raiz(palabra);
  return mapaSinonimos.get(r) ?? [r];
}

/** Cuánto coincide una palabra buscada con las palabras de un texto: 3 exacta, 2 empieza con (palabra casi completa), 0 no está. */
function puntosPalabra(variantesBuscadas: string[], textoPalabras: string[]): number {
  let mejor = 0;
  for (const v of variantesBuscadas) {
    for (const p of textoPalabras) {
      const rp = raiz(p);
      if (rp === v) return 3;
      // Por prefijo mientras se escribe ("auric" → "auricular"), pero sin pescar palabras distintas ("termo" no es "termotanque").
      if (v.length >= 3 && rp.startsWith(v) && rp.length - v.length <= 4) mejor = Math.max(mejor, 2);
    }
  }
  return mejor;
}

export interface Candidato {
  /** Campos con su peso: lo que coincide en un campo más importante vale más. */
  campos: { texto: string; peso: number }[];
}

/** Puntaje de un candidato para una búsqueda. 0 si alguna de las palabras buscadas no aparece en ningún campo. */
export function puntuar(consulta: string, candidato: Candidato): number {
  const buscadas = palabras(consulta);
  if (buscadas.length === 0) return 0;
  const camposPalabras = candidato.campos.map((c) => ({ peso: c.peso, palabras: palabras(c.texto) }));
  let total = 0;
  for (const b of buscadas) {
    const v = variantes(b);
    let mejorPalabra = 0;
    for (const c of camposPalabras) mejorPalabra = Math.max(mejorPalabra, puntosPalabra(v, c.palabras) * c.peso);
    if (mejorPalabra === 0) return 0; // todas las palabras tienen que aparecer
    total += mejorPalabra;
  }
  return total;
}

export interface ProductoBuscable {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  score: number;
}

export interface ResultadoAnalizado {
  tipo: "analizado";
  id: string;
  nombre: string;
  categoria: string;
  score: number;
  puntos: number;
}
export interface ResultadoTendencia {
  tipo: "tendencia";
  palabra: string;
  posicion: number;
  puntos: number;
}
export interface ResultadoVendido {
  tipo: "vendido";
  nombre: string;
  categoria: string;
  posicion: number;
  puntos: number;
}

export interface ResultadosBusqueda {
  analizados: ResultadoAnalizado[];
  tendencias: ResultadoTendencia[];
  vendidos: ResultadoVendido[];
  /** Total de coincidencias, para decir "no encontramos nada". */
  total: number;
}

export function buscar(
  consulta: string,
  fuentes: { productos: ProductoBuscable[]; tendencias: MeliTrend[]; categorias: MeliDiscoveryCategory[] },
): ResultadosBusqueda {
  const analizados: ResultadoAnalizado[] = [];
  for (const p of fuentes.productos) {
    const puntos = puntuar(consulta, {
      campos: [
        { texto: p.nombre, peso: 3 },
        { texto: p.categoria, peso: 2 },
        { texto: p.descripcion, peso: 1 },
      ],
    });
    if (puntos > 0) analizados.push({ tipo: "analizado", id: p.id, nombre: p.nombre, categoria: p.categoria, score: p.score, puntos });
  }
  analizados.sort((a, b) => b.puntos - a.puntos || b.score - a.score);

  const tendencias: ResultadoTendencia[] = [];
  for (const t of fuentes.tendencias) {
    const puntos = puntuar(consulta, { campos: [{ texto: t.keyword, peso: 3 }] });
    if (puntos > 0) tendencias.push({ tipo: "tendencia", palabra: t.keyword, posicion: t.position, puntos });
  }
  tendencias.sort((a, b) => b.puntos - a.puntos || a.posicion - b.posicion);

  const vistos = new Set<string>();
  const vendidos: ResultadoVendido[] = [];
  for (const c of fuentes.categorias) {
    for (const v of c.bestSellers) {
      const puntos = puntuar(consulta, {
        campos: [
          { texto: v.name, peso: 3 },
          { texto: c.categoryName, peso: 1 },
        ],
      });
      const clave = normalizar(v.name);
      if (puntos > 0 && !vistos.has(clave)) {
        vistos.add(clave);
        vendidos.push({ tipo: "vendido", nombre: v.name, categoria: c.categoryName, posicion: v.position, puntos });
      }
    }
  }
  vendidos.sort((a, b) => b.puntos - a.puntos || a.posicion - b.posicion);

  return { analizados, tendencias, vendidos, total: analizados.length + tendencias.length + vendidos.length };
}
