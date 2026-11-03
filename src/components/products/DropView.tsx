"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getRealProducts } from "@/data";
import type { Competition, Trend } from "@/data/types";
import type { Dolar } from "@/lib/dolar-parse";
import { dateKeyArg, pickDrop } from "@/lib/drop";
import { formatMoney, formatPercent } from "@/lib/format";
import { scoreProduct } from "@/lib/score";
import { assess } from "@/lib/assessment";
import { DataBadge } from "@/components/ui/Badges";
import { CountUp } from "@/components/ui/CountUp";
import { DolarStrip } from "@/components/products/DolarStrip";
import { BAND_LABEL } from "@/components/products/ScoreDial";

const DATE_FORMAT = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Argentina/Buenos_Aires",
});
const ARS = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

const TREND_TEXT: Record<Trend, string> = { up: "Demanda en alza", steady: "Demanda estable", down: "Demanda en baja" };
const COMP_TEXT: Record<Competition, string> = { low: "poca pelea", medium: "pelea media", high: "mucha pelea" };

export function DropView({ dolar }: { dolar: Dolar | null }) {
  const [now, setNow] = useState<Date | null>(null);

  // La fecha se lee en el navegador para que el drop cambie cada día sin volver a publicar la página.
  useEffect(() => {
    setNow(new Date());
  }, []);

  const drop = useMemo(() => {
    if (!now) return [];
    const ranked = getRealProducts().map((p) => ({ item: p, score: scoreProduct(p).score }));
    return pickDrop(ranked, dateKeyArg(now));
  }, [now]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="entrada mb-6 grid items-start gap-6 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-radar-dark">
            Drop diario / {now ? DATE_FORMAT.format(now).toLocaleUpperCase("es-AR") : "hoy"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Tres productos.
            <br />
            Tu próximo análisis.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            Una selección acotada para mirar con atención. Compará las señales, revisá los detalles y tanteá antes de avanzar.
          </p>
        </div>
        <div className="rounded-3xl bg-profundo p-6 text-white lg:w-64">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lima">Menos, pero más claro</p>
          <p className="mt-2 font-display text-6xl font-black leading-none">03</p>
          <p className="mt-2 text-sm text-white/85">productos por día. Nada más para mirar.</p>
        </div>
      </header>

      <DolarStrip dolar={dolar} />

      {!now ? (
        <p role="status" className="mt-8 text-sm text-muted">Armando tu drop de hoy…</p>
      ) : (
        <ol className="mt-6 grid gap-5 lg:grid-cols-3">
          {drop.map(({ item: p }, i) => {
            const s = scoreProduct(p);
            const a = assess(p);
            const ars = dolar ? Math.round(p.referencePriceUsd * dolar.blue) : null;
            return (
              <li
                key={p.id}
                className="entrada relative flex flex-col overflow-hidden rounded-3xl border-2 border-profundo bg-surface transition duration-200 focus-within:border-radar hover:border-radar motion-safe:hover:-translate-y-0.5"
                style={{ "--retraso": `${120 + i * 140}ms` } as React.CSSProperties}
              >
                <div className="relative flex h-56 flex-col justify-between bg-panel p-4">
                  {p.image ? (
                    <>
                      <Image
                        src={p.image}
                        alt={`Ilustración de ${p.name}`}
                        fill
                        loading="eager"
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-contain"
                      />
                    </>
                  ) : null}
                  <div className="relative flex justify-end">
                    <DataBadge status={p.dataStatus} />
                  </div>
                  <div className="relative flex w-fit items-end gap-2 rounded-2xl border-2 border-profundo bg-surface px-3 py-1.5" role="img" aria-label={`Score ${s.score} de 100. ${BAND_LABEL[s.band]}.`}>
                    <CountUp valor={s.score} className="font-display text-5xl font-bold leading-none text-signal tabular-nums" />
                    <span className="pb-1 text-sm text-muted">/100</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-radar-dark">{p.category}</p>
                  <h2 className="mt-1 font-display text-lg font-bold leading-snug">
                    {/* Toda la tarjeta es un solo toque: el enlace se estira sobre ella. */}
                    <Link href={`/analisis/${p.id}`} className="after:absolute after:inset-0 hover:underline">
                      {p.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm italic text-radar-dark">
                    {TREND_TEXT[p.trend]}, {COMP_TEXT[p.competition]}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Precio ref.</dt>
                      <dd className="font-bold tabular-nums">{formatMoney(p.referencePriceUsd, "USD")}</dd>
                      {ars !== null ? <dd className="text-xs text-muted">≈ $ {ARS.format(ars)}</dd> : null}
                    </div>
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Margen</dt>
                      <dd className={`font-bold tabular-nums ${a.calc.marginPct >= 30 ? "text-signal" : ""}`}>
                        {formatPercent(a.calc.marginPct)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Ganás por unidad</dt>
                      <dd className="font-bold tabular-nums">{formatMoney(a.calc.profit, "USD")}</dd>
                      {dolar ? <dd className="text-xs text-muted">≈ $ {ARS.format(Math.round(a.calc.profit * dolar.blue))}</dd> : null}
                    </div>
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Para arrancar (10 u.)</dt>
                      <dd className="font-bold tabular-nums">{formatMoney(a.calc.totalCost * 10, "USD")}</dd>
                      {dolar ? <dd className="text-xs text-muted">≈ $ {ARS.format(Math.round(a.calc.totalCost * 10 * dolar.blue))}</dd> : null}
                    </div>
                  </dl>

                  <p aria-hidden="true" className="mt-5 inline-flex min-h-11 w-fit items-center rounded-full bg-radar px-5 text-sm font-bold text-white">
                    Explorar producto <span className="ml-2">→</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="tarjeta flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface p-6">
          <div>
            <h2 className="font-display text-xl font-bold">¿Y los costos?</h2>
            <p className="mt-1 text-sm text-ink-soft">Armá tu cuenta antes de comprar.</p>
          </div>
          <Link href="/tantear" className="inline-flex min-h-11 items-center rounded-full bg-radar px-6 text-sm font-bold text-white">
            Tantear
          </Link>
        </div>
        <div className="tarjeta flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface p-6">
          <div>
            <h2 className="font-display text-xl font-bold">Antes de importar.</h2>
            <p className="mt-1 text-sm text-ink-soft">Mirá pasos, impuestos y comisiones.</p>
          </div>
          <Link href="/importador" className="inline-flex min-h-11 items-center rounded-full border-2 border-profundo px-6 text-sm font-bold">
            Leé la guía
          </Link>
        </div>
      </div>
    </div>
  );
}
