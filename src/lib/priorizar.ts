import type { Coverage } from "./coverage";
import { planCapital, type PlanCapital } from "./capital";

/**
 * El score dice qué tan buena parece la oportunidad. La evidencia dice cuánto de eso está respaldado.
 * Son dos cosas distintas y se muestran por separado.
 */
export type NivelEvidencia = "fuerte" | "media" | "debil";

export const EVIDENCIA_ETIQUETA: Record<NivelEvidencia, string> = {
  fuerte: "Evidencia fuerte",
  media: "Evidencia media",
  debil: "Evidencia débil",
};

export function nivelEvidencia(c: Coverage): NivelEvidencia {
  if (c.confirmed >= c.total - 1) return "fuerte";
  if (c.backed >= c.total - 2) return "media";
  return "debil";
}

/** Peso que le damos a la evidencia al ordenar: con evidencia nula el score vale 60 %, con evidencia total, 100 %. */
export const PESO_BASE = 0.6;

/** Score ajustado por evidencia, solo para ordenar qué investigar primero. No reemplaza al score. */
export function scoreAjustado(score: number, c: Coverage): number {
  return Math.round(score * (PESO_BASE + (1 - PESO_BASE) * (c.backed / c.total)) * 10) / 10;
}

export interface CandidatoPriorizar {
  id: string;
  nombre: string;
  score: number;
  profit: number;
  totalCost: number;
  coverage: Coverage;
}

export interface Priorizado {
  id: string;
  nombre: string;
  score: number;
  ajustado: number;
  nivel: NivelEvidencia;
  plan: PlanCapital | null;
  /** Ganancia sobre lo invertido si se vende todo, en %. */
  retornoPct: number | null;
  /** Los productos que pierden plata no compiten: quedan al final y se marcan. */
  pierde: boolean;
}

/** Ordena qué investigar primero: primero los que dan ganancia, por score ajustado por evidencia; a igualdad, mayor retorno. */
export function priorizar(candidatos: CandidatoPriorizar[], capital: number): Priorizado[] {
  const lista = candidatos.map<Priorizado>((c) => ({
    id: c.id,
    nombre: c.nombre,
    score: c.score,
    ajustado: scoreAjustado(c.score, c.coverage),
    nivel: nivelEvidencia(c.coverage),
    plan: planCapital(capital, c.totalCost, c.profit),
    retornoPct: c.totalCost > 0 ? (c.profit / c.totalCost) * 100 : null,
    pierde: c.profit <= 0,
  }));
  return lista.sort(
    (a, b) =>
      Number(a.pierde) - Number(b.pierde) || b.ajustado - a.ajustado || (b.retornoPct ?? -Infinity) - (a.retornoPct ?? -Infinity),
  );
}
