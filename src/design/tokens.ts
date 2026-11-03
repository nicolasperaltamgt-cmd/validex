/**
 * Tokens de diseño de Validex.
 * Origen: Figma, archivo "Untitled", colecciones "VALIDEX · Primitivos" (35) y "VALIDEX · Semánticos" (14).
 * Si cambia un valor en Figma, se cambia acá y en globals.css (@theme): los tres deben coincidir.
 */

/** Primitivos: valores crudos. No se usan directo en pantallas, solo para armar los semánticos. */
export const primitivos = {
  color: {
    ink: "#1a1033",
    "ink-soft": "#4a4268",
    muted: "#6b6488",
    paper: "#ffffff",
    panel: "#ece6ff",
    line: "#cbbff0",
    "violet-brand": "#5b3df5",
    "violet-dark": "#4528d4",
    "violet-deep": "#2b1a8f",
    "violet-light": "#d9ceff",
    danger: "#c62828",
  },
  /** Escala base 4 px. */
  space: { 0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 32: 32, 40: 40, 48: 48, 64: 64, 80: 80 },
  radius: { field: 12, panel: 20, product: 32, pill: 999 },
  border: { subtle: 1, strong: 2 },
  size: { icon: 24, button: 48, field: 56 },
  /** Anchos mínimos (px) donde empieza cada tamaño de pantalla. */
  breakpoint: { mobile: 0, tablet: 768, desktop: 1200 },
} as const;

const c = primitivos.color;

/** Semánticos: lo que se usa en los componentes, por función y no por color suelto. */
export const semanticos = {
  text: { primary: c.ink, secondary: c["ink-soft"], muted: c.muted, inverse: c.paper },
  surface: { canvas: c.paper, subtle: c.panel, pressed: c["violet-light"], brand: c["violet-deep"] },
  action: { primary: c["violet-brand"], hover: c["violet-dark"], pressed: c["violet-deep"] },
  border: { subtle: c.line, strong: c["violet-deep"] },
  feedback: { danger: c.danger },
} as const;

export const tokens = { primitivos, semanticos } as const;

export type Primitivos = typeof primitivos;
export type Semanticos = typeof semanticos;
