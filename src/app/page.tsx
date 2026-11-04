import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getRealProducts } from "@/data";
import { responder } from "@/lib/importador";
import { assess } from "@/lib/assessment";
import { formatMoney, formatPercent } from "@/lib/format";
import { SCORE_MAX, scoreProduct } from "@/lib/score";
import { BAND_LABEL } from "@/components/products/ScoreDial";
import { AvoidCard } from "@/components/products/AvoidCard";
import { avoidList } from "@/lib/avoid";
import { Faq } from "@/components/ui/Faq";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { cardClass } from "@/components/kit/card";
import { buttonVariants } from "@/components/kit/button";
import { cn } from "@/lib/cn";

const faq = [
  { q: "¿Los datos son reales?", a: "Son referencias con fuente y fecha, todavía sin verificar. Cada ficha muestra qué está confirmado y qué es estimado." },
  { q: "¿Puedo usarla en el celular?", a: "Sí. Abrila en Chrome y tocá “Instalar app”." },
  { q: "¿Me dice cuando no conviene?", a: "Sí. Un score bajo te avisa que no compres todavía." },
  { q: "¿Puedo usarla si nunca importé?", a: "Sí. El Importador explica impuestos y pasos en simple." },
  { q: "¿Cuánto cuesta?", a: "Es gratis y sin registro mientras sea una versión de prueba." },
];

const fuentes = ["Mercado Libre (vía MejoresCompras)", "Frávega", "Alibaba", "Made-in-China", "DolarAPI", "Aduana y ARCA (reglas)"];

const formula = [
  { clave: "margin", nombre: "Margen", donde: "Venta menos todos los costos.", origen: "Referencia" },
  { clave: "trend", nombre: "Tendencia", donde: "Demanda en alza, estable o en baja.", origen: "Estimado" },
  { clave: "competition", nombre: "Competencia", donde: "Cuántos vendedores publican lo mismo.", origen: "Estimado" },
  { clave: "capital", nombre: "Capital por unidad", donde: "Cuánta plata ponés para probar.", origen: "Referencia" },
] as const;

const retraso = (ms: number) => ({ "--retraso": `${ms}ms` }) as CSSProperties;

const PILDORA_BLANCA = cn(buttonVariants({ variant: "light" }), "min-h-12 px-8");
const TITULO = "font-display text-3xl font-black leading-[1.05] tracking-tight text-balance sm:text-5xl";
const ETIQUETA = "text-xs font-bold uppercase tracking-[0.14em] text-radar-dark";

/** Marca el origen de cada factor del score: "Referencia" (hay una fuente) o "Estimado" (es nuestra estimación). */
function Origen({ tipo }: { tipo: "Referencia" | "Estimado" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.7rem] font-bold",
        tipo === "Referencia" ? "bg-radar-soft text-radar-dark" : "bg-ink/10 text-ink-soft",
      )}
    >
      {tipo}
    </span>
  );
}

