import { realProducts } from "./real-products";
import type { Product } from "./types";

/**
 * Capa de acceso a datos. Hoy lee datos locales: productos con referencias reales sin verificar
 * (con sus fuentes). No hay productos ficticios en el sitio. En fases posteriores, estas funciones
 * pueden consultar Supabase u otra fuente sin cambiar las páginas que las usan.
 */
const all: Product[] = [...realProducts];

export function getProducts(): Product[] {
  return all;
}

/** Solo los productos con referencias reales (sin verificar). Son los que usa el drop del día. */
export function getRealProducts(): Product[] {
  return all.filter((p) => p.dataStatus !== "demo");
}

export function getProduct(id: string): Product | undefined {
  return all.find((p) => p.id === id);
}

export type { Product } from "./types";
