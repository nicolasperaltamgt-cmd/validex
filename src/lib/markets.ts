/**
 * Configuración por mercado: monedas, impuestos y comisiones en un solo lugar.
 * Hoy existe solo Argentina. Para sumar un país hay que cargar sus valores con fuente y fecha;
 * no se inventan tasas. Pasos en `docs/MERCADOS.md`.
 */

export interface MarketConfig {
  id: string;
  country: string;
  /** Moneda local (ISO 4217) y configuración regional para formatear. */
  currency: string;
  locale: string;
  /** IVA general, como fracción (0,21 = 21 %). */
  vat: number;
  /** Derechos de importación usados como estimación base, como fracción del valor CIF. */
  dutyEstimate: number;
  /** Rango publicado de derechos de importación según la posición arancelaria. */
  dutyRange: { min: number; max: number };
  /** Tasa de estadística (fracción del CIF). */
  statisticsFee: number;
  commission: {
    /** Comisión usada por defecto, en % del precio de venta. */
    defaultPct: number;
    /** Rango publicado según categoría. */
    minPct: number;
    maxPct: number;
    source: string;
  };
  /** Tipo de cambio de referencia a USD (moneda local por 1 USD) y de dónde sale. */
  referenceRate: { value: number; date: string; source: string };
  /** Plataforma de venta de referencia. */
  marketplace: string;
}

const AR: MarketConfig = {
  id: "AR",
  country: "Argentina",
  currency: "ARS",
  locale: "es-AR",
  vat: 0.21,
  dutyEstimate: 0.2,
  dutyRange: { min: 0, max: 0.35 },
  statisticsFee: 0.005,
  commission: {
    defaultPct: 14,
    minPct: 11.8,
    maxPct: 17.1,
    source: "https://algoritmodigital.com.ar/cuanto-es-la-comision-de-mercado-libre-por-vender/",
  },
  referenceRate: { value: 1580, date: "2026-11-19", source: "DolarAPI (dólar oficial, venta)" },
  marketplace: "Mercado Libre",
};

export const MARKETS: Record<string, MarketConfig> = { AR };
export const DEFAULT_MARKET: MarketConfig = AR;

/** Derechos + tasa de estadística como fracción del CIF, sin errores de coma flotante. */
export function importTaxRate(m: MarketConfig): number {
  return Math.round((m.dutyEstimate + m.statisticsFee) * 1000) / 1000;
}
