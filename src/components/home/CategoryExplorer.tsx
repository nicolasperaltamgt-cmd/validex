"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { assess } from "@/lib/assessment";
import { formatPercent } from "@/lib/format";
import { TrendBadge } from "@/components/ui/Badges";

/** Explorador por categoría de la portada: tocá una categoría y mirá sus productos de demostración. */
export function CategoryExplorer({ products }: { products: Product[] }) {
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);
  const [current, setCurrent] = useState(categories[0]);
  const items = products
    .filter((p) => p.category === current)
    .map((p) => ({ p, a: assess(p) }))
    .sort((x, y) => y.a.calc.marginPct - x.a.calc.marginPct);
  const max = Math.max(...items.map((i) => i.a.calc.marginPct), 1);

  return (
    <div className="rounded-2xl border-2 border-profundo bg-panel p-4 shadow-2xl shadow-radar/10 sm:p-6">
      <div role="group" aria-label="Categorías" className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === current}
            onClick={() => setCurrent(c)}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
              c === current
                ? "border-radar bg-radar-soft text-radar"
                : "border-line text-ink-soft hover:border-ink/40 hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs uppercase tracking-wider text-muted" aria-live="polite">
        {current} · margen ilustrativo · datos ficticios
      </p>
      <ul className="mt-3 space-y-3">
        {items.map(({ p, a }) => (
          <li key={p.id} className="rounded-xl border-2 border-profundo bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/catalogo/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
              <TrendBadge trend={p.trend} />
            </div>
            <p className="mt-1 text-xs text-muted">{p.market}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                <div className="h-full rounded-full bg-gradient-to-r from-radar/60 to-radar" style={{ width: `${(a.calc.marginPct / max) * 100}%` }} />
              </div>
              <span className="w-14 text-right text-sm tabular-nums">{formatPercent(a.calc.marginPct)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
