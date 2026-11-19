"use client";

import { useEffect } from "react";

const CLAVE = "validex-recarga-por-version";

/**
 * Cada publicación cambia los nombres de los archivos del sitio. Si alguien tiene abierta una página de la versión anterior
 * y toca un link, el navegador pide un archivo que ya no existe y la pantalla no responde.
 * Si pasa eso, se recarga la página una sola vez para traer la versión nueva.
 */
export function RecargarSiHayVersionNueva() {
  useEffect(() => {
    function recargar() {
      try {
        if (sessionStorage.getItem(CLAVE)) return;
        sessionStorage.setItem(CLAVE, "1");
      } catch {
        // Sin almacenamiento, igual se recarga (una vez por carga de página).
      }
      window.location.reload();
    }
    const esChunk = (m: unknown) => /ChunkLoadError|Loading chunk .* failed|Failed to load chunk/i.test(String(m));
    // Los errores de carga de un archivo no "suben" por la página: hay que escucharlos en la fase de captura.
    const onError = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLScriptElement && el.src.includes("/_next/static/")) return recargar();
      const ev = e as ErrorEvent;
      if (esChunk(ev.message) || esChunk(ev.error)) recargar();
    };
    const onRechazo = (e: PromiseRejectionEvent) => {
      if (esChunk(e.reason) || esChunk((e.reason as { name?: string } | null)?.name)) recargar();
    };
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRechazo);
    // Una navegación exitosa a otra página borra la marca, para poder recargar de nuevo en una publicación futura.
    const limpiar = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(CLAVE);
      } catch {
        /* nada */
      }
    }, 10000);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRechazo);
      window.clearTimeout(limpiar);
    };
  }, []);
  return null;
}
