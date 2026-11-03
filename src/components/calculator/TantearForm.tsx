"use client";

import { useMemo, useState } from "react";
import { getRealProducts } from "@/data";
import type { Competition, Product, Trend } from "@/data/types";
import { calculate, parseDecimal, precioParaMargen, validateField, type FieldKey } from "@/lib/calculator";
import { formatMoney, formatPercent } from "@/lib/format";
import { scoreInput, scoreProduct } from "@/lib/score";
import { ScoreBreakdown, ScoreDial, BAND_LABEL } from "@/components/products/ScoreDial";

const FIELDS: { key: FieldKey; label: string; hint: string; suffix: string }[] = [
  { key: "purchase", label: "Costo de compra por unidad", hint: "Lo que pagás al proveedor, en dólares.", suffix: "USD" },
  { key: "shipping", label: "Transporte por unidad", hint: "Flete y envío, en dólares.", suffix: "USD" },
  { key: "taxes", label: "Impuestos y aranceles por unidad", hint: "Lo cargás vos; no se calcula solo.", suffix: "USD" },
  { key: "commissionPct", label: "Comisión de la plataforma", hint: "% del precio de venta.", suffix: "%" },
  { key: "salePrice", label: "Precio de venta por unidad", hint: "A cuánto lo vas a vender, en dólares.", suffix: "USD" },
];

const VACIO: Record<FieldKey, string> = { purchase: "", shipping: "", taxes: "", commissionPct: "14", salePrice: "" };
const PROPIO = "propio";

