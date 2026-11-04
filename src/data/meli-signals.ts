import type { MeliSignals } from "@/lib/meli-signals";
import raw from "./meli-signals.json";

/** Foto de las señales de Mercado Libre. Se actualiza con `npm run meli:signals` (ver docs/MERCADOLIBRE.md). */
export const meliSignals = raw as MeliSignals;
