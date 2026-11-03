import { getProduct } from "@/data";
import { assess } from "@/lib/assessment";
import { formatMoney, formatPercent } from "@/lib/format";
import { CompetitionBadge, LevelBadge, TrendBadge } from "@/components/ui/Badges";
import { WindowFrame } from "./FeatureSection";

const EXAMPLE_ID = "demo-comedero-mascotas";

function example() {
  const p = getProduct(EXAMPLE_ID)!;
  return { p, a: assess(p) };
}

/** Lectura de una oportunidad: señales + reglas visibles. */
export function AssessmentMockup() {
  const { p, a } = example();
  return (
    <WindowFrame title={"Análisis de oportunidad"}>
      <p className="text-xs uppercase tracking-wide text-muted">{p.category} · {p.market}</p>
      <h3 className="mt-1 font-display text-lg font-bold">{p.name}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <LevelBadge level={a.level} />
        <TrendBadge trend={p.trend} />
        <CompetitionBadge competition={p.competition} />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted">Por qué esta lectura</p>
      <ul className="mt-2 space-y-2 text-sm text-ink-soft">
        {a.reasons.map((r) => (
          <li key={r} className="flex gap-2 rounded-lg border-2 border-profundo bg-surface px-3 py-2">
            <span aria-hidden="true" className="text-radar">●</span>
            {r}
          </li>
        ))}
      </ul>
    </WindowFrame>
  );
}

/** Composición del costo por unidad como barra segmentada. */
export function CostMockup() {
  const { p, a } = example();
  const parts = [
    { label: "Compra", value: p.costs.purchase, cls: "bg-[#5b8def]" },
    { label: "Transporte", value: p.costs.shipping, cls: "bg-[#38bdf8]" },
    { label: "Impuestos (ejemplo)", value: p.costs.taxes, cls: "bg-signal" },
    { label: "Comisión", value: a.calc.commission, cls: "bg-danger" },
    { label: "Beneficio", value: Math.max(a.calc.profit, 0), cls: "bg-radar" },
  ];
  const total = parts.reduce((s, x) => s + x.value, 0);
  return (
    <WindowFrame title="Calculadora de margen">
      <p className="text-xs uppercase tracking-wider text-muted">
        Dónde va cada {formatMoney(p.referencePriceUsd, "USD")} de venta
      </p>
      <div className="mt-3 flex h-4 overflow-hidden rounded-full" role="img"
        aria-label={`Composición del precio de venta de ${p.name}: ${parts.map((x) => `${x.label} ${formatMoney(x.value, "USD")}`).join(", ")}`}>
        {parts.map((x) => (
          <div key={x.label} className={x.cls} style={{ width: `${(x.value / total) * 100}%` }} />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {parts.map((x) => (
          <div key={x.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${x.cls}`} />
            <dt className="text-ink-soft">{x.label}</dt>
            <dd className="ml-auto tabular-nums">{formatMoney(x.value, "USD")}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-baseline justify-between rounded-xl border-2 border-profundo bg-surface px-4 py-3">
        <span className="text-sm text-ink-soft">Margen estimado</span>
        <span className="font-display text-2xl font-bold tabular-nums text-radar">{formatPercent(a.calc.marginPct)}</span>
      </div>
    </WindowFrame>
  );
}

/** Riesgos, oportunidades y qué validar. */
export function RiskMockup() {
  const { p } = example();
  return (
    <WindowFrame title={"Riesgos y validación"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-danger">Riesgos</p>
          <ul className="mt-2 space-y-2 text-sm text-ink-soft">
            {p.risks.map((r) => <li key={r} className="rounded-lg border-2 border-profundo bg-surface px-3 py-2">{r}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-radar">Oportunidades</p>
          <ul className="mt-2 space-y-2 text-sm text-ink-soft">
            {p.opportunities.map((r) => <li key={r} className="rounded-lg border-2 border-profundo bg-surface px-3 py-2">{r}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted">Qué validar antes de invertir</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
        {["Costos reales con cotizaciones", "Impuestos y requisitos de importación", "Competidores reales del mercado"].map((x) => (
          <li key={x} className="flex gap-2"><span aria-hidden="true" className="text-signal">☐</span>{x}</li>
        ))}
      </ul>
    </WindowFrame>
  );
}
