"use client";

import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Botón "Instalar app". Solo aparece cuando el navegador (Chrome en Android o PC) dice que se puede instalar
 * y la app todavía no está instalada. En iPhone no existe esta señal: ahí se instala desde Compartir > Agregar a inicio.
 */
export function InstallButton({ className = "" }: { className?: string }) {
  const [evento, setEvento] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const alOfrecer = (e: Event) => {
      e.preventDefault();
      setEvento(e as InstallPromptEvent);
    };
    const alInstalar = () => setEvento(null);
    window.addEventListener("beforeinstallprompt", alOfrecer);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alOfrecer);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  if (!evento) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await evento.prompt();
        await evento.userChoice;
        setEvento(null);
      }}
      className={className}
    >
      Instalar app
    </button>
  );
}
