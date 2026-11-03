"use client";

import Link from "next/link";
import { useState } from "react";
import { calculate } from "@/lib/calculator";
import { formatMoney, formatPercent } from "@/lib/format";
import { DemoBadge } from "@/components/ui/Badges";

/** Mini calculadora real de la portada: mové los controles y mirá cómo cambia el margen. */
export function HeroDemo() {
  const [purchase, setPurchase] = useState(10);
  const [sale, setSale] = useState(25);
  const r = calculate({ purchase, shipping: 3, taxes: 2, commissionPct: 10, salePrice: sale });
  const negative = r.profit < 0;

  return (
    <section
      aria-labelledby="demo-title"
      className="w-full max-w-md rounded-3xl border-2 border-profundo bg-surface p-6 shadow-xl shadow-radar/10"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id="demo-title" className="text-xs font-semibold uppercase tracking-wide text-muted">
          Probalo
        </h2>
        <DemoBadge long />
      </div>

      <Slider id="d-purchase" label="Costo de compra" value={purchase} min={1} max={40} onChange={setPurchase} />
      <Slider id="d-sale" label="Precio de venta" value={sale} min={5} max={80} onChange={setSale} />
      <p className="mt-1 text-xs text-muted">
        Ejemplo con transporte 3, impuestos 2 y comisión 10 % fijos, en USD ilustrativos.
      </p>

      <div aria-live="polite" className="mt-5 rounded-xl bg-panel border-2 border-profundo p-4 text-ink">
        <p className="text-xs text-muted">Margen estimado por unidad</p>
        <p className={`font-display text-4xl font-bold tabular-nums ${negative ? "text-red-300" : ""}`}>
          {formatPercent(r.marginPct)}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Beneficio: {formatMoney(r.profit, "USD")} · Costo total: {formatMoney(r.totalCost, "USD")}
        </p>
        {negative ? <p className="mt-2 text-sm text-red-200">Con estos números perdés dinero en cada unidad.</p> : null}
      </div>

      <Link href="/calculadora" className="mt-4 inline-block text-sm font-semibold text-radar underline underline-offset-4">
        Usar mis propios números →
      </Link>
    </section>
  );
}

function Slider({
  id, label, value, min, max, onChange,
}: { id: string; label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <output htmlFor={id} className="text-sm font-semibold tabular-nums">{formatMoney(value, "USD")}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-8 w-full cursor-pointer accent-[var(--color-radar)]"
      />
    </div>
  );
}
