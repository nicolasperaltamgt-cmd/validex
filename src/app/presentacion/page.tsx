import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactoForm } from "@/components/ui/ContactoForm";
import { buttonClass } from "@/components/ui/button";
import { getProducts, getRealProducts } from "@/data";

export const metadata: Metadata = { title: "Presentación de Validex" };

const CAJA = "rounded-2xl border-2 border-profundo bg-surface p-6";

export default function PresentacionPage() {
  const analizados = getRealProducts().length;
  const verificados = getProducts().filter((p) => p.dataStatus === "verified").length;
  return (
    <>
      <PageHeader
        eyebrow="Presentación"
        title="Validex: decidí qué importar antes de arriesgar tu plata"
        description="Qué problema resuelve, para quién es y cómo podría convertirse en un negocio. Lo que está probado y lo que todavía es una hipótesis, por separado."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="problema" className={CAJA}>
          <h2 id="problema" className="font-display text-xl font-bold">El problema</h2>
          <p className="mt-3 text-ink-soft">
            Quien piensa importar para revender suele decidir con una intuición y el precio del proveedor. Pero lo que define si gana o pierde es el costo completo puesto en el país:
            flete, impuestos, comisión de la plataforma y el dólar del día. Equivocarse con la primera compra inmoviliza capital que un emprendedor chico no tiene de sobra.
          </p>
          <p className="mt-3 text-ink-soft">
            Las herramientas conocidas de investigación de productos nacieron para vender en Amazon y no resuelven el régimen de importación argentino.
          </p>
        </section>

        <section aria-labelledby="para-quien" className={CAJA}>
          <h2 id="para-quien" className="font-display text-xl font-bold">Para quién es</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
            <li>Emprendedores que quieren empezar a importar y nunca lo hicieron.</li>
            <li>Vendedores de Mercado Libre que evalúan traer un producto propio.</li>
            <li>Quien necesita saber cuánto pedir con un presupuesto limitado.</li>
          </ul>
        </section>

        <section aria-labelledby="solucion" className={`${CAJA} lg:col-span-2`}>
          <h2 id="solucion" className="font-display text-xl font-bold">Qué hace hoy</h2>
          <ol className="mt-3 grid gap-4 text-sm text-ink-soft sm:grid-cols-2 lg:grid-cols-4">
            <li><strong className="block text-ink">1. Descubrir</strong>Busca ideas entre lo que ya analizamos y lo que Mercado Libre muestra como tendencia y más vendido hoy.</li>
            <li><strong className="block text-ink">2. Analizar</strong>Costo completo, margen, score de 0 a 100, escenarios y un veredicto: descartar, probar en chico o avanzar.</li>
            <li><strong className="block text-ink">3. Decidir con tu plata</strong>Con tu presupuesto, cuántas unidades alcanzan y cuál conviene investigar primero.</li>
            <li><strong className="block text-ink">4. Seguir</strong>Guardás productos y comparás hasta tres. El veredicto nunca dice “comprar” si faltan datos confirmados.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/demo" className={buttonClass("primary")}>Probar la demo de un minuto</Link>
            <Link href="/metodologia" className={buttonClass("secondary")}>Ver la metodología</Link>
          </div>
        </section>

        <section aria-labelledby="negocio" className={CAJA}>
          <h2 id="negocio" className="font-display text-xl font-bold">Cómo podría ser un negocio</h2>
          <p className="mt-2 text-xs font-semibold text-signal">Hipótesis a validar: todavía no hay clientes ni ingresos.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
            <li>Gratis para decidir; suscripción por seguimiento y alertas de cambios de precio, costos o competencia.</li>
            <li>Derivación a proveedores, couriers y despachantes de confianza, con comisión por cliente.</li>
            <li>Con el tiempo, datos propios de resultados reales (cuánto costó traer y cuánto se vendió), si los usuarios deciden compartirlos.</li>
          </ul>
        </section>

        <section aria-labelledby="estado" className={CAJA}>
          <h2 id="estado" className="font-display text-xl font-bold">Estado real y límites</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
            <li>{analizados} productos analizados, con fuente y fecha. {verificados === 0 ? "Ninguno está verificado todavía" : `${verificados} verificados`}: son referencias, no cotizaciones.</li>
            <li>El flete y los impuestos son estimaciones nuestras; el real depende de la posición arancelaria y de cada importador.</li>
            <li>Las señales de Mercado Libre (tendencias, más vendidos) indican interés, no ventas ni precios.</li>
            <li>Nada de lo que muestra es una recomendación de compra ni una ganancia garantizada.</li>
          </ul>
          <p className="mt-3 text-sm font-semibold">Próximos pasos: verificar cinco productos con cotizaciones reales y probarla con usuarios.</p>
        </section>
        <div className="lg:col-span-2">
          <ContactoForm />
        </div>
      </div>
    </>
  );
}
