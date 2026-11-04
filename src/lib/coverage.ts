import type { EvidenceLevel, EvidenceMap, EvidenceKey, Product } from "@/data/types";

/**
 * Cobertura del análisis: cuántos de los datos que entran al score tienen respaldo real.
 *   confirmado = cotización o dato verificado por Validex
 *   publicado  = cifra publicada por una fuente que se puede abrir (pero no confirmada con un proveedor)
 *   estimado   = supuesto o estimación nuestra
 * Un producto solo es "completo" si los siete datos están confirmados y su estado es "verified".
 */
export const EVIDENCE_KEYS: EvidenceKey[] = [
  "salePrice",
  "purchase",
  "shipping",
  "taxes",
  "commission",
  "trend",
  "competition",
];

export const EVIDENCE_LABEL: Record<EvidenceKey, string> = {
  salePrice: "Precio de venta",
  purchase: "Costo de compra",
  shipping: "Flete",
  taxes: "Impuestos de importación",
  commission: "Comisión de la plataforma",
  trend: "Tendencia",
  competition: "Competencia",
};

/** Qué hace falta para subir cada dato a "confirmado". */
export const EVIDENCE_NEXT: Record<EvidenceKey, string> = {
  salePrice: "Revisar el precio de venta actual en las publicaciones de Mercado Libre del mismo producto.",
  purchase: "Pedir una cotización por escrito al proveedor para la cantidad que vas a comprar.",
  shipping: "Pedir cotización de flete a un transportista o al proveedor (FOB y puesto en Buenos Aires).",
  taxes: "Confirmar la posición arancelaria con un despachante de aduana.",
  commission: "Mirar la comisión exacta de la categoría en la Central de Vendedores.",
  trend: "Contrastar con una fuente de tendencia propia (Google Trends o búsquedas de Mercado Libre) de las últimas semanas.",
  competition: "Contar cuántos vendedores publican el mismo producto y a qué precio.",
};

export const EVIDENCE_LEVEL_LABEL: Record<EvidenceLevel, string> = {
  confirmado: "Confirmado",
  publicado: "Publicado",
  estimado: "Estimado",
};

export type CoverageStatus = "completo" | "parcial" | "incompleto";

export interface Coverage {
  status: CoverageStatus;
  /** Datos con respaldo (confirmado o publicado) sobre el total. */
  backed: number;
  confirmed: number;
  total: number;
  items: { key: EvidenceKey; label: string; level: EvidenceLevel; next: string }[];
}

export function coverageOf(p: Pick<Product, "evidence" | "dataStatus">): Coverage {
  const evidence: EvidenceMap = p.evidence ?? {};
  const items = EVIDENCE_KEYS.map((key) => ({
    key,
    label: EVIDENCE_LABEL[key],
    level: evidence[key] ?? ("estimado" as EvidenceLevel),
    next: EVIDENCE_NEXT[key],
  }));
  const confirmed = items.filter((i) => i.level === "confirmado").length;
  const backed = items.filter((i) => i.level !== "estimado").length;
  const total = items.length;
  let status: CoverageStatus = "incompleto";
  if (confirmed === total && p.dataStatus === "verified") status = "completo";
  else if (backed >= total - 2) status = "parcial";
  return { status, backed, confirmed, total, items };
}

export const COVERAGE_LABEL: Record<CoverageStatus, string> = {
  completo: "Análisis completo",
  parcial: "Análisis parcial",
  incompleto: "Análisis incompleto",
};
