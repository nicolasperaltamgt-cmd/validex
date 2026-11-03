/**
 * Monitoreo de errores con Sentry. Está APAGADO si no hay una clave (NEXT_PUBLIC_SENTRY_DSN): en ese caso
 * no se carga nada ni se envía nada a ningún servicio. Pasos para encenderlo: docs/SENTRY.md.
 *
 * Privacidad: no se envían datos personales (sendDefaultPii apagado), ni grabaciones de pantalla, ni trazas de rendimiento.
 */
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

let iniciado: Promise<typeof import("@sentry/browser")> | null = null;

function cargar() {
  if (!DSN) return null;
  if (!iniciado) {
    iniciado = import("@sentry/browser").then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        // Se saca la parte de la dirección que puede traer datos (después del ?).
        beforeSend(evento) {
          if (evento.request?.url) evento.request.url = evento.request.url.split("?")[0];
          return evento;
        },
      });
      return Sentry;
    });
  }
  return iniciado;
}

/** Avisa de un error al servicio de monitoreo, si está encendido. Nunca rompe la página si falla. */
export function reportarError(error: unknown): void {
  try {
    const sentry = cargar();
    if (!sentry) return;
    sentry.then((S) => S.captureException(error)).catch(() => undefined);
  } catch {
    // El monitoreo no debe causar errores nuevos.
  }
}

export const monitoreoActivo = Boolean(DSN);
