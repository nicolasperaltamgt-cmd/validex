// Señales de Mercado Libre actualizadas por el servidor. SOLO SE USA EN EL SERVIDOR: lee MELI_CLIENT_ID y MELI_CLIENT_SECRET
// (sin prefijo NEXT_PUBLIC_), que nunca llegan al navegador. Si faltan las claves o algo falla, devuelve la última foto guardada
// (`src/data/meli-signals.json`) con su fecha: nunca se muestra un dato inventado ni se rompe la página.
import { meliSignals } from "@/data/meli-signals";
import type { MeliBestSeller, MeliProductSignal, MeliSignals } from "./meli-signals";

const API = "https://api.mercadolibre.com";
/** Cada cuántos segundos se vuelve a consultar. Las páginas se regeneran con este mismo intervalo. */
export const MELI_REVALIDATE_SECONDS = 21600;
const MIN_TRENDS = 20;

let tokenCache: { value: string; expiresAt: number } | null = null;

async function appToken(): Promise<string | null> {
  const id = process.env.MELI_CLIENT_ID;
  const secret = process.env.MELI_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.value;
  const res = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
    // Se cachea menos que lo que dura el token (6 horas) para que la página siga siendo estática y se regenere sola.
    next: { revalidate: 3000 },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) return null;
  tokenCache = { value: j.access_token, expiresAt: Date.now() + Math.max(60, (j.expires_in ?? 3600) - 300) * 1000 };
  return j.access_token;
}

/** Las señales más recientes disponibles: en vivo si se puede, y si no, la última foto guardada. */
export async function loadMeliSignals(): Promise<MeliSignals> {
  try {
    const token = await appToken();
    if (!token) return meliSignals;
    const headers = { Authorization: `Bearer ${token}`, accept: "application/json" };
    const get = async <T,>(path: string): Promise<T | null> => {
      const res = await fetch(API + path, { headers, next: { revalidate: MELI_REVALIDATE_SECONDS } });
      return res.ok ? ((await res.json()) as T) : null;
    };

    const trendsRaw = await get<{ keyword?: string }[]>(`/trends/${meliSignals.site}`);
    if (!Array.isArray(trendsRaw) || trendsRaw.length < MIN_TRENDS) return meliSignals;
    const trends = trendsRaw.map((t, i) => ({ position: i + 1, keyword: String(t.keyword ?? "") }));

    const products: Record<string, MeliProductSignal> = {};
    await Promise.all(
      Object.entries(meliSignals.products).map(async ([id, snap]) => {
        // La categoría de cada producto ya fue revisada a mano: acá solo se actualizan la cantidad de publicaciones y los más vendidos.
        if (!snap.categoryId) {
          products[id] = snap;
          return;
        }
        const [cat, hl] = await Promise.all([
          get<{ total_items_in_this_category?: number }>(`/categories/${snap.categoryId}`),
          get<{ content?: { id: string; position: number; type: string }[] }>(`/highlights/${meliSignals.site}/category/${snap.categoryId}`),
        ]);
        const top = (hl?.content ?? []).filter((c) => c.type === "PRODUCT").slice(0, 5);
        const named = await Promise.all(
          top.map(async (c): Promise<MeliBestSeller | null> => {
            const p = await get<{ name?: string }>(`/products/${c.id}`);
            return p?.name ? { position: c.position, name: String(p.name) } : null;
          }),
        );
        const bestSellers = named.filter((x): x is MeliBestSeller => x !== null);
        products[id] = {
          ...snap,
          totalItems: cat?.total_items_in_this_category ?? snap.totalItems,
          bestSellers: bestSellers.length > 0 ? bestSellers : snap.bestSellers,
        };
      }),
    );
    return { ...meliSignals, fetchedAt: new Date().toISOString(), trends, products };
  } catch {
    return meliSignals;
  }
}
