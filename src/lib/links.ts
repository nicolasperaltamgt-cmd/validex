/**
 * Validación de los links que pega la persona en Tantear (Alibaba y Mercado Libre).
 * Solo mira el texto: el link nunca se abre, se consulta ni se envía a ningún servidor.
 */
export const ES_ALIBABA = /(^|\.)alibaba\.com$/i;
export const ES_MELI = /(^|\.)mercadolibre\.com(\.ar)?$/i;

/** Devuelve un aviso si el texto no es un link https del sitio esperado; null si está bien o está vacío. */
export function avisoDeLink(texto: string, dominio: RegExp, nombre: string): string | null {
  const t = texto.trim();
  if (!t) return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return "No parece un link. Copialo completo, con https://";
  }
  if (u.protocol !== "https:") return "El link tiene que empezar con https://";
  return dominio.test(u.hostname) ? null : `No parece un link de ${nombre}.`;
}
