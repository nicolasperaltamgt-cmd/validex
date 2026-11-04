import type { Product } from "@/data/types";

const SUMMARY = "cursor-pointer py-3 text-sm font-semibold text-radar-dark underline-offset-2 hover:underline";

/** Muestra de dónde sale cada número de un producto con referencias reales. Cada bloque se abre a pedido. */
export function SourcesPanel({ product }: { product: Product }) {
  const { sources, assumptions } = product;
  if (!sources?.length && !assumptions?.length) return null;
  return (
    <section aria-labelledby="fuentes" className="mt-8 rounded-2xl border-2 border-profundo bg-surface p-5 sm:p-6">
      <h2 id="fuentes" className="font-display text-xl font-bold">De dónde sale cada número</h2>
      <p className="mt-1 text-sm text-ink-soft">Relevado el {product.updatedAt.split("-").reverse().join("/")}. Los precios cambian todos los días.</p>

      <div className="mt-3 divide-y divide-line">
        {assumptions?.length ? (
          <details>
            <summary className={SUMMARY}>Qué es dato y qué es estimación nuestra ({assumptions.length})</summary>
            <ul className="mb-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
              <li>{product.sourceNote}</li>
              {assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </details>
        ) : null}

        {sources?.length ? (
          <details>
            <summary className={SUMMARY}>Fuentes ({sources.length})</summary>
            <ul className="mb-3 space-y-2 text-sm">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-radar underline underline-offset-4">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-muted">Confirmalos con cotizaciones reales antes de comprar.</p>
    </section>
  );
}
