"use client";

import { useCallback, useState } from "react";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { useSession } from "@/state/session-store";
import { buttonClass } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/StateMessage";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AccountPanel() {
  const { accountsAvailable, user, signInWithEmail, googleEnabled, signInWithGoogle, signOut, savedIds, syncError } = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [gsiFailed, setGsiFailed] = useState(false);
  const onGsiUnavailable = useCallback(() => setGsiFailed(true), []);

  if (!accountsAvailable) {
    return (
      <StateMessage kind="empty" title="Cuentas no disponibles">
        Faltan las claves de Supabase en el archivo .env.local.
      </StateMessage>
    );
  }

  if (user) {
    return (
      <div className="max-w-md rounded-3xl border-2 border-profundo bg-surface p-6">
        <p className="text-sm text-muted">Ingresaste como</p>
        <p className="mt-1 break-all text-lg font-semibold">{user.email}</p>
        <p className="mt-3 text-sm text-ink-soft">Guardados en tu cuenta: {savedIds.length}</p>
        {syncError ? (
          <p role="alert" className="mt-3 text-sm font-medium text-danger">{syncError}</p>
        ) : null}
        <button type="button" onClick={() => void signOut()} className={buttonClass("secondary", "mt-5")}>
          Salir
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_OK.test(value)) {
      setError("Escribí un email válido.");
      return;
    }
    setError(null);
    setStatus("sending");
    const result = await signInWithEmail(value);
    if (result) {
      setError(result);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <StateMessage kind="empty" title="Revisá tu email">
        Te mandamos un enlace a {email.trim()}. Tocalo para ingresar. Si no llega, mirá en spam.
      </StateMessage>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md rounded-3xl border-2 border-profundo bg-surface p-6">
      {googleEnabled ? (
        <>
          {GOOGLE_CLIENT_ID && !gsiFailed ? (
            <GoogleSignIn clientId={GOOGLE_CLIENT_ID} onError={setError} onUnavailable={onGsiUnavailable} />
          ) : (
          <button
            type="button"
            onClick={async () => {
              const result = await signInWithGoogle();
              if (result) setError(result);
            }}
            className={buttonClass("secondary", "w-full")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 0 1 0-12.4c2 0 3.3.9 4.1 1.6l2.8-2.7A10 10 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.8 0-.7-.1-1.2-.2-1.9z" />
            </svg>
            Continuar con Google
          </button>
          )}
          <p className="my-4 text-center text-xs text-muted">o con tu email</p>
        </>
      ) : null}
      <label htmlFor="acc-email" className="mb-1 block text-sm font-medium">Email</label>
      <input
        id="acc-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "acc-err" : undefined}
        className={`min-h-11 w-full rounded-lg border bg-surface px-3 ${error ? "border-danger" : "border-ink/20 focus:border-radar"}`}
        placeholder="tu@email.com"
      />
      {error ? <p id="acc-err" role="alert" className="mt-2 text-sm font-medium text-danger">{error}</p> : null}
      <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "mt-4 w-full")}>
        {status === "sending" ? "Enviando…" : "Enviarme un enlace"}
      </button>
      <p className="mt-3 text-xs text-muted">Sin contraseña. Tus guardados quedan en tu cuenta.</p>
    </form>
  );
}
