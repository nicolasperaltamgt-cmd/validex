export interface CalcInput {
  purchase: number;
  shipping: number;
  taxes: number;
  commissionPct: number;
  salePrice: number;
}

export interface CalcResult {
  commission: number;
  totalCost: number;
  profit: number;
  /** Beneficio sobre el precio de venta, en %. */
  marginPct: number;
  /** Beneficio sobre el costo total, en %. */
  markupPct: number;
}

export function calculate(input: CalcInput): CalcResult {
  const commission = (input.salePrice * input.commissionPct) / 100;
  const totalCost = input.purchase + input.shipping + input.taxes + commission;
  const profit = input.salePrice - totalCost;
  return {
    commission,
    totalCost,
    profit,
    marginPct: input.salePrice > 0 ? (profit / input.salePrice) * 100 : 0,
    markupPct: totalCost > 0 ? (profit / totalCost) * 100 : 0,
  };
}

/** Acepta "12,5" o "12.5". Devuelve null si el texto no es un número válido. */
export function parseDecimal(text: string): number | null {
  const clean = text.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^(\d+\.?\d*|\.\d+)$/.test(clean)) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

export type FieldKey = keyof CalcInput;

export const FIELD_MAX: Record<FieldKey, number> = {
  purchase: 1_000_000,
  shipping: 1_000_000,
  taxes: 1_000_000,
  commissionPct: 100,
  salePrice: 1_000_000,
};

/** Devuelve un mensaje de error en español o null si el valor es válido. */
export function validateField(key: FieldKey, text: string): string | null {
  const n = parseDecimal(text);
  if (n === null) {
    return text.trim() === ""
      ? "Completá este campo (podés poner 0)."
      : "Ingresá un número válido, sin letras ni signos negativos.";
  }
  if (n > FIELD_MAX[key]) {
    return `El valor máximo permitido es ${FIELD_MAX[key].toLocaleString("es-AR")}.`;
  }
  if (key === "salePrice" && n === 0) {
    return "El precio de venta debe ser mayor que 0.";
  }
  return null;
}

/**
 * Precio de venta mínimo para lograr un margen objetivo (sobre el precio), dado el costo fijo por unidad y la comisión.
 * Devuelve null si con esa comisión y ese margen no hay precio que alcance.
 */
export function precioParaMargen(
  costoFijo: number,
  commissionPct: number,
  margenPct: number,
): number | null {
  const resto = 1 - commissionPct / 100 - margenPct / 100;
  return resto > 0 ? costoFijo / resto : null;
}
