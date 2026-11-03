"use client";

import Link from "next/link";
import { useState } from "react";

const PASOS = [
  {
    titulo: "Definí el producto y el destino",
    texto: "Anotá qué querés importar, dónde lo vas a vender y a qué precio. Sin eso, los costos no cierran.",
    revisar: "Qué producto es y si tiene requisitos para entrar al país.",
  },
  {
    titulo: "Armá el costo completo",
    texto: "Sumá la compra, el transporte, los impuestos y la comisión de donde vendés. Tantear hace la cuenta.",
    revisar: "Aranceles, tipo de cambio y costos de envío.",
  },
  {
    titulo: "Acordá documentación y logística",
    texto: "Pedí por escrito el precio, el plazo, la cantidad mínima y quién se hace cargo del envío.",
    revisar: "Factura, courier y seguro.",
  },
  {
    titulo: "Confirmá antes de operar",
    texto: "Hacé una compra chica de prueba antes de comprar en cantidad.",
    revisar: "Calidad, plazos reales y normas vigentes.",
  },
];

const CHECKLIST = [
  "Tengo el costo completo por unidad.",
  "Sé qué impuestos aplican a este producto.",
  "Pedí una muestra y la probé.",
  "Confirmé los datos con una fuente oficial.",
];

/** Guía de importación en cuatro pasos, con un checklist que se marca en el momento (no se guarda). */
export function GuiaImportacion() {
  const [marcados, setMarcados] = useState<boolean[]>(CHECKLIST.map(() => false));
  const hechos = marcados.filter(Boolean).length;

  return (
    <section aria-labelledby="guia" className="mt-14">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-radar-dark">Guía de importación / cuatro pasos</p>
      <h2 id="guia" className="mt-2 font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl">
        Antes de pagar, revisá.
      </h2>

      <ol className="mt-8 space-y-4">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="tarjeta rounded-3xl bg-surface p-6">
            <div className="flex items-start gap-4">
              <span aria-hidden="true" className="font-display text-3xl font-black text-radar-dark">0{i + 1}</span>
              <div>
                <h3 className="font-display text-xl font-bold">{p.titulo}</h3>
                <p className="mt-1 leading-relaxed text-ink-soft">{p.texto}</p>
                <p className="mt-3 rounded-xl bg-panel px-3 py-2 text-sm text-ink-soft">
                  <strong className="text-ink">Para revisar:</strong> {p.revisar}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="tarjeta mt-8 rounded-3xl bg-surface p-6">
        <h3 className="font-display text-xl font-bold">Tu checklist antes de avanzar</h3>
        <ul className="mt-4 space-y-2">
          {CHECKLIST.map((texto, i) => (
            <li key={texto}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={marcados[i]}
                  onChange={() => setMarcados((m) => m.map((v, j) => (j === i ? !v : v)))}
                  className="h-5 w-5 accent-[var(--color-radar)]"
                />
                {texto}
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-bold text-radar-dark" aria-live="polite">
          {hechos} de {CHECKLIST.length} listos
        </p>
        <Link
          href="/tantear"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-radar px-6 text-sm font-bold text-white"
        >
          Abrir Tantear
        </Link>
      </div>

      <p className="mt-4 rounded-2xl bg-panel px-4 py-3 text-sm text-ink-soft">
        <strong className="text-ink">Verificá con fuentes oficiales.</strong> Esta guía es orientativa y no reemplaza a un
        despachante de aduana ni a un contador.
      </p>
    </section>
  );
}
