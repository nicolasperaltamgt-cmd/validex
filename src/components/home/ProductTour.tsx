"use client";

import Link from "next/link";
import { useState } from "react";
import { BrowserFrame, PhoneFrame } from "./DeviceFrames";
import { buttonClass } from "@/components/ui/button";

interface Slide {
  id: string;
  label: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  desktop: string;
  mobile: string;
  desktopAlt: string;
  mobileAlt: string;
  url: string;
}

const slides: Slide[] = [
  {
    id: "oportunidades",
    label: "Oportunidades",
    title: "Todas tus ideas ordenadas por señales.",
    text: "Agrupadas en favorables, mixtas y de cautela, con el margen a la vista.",
    href: "/oportunidades",
    cta: "Abrir el panel",
    desktop: "/images/app-oportunidades.png",
    mobile: "/images/movil-oportunidades.png",
    desktopAlt: "Panel de oportunidades de Validex con productos agrupados por señales favorables, mixtas y de cautela",
    mobileAlt: "Panel de oportunidades de Validex en un celular",
    url: "Panel de oportunidades",
  },
  {
    id: "comparar",
    label: "Comparar",
    title: "Ponelos lado a lado y decidí.",
    text: "Hasta tres productos, con el margen más alto resaltado.",
    href: "/comparar",
    cta: "Comparar productos",
    desktop: "/images/app-comparar.png",
    mobile: "/images/movil-comparar.png",
    desktopAlt: "Comparador de Validex con tres productos lado a lado: margen, tendencia, competencia y riesgo",
    mobileAlt: "Comparador de Validex en un celular",
    url: "Comparar productos",
  },
  {
    id: "calculadora",
    label: "Calculadora",
    title: "Sabé cuánto te queda antes de comprar.",
    text: "Cargás tus costos y el resultado se recalcula al instante.",
    href: "/calculadora",
    cta: "Abrir la calculadora",
    desktop: "/images/app-calculadora.png",
    mobile: "/images/movil-calculadora.png",
    desktopAlt: "Calculadora de costos y margen de Validex con campos de costo, transporte, impuestos, comisión y precio de venta",
    mobileAlt: "Calculadora de Validex en un celular",
    url: "Calculadora de margen",
  },
  {
    id: "analisis",
    label: "Análisis",
    title: "Entendé por qué es riesgoso o no.",
    text: "Cada lectura muestra las reglas, los riesgos y qué validar.",
    href: "/analisis/demo-comedero-mascotas",
    cta: "Ver un análisis",
    desktop: "/images/app-analisis.png",
    mobile: "/images/movil-oportunidades.png",
    desktopAlt: "Análisis de oportunidad de Validex con las razones de la lectura, números ilustrativos, riesgos y oportunidades",
    mobileAlt: "Validex en un celular",
    url: "Análisis de oportunidad",
  },
];

/** Recorrido del producto: pestañas con capturas reales de la app (datos ficticios). */
export function ProductTour() {
  const [index, setIndex] = useState(0);
  const s = slides[index];

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[2fr_5fr] lg:gap-12">
      <div>
        <div role="tablist" aria-label="Pantallas de Validex" className="flex flex-wrap gap-2 lg:flex-col">
          {slides.map((x, i) => (
            <button
              key={x.id}
              id={`tab-${x.id}`}
              role="tab"
              type="button"
              aria-selected={i === index}
              aria-controls="tour-panel"
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") setIndex((index + 1) % slides.length);
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") setIndex((index - 1 + slides.length) % slides.length);
              }}
              className={`min-h-11 rounded-xl border px-4 text-left text-sm font-semibold transition-colors ${
                i === index
                  ? "border-radar bg-radar-soft text-radar"
                  : "border-line text-ink-soft hover:border-ink/40 hover:text-ink"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="mt-6" aria-live="polite">
          <h3 className="font-display text-2xl font-bold leading-snug text-balance">{s.title}</h3>
          <p className="mt-2 text-ink-soft">{s.text}</p>
          <Link href={s.href} className={buttonClass("secondary", "mt-5")}>
            {s.cta} →
          </Link>
        </div>
      </div>

      <div id="tour-panel" role="tabpanel" aria-labelledby={`tab-${s.id}`} className="relative lg:pb-10 lg:pr-10">
        <div className="hidden lg:block">
          <BrowserFrame src={s.desktop} alt={s.desktopAlt} label={s.url} />
        </div>
        <PhoneFrame
          src={s.mobile}
          alt={s.mobileAlt}
          className="mx-auto w-[250px] lg:absolute lg:-bottom-2 lg:right-0 lg:w-[28%] lg:max-w-[190px]"
        />
      </div>
    </div>
  );
}
