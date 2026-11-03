import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getRealProducts } from "@/data";
import { responder } from "@/lib/importador";
import { assess } from "@/lib/assessment";
import { formatMoney, formatPercent } from "@/lib/format";
import { scoreProduct } from "@/lib/score";
import { PhoneFrame } from "@/components/home/PhoneFrame";
import { BAND_LABEL, ScoreBreakdown, ScoreDial } from "@/components/products/ScoreDial";
import { Faq } from "@/components/ui/Faq";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { cardClass } from "@/components/kit/card";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/kit/button";

const faq = [
  { q: "¿Los datos son reales?", a: "Son referencias reales sin verificar, con sus fuentes y fecha. Cada producto lo aclara." },
  { q: "¿Puedo usarla en el celular?", a: "Sí. Abrila en Chrome y tocá “Instalar app”: queda como una app más, sin pasar por una tienda." },
  { q: "¿Me dice cuando un producto no conviene?", a: "Sí. Un score bajo te avisa que no compres todavía, y te explica por qué." },
  { q: "¿Estamos en versión final?", a: "No: es una versión de prueba. Puede haber detalles por mejorar y algunos datos todavía sin verificar." },
  { q: "¿Puedo usarla si nunca importé?", a: "Sí. Está pensada para empezar: el Importador explica impuestos y pasos en simple, y Tantear te muestra los números antes de comprar." },
  { q: "¿Cuánto cuesta?", a: "Es gratis y sin registro mientras sea una versión de prueba." },
];

const pasos = [
  { t: "Mirás el drop", d: "Cada día, tres productos con su score." },
  { t: "Tanteás los números", d: "Elegís cuántas unidades y ves cuánto necesitás y cuánto ganarías." },
  { t: "Preguntás lo que no sabés", d: "Impuestos, aduana y comisiones, en simple." },
  { t: "Guardás tu reporte", d: "Lo bajás en PDF para decidir con calma o mostrarlo." },
];

const paraQuien = [
  { t: "Quien quiere empezar", d: "Querés vender productos importados y no sabés por dónde arrancar." },
  { t: "Quien ya vende", d: "Ya tenés un negocio y buscás el próximo producto con buen margen." },
  { t: "Quien revende por Mercado Libre", d: "Necesitás saber cuánto te queda después de la comisión y el envío." },
];

const origen = [
  { t: "Precios de referencia", d: "Tomados de tiendas y marketplaces, con el enlace y la fecha en cada producto." },
  { t: "Dólar del día", d: "Se actualiza solo desde una fuente pública y se muestra en el drop." },
  { t: "Impuestos y comisión", d: "Reglas de importación y de venta que podés ver y cambiar en Tantear." },
  { t: "Lo que no sabemos", d: "Si un dato no está verificado, lo decimos en vez de rellenarlo." },
];

const retraso = (ms: number) => ({ "--retraso": `${ms}ms` }) as CSSProperties;

const PILDORA_LIMA = cn(buttonVariants({ variant: "light" }), "min-h-12 px-8");
const PILDORA = cn(buttonVariants({ variant: "dark" }), "min-h-12 px-8");
const TITULO = "font-display text-3xl font-black leading-[1.05] tracking-tight text-balance sm:text-5xl";

