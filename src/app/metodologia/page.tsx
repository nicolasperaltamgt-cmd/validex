import type { Metadata } from "next";
import Link from "next/link";
import { COMMISSION_PCT, DUTY_RATE, IVA, REFERENCE_RATE_ARS, realProducts } from "@/data/real-products";
import { SCORE_MAX } from "@/lib/score";
import { MIN_DROP_SCORE } from "@/lib/drop";
import { Disclaimer, PageHeader } from "@/components/ui/PageHeader";
import { cardClass } from "@/components/kit/card";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Metodología",
  description: "Cómo se calcula el score de Validex, de dónde salen los datos y qué límites tienen.",
};

const factores = [
  { clave: "margin", nombre: "Margen", texto: "Lo que queda de cada venta después de costo, flete, impuestos y comisión, sobre el precio de venta." },
  { clave: "trend", nombre: "Tendencia", texto: "Si la demanda sube, está estable o baja. Hoy es una estimación nuestra, salvo que la ficha cite una señal de búsqueda." },
  { clave: "competition", nombre: "Competencia", texto: "Cuántos modelos y vendedores vimos publicados. Es una estimación, no una medición." },
  { clave: "capital", nombre: "Capital por unidad", texto: "Cuánta plata hay que poner por unidad con todo incluido. Menos capital es más fácil de probar." },
] as const;

const estados = [
  ["Referencia sin verificar", "Hay una fuente publicada (una tienda, un listado de proveedor) con su enlace y fecha, pero no la confirmamos con el proveedor ni con una compra."],
  ["Estimado", "Es un cálculo o una estimación nuestra, por ejemplo el flete, la tendencia o la competencia. Cada ficha lo aclara."],
  ["Verificado", "Lo confirmamos con una cotización real o una compra de prueba, con la fecha. Hoy ningún producto tiene este estado."],
];

const noHacemos = [
  "No predecimos ventas: el score es una regla simple, no una promesa.",
  "No cotizamos la aduana: los impuestos son una estimación y dependen de la posición arancelaria y de tu situación fiscal.",
  "No usamos una IA para calcular el score. La fórmula es fija y está arriba.",
  "No rellenamos con un número inventado lo que no pudimos medir: lo marcamos como estimado.",
];

export default function MethodologyPage() {
  const fechas = [...new Set(realProducts.map((p) => p.updatedAt))].sort();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Metodología"
        title="Cómo se calcula todo, y qué límites tiene"
        description="Para que puedas comprobar cada número en vez de creernos."
      />

      <section aria-labelledby="score" className="mb-12">
        <h2 id="score" className="font-display text-2xl font-bold">El score</h2>
        <p className="mt-2 text-ink-soft">
          Suma hasta 100 puntos con cuatro factores. De {MIN_DROP_SCORE} en adelante un producto puede aparecer en el drop del día. Si el
          producto pierde plata en cada unidad, el score no pasa de 29.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {factores.map((f) => (
            <li key={f.clave} className={cn(cardClass, "p-5")}>
              <p className="font-bold">
                {f.nombre} <span className="font-normal text-ink-soft">· hasta {SCORE_MAX[f.clave]} puntos</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-soft">
          Bandas: <strong className="text-ink">70 o más</strong> alto, <strong className="text-ink">de 45 a 69</strong> medio,{" "}
          <strong className="text-ink">menos de 45</strong> bajo.
        </p>
      </section>

      <section aria-labelledby="costos" className="mb-12">
        <h2 id="costos" className="font-display text-2xl font-bold">Cómo armamos el costo</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          <li>
            El precio de venta es el publicado en pesos, con IVA. Lo pasamos a dólares sin IVA ({Math.round((IVA - 1) * 100)} %) y al dólar oficial de
            referencia de ${REFERENCE_RATE_ARS.toLocaleString("es-AR")}.
          </li>
          <li>
            Impuestos de importación: estimamos {(DUTY_RATE * 100).toLocaleString("es-AR")} % sobre costo más flete. El real puede ir de 0 % a 35 %
            según el producto.
          </li>
          <li>Comisión de la plataforma de venta: {COMMISSION_PCT} %. No incluye cuotas ni costos fijos por unidad.</li>
          <li>El flete por unidad es una estimación nuestra, sin cotización de un transportista.</li>
          <li>El dólar que ves en el drop se actualiza solo desde una fuente pública, como máximo cada 10 minutos.</li>
        </ul>
      </section>

      <section aria-labelledby="estados" className="mb-12">
        <h2 id="estados" className="font-display text-2xl font-bold">Estados del dato</h2>
        <dl className="mt-4 space-y-3">
          {estados.map(([nombre, texto]) => (
            <div key={nombre} className={cn(cardClass, "p-5")}>
              <dt className="font-bold">{nombre}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="nohacemos" className="mb-12">
        <h2 id="nohacemos" className="font-display text-2xl font-bold">Lo que no hacemos</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          {noHacemos.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="actualiza" className="mb-12">
        <h2 id="actualiza" className="font-display text-2xl font-bold">Cuándo se actualizó</h2>
        <p className="mt-2 text-ink-soft">
          Hay {realProducts.length} productos con fuentes. Los precios se relevaron a mano en estas fechas: {fechas.join(" y ")}. Cambian todos los días,
          así que cada ficha muestra su fecha y sus enlaces para que compruebes el dato vigente.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/catalogo" className="font-bold text-radar-dark underline underline-offset-4">Ver el catálogo con sus fuentes</Link>
        </p>
      </section>

      <Disclaimer>
        Esta es una versión de prueba con datos sin verificar. No es asesoramiento financiero, fiscal ni aduanero: consultá a un despachante de aduana
        y a un contador antes de importar.
      </Disclaimer>
    </div>
  );
}
