import type { ReactNode } from "react";

/** Marco de celular simple para mostrar pantallas reales de la app. */
export function PhoneFrame({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  return (
    <figure
      aria-label={label}
      className={`mx-auto w-full max-w-[17rem] rounded-[2.5rem] border-[7px] border-ink bg-paper p-3 shadow-2xl shadow-ink/25 ${className}`}
    >
      <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-ink/15" />
      <div className="min-h-[22rem] space-y-3 text-left">{children}</div>
    </figure>
  );
}
