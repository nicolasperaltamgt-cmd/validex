import type { Metadata } from "next";
import { fetchCategories } from "@/lib/meli";
import { Disclaimer, PageHeader } from "@/components/ui/PageHeader";
import { StateMessage } from "@/components/ui/StateMessage";

export const metadata: Metadata = { title: "Oferta por categoría" };

// Se vuelve a generar como máximo cada hora.
export const revalidate = 3600;

// Categorías principales de Mercado Libre Argentina (sitio MLA) dedicadas a productos.
const CATEGORY_IDS = [
  "MLA1574", "MLA1430", "MLA3025", "MLA5725", "MLA1276", "MLA1132", "MLA1648", "MLA1051",
  "MLA3937", "MLA1000", "MLA1246", "MLA1500", "MLA1403", "MLA1071", "MLA1499", "MLA1168",
  "MLA409431", "MLA1384", "MLA1182", "MLA1039", "MLA1367", "MLA1144",
];

const number = new Intl.NumberFormat("es-AR");

export default async function CategoriesPage() {
  const { configured, items, failed, fetchedAt } = await fetchCategories(CATEGORY_IDS);
  const sorted = [...items].sort((a, b) => b.totalItems - a.totalItems);
  const max = Math.max(...sorted.map((c) => c.totalItems), 1);
  const when = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(fetchedAt));

  return (
    <>
      <PageHeader
        eyebrow="Datos reales"
        title="Oferta por categoría"
        description="Cuántas publicaciones activas tiene cada rubro en Mercado Libre Argentina."
      />

      {sorted.length === 0 ? (
        <StateMessage kind="error" title="No pudimos cargar los datos">
          {configured
            ? "Mercado Libre no respondió. Probá de nuevo en un rato."
            : "Faltan las claves de Mercado Libre en el servidor."}
        </StateMessage>
      ) : (
        <>
          <p className="mb-6 text-sm text-ink-soft">
            Fuente: <strong>API oficial de Mercado Libre</strong> · Consultado el {when}
            {failed > 0 ? ` · ${failed} categoría${failed === 1 ? "" : "s"} no se pudieron leer` : ""}
          </p>

          <ol className="space-y-3">
            {sorted.map((c, i) => (
              <li key={c.id} className="rounded-2xl border-2 border-profundo bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-lg font-bold">
                    <span className="mr-2 text-sm font-normal text-muted">{i + 1}.</span>
                    {c.name}
                  </h2>
                  <p className="text-sm tabular-nums text-ink-soft">
                    <strong className="text-base text-ink">{number.format(c.totalItems)}</strong> publicaciones
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-radar/60 to-radar"
                    style={{ width: `${Math.max((c.totalItems / max) * 100, 1)}%` }}
                  />
                </div>
                {c.permalink ? (
                  <a
                    href={c.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-radar underline underline-offset-4"
                  >
                    Ver en Mercado Libre<span className="sr-only"> (se abre en otra pestaña)</span> ↗
                  </a>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="mt-8 space-y-3">
            <Disclaimer>
              La cantidad de publicaciones muestra cuánta <strong>oferta</strong> hay, no cuánto se vende ni cuánta
              demanda existe. Un rubro con muchas publicaciones puede tener mucha competencia. Validex no está afiliado
              ni respaldado por Mercado Libre.
            </Disclaimer>
          </div>
        </>
      )}
    </>
  );
}
