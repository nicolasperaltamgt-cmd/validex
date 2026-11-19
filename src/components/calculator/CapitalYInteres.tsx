"use client";

import { useState } from "react";
import { Input } from "@/components/kit/input";
import { parseDecimal } from "@/lib/calculator";
import { formatMoney } from "@/lib/format";
import { planCapital } from "@/lib/capital";
import { evaluateInterest, MIN_VISITAS } from "@/lib/interest-test";

const numero = (v: string) => v.replace(/[^\d.,]/g, "").slice(0, 9);

function Campo({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <Input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(numero(e.target.value))} className="tabular-nums" />
    </div>
  );
}

/** Dos herramientas debajo del resultado: cuánto pedir con tu capital y si vale la pena antes de comprar stock. */
export function CapitalYInteres({ costoUnidad, gananciaUnidad }: { costoUnidad: number; gananciaUnidad: number }) {
  const [capital, setCapital] = useState("");
  const [gasto, setGasto] = useState("");
  const [visitas, setVisitas] = useState("");
  const [contactos, setContactos] = useState("");
  const [compran, setCompran] = useState("");

  const plan = planCapital(parseDecimal(capital) ?? 0, costoUnidad, gananciaUnidad);
  const interes = evaluateInterest({
    adSpend: parseDecimal(gasto) ?? NaN,
    visits: parseDecimal(visitas) ?? NaN,
    leads: parseDecimal(contactos) ?? NaN,
    buyRatePct: parseDecimal(compran) ?? NaN,
    profitPerUnit: Math.max(0, gananciaUnidad),
  });

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="capital" className="rounded-2xl border-2 border-profundo bg-surface p-5">
        <h3 id="capital" className="font-display text-lg font-bold">¿Cuánto pedir con tu plata?</h3>
        <div className="mt-3 max-w-[12rem]">
          <Campo id="capital-usd" label="Capital disponible (USD)" value={capital} onChange={setCapital} />
        </div>
        {plan ? (
          plan.unidades >= 1 ? (
            <div className="mt-3 space-y-2 text-sm text-ink-soft" aria-live="polite">
              <p>Alcanza para <strong className="text-ink">{plan.unidades}</strong> unidades ({formatMoney(plan.gasto, "USD")}); sobran {formatMoney(plan.sobrante, "USD")}.</p>
              <p>Primer pedido sugerido: <strong className="text-ink">{plan.primerPedido}</strong> unidades ({formatMoney(plan.primerPedidoGasto, "USD")}, cerca del 30 % de tu capital), porque los datos todavía no están confirmados.</p>
              <p className="text-xs">Si vendieras las {plan.unidades} al precio cargado, {gananciaUnidad >= 0 ? "ganarías" : "perderías"} {formatMoney(Math.abs(plan.gananciaSiVendeTodo), "USD")}. Es un cálculo, no una promesa.</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-soft" aria-live="polite">Con ese capital no alcanza ni para una unidad ({formatMoney(costoUnidad, "USD")} cada una).</p>
          )
        ) : null}
      </section>

      <section aria-labelledby="interes" className="rounded-2xl border-2 border-profundo bg-surface p-5">
        <h3 id="interes" className="font-display text-lg font-bold">Probá el interés antes de comprar</h3>
        <p className="mt-1 text-xs text-muted">Publicá el producto con anuncios, sin stock, y cargá lo que pasó de verdad.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Campo id="i-gasto" label="Gasto en anuncios (USD)" value={gasto} onChange={setGasto} />
          <Campo id="i-visitas" label="Visitas" value={visitas} onChange={setVisitas} />
          <Campo id="i-contactos" label="Contactos o “avisame”" value={contactos} onChange={setContactos} />
          <Campo id="i-compran" label="De cada 100, ¿cuántos comprarían?" value={compran} onChange={setCompran} />
        </div>
        <div aria-live="polite" className="mt-3 text-sm">
          {interes ? (
            <p className="rounded-xl bg-radar-soft px-4 py-3 font-medium text-radar-dark">{interes.message}</p>
          ) : (
            <p className="text-xs text-muted">Completá los cuatro datos (mínimo {MIN_VISITAS} visitas para decidir). Lo de “cuántos comprarían” es tu estimación, no un dato del mercado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
