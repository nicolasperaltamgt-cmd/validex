import Link from "next/link";
import type { Product } from "@/data/types";
import { assess } from "@/lib/assessment";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { CompetitionBadge, DataBadge, LevelBadge, TrendBadge } from "@/components/ui/Badges";
import { SaveButton } from "./SaveButton";
import { ProductImage } from "./ProductImage";
import { t } from "@/i18n";

export function ProductCard({ product }: { product: Product }) {
  const a = assess(product);
  return (
    <article className="flex flex-col rounded-2xl border-2 border-profundo bg-surface p-5 shadow-[0_1px_0_rgba(12,26,43,0.04)] transition-shadow hover:shadow-md">
      <ProductImage product={product} className="-mx-5 -mt-5 mb-4 h-44 rounded-t-2xl" sizes="(min-width: 1024px) 33vw, 100vw" />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {product.category} · {product.market}
        </p>
        <DataBadge status={product.dataStatus} />
      </div>

      <h3 className="font-display text-lg font-bold leading-snug">
        <Link href={`/catalogo/${product.id}`} className="hover:underline">
          {product.name}
        </Link>
      </h3>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Precio de referencia (ilustrativo)</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums">
            {formatMoney(product.referencePriceUsd, "USD")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Margen ilustrativo</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums">
            {formatPercent(a.calc.marginPct)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <TrendBadge trend={product.trend} />
        <CompetitionBadge competition={product.competition} />
      </div>

      <div className="mt-3">
        <LevelBadge level={a.level} />
      </div>

      <p className="mt-3 text-xs text-muted">Actualizado: {formatDate(product.updatedAt)}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/catalogo/${product.id}`} className={buttonClass("primary")}>
          {t.actions.viewProduct}
        </Link>
        <SaveButton productId={product.id} productName={product.name} />
      </div>
    </article>
  );
}
