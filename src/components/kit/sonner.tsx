"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

/**
 * Avisos breves (toasts) con los colores de Validex. Se monta una sola vez en el layout.
 * Arriba y al centro para no tapar la barra de pestañas del celular.
 */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      duration={4000}
      style={
        {
          "--normal-bg": "var(--color-card)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-profundo)",
          "--error-bg": "var(--color-card)",
          "--error-text": "var(--color-danger)",
          "--error-border": "var(--color-danger)",
          "--border-radius": "1.25rem",
        } as CSSProperties
      }
    />
  );
}
