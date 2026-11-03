import type { ScoreBand, ScorePart } from "@/lib/score";

const STROKE: Record<ScoreBand, string> = {
  high: "stroke-radar",
  medium: "stroke-signal",
  low: "stroke-danger",
};

export const BAND_LABEL: Record<ScoreBand, string> = {
  high: "Score alto",
  medium: "Score medio",
  low: "Score bajo",
};

export function ScoreDial({ score, band, size = 96 }: { score: number; band: ScoreBand; size?: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Score ${score} de 100. ${BAND_LABEL[band]}.`}>
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-line" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
        transform="rotate(-90 50 50)"
        className={`${STROKE[band]} anillo-score`}
        style={{ "--trazo-total": c } as React.CSSProperties}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="30" fontWeight="700" className="fill-ink font-display">
        {score}
      </text>
    </svg>
  );
}

export function ScoreBreakdown({ parts, capped }: { parts: ScorePart[]; capped: boolean }) {
  return (
    <div>
      <ul className="space-y-4">
        {parts.map((p) => (
          <li key={p.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{p.label}</span>
              <span className="tabular-nums text-ink-soft">
                {p.points} / {p.max}
              </span>
            </div>
            <div
              className="mt-1 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label={p.label}
              aria-valuenow={p.points}
              aria-valuemin={0}
              aria-valuemax={p.max}
            >
              <div className="h-full rounded-full bg-radar" style={{ width: `${(p.points / p.max) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">{p.why}</p>
          </li>
        ))}
      </ul>
      {capped ? (
        <p role="note" className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          Como perdés plata en cada unidad, el score se limita a 29 sin importar lo demás.
        </p>
      ) : null}
      <p className="mt-4 text-xs text-muted">
        Fórmula abierta: margen 40 + tendencia 25 + competencia 20 + plata en juego 15. Es una regla simple, no una
        predicción de ventas.
      </p>
    </div>
  );
}
