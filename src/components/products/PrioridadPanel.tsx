"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { assess } from "@/lib/assessment";
import { coverageOf } from "@/lib/coverage";
import { scoreProduct } from "@/lib/score";
import { formatMoney, formatPercent } from "@/lib/format";
import { parseDecimal } from "@/lib/calculator";
import { EVIDENCIA_ETIQUETA, PESO_BASE, priorizar } from "@/lib/priorizar";
import { Input } from "@/components/kit/input";

/** Con tu capital, ordena los productos elegidos: cuál conviene investigar primero y por qué. */
export function PrioridadPanel({ products }: { products: Product[] }) {
  const [capital, setCapital] = useState("");
  const capitalNum = parseDecimal(capital) ?? 0;

  const orden = useMemo(
    () =>
      priorizar(
        products.map((p) => {
          const a = assess(p);
          return { id: p.id, nombre: p.name, score: scoreProduct(p).score, profit: a.calc.profit, totalCost: a.calc.totalCost, coverage: coverageOf(p) };
        }),
        capitalNum,
      ),
    [products, capitalNum],
  );
  const primero = orden[0];

  return (
    <section aria-labelledby="prioridad" className="mt-8 rounded-2xl border-2 border-profundo bg-surface p-6">
      <h2 id="prioridad" className="font-display text-xl font-bold">¿Cuál investigar primero?</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ordenamos por el score ajustado por evidencia: con datos sin respaldo el score vale {Math.round(PESO_BASE * 100)} %, y sube hasta 100 % a medida que se confirman. Es para decidir qué
        investigar primero, no qué comprar.
      </p>
      <div className="mt-4 max-w-[12rem]">
        <label htmlFor="prio-capital" className="mb-1 block text-sm font-medium">Tu capital (USD), opcional</label>
        <Input
          id="prio-capital"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={capital}
          onChange={(e) => setCapital(e.target.value.replace(/[^\d.,]/g, "").slice(0, 9))}
          className="tabular-nums"
        />
      </div>

      {primero && !primero.pierde ? (
        <p className="mt-4 rounded-xl bg-radar-soft px-4 py-3 text-sm font-medium text-radar-dark" aria-live="polite">
          Investigá primero: <strong>{primero.nombre}</strong> (score {primero.score}, {EVIDENCIA_ETIQUETA[primero.nivel].toLowerCase()}). Pedí cotizaciones reales antes de comprar.
        </p>
      ) : (
        <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium" aria-live="polite">
          Con estos números ninguno da ganancia. Probá otros productos.
        </p>
      )}

      <ol className="mt-4 space-y-3">
        {orden.map((o, i) => (
          <li key={o.id} className="rounded-xl border border-line p-4 text-sm">
            <p className="font-semibold">
              {i + 1}. {o.nombre}
            </p>
            <p className="mt-1 text-ink-soft">
              Score {o.score} · ajustado {String(o.ajustado).replace(".", ",")} · {EVIDENCIA_ETIQUETA[o.nivel]}
              {o.retornoPct !== null ? ` · retorno estimado ${formatPercent(o.retornoPct)} sobre lo invertido` : ""}
            </p>
            {o.pierde ? <p className="mt-1 font-medium text-danger">Pierde plata con estos números.</p> : null}
            {o.plan && !o.pierde ? (
              o.plan.unidades >= 1 ? (
                <p className="mt-1 text-ink-soft">
                  Con tu capital: {o.plan.unidades} unidades; primer pedido sugerido de {o.plan.primerPedido} ({formatMoney(o.plan.primerPedidoGasto, "USD")}).
                </p>
              ) : (
                <p className="mt-1 text-ink-soft">Con ese capital no alcanza ni para una unidad.</p>
              )
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
