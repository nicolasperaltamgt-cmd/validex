// Cliente mínimo de la API oficial de Mercado Libre. SOLO SE USA EN EL SERVIDOR:
// lee MELI_CLIENT_ID y MELI_CLIENT_SECRET (sin prefijo NEXT_PUBLIC_), que nunca llegan al navegador.
// Solo hace consultas de lectura de datos públicos de categorías.

const API = "https://api.mercadolibre.com";
const REVALIDATE_SECONDS = 3600; // se vuelve a consultar como máximo una vez por hora

export interface MeliCategory {
  id: string;
  name: string;
  /** Cantidad de publicaciones activas en la categoría. Es el tamaño de la oferta, no ventas ni demanda. */
  totalItems: number;
  permalink: string | null;
  subcategories: number;
}

export interface CategoriesResult {
  /** false si faltan las claves en el servidor. */
  configured: boolean;
  items: MeliCategory[];
  /** Categorías que no se pudieron leer. */
  failed: number;
  fetchedAt: string;
}

let tokenCache: { value: string; expiresAt: number } | null = null;

async function getAppToken(): Promise<string | null> {
  const id = process.env.MELI_CLIENT_ID;
  const secret = process.env.MELI_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.value;

  const res = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  // Se renueva 5 minutos antes de que venza.
  tokenCache = { value: json.access_token, expiresAt: Date.now() + ((json.expires_in ?? 3600) - 300) * 1000 };
  return tokenCache.value;
}

/** Lee categorías por id. Nunca lanza error: devuelve lo que pudo leer y cuántas fallaron. */
export async function fetchCategories(ids: string[]): Promise<CategoriesResult> {
  const fetchedAt = new Date().toISOString();
  const configured = Boolean(process.env.MELI_CLIENT_ID && process.env.MELI_CLIENT_SECRET);
  if (!configured) return { configured, items: [], failed: ids.length, fetchedAt };

  let token: string | null = null;
  try {
    token = await getAppToken();
  } catch {
    token = null;
  }
  if (!token) return { configured, items: [], failed: ids.length, fetchedAt };

  const settled = await Promise.allSettled(
    ids.map(async (id): Promise<MeliCategory> => {
      const res = await fetch(`${API}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as {
        id: string;
        name: string;
        total_items_in_this_category?: number;
        permalink?: string | null;
        children_categories?: unknown[];
      };
      return {
        id: j.id,
        name: j.name,
        totalItems: j.total_items_in_this_category ?? 0,
        permalink: j.permalink ?? null,
        subcategories: j.children_categories?.length ?? 0,
      };
    }),
  );

  const items = settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
  return { configured, items, failed: settled.length - items.length, fetchedAt };
}
