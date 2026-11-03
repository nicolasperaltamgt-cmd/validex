import { parseDolar, type Dolar } from "./dolar-parse";

/**
 * Cotizaciones del dólar desde DolarAPI (https://dolarapi.com): pública, gratuita y sin clave.
 * Solo se usa en el servidor y se vuelve a pedir cada 10 minutos como máximo.
 */
export async function fetchDolar(): Promise<Dolar | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", { next: { revalidate: 600 } });
    if (!res.ok) return null;
    return parseDolar(await res.json());
  } catch {
    return null;
  }
}
