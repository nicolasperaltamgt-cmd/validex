import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Variantes del botón de Validex (Figma: capítulo 08, "Acciones con jerarquía"). Siempre en forma de píldora. */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Acción principal: violeta de marca. */
        default: "bg-primary text-primary-foreground hover:bg-radar-dark",
        /** Acción fuerte sobre fondo claro: tinta. */
        dark: "bg-ink text-paper hover:opacity-90",
        /** Sobre bloques de color de marca. */
        light: "bg-white text-ink shadow-lg shadow-black/20 hover:brightness-95",
        /** Acción secundaria: solo contorno. */
        outline: "border border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "text-ink-soft hover:bg-ink/5",
        destructive: "bg-destructive text-white hover:opacity-90",
        link: "min-h-0 rounded-none px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-6 text-sm",
        sm: "min-h-9 px-4 text-xs",
        lg: "min-h-12 px-8 text-sm",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