export default function HomePage() {
  const productos = getRealProducts();
  const ranking = productos.map((p) => ({ p, s: scoreProduct(p) })).sort((a, b) => b.s.score - a.s.score);
  const { p: top, s: topScore } = ranking[0];
  const { p: peor, s: peorScore } = ranking[ranking.length - 1];
  const consulta = responder("¿Qué necesito para importar y revender?", { productos, dolar: null }).parrafos[0];

  const pantallaDrop = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-panel">
        {top.image ? <Image src={top.image} alt="" fill sizes="272px" className="object-cover" /> : null}
      </div>
      <p className="text-sm font-bold leading-snug">{top.name}</p>
      <div className="flex items-center gap-3">
        <ScoreDial score={topScore.score} band={topScore.band} size={72} />
        <p className="font-display text-lg font-bold">{BAND_LABEL[topScore.band]}</p>
      </div>
    </>
  );

  return (
    <div>
      {/* Bloque grande de marca */}
      <section className="relative left-1/2 -mt-10 w-screen -translate-x-1/2 bg-profundo text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
          <div className="text-center lg:text-left">
            <div className="entrada mb-8 flex justify-center lg:justify-start" style={retraso(0)}>
              <Logo size="grande" showTagline={false} tono="claro" />
            </div>
            <p className="entrada mb-4 inline-block rounded-full border border-white/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white" style={retraso(100)}>
              Para importar y revender en Argentina
            </p>
            <h1 className={`entrada text-white ${TITULO} sm:text-6xl`} style={retraso(140)}>
              Antes de comprar, <span className="text-lima">mirá los números.</span>
            </h1>
            <p className="entrada mx-auto mt-6 max-w-md text-lg leading-relaxed text-white/85 lg:mx-0" style={retraso(280)}>
              Cada día, tres productos con un score de 0 a 100.
            </p>
            <div className="entrada mt-8 flex justify-center lg:justify-start" style={retraso(420)}>
              <Link href="/hoy" className={PILDORA_LIMA}>
                Ver el drop de hoy <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
            <p className="entrada mt-4 text-sm text-white/75" style={retraso(560)}>Gratis y sin registro. Cada dato con su fuente y su fecha.</p>
          </div>
          <div className="entrada" style={retraso(300)}>
            <Image
              src="/images/hero-ilustracion.jpg"
              alt="Un celular con un score rodeado de productos: auriculares, pava, fuente para gatos, cortina y horno de pizza"
              width={900}
              height={900}
              priority
              sizes="(min-width: 1024px) 460px, 90vw"
              className="mx-auto w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-black/40"
            />
          </div>
        </div>
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 border-t border-white/20 px-4 py-10 text-center sm:grid-cols-4 sm:px-6">
          {[
            [String(productos.length), "productos con fuentes"],
            ["3", "nuevos por día"],
            ["4", "factores en el score"],
            ["$0", "para usarla"],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className="font-display text-4xl font-black text-lima sm:text-5xl">{n}</dt>
              <dd className="mt-1 text-sm text-white/85">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Qué es */}
      <section aria-labelledby="que-es" className="relative left-1/2 w-screen -translate-x-1/2 bg-panel px-4 py-20 sm:px-6 sm:py-28">
        <Reveal className="mx-auto block max-w-6xl">
          <h2 id="que-es" className={`mx-auto max-w-3xl text-center ${TITULO}`}>
            Validex te muestra si un producto <span className="text-radar">vale la pena</span> antes de gastar.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <div>
              <PhoneFrame label="Pantalla del drop">{pantallaDrop}</PhoneFrame>
              <p className="mt-5 text-center font-bold">Mirá el drop de hoy</p>
            </div>
            <div>
              <PhoneFrame label="Pantalla con el detalle del score">
                <p className="text-sm font-bold">Cómo se arma el score</p>
                <ScoreBreakdown parts={topScore.parts} capped={topScore.capped} />
              </PhoneFrame>
              <p className="mt-5 text-center font-bold">Entendé cada número</p>
            </div>
            <div>
              <PhoneFrame label="Pantalla del Importador">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-radar px-3 py-2 text-xs font-medium text-white">
                  ¿Qué necesito para importar y revender?
                </p>
                <p className="max-w-[92%] rounded-2xl rounded-bl-sm bg-panel px-3 py-2 text-xs leading-relaxed text-ink-soft">{consulta}</p>
              </PhoneFrame>
              <p className="mt-5 text-center font-bold">Preguntá lo que no sabés</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="como" className="py-20 sm:py-28">
        <Reveal>
          <h2 id="como" className={`max-w-2xl ${TITULO}`}>Cómo funciona, en cuatro pasos.</h2>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((x, i) => (
              <li key={x.t} className={cn(cardClass, "p-6")}>
                <span className="font-display text-5xl font-black text-radar" aria-hidden="true">{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{x.d}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Importar */}
      <section aria-labelledby="importar" className="py-20 sm:py-28">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Image
              src="/images/seccion-ilustracion.jpg"
              alt="Una caja con un gráfico que sube, una lupa, una calculadora, monedas y un avión de carga"
              width={1000}
              height={750}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="w-full rounded-3xl"
            />
            <div>
              <h2 id="importar" className={TITULO}>
                Importar <span className="text-radar">sin vueltas.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                Costos, impuestos, comisiones y margen en una sola cuenta, con las fuentes a la vista.
              </p>
              <div className="mt-8">
                <Link href="/importador" className={PILDORA}>Preguntale al Importador</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* De dónde sale cada dato */}
      <section aria-labelledby="origen" className="relative left-1/2 w-screen -translate-x-1/2 bg-profundo py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lima">Sin datos inventados</p>
            <h2 id="origen" className={`mt-3 max-w-2xl text-white ${TITULO}`}>Sabés de dónde sale cada número.</h2>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {origen.map((b) => (
                <li key={b.t} className="rounded-3xl bg-paper p-7 text-ink">
                  <h3 className="font-display text-xl font-bold">{b.t}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{b.d}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* También decimos que no */}
      <section aria-labelledby="no" className="py-20 sm:py-28">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 id="no" className={TITULO}>
                Y si no conviene, <span className="text-radar">te lo decimos.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                Un score bajo es información útil: te ahorra comprar algo que no deja margen.
              </p>
            </div>
            <div className={cn(cardClass, "mx-auto w-full max-w-sm p-6")}>
              <p className="text-sm font-bold leading-snug">{peor.name}</p>
              <div className="mt-3 flex items-center gap-4">
                <ScoreDial score={peorScore.score} band={peorScore.band} size={88} />
                <div>
                  <p className="font-display text-xl font-bold">{BAND_LABEL[peorScore.band]}</p>
                  <p className="mt-1 text-sm text-ink-soft">No compres todavía.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Ranking ilustrado con productos reales */}
      <section aria-labelledby="ranking" className="py-20 sm:py-28">
        <Reveal>
          <h2 id="ranking" className={`mx-auto max-w-3xl text-center ${TITULO}`}>
            Los productos, <span className="text-radar">ordenados por score.</span>
          </h2>
          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
            {ranking.slice(0, 6).map(({ p, s }) => (
              <li key={p.id} className={cn(cardClass, "overflow-hidden rounded-2xl")}>
                <div className="relative aspect-square bg-panel">
                  {p.image ? <Image src={p.image} alt={p.name} fill sizes="(min-width: 640px) 260px, 50vw" className="object-cover" /> : null}
                  <span className="absolute right-3 top-3 rounded-full bg-ink px-3 py-1 font-display text-lg font-black text-paper">{s.score}</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-bold leading-snug">{p.name}</p>
                  <p className="mt-2 text-xs text-ink-soft">
                    Margen <strong className="text-ink">{formatPercent(assess(p).calc.marginPct)}</strong> · ganás{" "}
                    <strong className="text-ink">{formatMoney(assess(p).calc.profit, "USD")}</strong> por unidad
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/hoy" className={PILDORA}>Ver el drop de hoy</Link>
          </div>
        </Reveal>
      </section>

      {/* Para quién */}
      <section aria-labelledby="quien" className="pb-20 sm:pb-28">
        <Reveal>
          <h2 id="quien" className={`mb-10 ${TITULO}`}>Pensada para vos.</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {paraQuien.map((x) => (
              <li key={x.t} className="rounded-3xl bg-panel p-7">
                <h3 className="font-display text-xl font-bold">{x.t}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{x.d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section aria-labelledby="faq" className="relative left-1/2 w-screen -translate-x-1/2 bg-panel px-4 py-20 sm:px-6 sm:py-28">
        <Reveal className="mx-auto block max-w-6xl">
          <h2 id="faq" className={`mb-8 ${TITULO}`}>Preguntas</h2>
          <Faq items={faq} />
        </Reveal>
      </section>

      {/* Cierre */}
      <section className="relative left-1/2 -mb-10 w-screen -translate-x-1/2 bg-ink px-4 py-20 text-center text-white sm:px-6 sm:py-24">
        <h2 className={`mx-auto max-w-2xl text-white ${TITULO}`}>
          Mirá los números <span className="text-lima">antes de comprar.</span>
        </h2>
        <div className="mt-8">
          <Link href="/hoy" className={PILDORA_LIMA}>Ver el drop de hoy <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>
    </div>
  );
}
