import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

/** Documento legal sencillo: título, aviso de borrador y secciones numeradas. */
export function LegalDoc({
  eyebrow,
  title,
  sections,
}: {
  eyebrow: string;
  title: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <p className="mb-8 rounded-xl border border-signal/30 bg-signal-soft px-4 py-3 text-sm text-ink-soft">
        <strong className="text-signal">Borrador.</strong> Este texto todavía no fue revisado por un abogado y tiene
        datos pendientes de completar (marcados entre corchetes). No lo publiques como definitivo.
      </p>
      <div className="max-w-3xl space-y-8">
        {sections.map((s, i) => (
          <section key={s.title} aria-labelledby={`sec-${i}`}>
            <h2 id={`sec-${i}`} className="font-display text-xl font-bold">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed text-ink-soft">{s.body}</div>
          </section>
        ))}
      </div>
    </>
  );
}
