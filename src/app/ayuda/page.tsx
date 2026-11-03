import type { Metadata } from "next";
import { Disclaimer, PageHeader } from "@/components/ui/PageHeader";
import { Faq } from "@/components/ui/Faq";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.help };

const limits = [
  ["Datos reales y ficticios", "Algunos productos tienen precios publicados en Argentina y costos de listados de proveedores, sin verificar; otros son inventados para probar la plataforma. Cada ficha lo indica."],
  ["Datos reales", "Solo “Oferta por categoría” usa datos reales de la API oficial de Mercado Libre, con su fuente y fecha."],
  ["Sin más fuentes", "Búsqueda, ventas y tendencias de Mercado Libre todavía no están habilitadas para esta aplicación."],
  ["Reglas simples", "Suma tres señales: margen, tendencia y competencia. No es una predicción."],
  ["Tus supuestos", "Impuestos y aranceles los cargás vos. No es una cotización real."],
  ["Sin IA", "No se usa ningún servicio de IA."],
  ["Guardados", "Sin cuenta, quedan en este navegador. Con cuenta, quedan en tu cuenta."],
];

const glossary = [
  { q: "Margen ilustrativo", a: "Beneficio sobre el precio de venta." },
  { q: "Recargo sobre el costo (markup)", a: "Beneficio sobre el costo total. No es el margen." },
  { q: "Señal de tendencia", a: "Al alza, estable o a la baja. Cada ficha aclara si es dato publicado o estimación." },
  { q: "Competencia estimada", a: "Baja, media o alta. Es una estimación: no se mide." },
];

export default function HelpPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.help}
        title="Ayuda y límites de los datos"
        description="Qué es real y qué no en esta versión de prueba."
      />
      <section aria-labelledby="lim" className="mb-12">
        <h2 id="lim" className="mb-4 font-display text-2xl font-bold">Limitaciones</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {limits.map(([title, text]) => (
            <li key={title} className="rounded-2xl border-2 border-profundo bg-surface p-5">
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="glo" className="mb-8">
        <h2 id="glo" className="mb-4 font-display text-2xl font-bold">Glosario</h2>
        <Faq items={glossary} />
      </section>
      <Disclaimer>{t.disclaimerShort}</Disclaimer>
    </>
  );
}
