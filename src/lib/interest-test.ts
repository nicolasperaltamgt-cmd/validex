/**
 * Prueba de interés sin comprar stock. Toma números REALES de la prueba (gasto, visitas, contactos) y una estimación de la persona
 * (de cada 100 contactos, cuántos comprarían). No inventa ningún promedio del mercado.
 *
 * Reglas nuestras, a la vista:
 *  - Con menos de MIN_VISITAS visitas la muestra es chica: se pide seguir juntando.
 *  - Si conseguir una venta cuesta más que lo que ganás por unidad, se descarta.
 *  - Si cuesta más de la mitad de lo que ganás, se ajusta: queda muy poco margen para otros imprevistos.
 *  - Si cuesta la mitad o menos, conviene seguir.
 */
export const MIN_VISITAS = 100;
export const MAX_PARTE_DE_LA_GANANCIA = 0.5;

export type InterestVerdict = "juntar-mas" | "descartar" | "ajustar" | "seguir";

export interface InterestInput {
  /** Gasto total en anuncios, en dólares. */
  adSpend: number;
  visits: number;
  /** Personas que dejaron su contacto o dijeron "avisame". */
  leads: number;
  /** Estimación de la persona: de cada 100 contactos, cuántos terminarían comprando. */
  buyRatePct: number;
  /** Ganancia por unidad, en dólares (sale de Tantear). */
  profitPerUnit: number;
}

export interface InterestResult {
  verdict: InterestVerdict;
  conversionPct: number | null;
  costPerLead: number | null;
  expectedSales: number;
  costPerExpectedSale: number | null;
  message: string;
}

export function evaluateInterest(i: InterestInput): InterestResult | null {
  const nums = [i.adSpend, i.visits, i.leads, i.buyRatePct, i.profitPerUnit];
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (i.visits <= 0 || i.leads > i.visits || i.buyRatePct > 100) return null;

  const conversionPct = (i.leads / i.visits) * 100;
  const costPerLead = i.leads > 0 ? i.adSpend / i.leads : null;
  const expectedSales = (i.leads * i.buyRatePct) / 100;
  const costPerExpectedSale = expectedSales > 0 ? i.adSpend / expectedSales : null;
  const base = { conversionPct, costPerLead, expectedSales, costPerExpectedSale };

  if (i.visits < MIN_VISITAS) {
    return { ...base, verdict: "juntar-mas", message: `Todavía son pocas visitas (menos de ${MIN_VISITAS}): seguí juntando antes de decidir.` };
  }
  if (costPerExpectedSale === null) {
    return { ...base, verdict: "descartar", message: "Con esas visitas casi nadie mostró interés. Probá con otra oferta o descartalo." };
  }
  if (i.profitPerUnit <= 0) {
    return { ...base, verdict: "descartar", message: "El producto no deja ganancia por unidad: la prueba de interés no lo arregla." };
  }
  if (costPerExpectedSale > i.profitPerUnit) {
    return { ...base, verdict: "descartar", message: "Conseguir una venta te costaría más de lo que ganás por unidad." };
  }
  if (costPerExpectedSale > i.profitPerUnit * MAX_PARTE_DE_LA_GANANCIA) {
    return { ...base, verdict: "ajustar", message: "Conviene, pero conseguir cada venta se come más de la mitad de la ganancia. Mejorá la oferta o el precio." };
  }
  return { ...base, verdict: "seguir", message: "Hay interés a un costo razonable. Es una buena señal para hacer un primer pedido chico." };
}
