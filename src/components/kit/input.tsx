import * as React from "react";
import { cn } from "@/lib/cn";

/** Campo de texto de Validex: alto mínimo 44 px (táctil), radio 12 px. El error se marca con aria-invalid. */
export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-11 w-full rounded-xl border border-ink/25 bg-surface px-3 text-base placeholder:text-muted focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}
