"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRealProducts } from "@/data";
import { responder } from "@/lib/importador";

const PREGUNTA = "¿Me conviene importar una pava eléctrica?";

/**
 * Conversación de ejemplo que se arma sola al llegar a verla: pregunta, "escribiendo…" y respuesta.
 * La respuesta NO es un texto armado a mano: sale del mismo motor y de los mismos datos que usa El Importador.
 */
export function ChatDemo() {
  const productos = useMemo(() => getRealProducts(), []);
  const lineas = useMemo(() => responder(PREGUNTA, { productos, dolar: null }).parrafos.slice(0, 3), [productos]);
  const ref = useRef<HTMLDivElement>(null);
  // 0 nada · 1 pregunta · 2 escribiendo · 3 respuesta
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaso(3);
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setPaso(1);
        timers.push(window.setTimeout(() => setPaso(2), 1000), window.setTimeout(() => setPaso(3), 2600));
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-sm">
      <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-full bg-radar/20 blur-3xl" />
      <div className="rounded-[2.5rem] border border-ink/15 bg-surface p-3 shadow-2xl shadow-radar/15">
        <div aria-hidden="true" className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-ink/15" />
        <div className="rounded-3xl bg-panel p-4">
      <div className="flex items-center gap-3 border-b border-line px-1 pb-3">
        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-radar-soft text-radar">◈</span>
        <div className="leading-tight">
          <p className="text-sm font-bold">El Importador</p>
          <p className="text-xs text-muted">Guía de importación</p>
        </div>
      </div>

      <div className="min-h-[19rem] space-y-3 px-1 py-4" aria-live="polite">
        {paso >= 1 ? (
          <div className="entrada flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-radar px-4 py-2.5 text-sm font-medium text-paper">{PREGUNTA}</p>
          </div>
        ) : null}

        {paso === 2 ? (
          <div role="status" className="entrada inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border-2 border-profundo bg-panel px-4 py-3">
            <span className="sr-only">El Importador está escribiendo</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className="punto-escribiendo size-1.5 rounded-full bg-ink-soft"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        ) : null}

        {paso >= 3 ? (
          <div className="entrada max-w-[92%] space-y-2 rounded-2xl rounded-bl-sm border-2 border-profundo bg-panel px-4 py-3 text-sm leading-relaxed text-ink-soft">
            {lineas.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-1 pt-3">
        <p className="text-xs text-muted">Ejemplo real con nuestros datos, sin verificar.</p>
        <Link href="/importador" className="whitespace-nowrap text-sm font-bold text-signal">
          Probalo <span aria-hidden="true">→</span>
        </Link>
      </div>
        </div>
      </div>
    </div>
  );
}
