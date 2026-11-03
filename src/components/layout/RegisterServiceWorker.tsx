"use client";

import { useEffect } from "react";

/** Registra el service worker que permite instalar la app. Solo en producción y con HTTPS (o localhost). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sin service worker la web funciona igual; solo no se ofrece instalarla.
    });
  }, []);
  return null;
}