const TRENDS: { value: Trend; label: string }[] = [
  { value: "up", label: "Sube" },
  { value: "steady", label: "Estable" },
  { value: "down", label: "Baja" },
];
const COMPETITIONS: { value: Competition; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const PROXIMO: Record<"high" | "medium" | "low", string> = {
  high: "Próximo paso: pedí cotización a dos o tres proveedores y probá con pocas unidades.",
  medium: "Próximo paso: revisá qué costo o precio podés mejorar antes de comprar.",
  low: "Próximo paso: no compres todavía. Probá otro producto o cambiá los números.",
};

const PLAN = [
  "Pedí cotización a dos o tres proveedores.",
  "Pedí una muestra y comprobá la calidad.",
  "Confirmá impuestos y envío con tu courier.",
  "Hacé una primera compra chica y medí cómo vende.",
];

const aTexto = (n: number) => String(n).replace(".", ",");

function valoresDe(p: Product): Record<FieldKey, string> {
  return {
    purchase: aTexto(p.costs.purchase),
    shipping: aTexto(p.costs.shipping),
    taxes: aTexto(p.costs.taxes),
    commissionPct: aTexto(p.costs.commissionPct),
    salePrice: aTexto(p.referencePriceUsd),
  };
}

export function TantearForm() {
  const productos = useMemo(() => getRealProducts(), []);
  // Arranca con el producto de mayor score, así la pantalla ya muestra un resultado.
  const inicial = useMemo(
    () => [...productos].sort((a, b) => scoreProduct(b).score - scoreProduct(a).score)[0],
    [productos],
  );

  const [elegido, setElegido] = useState(inicial.id);
  const [values, setValues] = useState<Record<FieldKey, string>>(valoresDe(inicial));
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [trend, setTrend] = useState<Trend>(inicial.trend);
  const [competition, setCompetition] = useState<Competition>(inicial.competition);
  const [ajustar, setAjustar] = useState(false);
  const [cantidad, setCantidad] = useState("10");

  function elegir(id: string) {
    setElegido(id);
    setTouched({});
    if (id === PROPIO) {
      setValues(VACIO);
      setTrend("steady");
      setCompetition("medium");
      setAjustar(true);
      return;
    }
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    setValues(valoresDe(p));
    setTrend(p.trend);
    setCompetition(p.competition);
  }

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    for (const f of FIELDS) {
      const msg = validateField(f.key, values[f.key]);
      if (msg) e[f.key] = msg;
    }
    return e;
  }, [values]);

  const valid = Object.keys(errors).length === 0;
  const out = useMemo(() => {
    if (!valid) return null;
    const n = (k: FieldKey) => parseDecimal(values[k]) ?? 0;
    const calc = calculate({
      purchase: n("purchase"),
      shipping: n("shipping"),
      taxes: n("taxes"),
      commissionPct: n("commissionPct"),
      salePrice: n("salePrice"),
    });
    return { calc, score: scoreInput({ marginPct: calc.marginPct, unitCostUsd: calc.totalCost, trend, competition }) };
  }, [valid, values, trend, competition]);

  const propio = elegido === PROPIO;
  const fijo = valid
    ? (parseDecimal(values.purchase) ?? 0) + (parseDecimal(values.shipping) ?? 0) + (parseDecimal(values.taxes) ?? 0)
    : null;
  const precioMargen = (m: number) => {
    const p = fijo === null ? null : precioParaMargen(fijo, parseDecimal(values.commissionPct) ?? 0, m);
    return p === null ? "un precio imposible con esta comisión" : formatMoney(p, "USD");
  };
  const unidades = Number(cantidad) || 0;
  const nombreElegido = propio ? "producto propio" : (productos.find((x) => x.id === elegido)?.name ?? "");

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <label htmlFor="partir" className="mb-1 block text-sm font-medium">¿Qué producto querés tantear?</label>
        <select
          id="partir"
          value={elegido}
          onChange={(e) => elegir(e.target.value)}
          className="min-h-12 w-full rounded-full border border-ink/25 bg-surface px-5 text-base"
        >
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
          <option value={PROPIO}>Otro producto: cargo mis números</option>
        </select>
      </div>

      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-radar-dark">Herramienta de tanteo</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Antes de avanzar, tanteá.</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">Elegí un producto y mirá su score. Si querés, cambiá los números.</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section aria-labelledby="sc" aria-live="polite" className="rounded-3xl border-2 border-profundo bg-surface p-6 sm:p-7">
        <h2 id="sc" className="sr-only">Tu score</h2>
        <div className="solo-imprimir mb-4">
          <p className="text-lg font-bold">Reporte Validex: {nombreElegido}</p>
          <p className="text-xs">
            {new Date().toLocaleDateString("es-AR")} · Referencias sin verificar, según los supuestos cargados. No es una cotización aduanera ni una predicción de ventas.
          </p>
        </div>
        {out ? (
          <>
            <div className="flex items-center gap-5">
              <ScoreDial score={out.score.score} band={out.score.band} size={112} />
              <div>
                <p className="font-display text-2xl font-bold">{BAND_LABEL[out.score.band]}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Margen {formatPercent(out.calc.marginPct)} ·{" "}
                  {out.calc.profit >= 0
                    ? `ganás ${formatMoney(out.calc.profit, "USD")}`
                    : `perdés ${formatMoney(-out.calc.profit, "USD")}`}{" "}
                  por unidad
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <label htmlFor="cantidad" className="mb-1 block text-sm font-medium">¿Cuántas unidades querés comprar?</label>
              <input
                id="cantidad"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="min-h-11 w-28 rounded-lg border border-ink/20 bg-surface px-3 text-base tabular-nums focus:border-radar"
              />
              {unidades > 0 ? (
                <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
                  Necesitás <strong className="text-ink">{formatMoney(out.calc.totalCost * unidades, "USD")}</strong> para empezar y,
                  si vendés todo,{" "}
                  {out.calc.profit >= 0 ? "ganás" : "perdés"}{" "}
                  <strong className="text-ink">{formatMoney(Math.abs(out.calc.profit) * unidades, "USD")}</strong>.
                </p>
              ) : null}
              {fijo !== null ? (
                <p className="mt-3 text-sm text-ink-soft">
                  Para ganar <strong className="text-ink">20 %</strong> de margen tenés que vender a{" "}
                  <strong className="text-ink">{precioMargen(20)}</strong>; para ganar <strong className="text-ink">30 %</strong>, a{" "}
                  <strong className="text-ink">{precioMargen(30)}</strong>.
                </p>
              ) : null}
              <p className="mt-3 rounded-xl bg-radar-soft px-4 py-3 text-sm font-medium text-radar-dark">{PROXIMO[out.score.band]}</p>
              <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
                {PLAN.map((paso) => (
                  <li key={paso}>{paso}</li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-imprimir mt-5 inline-flex min-h-11 items-center rounded-full border border-ink/25 px-5 text-sm font-bold hover:bg-ink/5"
              >
                Guardar reporte en PDF
              </button>
            </div>
            <details className="mt-4 border-t border-line pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-radar">Cómo se arma el score</summary>
              <div className="mt-3">
                <ScoreBreakdown parts={out.score.parts} capped={out.score.capped} />
              </div>
            </details>
          </>
        ) : (
          <p className="text-sm text-ink-soft">Completá los números para ver el score.</p>
        )}
      </section>

      {out ? (
        <aside aria-label="Cómo llegamos" className="rounded-3xl bg-profundo p-6 text-white sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lima">Resultado orientativo</p>
          <p className="mt-2 text-sm text-white/85">Costo por unidad, con todo incluido</p>
          <p className="mt-1 font-display text-5xl font-black leading-none tabular-nums">{formatMoney(out.calc.totalCost, "USD")}</p>
          <h2 className="mt-6 font-display text-lg font-bold">Cómo llegamos</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Compra", parseDecimal(values.purchase) ?? 0],
              ["Transporte", parseDecimal(values.shipping) ?? 0],
              ["Impuestos y aranceles", parseDecimal(values.taxes) ?? 0],
              ["Comisión", out.calc.commission],
            ].map(([nombre, v]) => (
              <div key={nombre as string} className="flex justify-between gap-4 border-b border-white/20 pb-2">
                <dt className="text-white/85">{nombre as string}</dt>
                <dd className="font-bold tabular-nums">{formatMoney(v as number, "USD")}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-1">
              <dt className="font-bold">Total por unidad</dt>
              <dd className="font-bold tabular-nums">{formatMoney(out.calc.totalCost, "USD")}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-white/75">Según tus supuestos: no es una cotización aduanera.</p>
        </aside>
      ) : null}
      </div>

      <details
        open={ajustar}
        onToggle={(e) => setAjustar(e.currentTarget.open)}
        className="no-imprimir rounded-3xl border-2 border-profundo bg-surface p-6"
      >
        <summary className="cursor-pointer text-sm font-semibold">
          {propio ? "Tus números" : "Cambiar los números"}
        </summary>
        <form onSubmit={(e) => e.preventDefault()} noValidate className="mt-4 space-y-5">
          {FIELDS.map((f) => {
            const err = touched[f.key] ? errors[f.key] : undefined;
            const id = `t-${f.key}`;
            return (
              <div key={f.key}>
                <label htmlFor={id} className="mb-1 block text-sm font-medium">{f.label}</label>
                <div className="relative">
                  <input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={values[f.key]}
                    aria-invalid={Boolean(err)}
                    aria-describedby={`${id}-hint${err ? ` ${id}-err` : ""}`}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    onBlur={() => setTouched((x) => ({ ...x, [f.key]: true }))}
                    className={`min-h-11 w-full rounded-lg border bg-surface px-3 pr-14 text-base tabular-nums ${
                      err ? "border-danger" : "border-ink/20 focus:border-radar"
                    }`}
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">
                    {f.suffix}
                  </span>
                </div>
                <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{f.hint}</p>
                {err ? <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-medium text-danger">{err}</p> : null}
              </div>
            );
          })}

          <fieldset>
            <legend className="mb-1 text-sm font-medium">¿Cómo ves la demanda?</legend>
            <div className="flex flex-wrap gap-2">
              {TRENDS.map((o) => (
                <label key={o.value} className={`flex min-h-11 cursor-pointer items-center rounded-lg border px-4 text-sm font-medium ${trend === o.value ? "border-radar bg-radar-soft text-radar-dark" : "border-ink/20"}`}>
                  <input type="radio" name="trend" value={o.value} checked={trend === o.value} onChange={() => setTrend(o.value)} className="sr-only" />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-medium">¿Cuánta competencia hay?</legend>
            <div className="flex flex-wrap gap-2">
              {COMPETITIONS.map((o) => (
                <label key={o.value} className={`flex min-h-11 cursor-pointer items-center rounded-lg border px-4 text-sm font-medium ${competition === o.value ? "border-radar bg-radar-soft text-radar-dark" : "border-ink/20"}`}>
                  <input type="radio" name="competition" value={o.value} checked={competition === o.value} onChange={() => setCompetition(o.value)} className="sr-only" />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        </form>
      </details>

      <p className="text-xs text-muted">
        Según tus supuestos. Es una regla simple, no una predicción de ventas ni una cotización aduanera.
      </p>
    </div>
  );
}
