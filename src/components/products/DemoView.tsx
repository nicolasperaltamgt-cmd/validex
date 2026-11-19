"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { assess } from "@/lib/assessment";
import { coverageOf } from "@/lib/coverage";
import { decide } from "@/lib/decision";
import { sensitivityOf } from "@/lib/sensitivity";
import { scoreProduct } from "@/lib/score";
import { parseDecimal } from "@/lib/calculator";
import { formatMoney, formatPercent } from "@/lib/format";
import { EVIDENCIA_ETIQUETA, priorizar } from "@/lib/priorizar";
import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/kit/input";
import { VerdictCard } from "@/components/products/VerdictCard";

const ATAJOS = [300, 1000, 3000];

/** Demo de un minuto: el usuario pone su presupuesto y ve qué conviene investigar primero, cuánto pedir, qué rinde y qué riesgos tiene. */
export function DemoView({ products }: { products: Product[] }) {
  const [texto, setTexto] = useState("");
  const capital = parseDecimal(texto) ?? 0;

  const datos = useMemo(
    () =>
      products.map((p) => {
        const a = assess(p);
        const s = scoreProduct(p);
        return { p, a, s, cov: coverageOf(p), firmeza: sensitivityOf(p).firmness };
      }),
    [products],
  );

  const resultado = useMemo(() => {
    if (capital <= 0) return null;
    const orden = priorizar(
      datos.map((d) => ({ id: d.p.id, nombre: d.p.name, score: d.s.score, profit: d.a.calc.profit, totalCost: d.a.calc.totalCost, coverage: d.cov })),
      capital,
    );
    const alcanzan = orden.filter((o) => !o.pierde && (o.plan?.unidades ?? 0) >= 1);
    const masBarato = Math.min(...datos.map((d) => d.a.calc.totalCost));
    return { top: alcanzan.slice(0, 3), alcanzan: alcanzan.length, masBarato };
  }, [capital, datos]);

  return (
    <div className="space-y-8">
      <section aria-labelledby="presupuesto" className="rounded-3xl bg-profundo p-6 text-white sm:p-8">
        <h2 id="presupuesto" className="font-display text-2xl font-black sm:text-3xl">¿Con cuánto querés empezar?</h2>
        <p className="mt-1 text-white/80">Poné tu presupuesto en dólares y te mostramos qué conviene investigar primero.</p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-full max-w-[14rem]">
            <label htmlFor="demo-capital" className="mb-1 block text-sm font-medium">Presupuesto (USD)</label>
            <Input
              id="demo-capital"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Ej.: 1000"
              value={texto}
              onChange={(e) => setTexto(e.target.value.replace(/[^\d.,]/g, "").slice(0, 9))}
              className="border-white/40 text-ink tabular-nums"
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Montos de ejemplo">
            {ATAJOS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTexto(String(m))}
                className="min-h-11 rounded-full border border-white/40 px-4 text-sm font-bold hover:bg-white/10"
              >
                US$ {m.toLocaleString("es-AR")}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div aria-live="polite" className="space-y-6">
        {!resultado ? (
          <p className="rounded-2xl border border-line p-5 text-ink-soft">Escribí un monto o tocá uno de los ejemplos para ver resultados.</p>
        ) : resultado.top.length === 0 ? (
          <p className="rounded-2xl border border-line p-5 text-ink-soft">
            Con {formatMoney(capital, "USD")} no alcanza para ninguna unidad de los productos analizados que dan ganancia (la más barata cuesta unos {formatMoney(resultado.masBarato, "USD")}). Probá con un monto mayor o tanteá tus propios números.
            <Link href="/tantear" className={`${buttonClass("secondary")} ml-3 mt-3 inline-flex`}>Ir a Tantear</Link>
          </p>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold">
              Con {formatMoney(capital, "USD")}, esto conviene investigar primero ({resultado.alcanzan} {resultado.alcanzan === 1 ? "producto alcanza" : "productos alcanzan"})
            </h2>
            <ol className="space-y-6">
              {resultado.top.map((o, i) => {
                const d = datos.find((x) => x.p.id === o.id)!;
                const dec = decide({ score: d.s.score, marginPct: d.a.calc.marginPct, profit: d.a.calc.profit, firmness: d.firmeza, coverage: d.cov });
                return (
                  <li key={o.id} className="rounded-2xl border-2 border-profundo bg-surface p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-radar-dark">Opción {i + 1}</p>
                    <h3 className="mt-1 font-display text-xl font-bold">
                      <Link href={`/analisis/${d.p.id}`} className="hover:underline">{d.p.name}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      Score {d.s.score}/100 · {EVIDENCIA_ETIQUETA[o.nivel]} · Referencia sin verificar
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                      <div><dt className="text-ink-soft">Costo por unidad</dt><dd className="text-lg font-bold tabular-nums">{formatMoney(d.a.calc.totalCost, "USD")}</dd></div>
                      <div><dt className="text-ink-soft">Ganancia por unidad (estimada)</dt><dd className="text-lg font-bold tabular-nums">{formatMoney(d.a.calc.profit, "USD")}</dd></div>
                      <div><dt className="text-ink-soft">Margen</dt><dd className="text-lg font-bold tabular-nums">{formatPercent(d.a.calc.marginPct)}</dd></div>
                      <div><dt className="text-ink-soft">Primer pedido sugerido</dt><dd className="text-lg font-bold tabular-nums">{o.plan?.primerPedido} u. ({formatMoney(o.plan?.primerPedidoGasto ?? 0, "USD")})</dd></div>
                    </dl>
                    <p className="mt-3 text-xs text-muted">Son estimaciones con datos sin verificar, no ganancias garantizadas.</p>
                    <div className="mt-4">
                      <p className="text-sm font-semibold">Riesgos principales</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                        {d.p.risks.slice(0, 2).map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <VerdictCard decision={dec} id={`veredicto-${o.id}`} nivel={3} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/analisis/${d.p.id}`} className={buttonClass("primary")}>Ver el análisis completo</Link>
                      <Link href={`/calculadora?producto=${d.p.id}`} className={buttonClass("secondary")}>Cambiar los números</Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
