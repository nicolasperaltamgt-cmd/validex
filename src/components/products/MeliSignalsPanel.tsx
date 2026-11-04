import type { MeliProductSignal, MeliTrend } from "@/lib/meli-signals";

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "2-digit", year: "numeric" });
const miles = (n: number) => n.toLocaleString("es-AR");

/** Qué dice Mercado Libre de este producto: tendencias, tamaño de la oferta y más vendidos. Datos públicos, con fecha. */
export function MeliSignalsPanel({
  signal,
  matches,
  fetchedAt,
}: {
  signal: MeliProductSignal;
  matches: MeliTrend[];
  fetchedAt: string;
}) {
  const ruta = signal.categoryPath ? signal.categoryPath.split(" > ").slice(-2).join(" > ") : signal.categoryName;
  return (
    <section aria-labelledby="meli" className="mb-8 rounded-2xl border-2 border-profundo bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="meli" className="font-display text-xl font-bold">Qué dice Mercado Libre</h2>
        <p className="text-sm text-muted">Consultado el {fecha(fetchedAt)}</p>
      </div>

      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="font-semibold">Búsquedas en alza</dt>
          <dd className="mt-1.5">
            {matches.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {matches.map((m) => (
                  <li key={m.keyword} className="rounded-full bg-radar-soft px-3 py-1 text-xs font-bold text-radar-dark">
                    #{m.position} «{m.keyword}»
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-ink-soft">No aparece entre las 50 búsquedas en alza de hoy.</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-semibold">Categoría</dt>
          <dd className="mt-1 text-ink-soft">
            {ruta}
            {signal.categoryMatch === "aproximada" ? (
              <span className="ml-2 rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-semibold text-muted">
                categoría aproximada
              </span>
            ) : null}
            {signal.totalItems ? (
              <>
                {" · "}
                <strong className="text-ink">{miles(signal.totalItems)}</strong> publicaciones
              </>
            ) : null}
          </dd>
        </div>
      </dl>

      {signal.bestSellers.length > 0 ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-radar-dark underline-offset-2 hover:underline">
            Los más vendidos de la categoría
          </summary>
          <ol className="mt-3 space-y-1.5 text-ink-soft">
            {signal.bestSellers.map((b) => (
              <li key={b.position}>
                <span className="font-semibold tabular-nums text-ink">{b.position}.</span> {b.name}
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <p className="mt-4 text-xs text-muted">
        Fuente: Mercado Libre. Señales de interés y tamaño de la oferta, no ventas ni precios. La categoría la sugiere Mercado Libre según el nombre del producto.
      </p>
    </section>
  );
}
