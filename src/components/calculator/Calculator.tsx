"use client";

import { useMemo, useState } from "react";
import {
  calculate,
  parseDecimal,
  validateField,
  type FieldKey,
} from "@/lib/calculator";
import { formatMoney, formatPercent } from "@/lib/format";
import { CURRENCY_OPTIONS, useSession, type CurrencyLabel } from "@/state/session-store";
import { Disclaimer } from "@/components/ui/PageHeader";
import { buttonClass } from "@/components/ui/button";

export type CalcDefaults = Record<FieldKey, string>;

const FIELDS: { key: FieldKey; label: string; hint: string; suffix?: "pct" }[] = [
  { key: "purchase", label: "Costo de compra por unidad", hint: "Lo que pagás al proveedor." },
  { key: "shipping", label: "Transporte por unidad", hint: "Flete y envío." },
  { key: "taxes", label: "Impuestos y aranceles por unidad", hint: "Lo cargás vos; no se calcula solo." },
  { key: "commissionPct", label: "Comisiones (% del precio de venta)", hint: "Plataforma o cobro.", suffix: "pct" },
  { key: "salePrice", label: "Precio de venta esperado por unidad", hint: "A cuánto vas a vender." },
];

export function Calculator({ defaults, productName }: { defaults: CalcDefaults; productName?: string }) {
  const { currency, setCurrency } = useSession();
  const [values, setValues] = useState<CalcDefaults>(defaults);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    for (const f of FIELDS) {
      const msg = validateField(f.key, values[f.key]);
      if (msg) e[f.key] = msg;
    }
    return e;
  }, [values]);

  const valid = Object.keys(errors).length === 0;
  const result = useMemo(() => {
    if (!valid) return null;
    const n = (k: FieldKey) => parseDecimal(values[k]) ?? 0;
    return calculate({
      purchase: n("purchase"),
      shipping: n("shipping"),
      taxes: n("taxes"),
      commissionPct: n("commissionPct"),
      salePrice: n("salePrice"),
    });
  }, [valid, values]);

  const reset = () => {
    setValues(defaults);
    setTouched({});
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="rounded-2xl border-2 border-profundo bg-surface p-5 sm:p-6">
        {productName ? (
          <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-sm text-ink-soft">
            Costos de referencia de <strong>{productName}</strong>. Podés cambiarlos.
          </p>
        ) : null}

        <div className="mb-5 max-w-48">
          <label htmlFor="cur" className="mb-1 block text-sm font-medium">
            Moneda (solo etiqueta)
          </label>
          <select
            id="cur"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyLabel)}
            className="min-h-11 w-full rounded-lg border border-ink/20 bg-surface px-3 text-sm"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-5">
          {FIELDS.map((f) => {
            const err = touched[f.key] ? errors[f.key] : undefined;
            const id = `f-${f.key}`;
            return (
              <div key={f.key}>
                <label htmlFor={id} className="mb-1 block text-sm font-medium">
                  {f.label}
                </label>
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
                    onBlur={() => setTouched((tt) => ({ ...tt, [f.key]: true }))}
                    className={`min-h-11 w-full rounded-lg border bg-surface px-3 pr-14 text-base tabular-nums ${
                      err ? "border-danger" : "border-ink/20 focus:border-radar"
                    }`}
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">
                    {f.suffix === "pct" ? "%" : currency}
                  </span>
                </div>
                <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
                  {f.hint}
                </p>
                {err ? (
                  <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-medium text-danger">
                    {err}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={reset} className={buttonClass("secondary", "mt-6")}>
          Restablecer valores
        </button>
      </form>

      <div className="space-y-4">
        <section aria-labelledby="res" aria-live="polite" className="rounded-2xl border-2 border-profundo bg-panel p-5 text-ink sm:p-6">
          <h2 id="res" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Resultado estimado por unidad
          </h2>
          {result ? (
            <>
              <p className="mt-3 text-sm text-muted">Beneficio estimado</p>
              <p className={`font-display text-4xl font-bold tabular-nums ${result.profit < 0 ? "text-danger" : ""}`}>
                {formatMoney(result.profit, currency)}
              </p>
              <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
                <Row label="Costo total" value={formatMoney(result.totalCost, currency)} />
                <Row label="Comisión calculada" value={formatMoney(result.commission, currency)} />
                <Row label="Margen sobre el precio de venta" value={formatPercent(result.marginPct)} strong />
                <Row label="Recargo sobre el costo" value={formatPercent(result.markupPct)} />
              </dl>
              {result.profit < 0 ? (
                <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                  Con estos números perdés dinero en cada unidad.
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              Corregí los campos marcados para ver el resultado.
            </p>
          )}
        </section>
        <Disclaimer>
          Resultado según tus supuestos. No es una cotización logística, fiscal ni aduanera.
        </Disclaimer>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-lg font-bold" : "font-medium"}`}>{value}</dd>
    </div>
  );
}
