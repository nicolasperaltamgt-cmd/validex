// Tipos de datos del catálogo. Cuando se conecte una fuente real (p. ej. Supabase),
// estos tipos describen la forma que debe devolver la capa de datos.

export type Trend = "up" | "steady" | "down";
export type Competition = "low" | "medium" | "high";

/** Estado del dato. Hoy todo es "demo"; las demás opciones están previstas para el futuro. */
export type DataStatus = "demo" | "unverified" | "verified";

/** Datos que entran al score y de los que se lleva el respaldo (ver `lib/coverage.ts`). */
export type EvidenceKey =
  | "salePrice"
  | "purchase"
  | "shipping"
  | "taxes"
  | "commission"
  | "trend"
  | "competition";
/** confirmado = cotización o verificación propia; publicado = cifra de una fuente abierta; estimado = supuesto nuestro. */
export type EvidenceLevel = "confirmado" | "publicado" | "estimado";
export type EvidenceMap = Partial<Record<EvidenceKey, EvidenceLevel>>;

export interface IllustrativeCosts {
  /** Costo de compra por unidad (ilustrativo). */
  purchase: number;
  /** Transporte por unidad (ilustrativo). */
  shipping: number;
  /** Impuestos y aranceles por unidad (ilustrativo, NO es un cálculo aduanero). */
  taxes: number;
  /** Comisión de plataforma, en % del precio de venta (ilustrativo). */
  commissionPct: number;
}

export interface ProductSource {
  label: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  /** Mercado o país de referencia. */
  market: string;
  description: string;
  /** Precio de venta de referencia en USD (ilustrativo). */
  referencePriceUsd: number;
  trend: Trend;
  competition: Competition;
  costs: IllustrativeCosts;
  /** Fecha ISO (AAAA-MM-DD) de la última actualización del dato. */
  updatedAt: string;
  dataStatus: DataStatus;
  /** Descripción del origen del dato. Para datos demo: aclaración explícita. */
  sourceNote: string;
  risks: string[];
  opportunities: string[];
  /** Ruta de una imagen ilustrativa dentro de `public/`. Nunca es la foto real de una tienda. */
  image?: string;
  /** Enlaces de donde salen los números. Los productos reales siempre los traen. */
  sources?: ProductSource[];
  /** Qué es dato publicado y qué es estimación nuestra, en lenguaje claro. */
  assumptions?: string[];
  /** Respaldo de cada dato del score. Lo que no figura se considera "estimado". */
  evidence?: EvidenceMap;
}
