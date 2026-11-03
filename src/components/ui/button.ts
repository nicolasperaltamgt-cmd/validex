type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:opacity-90",
  secondary: "border border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/5",
  ghost: "text-ink-soft hover:bg-ink/5",
};

/** Clases de botón reutilizables, para <button> y <Link>. Forma de píldora, como el resto de la interfaz. */
export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}
