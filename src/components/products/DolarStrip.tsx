import type { Dolar } from "@/lib/dolar-parse";

const ARS = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const WHEN = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

/** Cotización del dólar en una sola línea, para no robarle lugar a lo importante. */
export function DolarStrip({ dolar }: { dolar: Dolar | null }) {
  if (!dolar) {
    return (
      <p role="status" className="text-sm text-muted">
        No pudimos traer el dólar ahora, así que no mostramos precios en pesos.
      </p>
    );
  }
  const items = [
    { label: "Blue", value: dolar.blue },
    { label: "Oficial", value: dolar.oficial },
    { label: "CCL", value: dolar.ccl },
  ];
  return (
    <p aria-label="Cotización del dólar" className="text-sm text-ink-soft">
      <span className="text-muted">Dólar hoy · </span>
      {items.map((i, n) => (
        <span key={i.label}>
          {n > 0 ? <span aria-hidden="true" className="text-muted"> · </span> : null}
          {i.label} <strong className="tabular-nums text-ink">$ {ARS.format(i.value)}</strong>
        </span>
      ))}
      <span className="ml-2 text-xs text-muted">
        DolarAPI{dolar.updatedAt ? `, ${WHEN.format(new Date(dolar.updatedAt))}` : ""}
      </span>
    </p>
  );
}
