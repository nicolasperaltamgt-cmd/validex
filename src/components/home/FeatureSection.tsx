import type { ReactNode } from "react";
import Link from "next/link";

/** Bloque de función: texto + puntos a un lado, maqueta al otro. Alterna el lado con `reverse`. */
export function FeatureSection({
  eyebrow,
  title,
  text,
  bullets,
  href,
  cta,
  reverse = false,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  bullets?: string[];
  href: string;
  cta: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-radar">{eyebrow}</p>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {text ? <p className="mt-4 leading-relaxed text-ink-soft">{text}</p> : null}
        {bullets?.length ? (
          <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-ink-soft">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 text-radar">✓</span>
                {b}
              </li>
            ))}
          </ul>
        ) : null}
        <Link href={href} className="mt-6 inline-block text-sm font-semibold text-radar underline underline-offset-4">
          {cta} →
        </Link>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{children}</div>
    </section>
  );
}

/** Tarjeta con título para las maquetas. */
export function WindowFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-profundo bg-panel shadow-2xl shadow-radar/10">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="truncate text-sm font-semibold text-ink-soft">{title}</span>
        <span className="ml-auto rounded-full border border-signal/30 bg-signal-soft px-2 py-0.5 text-[11px] font-medium text-signal">
          Datos ficticios
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
