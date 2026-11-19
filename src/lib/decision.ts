import type { Coverage } from "./coverage";
import type { Firmness } from "./sensitivity";
import { AVOID_BELOW } from "./avoid";

/**
 * Veredicto de un producto: descartar, probar en chico o comprar.
 * Regla de honestidad: "comprar" solo aparece si TODOS los datos están confirmados con cotizaciones, el margen es firme
 * y el score es alto. Mientras haya datos sin confirmar, lo máximo que se recomienda es probar en chico.
 */
export type Verdict = "descartar" | "probar-en-chico" | "comprar";

export interface Decision {
  verdict: Verdict;
  title: string;
  /** Razones cortas, a partir de los números. */
  why: string[];
  /** Qué falta comprobar antes de decidir. */
  missing: string[];
}

export interface DecisionInput {
  score: number;
  marginPct: number;
  profit: number;
  /** Solo para productos del catálogo. En los que carga la persona no hay forma de saber qué está confirmado. */
  firmness?: Firmness;
  coverage?: Coverage;
}

const SCORE_COMPRAR = 70;

export const VERDICT_TITLE: Record<Verdict, string> = {
  descartar: "Descartalo por ahora",
  "probar-en-chico": "Probalo en chico",
  comprar: "Podés avanzar a comprar",
};

/** Lo que siempre hay que comprobar cuando no se sabe qué datos están confirmados (por ejemplo, en Tantear). */
export const FALTA_GENERAL = [
  "Cotización por escrito del proveedor",
  "Flete real hasta tu depósito",
  "Posición arancelaria con un despachante",
  "Precio de venta actual en las publicaciones",
  "Cuántos vendedores publican lo mismo",
];

export function decide(i: DecisionInput): Decision {
  const why: string[] = [];
  const missing: string[] = i.coverage
    ? i.coverage.items.filter((x) => x.level !== "confirmado").map((x) => x.label)
    : [...FALTA_GENERAL];

  if (i.profit <= 0) {
    why.push("Con estos números perdés plata en cada unidad.");
    return { verdict: "descartar", title: VERDICT_TITLE.descartar, why, missing: [] };
  }
  if (i.score < AVOID_BELOW) {
    why.push(`El score es ${i.score}, por debajo de ${AVOID_BELOW}.`);
    return { verdict: "descartar", title: VERDICT_TITLE.descartar, why, missing: [] };
  }

  why.push(`Da ganancia: margen de ${i.marginPct.toFixed(1).replace(".", ",")} %.`);
  if (i.firmness === "sensible") why.push("El margen cae por debajo de 10 % si el flete o los impuestos salen peor.");
  if (i.firmness === "firme") why.push("El margen aguanta impuestos altos y flete al doble.");

  const todoConfirmado = i.coverage?.status === "completo";
  if (todoConfirmado && i.firmness === "firme" && i.score >= SCORE_COMPRAR) {
    why.push("Todos los datos están confirmados.");
    return { verdict: "comprar", title: VERDICT_TITLE.comprar, why, missing: [] };
  }

  if (missing.length > 0) why.push(`Faltan comprobar ${missing.length} datos antes de comprar en serio.`);
  return { verdict: "probar-en-chico", title: VERDICT_TITLE["probar-en-chico"], why, missing };
}
