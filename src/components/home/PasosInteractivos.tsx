"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRealProducts } from "@/data";
import { responder } from "@/lib/importador";
import { scoreProduct } from "@/lib/score";
import { BAND_LABEL, ScoreBreakdown, ScoreDial } from "@/components/products/ScoreDial";

const PASOS = [
  {
    titulo: "Hoy",
    texto: "Cada día, tres productos con un score de 0 a 100 y el dólar de hoy.",
    cta: "Ver el drop",
    href: "/hoy",
  },
  {
    titulo: "Tantear",
    texto: "Elegí un producto o cargá tus costos y mirá cómo se arma su score.",
    cta: "Tantear",
    href: "/tantear",
  },
  {
    titulo: "Preguntar",
    texto: "Impuestos, aduana y comisiones, con las fuentes a la vista.",
    cta: "Preguntar",
    href: "/importador",
  },
];

const PILDORA =
  "inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-sm font-bold text-paper transition hover:opacity-90";
const CAMBIO_MS = 6500;

/**
 * Tres pasos en una lista grande: el activo se destaca y los otros se apagan, con un panel que cambia al lado.
 * Se mueve solo cada pocos segundos mientras se ve, salvo que la persona lo toque, lo apunte o prefiera menos movimiento.
 * Todo lo que muestra sale de los datos y de los motores reales de la app.
 */
export function PasosInteractivos() {
  const productos = useMemo(() => getRealProducts(), []);
  const destacado = useMemo(
    () => [...productos].sort((a, b) => scoreProduct(b).score - scoreProduct(a).score)[0],
    [productos],
  );
  const score = useMemo(() => scoreProduct(destacado), [destacado]);
  const consulta = useMemo(
    () => responder("¿Qué necesito para importar y revender?", { productos, dolar: null }).parrafos[0],
    [productos],
  );

  const raiz = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const [enVista, setEnVista] = useState(false);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setEnVista(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!enVista || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActivo((a) => (a + 1) % PASOS.length), CAMBIO_MS);
    return () => window.clearInterval(id);
  }, [enVista, pausado]);

  return (
    <div
      ref={raiz}
      className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <div
        key={activo}
        className="entrada relative min-h-[22rem] overflow-hidden rounded-3xl border-2 border-profundo bg-linear-to-br from-radar/35 via-surface to-surface lg:h-[27rem]"
      >
        {activo === 0 ? (
          <>
            {destacado.image ? (
              <Image
                src={destacado.image}
                alt={`Ilustración de ${destacado.name}`}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            ) : null}
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-surface via-surface/55 to-paper/30" />
            <div className="relative flex h-full min-h-[22rem] flex-col justify-end gap-4 p-6">
              <ScoreDial score={score.score} band={score.band} size={104} />
              <div>
                <p className="font-display text-xl font-bold leading-snug">{destacado.name}</p>
                <p className="text-sm text-ink-soft">{BAND_LABEL[score.band]} · ejemplo de hoy, sin verificar</p>
              </div>
            </div>
          </>
        ) : null}

        {activo === 1 ? (
          <div className="flex h-full min-h-[22rem] flex-col justify-center gap-5 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <ScoreDial score={score.score} band={score.band} size={88} />
              <div>
                <p className="font-display text-lg font-bold leading-snug">{destacado.name}</p>
                <p className="text-sm text-ink-soft">Así se arma su score</p>
              </div>
            </div>
            <ScoreBreakdown parts={score.parts} capped={score.capped} />
          </div>
        ) : null}

        {activo === 2 ? (
          <div className="flex h-full min-h-[22rem] flex-col justify-center gap-3 p-6 sm:p-8">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-radar px-4 py-2.5 text-sm font-medium text-paper">
                ¿Qué necesito para importar y revender?
              </p>
            </div>
            <p className="max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-profundo bg-panel px-4 py-3 text-sm leading-relaxed text-ink-soft">
              {consulta}
            </p>
          </div>
        ) : null}
      </div>

      <ol className="space-y-2 lg:flex lg:min-h-[27rem] lg:flex-col lg:justify-center">
        {PASOS.map((p, i) => {
          const activa = i === activo;
          return (
            <li key={p.titulo}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => setActivo(i)}
                className={`block w-full py-1 text-left font-display text-4xl font-bold tracking-tight transition-colors sm:text-5xl ${
                  activa ? "text-ink" : "text-ink/35 hover:text-ink/60"
                }`}
              >
                {p.titulo}
              </button>
              {activa ? (
                <div className="entrada pb-4 pt-1">
                  <p className="max-w-sm text-lg leading-relaxed text-ink-soft">{p.texto}</p>
                  <Link href={p.href} className={`${PILDORA} mt-4`}>
                    {p.cta} <span aria-hidden="true" className="ml-1.5">→</span>
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
