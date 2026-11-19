import type { Decision, Verdict } from "@/lib/decision";

const ESTILO: Record<Verdict, { caja: string; marca: string; etiqueta: string }> = {
  descartar: { caja: "border-danger bg-danger-soft", marca: "bg-danger text-white", etiqueta: "Descartar" },
  "probar-en-chico": { caja: "border-radar bg-radar-soft", marca: "bg-radar text-white", etiqueta: "Probar en chico" },
  comprar: { caja: "border-profundo bg-panel", marca: "bg-profundo text-white", etiqueta: "Avanzar" },
};

/** Veredicto en una frase, con las razones y lo que falta comprobar. Es orientativo: no promete ganancias. */
export function VerdictCard({ decision }: { decision: Decision }) {
  const e = ESTILO[decision.verdict];
  return (
    <section aria-labelledby="veredicto" className={`mb-8 rounded-2xl border-2 p-6 ${e.caja}`}>
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${e.marca}`}>{e.etiqueta}</span>
      <h2 id="veredicto" className="mt-3 font-display text-2xl font-bold">{decision.title}</h2>
      <ul className="mt-3 space-y-1 text-sm text-ink-soft">
        {decision.why.map((w) => (
          <li key={w}>• {w}</li>
        ))}
      </ul>
      {decision.missing.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Antes de comprar en serio, comprobá:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">
            {decision.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Orientativo, según los números cargados. No es una recomendación de compra ni asegura ganancias.</p>
    </section>
  );
}
