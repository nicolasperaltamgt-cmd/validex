import type { Product } from "@/data/types";
import { formatMoney, formatPercent } from "@/lib/format";
import { FIRMNESS_LABEL, FIRMNESS_SHORT, sensitivityOf } from "@/lib/sensitivity";

/** Cuánto aguanta el margen. Las explicaciones largas quedan en un desplegable. */
export function SensitivityPanel({ product }: { product: Product }) {
  const s = sensitivityOf(product);
  return (
    <section aria-labelledby="firmeza" className="mb-8 rounded-2xl border-2 border-profundo bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="firmeza" className="font-display text-xl font-bold">¿Aguanta el margen?</h2>
        <span className="rounded-full bg-panel px-3 py-1 text-sm font-semibold">{FIRMNESS_LABEL[s.firmness]}</span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{FIRMNESS_SHORT[s.firmness]}</p>

      <div
        className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-radar"
        tabIndex={0}
        role="region"
        aria-label="Escenarios de margen: la tabla se desplaza hacia los costados"
      >
        <table className="w-full min-w-[26rem] text-sm">
          <caption className="sr-only">Margen y score en distintos escenarios</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th scope="col" className="py-2 pr-4 font-medium">Escenario</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Margen</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Ganancia</th>
              <th scope="col" className="py-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {s.scenarios.map((x) => (
              <tr key={x.key} className="border-b border-line last:border-0">
                <th scope="row" className="py-2.5 pr-4 text-left font-medium">{x.label}</th>
                <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">{formatPercent(x.marginPct)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{formatMoney(x.profit, "USD")}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{x.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm font-medium">
        {s.breakEvenPrice === null
          ? "Con esta comisión no hay precio que cubra los costos."
          : s.priceCushionPct > 0
            ? `Da pérdida si lo vendés por menos de ${formatMoney(s.breakEvenPrice, "USD")} (colchón de ${formatPercent(s.priceCushionPct)}).`
            : `Para no perder, hay que vender a ${formatMoney(s.breakEvenPrice, "USD")} o más.`}
      </p>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-radar-dark underline-offset-2 hover:underline">
          ¿Qué significa cada escenario?
        </summary>
        <ul className="mt-3 space-y-2 text-ink-soft">
          {s.scenarios.map((x) => (
            <li key={x.key}>
              <span className="font-medium text-ink">{x.label}:</span> {x.detail}
            </li>
          ))}
          <li className="text-muted">Los rangos de impuestos y comisión son los publicados. No es una predicción.</li>
        </ul>
      </details>
    </section>
  );
}
