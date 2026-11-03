export interface FaqItem {
  q: string;
  a: string;
}

/** Preguntas frecuentes con <details>: accesible y utilizable con teclado sin JavaScript. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border-2 border-profundo bg-surface">
      {items.map((it) => (
        <details key={it.q} className="group px-5 py-4">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
            {it.q}
            <span aria-hidden="true" className="text-xl text-radar transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
