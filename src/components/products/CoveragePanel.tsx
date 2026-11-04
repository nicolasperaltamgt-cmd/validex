import type { Product } from "@/data/types";
import { COVERAGE_LABEL, EVIDENCE_LEVEL_LABEL, coverageOf } from "@/lib/coverage";

const LEVEL_STYLE = {
  confirmado: "bg-radar text-white",
  publicado: "bg-panel text-ink",
  estimado: "border border-dashed border-muted text-muted",
} as const;

/** Muestra cuántos datos del score tienen respaldo y qué falta para confirmarlos. */
export function CoveragePanel({ product }: { product: Product }) {
  const c = coverageOf(product);
  return (
    <section aria-labelledby="cobertura" className="mb-8 rounded-2xl border-2 border-profundo bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="cobertura" className="font-display text-xl font-bold">{COVERAGE_LABEL[c.status]}</h2>
        <p className="text-sm font-semibold tabular-nums text-ink-soft">
          {c.backed} de {c.total} datos con fuente · {c.confirmed} confirmados
        </p>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        El score usa siete datos. Acá ves cuáles salen de una fuente que podés abrir y cuáles son estimaciones nuestras. Mientras no
        haya cotizaciones confirmadas, tomalo como una primera orientación y no como una decisión de compra.
      </p>
      <ul className="mt-4 divide-y divide-line text-sm">
        {c.items.map((i) => (
          <li key={i.key} className="grid gap-1 py-3 sm:grid-cols-[13rem_7rem_1fr] sm:items-baseline sm:gap-4">
            <span className="font-medium">{i.label}</span>
            <span>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[i.level]}`}>
                {EVIDENCE_LEVEL_LABEL[i.level]}
              </span>
            </span>
            <span className="text-ink-soft">{i.level === "confirmado" ? "Verificado por Validex." : `Para confirmarlo: ${i.next}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
