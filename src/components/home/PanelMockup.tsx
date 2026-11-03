import { getProducts } from "@/data";
import { assess } from "@/lib/assessment";
import { formatPercent } from "@/lib/format";
import { LevelBadge } from "@/components/ui/Badges";
import { WindowFrame } from "./FeatureSection";

/** Vista previa del panel de oportunidades, armada con los mismos datos de demostración de la app. */
export function PanelMockup() {
  const rows = getProducts()
    .map((p) => ({ p, a: assess(p) }))
    .sort((x, y) => y.a.calc.marginPct - x.a.calc.marginPct)
    .slice(0, 5);
  const max = Math.max(...rows.map((r) => r.a.calc.marginPct), 1);

  return (
    <WindowFrame title="Panel de oportunidades">
      <p className="mb-3 text-xs uppercase tracking-wider text-muted">Margen ilustrativo</p>
      <ul className="space-y-3">
        {rows.map(({ p, a }) => (
          <li key={p.id} className="rounded-xl border-2 border-profundo bg-surface p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-semibold">{p.name}</span>
              <LevelBadge level={a.level} />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                <div className="h-full rounded-full bg-gradient-to-r from-radar/60 to-radar" style={{ width: `${(a.calc.marginPct / max) * 100}%` }} />
              </div>
              <span className="w-14 text-right text-sm tabular-nums">{formatPercent(a.calc.marginPct)}</span>
            </div>
          </li>
        ))}
      </ul>
    </WindowFrame>
  );
}
