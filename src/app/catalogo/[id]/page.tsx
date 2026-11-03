import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/data";
import { assess } from "@/lib/assessment";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { CompetitionBadge, DataBadge, LevelBadge, TrendBadge } from "@/components/ui/Badges";
import { Disclaimer } from "@/components/ui/PageHeader";
import { SaveButton } from "@/components/products/SaveButton";
import { SourcesPanel } from "@/components/products/SourcesPanel";
import { ProductImage } from "@/components/products/ProductImage";
import { t } from "@/i18n";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p ? p.name : t.states.notFoundTitle };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).id);
  if (!product) notFound();
  const a = assess(product);

  return (
    <article>
      <nav aria-label="Ruta de navegación" className="mb-5 text-sm text-muted">
        <Link href="/catalogo" className="hover:underline">{t.nav.catalog}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.category}</span>
      </nav>

      <header className="mb-8 border-b border-line pb-6">
        <ProductImage product={product} priority sizes="(min-width: 640px) 448px, 100vw" className="mb-5 h-56 w-full max-w-md rounded-2xl border-2 border-profundo" />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <DataBadge status={product.dataStatus} long />
          <span className="text-sm text-muted">{product.category} · {product.market}</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/analisis/${product.id}`} className={buttonClass("primary")}>
            {t.actions.viewAnalysis}
          </Link>
          <Link href={`/calculadora?producto=${product.id}`} className={buttonClass("secondary")}>
            {t.actions.openCalculator}
          </Link>
          <SaveButton productId={product.id} productName={product.name} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-8">
          <section aria-labelledby="senales">
            <h2 id="senales" className="mb-3 font-display text-xl font-bold">Señales (ilustrativas)</h2>
            <div className="flex flex-wrap gap-2">
              <TrendBadge trend={product.trend} />
              <CompetitionBadge competition={product.competition} />
              <LevelBadge level={a.level} />
            </div>
          </section>

          <section aria-labelledby="costos">
            <h2 id="costos" className="mb-3 font-display text-xl font-bold">Costos ilustrativos por unidad</h2>
            <dl className="divide-y divide-line rounded-2xl border-2 border-profundo bg-surface text-sm">
              {[
                ["Precio de referencia", formatMoney(product.referencePriceUsd, "USD")],
                ["Costo de compra", formatMoney(product.costs.purchase, "USD")],
                ["Transporte", formatMoney(product.costs.shipping, "USD")],
                ["Impuestos y aranceles (valor de ejemplo)", formatMoney(product.costs.taxes, "USD")],
                [`Comisión (${formatPercent(product.costs.commissionPct)})`, formatMoney(a.calc.commission, "USD")],
                ["Costo total", formatMoney(a.calc.totalCost, "USD")],
                ["Beneficio estimado", formatMoney(a.calc.profit, "USD")],
                ["Margen estimado", formatPercent(a.calc.marginPct)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section aria-labelledby="riesgos">
              <h2 id="riesgos" className="mb-3 font-display text-xl font-bold">Riesgos</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
                {product.risks.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
            <section aria-labelledby="oportunidades">
              <h2 id="oportunidades" className="mb-3 font-display text-xl font-bold">Oportunidades</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
                {product.opportunities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          </div>
        </div>

        <aside className="space-y-4" aria-label="Estado del dato">
          <div className="rounded-2xl border-2 border-profundo bg-surface p-5 text-sm">
            <h2 className="font-display text-lg font-bold">Estado del dato</h2>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-xs text-muted">Estado</dt>
                <dd className="font-medium">{t.dataStatus[product.dataStatus]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Última actualización</dt>
                <dd className="font-medium">{formatDate(product.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Fuente</dt>
                <dd className="leading-relaxed">{product.sourceNote}</dd>
              </div>
            </dl>
          </div>
          <Disclaimer>{t.disclaimerShort}</Disclaimer>
        </aside>
      </div>
      <SourcesPanel product={product} />
    </article>
  );
}
