"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buscar, type ProductoBuscable } from "@/lib/busqueda";
import type { MeliDiscoveryCategory, MeliTrend } from "@/lib/meli-signals";
import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/kit/input";

const SUGERENCIAS = ["ventilador", "termo", "auriculares", "cortina", "cargador", "cámara", "reloj", "mascotas"];
const MAX = 12;

export function BuscadorView({
  productos,
  tendencias,
  categorias,
  fecha,
}: {
  productos: ProductoBuscable[];
  tendencias: MeliTrend[];
  categorias: MeliDiscoveryCategory[];
  fecha: string;
}) {
  const inicial = useSearchParams().get("q") ?? "";
  const [q, setQ] = useState(inicial);
  const r = useMemo(() => buscar(q, { productos, tendencias, categorias }), [q, productos, tendencias, categorias]);
  const hayConsulta = q.trim().length > 0;
  const tantear = (nombre: string) => `/tantear/?nombre=${encodeURIComponent(nombre)}`;

  return (
    <div className="space-y-8">
      <div role="search">
        <label htmlFor="buscar-q" className="mb-2 block text-sm font-medium">
          ¿Qué querés vender?
        </label>
        <Input
          id="buscar-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ej.: ventilador, termo, auriculares"
          autoComplete="off"
        />
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Sugerencias">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-ink/5">
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {hayConsulta ? `${r.total} resultados` : ""}
      </p>

      {!hayConsulta && (
        <p className="text-sm text-ink/70">
          Buscamos en lo que Validex ya analizó y en lo que Mercado Libre muestra hoy como tendencia y más vendido. Son señales de interés, no ventas ni precios.
        </p>
      )}

      {hayConsulta && r.total === 0 && (
        <div className="rounded-2xl border border-line p-5">
          <p className="font-medium">No encontramos “{q.trim()}”.</p>
          <p className="mt-1 text-sm text-ink/70">No lo tenemos analizado ni aparece hoy en Mercado Libre. Igual podés tantearlo con tus números.</p>
          <Link href={tantear(q.trim())} className={`${buttonClass("primary")} mt-4 inline-flex`}>
            Tantear “{q.trim()}”
          </Link>
        </div>
      )}

      {r.analizados.length > 0 && (
        <section aria-labelledby="b-analizados">
          <h2 id="b-analizados" className="flex items-center gap-2 font-display text-xl font-bold">
            Ya analizados en Validex
            <span className="rounded-full bg-radar-soft px-2.5 py-0.5 text-sm font-semibold text-radar-dark">{r.analizados.length}</span>
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            {r.analizados.slice(0, MAX).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-radar-soft">
                <div>
                  <Link href={`/analisis/${p.id}`} className="font-medium hover:underline">{p.nombre}</Link>
                  <p className="text-sm text-ink/70">{p.categoria} · puntaje {p.score}/100</p>
                </div>
                <Link href={`/analisis/${p.id}`} className={buttonClass("secondary")}>Ver análisis</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.tendencias.length > 0 && (
        <section aria-labelledby="b-tend">
          <h2 id="b-tend" className="flex items-center gap-2 font-display text-xl font-bold">
            Búsquedas en alza hoy en Mercado Libre
            <span className="rounded-full bg-radar-soft px-2.5 py-0.5 text-sm font-semibold text-radar-dark">{r.tendencias.length}</span>
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            {r.tendencias.slice(0, MAX).map((t) => (
              <li key={t.palabra} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-radar-soft">
                <span>
                  <span className="font-medium">{t.palabra}</span>
                  <span className="ml-2 text-sm text-ink/70">puesto {t.posicion} de 50</span>
                </span>
                <Link href={tantear(t.palabra)} className={buttonClass("secondary")}>Tantear</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.vendidos.length > 0 && (
        <section aria-labelledby="b-vend">
          <h2 id="b-vend" className="flex items-center gap-2 font-display text-xl font-bold">
            Más vendidos hoy
            <span className="rounded-full bg-radar-soft px-2.5 py-0.5 text-sm font-semibold text-radar-dark">{r.vendidos.length}</span>
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            {r.vendidos.slice(0, MAX).map((v) => (
              <li key={v.nombre} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-radar-soft">
                <div className="min-w-0">
                  <p className="line-clamp-2 font-medium">{v.nombre}</p>
                  <p className="text-sm text-ink/70">{v.categoria} · puesto {v.posicion} en su categoría</p>
                </div>
                <Link href={tantear(v.nombre)} className={`${buttonClass("secondary")} shrink-0`}>Tantear</Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink/60">Muchos son marcas ya instaladas o productos con certificación: antes de comprar, revisá peso, permisos y quién domina la categoría.</p>
        </section>
      )}

      <p className="text-xs text-ink/60">Fuente: Mercado Libre Argentina (API oficial), consultado el {fecha}. Señales de interés, no ventas ni precios.</p>
    </div>
  );
}
