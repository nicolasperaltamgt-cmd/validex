import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Cliente de Supabase para el navegador. Usa solo la clave PÚBLICA (publishable): la seguridad
 * la dan las reglas por filas (RLS) de la base. Devuelve null si faltan las variables en
 * `.env.local`, y en ese caso la app sigue funcionando sin cuentas.
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}
