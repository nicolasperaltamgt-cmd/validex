import { getProduct } from "@/data";
import { assess } from "@/lib/assessment";
import { formatPercent } from "@/lib/format";
import { t } from "@/i18n";

/** Panel grande de la portada: marca a la izquierda y tarjetas apiladas con datos de demostración. */
export function HeroVisual() {
  const p = getProduct("demo-comedero-mascotas")!;
  const a = assess(p);

  const cards = [
    { icon: "%", title: "Margen calculado", sub: `${p.name.split(" (")[0]}`, value: formatPercent(a.calc.marginPct), tone: "text-radar" },
    { icon: "◎", title: "Lectura", sub: "Con reglas visibles", value: t.level[a.level], tone: "text-signal" },
    { icon: "!", title: "Riesgo", sub: p.risks[0].slice(0, 44) + "…", value: "", tone: "text-danger" },
    { icon: "✓", title: "Tus costos", sub: "Los cargás vos", value: "5 campos", tone: "text-radar" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-profundo bg-gradient-to-br from-[#2a1d55] via-panel to-[#120c26] p-6 shadow-2xl shadow-radar/20 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-radar/30 blur-3xl" />
      <div className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-8 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div>
          <p className="text-sm font-semibold text-ink-soft">Validex</p>
          <p className="mt-3 font-display text-3xl font-extrabold leading-[0.95] tracking-tight sm:text-4xl">
            VALIDÁ
            <br />
            <span className="text-ink-soft">ANTES DE</span>
            <br />
            INVERTIR
          </p>
        </div>

        <ul className="space-y-3">
          {cards.map((c) => (
            <li key={c.title} className="flex items-center gap-3 rounded-2xl border-2 border-profundo bg-surface/90 p-3 shadow-lg backdrop-blur">
              <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-radar-soft font-bold ${c.tone}`}>
                {c.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{c.title}</span>
                <span className="block truncate text-xs text-muted">{c.sub}</span>
              </span>
              {c.value ? <span className={`shrink-0 text-sm font-bold ${c.tone}`}>{c.value}</span> : null}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative mt-6 text-xs text-muted">Ejemplo con datos ficticios de demostración.</p>
    </div>
  );
}
