import type { Competition, Product, Trend } from "@/data/types";
import { calculate } from "./calculator";

export type ScoreBand = "high" | "medium" | "low";

export interface ScorePart {
  key: "margin" | "trend" | "competition" | "capital";
  label: string;
  points: number;
  max: number;
  why: string;
}

export interface ScoreResult {
  score: number;
  band: ScoreBand;
  parts: ScorePart[];
  /** Verdadero si el producto pierde plata por unidad y el puntaje se limitó. */
  capped: boolean;
}

export interface ScoreInput {
  /** Beneficio sobre el precio de venta, en %. */
  marginPct: number;
  /** Costo total por unidad, en USD. */
  unitCostUsd: number;
  trend: Trend;
  competition: Competition;
}

/**
 * Score Validex (0 a 100). Es una regla simple y abierta, NO una predicción de ventas:
 * los pesos son una decisión de diseño y se pueden discutir. Se muestra completa al usuario.
 *   Margen 40 + Tendencia 25 + Competencia 20 + Capital por unidad 15 = 100.
 */
export const SCORE_MAX = { margin: 40, trend: 25, competition: 20, capital: 15 } as const;

const TREND_POINTS: Record<Trend, number> = { up: 25, steady: 14, down: 3 };
const COMPETITION_POINTS: Record<Competition, number> = { low: 20, medium: 11, high: 3 };
const LOSS_CAP = 29;

function capitalPoints(unitCostUsd: number): number {
  if (unitCostUsd <= 10) return 15;
  if (unitCostUsd <= 30) return 10;
  if (unitCostUsd <= 80) return 5;
  return 2;
}

export function bandOf(score: number): ScoreBand {
  return score >= 70 ? "high" : score >= 45 ? "medium" : "low";
}

export function scoreInput(input: ScoreInput): ScoreResult {
  const m = Math.min(Math.max(input.marginPct, 0), 50);
  const marginPts = Math.round((m / 50) * SCORE_MAX.margin);
  const capPts = capitalPoints(input.unitCostUsd);

  const parts: ScorePart[] = [
    {
      key: "margin",
      label: "Margen",
      points: marginPts,
      max: SCORE_MAX.margin,
      why:
        input.marginPct < 0
          ? "Con estos números perdés plata en cada unidad."
          : `Margen de ${input.marginPct.toFixed(1)} %. Llega al máximo con 50 % o más.`,
    },
    {
      key: "trend",
      label: "Tendencia",
      points: TREND_POINTS[input.trend],
      max: SCORE_MAX.trend,
      why:
        input.trend === "up"
          ? "La señal de demanda va en alza."
          : input.trend === "steady"
            ? "La señal de demanda está estable."
            : "La señal de demanda va en baja.",
    },
    {
      key: "competition",
      label: "Competencia",
      points: COMPETITION_POINTS[input.competition],
      max: SCORE_MAX.competition,
      why:
        input.competition === "low"
          ? "Pocos vendedores: más espacio para entrar."
          : input.competition === "medium"
            ? "Competencia media."
            : "Muchos vendedores: cuesta diferenciarse.",
    },
    {
      key: "capital",
      label: "Plata en juego",
      points: capPts,
      max: SCORE_MAX.capital,
      why: `Costo total de ${input.unitCostUsd.toFixed(2)} USD por unidad: cuanto menos, menos riesgo al probar.`,
    },
  ];

  const raw = parts.reduce((s, p) => s + p.points, 0);
  const capped = input.marginPct < 0;
  const score = capped ? Math.min(raw, LOSS_CAP) : raw;
  return { score, band: bandOf(score), parts, capped };
}

/** Score de un producto del catálogo, con los costos ilustrativos que trae. */
export function scoreProduct(p: Product): ScoreResult {
  const calc = calculate({
    purchase: p.costs.purchase,
    shipping: p.costs.shipping,
    taxes: p.costs.taxes,
    commissionPct: p.costs.commissionPct,
    salePrice: p.referencePriceUsd,
  });
  return scoreInput({
    marginPct: calc.marginPct,
    unitCostUsd: calc.totalCost,
    trend: p.trend,
    competition: p.competition,
  });
}
