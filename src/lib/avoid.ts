import type { Product } from "@/data/types";
import { assess } from "./assessment";
import { scoreProduct } from "./score";
import { sensitivityOf } from "./sensitivity";

/**
 * "Evitá estos": los productos de menor score del catálogo y por qué.
 * Los motivos salen de los números de cada ficha (margen, competencia, tendencia, firmeza, riesgos cargados).
 * No se afirma nada que no esté en los datos: por ejemplo, "necesita homologación" solo aparece si la ficha lo dice.
 */
export const AVOID_BELOW = 45;
const MAX_REASONS = 3;

export interface AvoidItem {
  product: Product;
  score: number;
  marginPct: number;
  profit: number;
  reasons: string[];
}

function reasonsOf(p: Product): string[] {
  const a = assess(p);
  const s = sensitivityOf(p);
  const out: string[] = [];
  if (a.calc.profit < 0) out.push("Pierde plata en cada unidad");
  else if (a.calc.marginPct < 10) out.push("Margen casi nulo");
  if (p.competition === "high") out.push("Muchos vendedores publicando lo mismo");
  if (p.trend === "down") out.push("La demanda va en baja");
  if (s.firmness === "sensible" && a.calc.profit >= 0) out.push("Se cae con más flete o impuestos");
  if (p.risks.some((r) => /homolog|certific/i.test(r))) out.push("Necesita homologación o certificación");
  return out.slice(0, MAX_REASONS);
}

/** Productos con score por debajo del umbral, del peor al menos malo. Los de demostración no entran. */
export function avoidList(products: Product[], limit?: number): AvoidItem[] {
  const items = products
    .filter((p) => p.dataStatus !== "demo")
    .map((p) => {
      const a = assess(p);
      return { product: p, score: scoreProduct(p).score, marginPct: a.calc.marginPct, profit: a.calc.profit, reasons: reasonsOf(p) };
    })
    .filter((x) => x.score < AVOID_BELOW)
    .sort((x, y) => x.score - y.score);
  return limit ? items.slice(0, limit) : items;
}
