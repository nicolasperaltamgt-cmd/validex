"use client";

import { useEffect } from "react";
import { conBase } from "@/lib/base-path";

/** Registra el service worker que permite instalar la app. Solo en producción y con HTTPS (o localhost). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(conBase("/sw.js"), { scope: conBase("/") || "/" }).catch(() => {
      // Sin service worker la web funciona igual; solo no se ofrece instalarla.
    });
  }, []);
  return null;
}
