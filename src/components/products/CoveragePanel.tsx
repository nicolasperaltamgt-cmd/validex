import type { Product } from "@/data/types";
import { COVERAGE_LABEL, EVIDENCE_LEVEL_LABEL, coverageOf } from "@/lib/coverage";

const LEVEL_STYLE = {
  confirmado: "bg-radar text-white",
  publicado: "bg-panel text-ink",
  estimado: "border border-dashed border-muted text-muted",
} as const;

const SEGMENT_STYLE = {
  confirmado: "bg-radar",
  publicado: "bg-radar/40",
  estimado: "bg-line",
} as const;

/** Cuántos datos del score tienen respaldo. Lo largo (qué falta para confirmar) queda en un desplegable. */
export function CoveragePanel({ product }: { product: Product }) {
  const c = coverageOf(product);
  return (
    <section aria-labelledby="cobertura" className="mb-8 rounded-2xl border-2 border-profundo bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="cobertura" className="font-display text-xl font-bold">{COVERAGE_LABEL[c.status]}</h2>
        <p className="text-sm font-semibold tabular-nums">
          {c.backed} de {c.total} datos con fuente
        </p>
      </div>

      <div className="mt-3 flex gap-1" aria-hidden="true">
        {c.items.map((i) => (
          <span key={i.key} className={`h-2 flex-1 rounded-full ${SEGMENT_STYLE[i.level]}`} />
        ))}
      </div>

      <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {c.items.map((i) => (
          <li key={i.key} className="flex items-center justify-between gap-3">
            <span>{i.label}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[i.level]}`}>
              {EVIDENCE_LEVEL_LABEL[i.level]}
            </span>
          </li>
        ))}
      </ul>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-radar-dark underline-offset-2 hover:underline">
          ¿Cómo confirmar cada dato?
        </summary>
        <ul className="mt-3 space-y-2 text-ink-soft">
          {c.items
            .filter((i) => i.level !== "confirmado")
            .map((i) => (
              <li key={i.key}>
                <span className="font-medium text-ink">{i.label}:</span> {i.next}
              </li>
            ))}
        </ul>
      </details>
    </section>
  );
}
