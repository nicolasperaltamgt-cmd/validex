import type { Product } from "@/data/types";

/** Muestra de dónde sale cada número de un producto con referencias reales. */
export function SourcesPanel({ product }: { product: Product }) {
  const { sources, assumptions } = product;
  if (!sources?.length && !assumptions?.length) return null;
  return (
    <section aria-labelledby="fuentes" className="mt-8 rounded-2xl border-2 border-profundo bg-surface p-6">
      <h2 id="fuentes" className="font-display text-xl font-bold">De dónde sale cada número</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{product.sourceNote}</p>

      {assumptions?.length ? (
        <>
          <h3 className="mt-5 text-sm font-semibold">Qué es dato y qué es estimación nuestra</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      ) : null}

      {sources?.length ? (
        <>
          <h3 className="mt-5 text-sm font-semibold">Fuentes</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-radar underline underline-offset-4">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-5 text-xs text-muted">
        Los precios salen de resultados de búsqueda del 1/11/2026, no de una consulta a cada página, y cambian todos los
        días. Confirmalos con cotizaciones reales antes de comprar.
      </p>
    </section>
  );
}
