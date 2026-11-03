import type { Competition, DataStatus, Trend } from "@/data/types";
import type { Level } from "@/lib/assessment";
import { t } from "@/i18n";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

export function DemoBadge({ long = false }: { long?: boolean }) {
  return (
    <span className={`${base} border border-signal/30 bg-signal-soft text-signal`}>
      <span aria-hidden="true">◆</span>
      {long ? t.demo.badgeLong : t.demo.badge}
    </span>
  );
}

/** Etiqueta según el estado del dato: ficticio, real sin verificar o verificado. */
export function DataBadge({ status, long = false }: { status: DataStatus; long?: boolean }) {
  if (status === "demo") return <DemoBadge long={long} />;
  return (
    <span className={`${base} border border-radar/30 bg-radar-soft text-radar-dark`}>
      <span aria-hidden="true">◇</span>
      {status === "verified" ? "Verificado" : long ? "Referencia real, sin verificar" : "Sin verificar"}
    </span>
  );
}

const trendStyle: Record<Trend, { cls: string; icon: string }> = {
  up: { cls: "bg-radar-soft text-radar-dark", icon: "↗" },
  steady: { cls: "bg-ink/10 text-ink-soft", icon: "→" },
  down: { cls: "bg-danger-soft text-danger", icon: "↘" },
};

export function TrendBadge({ trend }: { trend: Trend }) {
  const s = trendStyle[trend];
  return (
    <span className={`${base} ${s.cls}`}>
      <span aria-hidden="true">{s.icon}</span>
      Tendencia: {t.trend[trend].toLowerCase()}
    </span>
  );
}

const compStyle: Record<Competition, string> = {
  low: "bg-radar-soft text-radar-dark",
  medium: "bg-ink/10 text-ink-soft",
  high: "bg-danger-soft text-danger",
};

export function CompetitionBadge({ competition }: { competition: Competition }) {
  return (
    <span className={`${base} ${compStyle[competition]}`}>
      Competencia: {t.competition[competition].toLowerCase()}
    </span>
  );
}

const levelStyle: Record<Level, string> = {
  favorable: "bg-radar text-paper",
  moderate: "bg-ink-soft text-paper",
  cautious: "bg-signal text-paper",
};

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`${base} ${levelStyle[level]}`}>{t.level[level]}</span>;
}
