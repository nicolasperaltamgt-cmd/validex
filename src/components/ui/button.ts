import { buttonVariants } from "@/components/kit/button";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

/** Nombres viejos de variante, traducidos a los del botón de shadcn. */
const EQUIVALENTE = { primary: "dark", secondary: "outline", ghost: "ghost" } as const;

/**
 * Clases de botón para <button> y <Link>. Se mantiene para no tocar de golpe los usos existentes:
 * por dentro usa el Button de `@/components/kit/button`, que es la única definición de estilos.
 */
export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return cn(buttonVariants({ variant: EQUIVALENTE[variant] }), extra);
}
