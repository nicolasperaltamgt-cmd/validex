import { t } from "@/i18n";

/** Marca: una V con flecha ascendente (violeta y blanco). */
export function RadarMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="fx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b6cff" />
          <stop offset="1" stopColor="#5b3df5" />
        </linearGradient>
      </defs>
      {/* Trazo izquierdo de la V */}
      <path d="M4 7 H12.5 L22.5 30 L18.5 36 Z" fill="currentColor" />
      {/* Trazo derecho: flecha ascendente */}
      <path d="M20 32 L32.5 12.5" stroke="url(#fx-g)" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M37 5 L37.2 13.6 L29.4 8.6 Z" fill="url(#fx-g)" />
    </svg>
  );
}

export function Logo({ showTagline = true, size = "normal", tono = "oscuro" }: { showTagline?: boolean; size?: "normal" | "grande"; tono?: "oscuro" | "claro" }) {
  const [a, b, c] = t.brandTagline.split(". ");
  const grande = size === "grande";
  const claro = tono === "claro";
  return (
    <span className={`inline-flex items-center ${grande ? "gap-4" : "gap-3"}`}>
      <RadarMark size={grande ? 56 : 36} className={claro ? "text-white" : "text-ink"} />
      <span className="leading-none">
        <span className={`block font-semibold uppercase tracking-[0.14em] text-ink ${grande ? "text-4xl" : "text-xl"} ${claro ? "!text-white" : ""}`}>
          Valide<span className={claro ? "text-lima" : "text-radar"}>x</span>
        </span>
        {showTagline ? (
          <span className="mt-1.5 hidden whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.2em] text-muted sm:block">
            {a}. {b}. <span className="text-radar">{c}</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}
