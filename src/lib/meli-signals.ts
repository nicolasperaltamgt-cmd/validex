import type { EvidenceMap, Product } from "@/data/types";

/**
 * Señales públicas de Mercado Libre Argentina (API oficial), guardadas con fecha por `npm run meli:signals`.
 * Son una pista de demanda y del tamaño de la oferta. NO son ventas ni precios, y no cambian el score por sí solas.
 */
export interface MeliTrend {
  position: number;
  keyword: string;
}

export interface MeliBestSeller {
  position: number;
  name: string;
}

export interface MeliProductSignal {
  query: string;
  /** Palabras nuestras con las que se busca el producto dentro de las tendencias. */
  trendWords: string[];
  categoryId: string | null;
  categoryName: string | null;
  categoryPath?: string | null;
  /** "aproximada" cuando Mercado Libre no tiene una categoría propia del producto: la ficha lo avisa. */
  categoryMatch?: "exacta" | "aproximada";
  /** Publicaciones activas en la categoría: tamaño de la oferta, no de la demanda. */
  totalItems: number | null;
  bestSellers: MeliBestSeller[];
}

export interface MeliSignals {
  source: string;
  site: string;
  fetchedAt: string;
  trends: MeliTrend[];
  products: Record<string, MeliProductSignal>;
}

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Tendencias que contienen alguna de las palabras como palabra completa (con plural simple).
 * "termo" coincide con "termos" y "termo stanley", pero NO con "termotanque".
 */
export function matchTrends(words: string[], trends: MeliTrend[]): MeliTrend[] {
  const patrones = words
    .map(normalizar)
    .filter(Boolean)
    .map((w) => new RegExp(`(?:^|\\s)${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:e?s)?(?:\\s|$)`));
  return trends.filter((t) => {
    const k = normalizar(t.keyword);
    return patrones.some((p) => p.test(k));
  });
}

/** Copia del producto con la tendencia marcada como "publicada" si aparece entre las búsquedas en alza de Mercado Libre. */
export function withMeliEvidence(product: Product, matches: MeliTrend[]): Product {
  if (matches.length === 0) return product;
  const evidence: EvidenceMap = { ...(product.evidence ?? {}), trend: "publicado" };
  return { ...product, evidence };
}
