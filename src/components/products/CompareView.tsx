"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { assess } from "@/lib/assessment";
import { formatMoney, formatPercent } from "@/lib/format";
import { CompetitionBadge, LevelBadge, TrendBadge } from "@/components/ui/Badges";
import { StateMessage } from "@/components/ui/StateMessage";
import { buttonClass } from "@/components/ui/button";
import { PrioridadPanel } from "@/components/products/PrioridadPanel";
import { NativeSelect } from "@/components/kit/native-select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/kit/table";

const SLOTS = 3;

export function CompareView({ products, initialIds }: { products: Product[]; initialIds: string[] }) {
  const [ids, setIds] = useState<string[]>(() => {
    const valid = initialIds.filter((id) => products.some((p) => p.id === id)).slice(0, SLOTS);
    return valid.length >= 2 ? valid : products.slice(0, 2).map((p) => p.id);
  });

  const chosen = useMemo(
    () =>
      ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .map((p) => ({ p, a: assess(p) })),
    [ids, products],
  );
  const bestMargin = Math.max(...chosen.map((c) => c.a.calc.marginPct));

  const setSlot = (i: number, id: string) =>
    setIds((prev) => {
      const next = [...prev];
      if (id === "") next.splice(i, 1);
      else next[i] = id;
      return next;
    });

  const rows: { label: string; render: (c: (typeof chosen)[number]) => React.ReactNode }[] = [
    { label: "Categoría y mercado", render: ({ p }) => `${p.category} · ${p.market}` },
    { label: "Precio de referencia", render: ({ p }) => formatMoney(p.referencePriceUsd, "USD") },
    { label: "Costo total", render: ({ a }) => formatMoney(a.calc.totalCost, "USD") },
    { label: "Beneficio estimado", render: ({ a }) => formatMoney(a.calc.profit, "USD") },
    {
      label: "Margen",
      render: ({ a }) => (
        <span className={a.calc.marginPct === bestMargin && chosen.length > 1 ? "font-bold text-radar" : ""}>
          {formatPercent(a.calc.marginPct)}
          {a.calc.marginPct === bestMargin && chosen.length > 1 ? " · el más alto" : ""}
        </span>
      ),
    },
    { label: "Tendencia", render: ({ p }) => <TrendBadge trend={p.trend} /> },
    { label: "Competencia", render: ({ p }) => <CompetitionBadge competition={p.competition} /> },
    { label: "Lectura", render: ({ a }) => <LevelBadge level={a.level} /> },
    { label: "Riesgo principal", render: ({ p }) => p.risks[0] ?? "—" },
  ];

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: Math.min(ids.length + 1, SLOTS) }).map((_, i) => (
          <div key={i}>
            <label htmlFor={`slot-${i}`} className="mb-1 block text-sm font-medium">
              Producto {i + 1}
            </label>
            <NativeSelect
              id={`slot-${i}`}
              value={ids[i] ?? ""}
              onChange={(e) => setSlot(i, e.target.value)}
              className="text-sm"
            >
              <option value="">{i < 2 ? "Elegí un producto" : "Ninguno"}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={ids.includes(p.id) && ids[i] !== p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        ))}
      </div>

      {chosen.length < 2 ? (
        <StateMessage kind="empty" title="Elegí al menos 2 productos">
          Así podemos ponerlos lado a lado.
        </StateMessage>
      ) : (
        <Table className="min-w-[36rem]">
            <TableCaption>Comparación de productos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted">
                  <span className="sr-only">Característica</span>
                </TableHead>
                {chosen.map(({ p }) => (
                  <TableHead key={p.id}>
                    <Link href={`/catalogo/${p.id}`} className="font-display text-base font-bold hover:underline">
                      {p.name}
                    </Link>
                    <span className="mt-1 block text-xs font-normal text-signal">Dato de ejemplo o sin verificar</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableHead scope="row" className="whitespace-nowrap font-normal text-ink-soft">
                    {row.label}
                  </TableHead>
                  {chosen.map((c) => (
                    <TableCell key={c.p.id}>{row.render(c)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
        </Table>
      )}

      {chosen.length >= 2 ? <PrioridadPanel products={chosen.map((c) => c.p)} /> : null}

      {chosen.length >= 2 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {chosen.map(({ p }) => (
            <Link key={p.id} href={`/analisis/${p.id}`} className={buttonClass("secondary")}>
              Análisis: {p.name.split(" (")[0]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
