import type { Product } from "@/data/types";
import { calculate, precioParaMargen } from "./calculator";
import { scoreInput } from "./score";
import { DEFAULT_MARKET } from "./markets";

/**
 * Qué tan firme es el margen de un producto cuando los datos estimados cambian dentro de rangos publicados.
 * No predice nada: muestra el abanico. Los rangos salen de fuentes que figuran en `docs/` y en la página de metodología:
 *   - derechos de importación: 0 % a 35 % según la posición arancelaria, más 0,5 % de tasa de estadística (Aduana / ARCA);
 *   - comisión de Mercado Libre: 11,8 % a 17,1 % según categoría (algoritmodigital.com.ar).
 * La prueba de "flete al doble" es una prueba de estrés nuestra, no un dato publicado.
 */
export const DUTY_RANGE = DEFAULT_MARKET.dutyRange;
export const STATISTICS_FEE = DEFAULT_MARKET.statisticsFee;
export const COMMISSION_RANGE = { min: DEFAULT_MARKET.commission.minPct, max: DEFAULT_MARKET.commission.maxPct };

export type Firmness = "firme" | "sensible" | "no-cierra";

export interface Scenario {
  key: "base" | "mejor" | "peor" | "flete";
  label: string;
  detail: string;
  marginPct: number;
  profit: number;
  score: number;
}

export interface Sensitivity {
  scenarios: Scenario[];
  /** Precio de venta (USD, sin IVA) al que el producto deja de dar pérdida con los costos base. */
  breakEvenPrice: number | null;
  /** Cuánto puede bajar el precio de venta, en %, antes de entrar en pérdida con los costos base. Negativo si ya hay pérdida. */
  priceCushionPct: number;
  firmness: Firmness;
}

function run(p: Product, opts: { duty: number; commissionPct: number; shippingFactor: number }) {
  const shipping = p.costs.shipping * opts.shippingFactor;
  const taxes = (p.costs.purchase + shipping) * (opts.duty + STATISTICS_FEE);
  const calc = calculate({
    purchase: p.costs.purchase,
    shipping,
    taxes,
    commissionPct: opts.commissionPct,
    salePrice: p.referencePriceUsd,
  });
  const score = scoreInput({
    marginPct: calc.marginPct,
    unitCostUsd: calc.totalCost,
    trend: p.trend,
    competition: p.competition,
  });
  return { calc, score: score.score };
}

export function sensitivityOf(p: Product): Sensitivity {
  // El escenario base usa exactamente los números de la ficha, para que todo el sitio diga lo mismo.
  const baseCalc = calculate({
    purchase: p.costs.purchase,
    shipping: p.costs.shipping,
    taxes: p.costs.taxes,
    commissionPct: p.costs.commissionPct,
    salePrice: p.referencePriceUsd,
  });
  const baseScore = scoreInput({
    marginPct: baseCalc.marginPct,
    unitCostUsd: baseCalc.totalCost,
    trend: p.trend,
    competition: p.competition,
  }).score;

  const best = run(p, { duty: DUTY_RANGE.min, commissionPct: COMMISSION_RANGE.min, shippingFactor: 1 });
  const worst = run(p, { duty: DUTY_RANGE.max, commissionPct: COMMISSION_RANGE.max, shippingFactor: 1 });
  const freight = run(p, {
    duty: (p.costs.taxes / (p.costs.purchase + p.costs.shipping)) - STATISTICS_FEE,
    commissionPct: p.costs.commissionPct,
    shippingFactor: 2,
  });

  const scenarios: Scenario[] = [
    {
      key: "base",
      label: "Caso base",
      detail: "Los números de la ficha.",
      marginPct: baseCalc.marginPct,
      profit: baseCalc.profit,
      score: baseScore,
    },
    {
      key: "mejor",
      label: "Mejor caso",
      detail: "Sin derechos de importación y comisión de 11,8 %.",
      marginPct: best.calc.marginPct,
      profit: best.calc.profit,
      score: best.score,
    },
    {
      key: "peor",
      label: "Peor caso",
      detail: "Derechos de 35 % y comisión de 17,1 %.",
      marginPct: worst.calc.marginPct,
      profit: worst.calc.profit,
      score: worst.score,
    },
    {
      key: "flete",
      label: "Si el flete cuesta el doble",
      detail: "Prueba de estrés: el flete es una estimación nuestra.",
      marginPct: freight.calc.marginPct,
      profit: freight.calc.profit,
      score: freight.score,
    },
  ];

  const fixed = p.costs.purchase + p.costs.shipping + p.costs.taxes;
  const breakEvenPrice = precioParaMargen(fixed, p.costs.commissionPct, 0);
  const priceCushionPct =
    breakEvenPrice === null ? -100 : ((p.referencePriceUsd - breakEvenPrice) / p.referencePriceUsd) * 100;

  const worstMargin = Math.min(worst.calc.marginPct, freight.calc.marginPct);
  let firmness: Firmness;
  if (baseCalc.marginPct <= 0) firmness = "no-cierra";
  else if (worstMargin >= 10) firmness = "firme";
  else firmness = "sensible";

  return { scenarios, breakEvenPrice, priceCushionPct, firmness };
}

export const FIRMNESS_LABEL: Record<Firmness, string> = {
  firme: "Margen firme",
  sensible: "Margen sensible",
  "no-cierra": "No cierra con estos números",
};

export const FIRMNESS_TEXT: Record<Firmness, string> = {
  firme: "Aun en el peor caso y con el flete al doble, el margen se mantiene en 10 % o más.",
  sensible: "El margen es positivo en el caso base, pero cae por debajo de 10 % si los impuestos, la comisión o el flete salen peor de lo estimado.",
  "no-cierra": "Con los números base el producto no deja ganancia. Solo cambiaría con un costo o un precio de venta distintos.",
};
