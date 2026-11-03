export interface Dolar {
  /** Cotización de venta, en pesos por dólar. */
  blue: number;
  oficial: number;
  ccl: number;
  /** Fecha ISO de la actualización más reciente entre las tres cotizaciones. */
  updatedAt: string;
}

interface Row {
  venta: number;
  at: string;
}

function findRow(rows: unknown[], casa: string): Row | null {
  const r = rows.find((x) => typeof x === "object" && x !== null && (x as { casa?: unknown }).casa === casa) as
    | { venta?: unknown; fechaActualizacion?: unknown }
    | undefined;
  if (!r || typeof r.venta !== "number" || !(r.venta > 0)) return null;
  return { venta: r.venta, at: typeof r.fechaActualizacion === "string" ? r.fechaActualizacion : "" };
}

/** Lee la respuesta de DolarAPI (`/v1/dolares`). Devuelve null si no tiene el formato esperado. */
export function parseDolar(json: unknown): Dolar | null {
  if (!Array.isArray(json)) return null;
  const blue = findRow(json, "blue");
  const oficial = findRow(json, "oficial");
  const ccl = findRow(json, "contadoconliqui");
  if (!blue || !oficial || !ccl) return null;
  const dates = [blue.at, oficial.at, ccl.at].filter(Boolean).sort();
  return {
    blue: blue.venta,
    oficial: oficial.venta,
    ccl: ccl.venta,
    updatedAt: dates[dates.length - 1] ?? "",
  };
}
