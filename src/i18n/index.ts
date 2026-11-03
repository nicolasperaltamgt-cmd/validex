import { es, type Messages } from "./es";

/** Idioma activo. Hoy solo español; aquí se elegirá según la configuración del usuario. */
export const t: Messages = es;

export const SUPPORTED_LOCALES = [
  { code: "es", label: "Español", available: true },
  { code: "en", label: "English", available: false },
  { code: "pt", label: "Português", available: false },
] as const;
