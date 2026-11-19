import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/data";
import { assess } from "@/lib/assessment";
import { scoreProduct } from "@/lib/score";
import { BAND_LABEL, ScoreBreakdown, ScoreDial } from "@/components/products/ScoreDial";
import { SourcesPanel } from "@/components/products/SourcesPanel";
import { CoveragePanel } from "@/components/products/CoveragePanel";
import { VerdictCard } from "@/components/products/VerdictCard";
import { EVIDENCIA_ETIQUETA, nivelEvidencia } from "@/lib/priorizar";
import { decide } from "@/lib/decision";
import { coverageOf } from "@/lib/coverage";
import { sensitivityOf } from "@/lib/sensitivity";
import { SensitivityPanel } from "@/components/products/SensitivityPanel";
import { MeliSignalsPanel } from "@/components/products/MeliSignalsPanel";
import { loadMeliSignals } from "@/lib/meli-live";
import { matchTrends, withMeliEvidence } from "@/lib/meli-signals";

/** La ficha se regenera cada 6 horas para traer las señales de Mercado Libre al día (ver lib/meli-live.ts). */
export const revalidate = 21600;
import { ShareButton } from "@/components/products/ShareButton";
import { ProductImage } from "@/components/products/ProductImage";
import { formatMoney, formatPercent } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { CompetitionBadge, DataBadge, LevelBadge, TrendBadge } from "@/components/ui/Badges";
import { Disclaimer } from "@/components/ui/PageHeader";
import { SaveButton } from "@/components/products/SaveButton";
import { t } from "@/i18n";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p ? `Análisis: ${p.name}` : t.states.notFoundTitle };
}

const checklist = [
  "Pedí cotizaciones reales de costos.",
  "Verificá impuestos y requisitos de importación.",
  "Compará precios y competidores reales.",
  "Probá la demanda con poca inversión.",
  "Revisá garantías y certificaciones.",
];

export default async function AnalysisPage({ params }: Props) {
  const product = getProduct((await params).id);
  if (!product) notFound();
  const a = assess(product);
  const s = scoreProduct(product);
  const meliSignals = await loadMeliSignals();
  const meli = meliSignals.products[product.id];
  const tendencias = meli ? matchTrends(meli.trendWords, meliSignals.trends) : [];
  // Si el producto aparece en las búsquedas en alza de Mercado Libre, su tendencia pasa a figurar como "publicada" en la cobertura.
  const productoCobertura = withMeliEvidence(product, tendencias);
  const cobertura = coverageOf(productoCobertura);
  const nivelEv = nivelEvidencia(cobertura);
  const decision = decide({
    score: s.score,
    marginPct: a.calc.marginPct,
    profit: a.calc.profit,
    firmness: sensitivityOf(product).firmness,
    coverage: cobertura,
  });

  return (
    <article>
      <nav aria-label="Ruta de navegación" className="mb-5 text-sm text-muted">
        <Link href="/oportunidades" className="hover:underline">{t.nav.opportunities}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Análisis</span>
      </nav>

      <header className="mb-8 border-b border-line pb-6">
        <ProductImage product={product} priority sizes="(min-width: 640px) 448px, 100vw" className="mb-5 h-56 w-full max-w-md rounded-2xl border-2 border-profundo" />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <DataBadge status={product.dataStatus} long />
          <LevelBadge level={a.level} />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Análisis de oportunidad: {product.name}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">Orientativo. No es una recomendación de compra.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/calculadora?producto=${product.id}`} className={buttonClass("primary")}>
            {t.actions.openCalculator}
          </Link>
          <Link href={`/catalogo/${product.id}`} className={buttonClass("secondary")}>
            {t.actions.viewProduct}
          </Link>
          <SaveButton productId={product.id} productName={product.name} />
          <ShareButton
            texto={`${product.name}: score ${s.score}/100 en Validex.`}
            ruta={`/analisis/${product.id}`}
            className={buttonClass("secondary")}
          />
        </div>
      </header>

      <section aria-labelledby="score" className="mb-8 rounded-2xl border-2 border-profundo bg-surface p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4 sm:flex-col sm:items-start">
            <ScoreDial score={s.score} band={s.band} size={120} />
            <div>
              <h2 id="score" className="font-display text-xl font-bold">Score Validex</h2>
              <p className="text-sm text-ink-soft">{BAND_LABEL[s.band]}</p>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <ScoreBreakdown parts={s.parts} capped={s.capped} />
            <p className="mt-4 rounded-xl border border-line px-4 py-3 text-sm">
              <strong>{EVIDENCIA_ETIQUETA[nivelEv]}:</strong> {cobertura.backed} de {cobertura.total} datos tienen respaldo y {cobertura.confirmed} están confirmados.{" "}
              <span className="text-ink-soft">El score dice qué tan buena parece la oportunidad; la evidencia dice cuánto de eso está comprobado. Son cosas distintas.</span>
            </p>
          </div>
        </div>
      </section>

      <VerdictCard decision={decision} />

      {product.dataStatus !== "demo" && <CoveragePanel product={productoCobertura} />}
      {product.dataStatus !== "demo" && meli && (
        <MeliSignalsPanel signal={meli} matches={tendencias} fetchedAt={meliSignals.fetchedAt} />
      )}
      {product.dataStatus !== "demo" && <SensitivityPanel product={product} />}

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="porque" className="rounded-2xl border-2 border-profundo bg-surface p-6">
          <h2 id="porque" className="font-display text-xl font-bold">Por qué esta lectura</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <TrendBadge trend={product.trend} />
            <CompetitionBadge competition={product.competition} />
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-soft">
            {a.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden="true" className="text-radar">●</span>
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="num" className="rounded-2xl border-2 border-profundo bg-surface p-6">
          <h2 id="num" className="font-display text-xl font-bold">Números ilustrativos por unidad</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ink-soft">Precio de referencia</dt><dd className="font-semibold tabular-nums">{formatMoney(product.referencePriceUsd, "USD")}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-soft">Costo total estimado</dt><dd className="font-semibold tabular-nums">{formatMoney(a.calc.totalCost, "USD")}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-soft">Beneficio estimado</dt><dd className="font-semibold tabular-nums">{formatMoney(a.calc.profit, "USD")}</dd></div>
            <div className="flex justify-between gap-4 border-t border-line pt-3"><dt className="text-ink-soft">Margen estimado</dt><dd className="text-lg font-bold tabular-nums">{formatPercent(a.calc.marginPct)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">
            {product.dataStatus === "demo" ? "Costos ficticios." : "Costos estimados, sin verificar."} Probá los tuyos en la calculadora.
          </p>
        </section>

        <section aria-labelledby="r" className="rounded-2xl border-2 border-profundo bg-surface p-6">
          <h2 id="r" className="font-display text-xl font-bold">Riesgos a considerar</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {product.risks.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </section>
        <section aria-labelledby="o" className="rounded-2xl border-2 border-profundo bg-surface p-6">
          <h2 id="o" className="font-display text-xl font-bold">Oportunidades a explorar</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {product.opportunities.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </section>
      </div>

      <SourcesPanel product={product} />

      <section aria-labelledby="validar" className="mt-8">
        <h2 id="validar" className="font-display text-xl font-bold">Qué validar antes de invertir</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          {checklist.map((c) => <li key={c}>{c}</li>)}
        </ol>
      </section>

      <div className="mt-8"><Disclaimer>{t.disclaimerShort}</Disclaimer></div>
    </article>
  );
}
