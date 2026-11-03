export const DROP_SIZE = 3;
/** Un producto solo entra al drop si llega a este puntaje (a menos que no alcancen). */
export const MIN_DROP_SCORE = 45;

const TZ = "America/Argentina/Buenos_Aires";

/** Fecha AAAA-MM-DD en hora de Argentina. El drop cambia a la medianoche de allá. */
export function dateKeyArg(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export interface Ranked<T> {
  item: T;
  score: number;
}

/**
 * Elige los productos del día. Es determinista: la misma fecha da el mismo drop para todos.
 * Ordena por score, descarta los flojos y rota una ventana según la fecha.
 */
export function pickDrop<T extends { id: string }>(
  items: Ranked<T>[],
  dateKey: string,
  size: number = DROP_SIZE,
): Ranked<T>[] {
  const ranked = [...items].sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  const strong = ranked.filter((r) => r.score >= MIN_DROP_SCORE);
  const pool = strong.length >= size ? strong : ranked;
  if (pool.length <= size) return pool;
  const start = hash(dateKey) % pool.length;
  return Array.from({ length: size }, (_, i) => pool[(start + i) % pool.length]);
}
