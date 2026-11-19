"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRealProducts } from "@/data";
import { importTaxes, netUsd } from "@/data/real-products";
import { avisoDeLink, ES_ALIBABA, ES_MELI } from "@/lib/links";
import type { Competition, Product, Trend } from "@/data/types";
import { calculate, parseDecimal, precioParaMargen, validateField, type FieldKey } from "@/lib/calculator";
import { formatMoney, formatPercent } from "@/lib/format";
import { scoreInput } from "@/lib/score";
import { ScoreBreakdown, ScoreDial, BAND_LABEL } from "@/components/products/ScoreDial";
import { Input } from "@/components/kit/input";
import { NativeSelect } from "@/components/kit/native-select";
import { VerdictCard } from "@/components/products/VerdictCard";
import { decide } from "@/lib/decision";
import { ScoreInfo } from "@/components/products/ScoreInfo";

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

const PLAN = [
  "Pedí cotización a dos o tres proveedores.",
  "Pedí una muestra y comprobá la calidad.",
  "Confirmá impuestos y envío con tu courier.",
  "Hacé una primera compra chica y medí cómo vende.",
];

const aTexto = (n: number) => String(n).replace(".", ",");
const redondear = (n: number) => Math.round(n * 100) / 100;

/** El flete es una estimación nuestra (sin cotización): 20 % del costo de compra, como en las fichas del catálogo. */
const FLETE_ESTIMADO = 0.2;

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
  // Viene del buscador: el nombre de la idea que se quiere tantear.
  const nombreIdea = (useSearchParams().get("nombre") ?? "").slice(0, 120);

  // Arranca en "mis links": es lo primero que se ve y lo más rápido. Los productos ya analizados quedan debajo.
  const [elegido, setElegido] = useState(PROPIO);
  const enPropio = useRef(true);
  const [values, setValues] = useState<Record<FieldKey, string>>(VACIO);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [trend, setTrend] = useState<Trend>("steady");
  const [competition, setCompetition] = useState<Competition>("medium");
  const [ajustar, setAjustar] = useState(false);
  const [cantidad, setCantidad] = useState("10");
  const [linkAlibaba, setLinkAlibaba] = useState("");
  const [linkMeli, setLinkMeli] = useState("");
  const [ventaArs, setVentaArs] = useState("");
  const [compraTexto, setCompraTexto] = useState("");
  // La fecha del reporte se pone en el navegador: la página se arma el día de la publicación y no coincidiría.
  const [fecha, setFecha] = useState("");
  useEffect(() => setFecha(new Date().toLocaleDateString("es-AR")), []);

  /** Si estaba mirando un producto del catálogo y empieza a cargar sus propios datos, pasa a "mis links" sin perder lo que escribe. */
  function entrarPropio() {
    // La marca se actualiza al instante (el estado no), para no reiniciar los valores varias veces en un mismo evento.
    if (enPropio.current) return;
    enPropio.current = true;
    setElegido(PROPIO);
    setTouched({});
    setValues(VACIO);
    setTrend("steady");
    setCompetition("medium");
  }

  function probarEjemplo() {
    entrarPropio();
    cargarCompra("5");
    cargarVenta("56628");
  }

  /** Al escribir el precio de compra, estima flete e impuestos para que la cuenta salga sola. Se pueden cambiar en "Tus números". */
  function cargarCompra(texto: string) {
    entrarPropio();
    setCompraTexto(texto);
    const n = parseDecimal(texto);
    setValues((v) => {
      if (n === null) return { ...v, purchase: texto };
      const flete = redondear(n * FLETE_ESTIMADO);
      return { ...v, purchase: aTexto(n), shipping: aTexto(flete), taxes: aTexto(importTaxes(n, flete)) };
    });
  }

  /** Pasa el precio publicado en pesos (con IVA) a dólares sin IVA, con el dólar de referencia del sitio. */
  function cargarVenta(texto: string) {
    entrarPropio();
    setVentaArs(texto);
    const n = parseDecimal(texto);
    setValues((v) => ({ ...v, salePrice: n === null || n <= 0 ? "" : aTexto(netUsd(n)) }));
  }

  function elegir(id: string) {
    enPropio.current = id === PROPIO;
    setElegido(id);
    setTouched({});
    setLinkAlibaba("");
    setLinkMeli("");
    setVentaArs("");
    setCompraTexto("");
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
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-radar-dark">Herramienta de tanteo</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Antes de avanzar, tanteá.</h1>
        {nombreIdea && (
          <p className="mt-3 rounded-2xl border border-line bg-paper px-4 py-2 text-sm">
            Tanteando: <strong>{nombreIdea}</strong>. Cargá tus links o tus números para saber si conviene.
          </p>
        )}
        <div className="mt-1">
          <ScoreInfo />
        </div>
      </header>

      {/* Lo principal: los dos links y los dos precios. Es lo primero que se ve. */}
      <section
        aria-labelledby="links"
        className="no-imprimir rounded-3xl bg-profundo p-5 text-white shadow-xl shadow-profundo/25 sm:p-8"
      >
        <p className="inline-block rounded-full bg-lima px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-profundo">
          Lo más rápido
        </p>
        <h2 id="links" className="mt-3 font-display text-3xl font-black leading-tight text-balance sm:text-4xl">
          Pegá dos links y sabé si te conviene.
        </h2>
        <p className="mt-2 max-w-2xl text-white/85">
          Uno de dónde lo comprás y otro de cómo se vende. Escribí los dos precios y la cuenta sale sola.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label htmlFor="link-alibaba" className="mb-1 block text-sm font-bold">1. Dónde lo comprás (Alibaba)</label>
              <Input
                id="link-alibaba"
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://www.alibaba.com/…"
                value={linkAlibaba}
                onChange={(e) => {
                  entrarPropio();
                  setLinkAlibaba(e.target.value);
                }}
                aria-describedby="link-alibaba-aviso"
              />
              <p id="link-alibaba-aviso" role="status" className="mt-1 min-h-4 text-xs font-semibold text-red-200">
                {avisoDeLink(linkAlibaba, ES_ALIBABA, "Alibaba")}
              </p>
            </div>
            <div>
              <label htmlFor="compra-usd" className="mb-1 block text-sm font-bold">Precio de compra por unidad (USD)</label>
              <Input
                id="compra-usd"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="5"
                value={compraTexto}
                onChange={(e) => cargarCompra(e.target.value)}
                className="tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="link-meli" className="mb-1 block text-sm font-bold">2. A cuánto se vende (Mercado Libre)</label>
              <Input
                id="link-meli"
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://articulo.mercadolibre.com.ar/…"
                value={linkMeli}
                onChange={(e) => {
                  entrarPropio();
                  setLinkMeli(e.target.value);
                }}
                aria-describedby="link-meli-aviso"
              />
              <p id="link-meli-aviso" role="status" className="mt-1 min-h-4 text-xs font-semibold text-red-200">
                {avisoDeLink(linkMeli, ES_MELI, "Mercado Libre")}
              </p>
            </div>
            <div>
              <label htmlFor="venta-ars" className="mb-1 block text-sm font-bold">Precio publicado (ARS, con IVA)</label>
              <Input
                id="venta-ars"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="45000"
                value={ventaArs}
                onChange={(e) => cargarVenta(e.target.value)}
                className="tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={probarEjemplo}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-profundo hover:bg-lima focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Probar con un ejemplo
          </button>
          <p className="text-xs text-white/80">Los precios los escribís vos. Flete, impuestos y comisión se estiman solos.</p>
        </div>
      </section>

      <div className="no-imprimir">
        <label htmlFor="partir" className="mb-1 block text-sm font-medium text-ink-soft">O mirá un producto ya analizado</label>
        <NativeSelect
          id="partir"
          value={elegido}
          onChange={(e) => elegir(e.target.value)}
          className="min-h-12 rounded-full px-5"
        >
          <option value={PROPIO}>Mis links y mis números</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section aria-labelledby="sc" aria-live="polite" className="rounded-3xl border-2 border-profundo bg-surface p-6 sm:p-7">
        <h2 id="sc" className="sr-only">Tu score</h2>
        <div className="solo-imprimir mb-4">
          <p className="text-lg font-bold">Reporte Validex: {nombreElegido}</p>
          <p className="text-xs">
            {fecha} · Referencias sin verificar, según los supuestos cargados. No es una cotización aduanera ni una predicción de ventas.
          </p>
          {propio && linkAlibaba.trim() ? <p className="break-all text-xs">Compra: {linkAlibaba.trim()}</p> : null}
          {propio && linkMeli.trim() ? <p className="break-all text-xs">Venta: {linkMeli.trim()}</p> : null}
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
              <Input
                id="cantidad"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="w-28 tabular-nums"
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
              <div className="mt-4">
                <VerdictCard decision={decide({ score: out.score.score, marginPct: out.calc.marginPct, profit: out.calc.profit })} />
              </div>
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
          <p className="text-sm text-ink-soft">Escribí los dos precios y acá aparece tu score.</p>
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
                  <Input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={values[f.key]}
                    aria-invalid={Boolean(err)}
                    aria-describedby={`${id}-hint${err ? ` ${id}-err` : ""}`}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    onBlur={() => setTouched((x) => ({ ...x, [f.key]: true }))}
                    className="pr-14 tabular-nums"
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
