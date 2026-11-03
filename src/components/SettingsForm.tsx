"use client";

import { CURRENCY_OPTIONS, useSession, type CurrencyLabel } from "@/state/session-store";
import { SUPPORTED_LOCALES } from "@/i18n";
import { buttonClass } from "@/components/ui/button";
import { NativeSelect } from "@/components/kit/native-select";

export function SettingsForm() {
  const { currency, setCurrency, savedIds, clearSaved } = useSession();
  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border-2 border-profundo bg-surface p-6">
        <h2 className="font-display text-xl font-bold">Idioma</h2>
        <label htmlFor="lang" className="mt-3 mb-1 block text-sm font-medium">Idioma de la interfaz</label>
        <NativeSelect id="lang" wrapperClassName="max-w-xs" className="text-sm" defaultValue="es">
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l.code} value={l.code} disabled={!l.available}>
              {l.label}{l.available ? "" : " (próximamente)"}
            </option>
          ))}
        </NativeSelect>
        <p className="mt-2 text-xs text-muted">Por ahora solo español.</p>
      </section>

      <section className="rounded-2xl border-2 border-profundo bg-surface p-6">
        <h2 className="font-display text-xl font-bold">Calculadora</h2>
        <label htmlFor="cur" className="mt-3 mb-1 block text-sm font-medium">Etiqueta de moneda</label>
        <NativeSelect id="cur" wrapperClassName="max-w-xs" className="text-sm" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyLabel)}>
          {CURRENCY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </NativeSelect>
        <p className="mt-2 text-xs text-muted">
          Solo cambia la etiqueta. No convierte valores.
        </p>
      </section>

      <section className="rounded-2xl border-2 border-profundo bg-surface p-6">
        <h2 className="font-display text-xl font-bold">Tus datos</h2>
        <p className="mt-2 text-sm text-ink-soft">Guardados: {savedIds.length}.</p>
        <button type="button" onClick={clearSaved} disabled={savedIds.length === 0} className={buttonClass("secondary", "mt-4")}>
          Vaciar productos guardados
        </button>
      </section>
    </div>
  );
}
