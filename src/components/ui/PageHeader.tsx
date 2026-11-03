import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-line pb-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-radar">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-signal/25 bg-signal-soft px-4 py-3 text-sm leading-relaxed text-ink-soft">
      <strong className="font-semibold text-signal">Importante: </strong>
      {children}
    </p>
  );
}
