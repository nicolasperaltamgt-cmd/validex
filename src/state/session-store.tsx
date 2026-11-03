"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type CurrencyLabel = "USD" | "EUR" | "ARS" | "MXN" | "CLP";
export const CURRENCY_OPTIONS: CurrencyLabel[] = ["USD", "EUR", "ARS", "MXN", "CLP"];

export interface AccountUser {
  id: string;
  email: string;
}

interface SessionState {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  clearSaved: () => void;
  /** Etiqueta de moneda para los importes que escribe el usuario en la calculadora. No convierte valores. */
  currency: CurrencyLabel;
  setCurrency: (c: CurrencyLabel) => void;
  /** Cuentas: `accountsAvailable` es false si faltan las claves de Supabase en `.env.local`. */
  accountsAvailable: boolean;
  user: AccountUser | null;
  /** Envía un enlace de ingreso al email. Devuelve un mensaje de error en español o null si salió bien. */
  signInWithEmail: (email: string) => Promise<string | null>;
  /** Ingreso con Google. Solo está disponible si Google está activado en Supabase (`googleEnabled`). */
  googleEnabled: boolean;
  signInWithGoogle: () => Promise<string | null>;
  /** Ingreso con el botón oficial de Google: recibe el token que entrega Google y el nonce original. */
  signInWithGoogleToken: (credential: string, nonce: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Hubo un problema al guardar en la cuenta (los cambios se revirtieron). */
  syncError: string | null;
}

const SessionContext = createContext<SessionState | null>(null);

const STORAGE_KEY = "validex:v1";

interface Persisted {
  savedIds: string[];
  currency: CurrencyLabel;
}

/** Lee del navegador. Puede fallar (modo privado, datos bloqueados): en ese caso se ignora. */
function readStorage(): Partial<Persisted> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Partial<Persisted>;
    return {
      savedIds: Array.isArray(data.savedIds) ? data.savedIds.filter((x) => typeof x === "string") : undefined,
      currency: CURRENCY_OPTIONS.includes(data.currency as CurrencyLabel) ? data.currency : undefined,
    };
  } catch {
    return {};
  }
}

function writeStorage(value: Persisted) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Sin almacenamiento disponible: la app sigue funcionando, solo que sin recordar.
  }
}

/**
 * Estado de la app.
 * - Sin cuenta: guardados y moneda en este navegador (localStorage).
 * - Con cuenta (Supabase): los guardados viven en la tabla `saved_products`, protegida por usuario.
 *   Al ingresar, los guardados locales se suman a los de la cuenta.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<CurrencyLabel>("USD");
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const savedRef = useRef<string[]>([]);
  savedRef.current = savedIds;

  // Se lee después de montar para que servidor y navegador renderen lo mismo al inicio.
  useEffect(() => {
    const stored = readStorage();
    if (stored.savedIds) setSavedIds(stored.savedIds);
    if (stored.currency) setCurrency(stored.currency);
    setLoaded(true);
  }, []);

  // Sin cuenta, todo se recuerda en el navegador. Con cuenta, los guardados van a la base.
  useEffect(() => {
    if (loaded && !user) writeStorage({ savedIds, currency });
    if (loaded && user) writeStorage({ savedIds: [], currency });
  }, [loaded, user, savedIds, currency]);

  // Escucha el ingreso/salida de la cuenta.
  useEffect(() => {
    if (!supabase) return;
    const toUser = (u: { id: string; email?: string | null } | undefined | null): AccountUser | null =>
      u ? { id: u.id, email: u.email ?? "" } : null;

    supabase.auth.getSession().then(({ data }) => setUser(toUser(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // Averigua si Google está activado en Supabase, para mostrar el botón solo si va a funcionar.
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabase || !url || !key) return;
    let cancelled = false;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!cancelled) setGoogleEnabled(Boolean(s?.external?.google));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Al tener cuenta: traer los guardados de la base y subir los locales que falten.
  const userId = user?.id;
  useEffect(() => {
    if (!supabase || !userId || !loaded) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("saved_products").select("product_id");
      if (cancelled) return;
      if (error) {
        setSyncError("No pudimos cargar tus guardados de la cuenta.");
        return;
      }
      const remote = data.map((r) => r.product_id as string);
      const local = savedRef.current;
      const missing = local.filter((id) => !remote.includes(id));
      if (missing.length > 0) {
        const { error: upErr } = await supabase
          .from("saved_products")
          .upsert(missing.map((product_id) => ({ user_id: userId, product_id })), {
            onConflict: "user_id,product_id",
            ignoreDuplicates: true,
          });
        if (upErr) setSyncError("No pudimos subir tus guardados a la cuenta.");
      }
      if (!cancelled) setSavedIds([...new Set([...remote, ...local])]);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, loaded]);

  const toggleSaved = useCallback(
    (id: string) => {
      const wasSaved = savedRef.current.includes(id);
      setSavedIds((prev) => (wasSaved ? prev.filter((x) => x !== id) : [...prev, id]));
      if (!supabase || !userId) return;
      setSyncError(null);
      const request = wasSaved
        ? supabase.from("saved_products").delete().eq("user_id", userId).eq("product_id", id)
        : supabase.from("saved_products").insert({ user_id: userId, product_id: id });
      request.then(({ error }) => {
        if (error) {
          // Se revierte el cambio para que la pantalla no mienta.
          setSavedIds((prev) => (wasSaved ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
          setSyncError("No pudimos guardar el cambio en tu cuenta. Probá de nuevo.");
        }
      });
    },
    [supabase, userId],
  );

  const clearSaved = useCallback(() => {
    const ids = savedRef.current;
    setSavedIds([]);
    if (!supabase || !userId || ids.length === 0) return;
    setSyncError(null);
    supabase
      .from("saved_products")
      .delete()
      .eq("user_id", userId)
      .in("product_id", ids)
      .then(({ error }) => {
        if (error) {
          setSavedIds(ids);
          setSyncError("No pudimos vaciar tu lista en la cuenta. Probá de nuevo.");
        }
      });
  }, [supabase, userId]);

  const signInWithEmail = useCallback(
    async (email: string) => {
      if (!supabase) return "Las cuentas todavía no están configuradas.";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/guardados` },
      });
      if (!error) return null;
      if (error.status === 429) return "Pediste demasiados enlaces. Esperá unos minutos y probá de nuevo.";
      return "No pudimos enviar el enlace. Revisá el email y probá de nuevo.";
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return "Las cuentas todavía no están configuradas.";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/guardados` },
    });
    return error ? "No pudimos abrir el ingreso con Google. Probá de nuevo." : null;
  }, [supabase]);

  const signInWithGoogleToken = useCallback(
    async (credential: string, nonce: string) => {
      if (!supabase) return "Las cuentas todavía no están configuradas.";
      const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: credential, nonce });
      return error ? "No pudimos ingresar con Google. Probá de nuevo." : null;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // En una computadora compartida no dejamos tus guardados a la vista.
    setSavedIds([]);
    setSyncError(null);
  }, [supabase]);

  const value = useMemo<SessionState>(
    () => ({
      savedIds,
      isSaved: (id) => savedIds.includes(id),
      toggleSaved,
      clearSaved,
      currency,
      setCurrency,
      accountsAvailable: supabase !== null,
      user,
      signInWithEmail,
      googleEnabled,
      signInWithGoogle,
      signInWithGoogleToken,
      signOut,
      syncError,
    }),
    [savedIds, toggleSaved, clearSaved, currency, supabase, user, signInWithEmail, googleEnabled, signInWithGoogle, signInWithGoogleToken, signOut, syncError],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
