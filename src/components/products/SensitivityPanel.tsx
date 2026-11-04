import type { Product } from "@/data/types";
import { formatMoney, formatPercent } from "@/lib/format";
import { FIRMNESS_LABEL, FIRMNESS_TEXT, sensitivityOf } from "@/lib/sensitivity";

/** Muestra el abanico del margen cuando los datos estimados cambian dentro de rangos publicados. */
export function SensitivityPanel({ product }: { product: Product }) {
  const s = sensitivityOf(product);
  return (
    <section aria-labelledby="firmeza" className="mb-8 rounded-2xl border-2 border-profundo bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="firmeza" className="font-display text-xl font-bold">¿Qué tan firme es este margen?</h2>
        <span className="rounded-full bg-panel px-3 py-1 text-sm font-semibold">{FIRMNESS_LABEL[s.firmness]}</span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">{FIRMNESS_TEXT[s.firmness]}</p>

      <div
        className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-radar"
        tabIndex={0}
        role="region"
        aria-label="Escenarios de margen: la tabla se desplaza hacia los costados"
      >
        <table className="w-full min-w-[30rem] text-sm">
          <caption className="sr-only">Margen y score en distintos escenarios</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th scope="col" className="py-2 pr-4 font-medium">Escenario</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Margen</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Ganancia por unidad</th>
              <th scope="col" className="py-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {s.scenarios.map((x) => (
              <tr key={x.key} className="border-b border-line last:border-0">
                <th scope="row" className="py-3 pr-4 text-left font-medium">
                  {x.label}
                  <span className="block text-xs font-normal text-muted">{x.detail}</span>
                </th>
                <td className="py-3 pr-4 text-right font-semibold tabular-nums">{formatPercent(x.marginPct)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{formatMoney(x.profit, "USD")}</td>
                <td className="py-3 text-right font-semibold tabular-nums">{x.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        {s.breakEvenPrice === null
          ? "Con esta comisión no hay precio de venta que alcance para cubrir los costos."
          : s.priceCushionPct > 0
            ? `El producto empieza a dar pérdida si el precio de venta baja de ${formatMoney(s.breakEvenPrice, "USD")} (sin IVA): hay un colchón de ${formatPercent(s.priceCushionPct)} respecto del precio de referencia.`
            : `Para no perder plata habría que venderlo a ${formatMoney(s.breakEvenPrice, "USD")} (sin IVA) o más, y hoy el precio de referencia es menor.`}
      </p>
      <p className="mt-2 text-xs text-muted">
        Los rangos de impuestos (0 % a 35 %) y de comisión (11,8 % a 17,1 %) son los publicados por las fuentes de la ficha. El flete al doble es una
        prueba de estrés nuestra. No es una predicción: sirve para ver cuánto aguanta el margen.
      </p>
    </section>
  );
}
