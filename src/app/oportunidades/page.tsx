import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/data";
import { assess, type Level } from "@/lib/assessment";
import { formatMoney, formatPercent } from "@/lib/format";
import { CompetitionBadge, DataBadge, LevelBadge, TrendBadge } from "@/components/ui/Badges";
import { PageHeader } from "@/components/ui/PageHeader";
import { SaveButton } from "@/components/products/SaveButton";
import { StateMessage } from "@/components/ui/StateMessage";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.opportunities };

const order: Level[] = ["favorable", "moderate", "cautious"];
const intro: Record<Level, string> = {
  favorable: "Varias señales a favor.",
  moderate: "Señales mezcladas.",
  cautious: "Predominan las señales en contra.",
};

export default function OpportunitiesPage() {
  const rows = getProducts().map((p) => ({ p, a: assess(p) }));

  return (
    <>
      <PageHeader
        eyebrow={t.nav.opportunities}
        title="Panel de oportunidades"
        description="Productos agrupados por señales. Cada uno indica si su dato es real sin verificar o ficticio."
      >
        <Link href="/categorias" className="text-sm font-semibold text-radar underline underline-offset-4">
          Ver datos reales: oferta por categoría →
        </Link>
      </PageHeader>

      <dl className="mb-10 grid grid-cols-3 gap-3 text-center sm:gap-4">
        {order.map((lvl) => (
          <div key={lvl} className="rounded-2xl border-2 border-profundo bg-surface p-4">
            <dt className="text-xs text-muted sm:text-sm">{t.level[lvl]}</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">
              {rows.filter((r) => r.a.level === lvl).length}
            </dd>
          </div>
        ))}
      </dl>

      {rows.length === 0 ? (
        <StateMessage kind="empty" title="Todavía no hay oportunidades">
          No hay datos para analizar.
        </StateMessage>
      ) : (
        <div className="space-y-10">
          {order.map((lvl) => {
            const group = rows.filter((r) => r.a.level === lvl);
            if (group.length === 0) return null;
            return (
              <section key={lvl} aria-labelledby={`g-${lvl}`}>
                <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 id={`g-${lvl}`} className="font-display text-2xl font-bold">{t.level[lvl]}</h2>
                  <p className="text-sm text-muted">{intro[lvl]}</p>
                </div>
                <ul className="space-y-3">
                  {group.map(({ p, a }) => (
                    <li key={p.id} className="rounded-2xl border-2 border-profundo bg-surface p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs uppercase tracking-wide text-muted">{p.category} · {p.market}</span>
                            <DataBadge status={p.dataStatus} />
                          </div>
                          <h3 className="font-display text-lg font-bold">
                            <Link href={`/analisis/${p.id}`} className="hover:underline">{p.name}</Link>
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <TrendBadge trend={p.trend} />
                            <CompetitionBadge competition={p.competition} />
                            <LevelBadge level={a.level} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-6 lg:justify-end">
                          <dl className="text-sm">
                            <dt className="text-xs text-muted">Margen ilustrativo</dt>
                            <dd className="text-lg font-bold tabular-nums">{formatPercent(a.calc.marginPct)}</dd>
                            <dd className="text-xs text-muted">sobre {formatMoney(p.referencePriceUsd, "USD")}</dd>
                          </dl>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/analisis/${p.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-radar px-4 text-sm font-semibold text-paper hover:bg-radar-dark">
                              {t.actions.viewAnalysis}
                            </Link>
                            <SaveButton productId={p.id} productName={p.name} />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
