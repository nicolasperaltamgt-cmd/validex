import * as React from "react";
import { cn } from "@/lib/cn";

type NativeSelectProps = React.ComponentProps<"select"> & { wrapperClassName?: string };

/**
 * Selector nativo con el estilo de shadcn. Se usa el del sistema (y no uno armado con Radix) porque en el celular
 * abre la lista del propio teléfono: más rápida y accesible. Mismo alto táctil y radio que el resto de los campos.
 */
export function NativeSelect({ className, wrapperClassName, children, ...props }: NativeSelectProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <select
        className={cn(
          "min-h-11 w-full appearance-none rounded-xl border border-ink/25 bg-surface pl-3 pr-10 text-base focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-ink-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
