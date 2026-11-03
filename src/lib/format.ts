const LOCALE = "es-AR";

export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(value)} %`;
}

/** Fija la zona horaria en UTC para evitar diferencias servidor/navegador. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