export default function HomePage() {
  const productos = getRealProducts();
  const ranking = productos.map((p) => ({ p, s: scoreProduct(p), a: assess(p) })).sort((a, b) => b.s.score - a.s.score);
  const { p: top, s: topScore, a: topAssess } = ranking[0];
  const evitar = avoidList(productos, 3);
  const tres = ranking.slice(0, 3);
  const consulta = responder("¿Qué necesito para importar y revender?", { productos, dolar: null }).parrafos[0];
  const origenPorClave: Record<string, "Referencia" | "Estimado"> = {
    margin: "Referencia",
    trend: "Estimado",
    competition: "Estimado",
    capital: "Referencia",
  };

  return (
    <div>
      {/* Portada: bloque de marca con el título centrado y una tarjeta de score real */}
      <section className="relative left-1/2 -mt-24 w-screen -translate-x-1/2 bg-profundo pb-16 pt-32 text-white sm:pb-24 sm:pt-40">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p
            className="entrada mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em]"
            style={retraso(0)}
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-lima" />
            Versión de prueba · Argentina
          </p>
          <h1 className="entrada font-display text-4xl font-black leading-[1.03] tracking-tight text-balance text-white sm:text-6xl" style={retraso(120)}>
            Antes de comprar, <span className="text-lima">mirá los números.</span>
          </h1>
          <p className="entrada mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85" style={retraso(240)}>
            Tres productos por día, con score de 0 a 100 y el costo completo.
          </p>
          <div className="entrada mt-8 flex flex-wrap items-center justify-center gap-3" style={retraso(360)}>
            <Link href="/hoy" className={PILDORA_BLANCA}>
              Ver el drop de hoy <span aria-hidden="true" className="ml-2">→</span>
            </Link>
            <a href="#formula" className="inline-flex min-h-12 items-center rounded-full px-6 text-sm font-bold text-white underline underline-offset-4 hover:text-lima">
              Cómo se calcula el score
            </a>
          </div>
          <ul className="entrada mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80" style={retraso(480)}>
            <li>✓ Gratis y sin registro</li>
            <li>✓ Precios en dólares y pesos</li>
            <li>✓ Cada dato con su fuente y su fecha</li>
          </ul>
        </div>

        {/* Tarjeta con un análisis real, con el origen de cada factor (estilo de reporte) */}
        <div className="entrada mx-auto mt-12 max-w-3xl px-4 sm:px-6" style={retraso(560)}>
          <div className="rounded-3xl bg-paper p-5 text-left text-ink shadow-2xl shadow-black/30 sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-panel">
                {top.image ? <Image src={top.image} alt="" fill sizes="80px" className="object-contain" priority /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-bold leading-snug">{top.name}</p>
                <p className="text-sm text-ink-soft">{top.category} · Argentina · Referencia sin verificar</p>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl font-black leading-none">
                  {topScore.score}
                  <span className="text-base font-bold text-ink-soft">/100</span>
                </p>
                <p className="mt-1 text-sm font-bold text-radar-dark">{BAND_LABEL[topScore.band]}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {topScore.parts.map((part) => (
                <li key={part.key} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_9.5rem]">
                  <span className="font-semibold">{part.label}</span>
                  <span
                    className="h-2 overflow-hidden rounded-full bg-line"
                    role="progressbar"
                    aria-label={part.label}
                    aria-valuenow={part.points}
                    aria-valuemin={0}
                    aria-valuemax={part.max}
                  >
                    <span className="block h-full rounded-full bg-radar" style={{ width: `${(part.points / part.max) * 100}%` }} />
                  </span>
                  <span className="flex items-center justify-end gap-2">
                    <span className="tabular-nums text-ink-soft">
                      {part.points}/{part.max}
                    </span>
                    <span className="hidden sm:inline">
                      <Origen tipo={origenPorClave[part.key]} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-soft">
              <Origen tipo="Referencia" /> con fuente · <Origen tipo="Estimado" /> estimación nuestra · Margen {formatPercent(topAssess.calc.marginPct)}, ganás{" "}
              {formatMoney(topAssess.calc.profit, "USD")} por unidad.
            </p>
          </div>
        </div>
      </section>

      {/* Productos con sus números: costo, venta, ganancia y margen */}
      <section aria-labelledby="productos" className="py-20 sm:py-28">
        <Reveal>
          <p className={ETIQUETA}>Los números, sin vueltas</p>
          <h2 id="productos" className={`mt-3 max-w-3xl ${TITULO}`}>
            Costo, venta, ganancia y margen de cada producto.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">Con flete, impuestos y comisión incluidos.</p>
        </Reveal>
        <div
          role="region"
          aria-label="Productos con sus números"
          tabIndex={0}
          className="-mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6"
        >
          {ranking.slice(0, 6).map(({ p, s, a }) => (
            <article key={p.id} className={cn(cardClass, "w-72 shrink-0 snap-start overflow-hidden rounded-3xl")}>
              <div className="relative aspect-[4/3] bg-panel">
                {p.image ? <Image src={p.image} alt={p.name} fill sizes="288px" className="object-contain" /> : null}
                <span className="absolute right-3 top-3 rounded-full bg-ink px-3 py-1 font-display text-lg font-black text-paper">{s.score}</span>
              </div>
              <div className="p-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-radar-dark">{p.category}</p>
                <h3 className="mt-1 font-display text-base font-bold leading-snug">{p.name}</h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-3 text-sm">
                  <div>
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Costo</dt>
                    <dd className="font-bold tabular-nums">{formatMoney(a.calc.totalCost, "USD")}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Venta</dt>
                    <dd className="font-bold tabular-nums">{formatMoney(p.referencePriceUsd, "USD")}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Ganancia</dt>
                    <dd className={cn("font-bold tabular-nums", a.calc.profit < 0 && "text-danger")}>{formatMoney(a.calc.profit, "USD")}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Margen</dt>
                    <dd className={cn("font-bold tabular-nums", a.calc.marginPct < 0 && "text-danger")}>{formatPercent(a.calc.marginPct)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Banda oscura: de dónde salen los datos */}
      <section aria-labelledby="fuentes" className="relative left-1/2 w-screen -translate-x-1/2 bg-ink py-10 text-white sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p id="fuentes" className="text-center text-xs font-bold uppercase tracking-[0.14em] text-lima">
              Validex compara datos publicados en
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {fuentes.map((f) => (
                <li key={f} className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium">
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Tres funciones, cada una con su ilustración y una mini pantalla real */}
      <section aria-labelledby="funciones" className="py-20 sm:py-28">
        <Reveal>
          <p className={ETIQUETA}>Qué podés hacer</p>
          <h2 id="funciones" className={`mt-3 max-w-3xl ${TITULO}`}>
            Todo para decidir con números, en un solo lugar.
          </h2>
        </Reveal>
        <div
          role="region"
          aria-label="Funciones de Validex"
          tabIndex={0}
          className="-mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0 [&>article]:w-72 [&>article]:shrink-0 [&>article]:snap-start lg:[&>article]:w-auto"
        >
          <article className={cn(cardClass, "overflow-hidden")}>
            <Image src="/images/feature-drop.jpg" alt="Tres tarjetas de producto flotando junto a un calendario" width={800} height={600} sizes="(min-width: 1024px) 380px, 100vw" className="w-full" />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold">Un drop por día</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Tres productos para mirar hoy. Mañana, otros tres.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {tres.map(({ p, s }) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2">
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="font-display font-black tabular-nums">{s.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={cn(cardClass, "overflow-hidden")}>
            <Image src="/images/feature-tantear.jpg" alt="Una calculadora con monedas, una caja y una lupa" width={800} height={600} sizes="(min-width: 1024px) 380px, 100vw" className="w-full" />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold">Tantear, con todo incluido</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Mirá cómo se arma el costo antes de comprar.</p>
              <dl className="mt-4 space-y-1.5 text-sm">
                {[
                  ["Compra", top.costs.purchase],
                  ["Transporte", top.costs.shipping],
                  ["Impuestos", top.costs.taxes],
                  ["Comisión", topAssess.calc.commission],
                ].map(([nombre, v]) => (
                  <div key={nombre as string} className="flex justify-between border-b border-line pb-1.5">
                    <dt className="text-ink-soft">{nombre as string}</dt>
                    <dd className="font-bold tabular-nums">{formatMoney(v as number, "USD")}</dd>
                  </div>
                ))}
                <div className="flex justify-between pt-1 font-bold">
                  <dt>Total por unidad</dt>
                  <dd className="tabular-nums">{formatMoney(topAssess.calc.totalCost, "USD")}</dd>
                </div>
              </dl>
            </div>
          </article>

          <article className={cn(cardClass, "overflow-hidden")}>
            <Image src="/images/feature-importador.jpg" alt="Dos globos de chat junto a un avión de carga y un documento" width={800} height={600} sizes="(min-width: 1024px) 380px, 100vw" className="w-full" />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold">El Importador</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Preguntá impuestos, aduana y comisiones.</p>
              <div className="mt-4 space-y-2 text-xs">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-radar px-3 py-2 font-medium text-white">¿Qué necesito para importar y revender?</p>
                <p className="line-clamp-2 max-w-[92%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 leading-relaxed text-ink-soft">{consulta}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sin números inventados + fórmula */}
      <section id="formula" aria-labelledby="sin-inventar" className="relative left-1/2 w-screen -translate-x-1/2 bg-panel py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className={ETIQUETA}>Sin números inventados</p>
            <h2 id="sin-inventar" className={`mt-3 max-w-3xl ${TITULO}`}>
              Una fórmula abierta, con cada factor a la vista.
            </h2>
            <div className="mt-8 max-w-3xl">
              <div className={cn(cardClass, "overflow-hidden")}>
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Factores del score, su peso y de dónde sale cada uno</caption>
                  <thead className="bg-secondary">
                    <tr>
                      <th scope="col" className="px-4 py-3">Factor</th>
                      <th scope="col" className="px-4 py-3">Hasta</th>
                      <th scope="col" className="px-4 py-3">Origen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {formula.map((f) => (
                      <tr key={f.clave}>
                        <th scope="row" className="px-4 py-3 align-top font-bold">{f.nombre}</th>
                        <td className="px-4 py-3 align-top font-display font-black tabular-nums">{SCORE_MAX[f.clave]}</td>
                        <td className="px-4 py-3 align-top text-ink-soft">
                          <Origen tipo={f.origen} />
                          <span className="mt-1 block">{f.donde}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-line px-4 py-3 text-xs text-ink-soft">
                  70 o más: alto · 45 a 69: medio · menos de 45: bajo.{" "}
                  <Link href="/metodologia" className="font-bold text-radar-dark underline underline-offset-4">Ver la metodología completa</Link>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Los que no conviene comprar: los de menor score y por qué */}
      <section aria-labelledby="no" className="pb-20 sm:pb-28">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-danger">Antes de comprar</p>
          <h2 id="no" className={`mt-3 max-w-3xl ${TITULO}`}>
            Y si no conviene, <span className="text-radar">te lo decimos.</span>
          </h2>
          <div role="region" aria-label="Productos que no conviene comprar" tabIndex={0} className="relative -mx-4 mt-10 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
            <ul className="flex snap-x gap-4 md:grid md:grid-cols-3 md:gap-5">
              {evitar.map((item) => (
                <li key={item.product.id} className="w-72 shrink-0 snap-start md:w-auto">
                  <AvoidCard item={item} />
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <Link href="/evitar" className="text-sm font-bold text-radar-dark underline underline-offset-4">
              Ver todos los que no conviene →
            </Link>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="faq" className="relative left-1/2 w-screen -translate-x-1/2 bg-panel px-4 py-20 sm:px-6 sm:py-28">
        <Reveal className="mx-auto block max-w-6xl">
          <h2 id="faq" className={`mb-8 ${TITULO}`}>Preguntas</h2>
          <Faq items={faq} />
        </Reveal>
      </section>

      {/* Cierre con ilustración */}
      <section className="relative left-1/2 -mb-10 w-screen -translate-x-1/2 overflow-hidden bg-profundo text-white">
        <Image src="/images/cierre-carga.jpg" alt="" fill sizes="100vw" className="object-cover opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mb-8">
            <Logo showTagline={false} tono="claro" />
          </div>
          <h2 className={`max-w-2xl text-white ${TITULO}`}>
            Mirá los números <span className="text-lima">antes de comprar.</span>
          </h2>
          <div className="mt-8">
            <Link href="/hoy" className={PILDORA_BLANCA}>
              Ver el drop de hoy <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
