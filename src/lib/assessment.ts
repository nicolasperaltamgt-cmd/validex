import type { Product } from "@/data/types";
import { calculate, type CalcResult } from "./calculator";
import { scoreProduct, type ScoreBand } from "./score";

export type Level = "favorable" | "moderate" | "cautious";

export interface Assessment {
  level: Level;
  calc: CalcResult;
  reasons: string[];
}

const LEVEL_BY_BAND: Record<ScoreBand, Level> = {
  high: "favorable",
  medium: "moderate",
  low: "cautious",
};

/**
 * Lectura orientativa de un producto. El nivel sale del Score Validex (ver `score.ts`),
 * así que toda la app dice lo mismo. NO es una predicción de rentabilidad.
 */
export function assess(p: Product): Assessment {
  const calc = calculate({
    purchase: p.costs.purchase,
    shipping: p.costs.shipping,
    taxes: p.costs.taxes,
    commissionPct: p.costs.commissionPct,
    salePrice: p.referencePriceUsd,
  });
  const score = scoreProduct(p);
  return { level: LEVEL_BY_BAND[score.band], calc, reasons: score.parts.map((part) => part.why) };
}
