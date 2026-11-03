"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/state/session-store";

interface GoogleId {
  initialize: (config: {
    client_id: string;
    callback: (resp: { credential: string }) => void;
    nonce: string;
    ux_mode?: "popup";
    auto_select?: boolean;
  }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "");
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Botón oficial "Continuar con Google" (Google Identity Services).
 * A diferencia del ingreso por redirección, la pantalla de Google no muestra la dirección técnica
 * de Supabase. Si el script de Google no carga, `onUnavailable` permite usar el método de respaldo.
 */
export function GoogleSignIn({
  clientId,
  onError,
  onUnavailable,
}: {
  clientId: string;
  onError: (message: string) => void;
  onUnavailable: () => void;
}) {
  const { signInWithGoogleToken } = useSession();
  const holder = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const gid = window.google?.accounts.id;
      if (!gid || !holder.current) return;
      const raw = randomNonce();
      const hashed = await sha256Hex(raw);
      if (cancelled || !holder.current) return;
      gid.initialize({
        client_id: clientId,
        nonce: hashed,
        ux_mode: "popup",
        auto_select: false,
        callback: async (resp) => {
          const error = await signInWithGoogleToken(resp.credential, raw);
          if (error) onError(error);
        },
      });
      holder.current.replaceChildren();
      gid.renderButton(holder.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        locale: "es",
        width: 300,
      });
      setReady(true);
    }

    const onLoad = () => void setup();
    let script: HTMLScriptElement | null = null;
    if (window.google?.accounts.id) {
      void setup();
    } else {
      script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onUnavailable);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onUnavailable);
    };
  }, [clientId, signInWithGoogleToken, onError, onUnavailable]);

  return (
    <div className="flex min-h-11 justify-center" aria-busy={!ready}>
      <div ref={holder} className="[color-scheme:light]" />
    </div>
  );
}
