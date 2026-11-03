import * as React from "react";
import { cn } from "@/lib/cn";

/** Tabla de Validex: contenedor con scroll horizontal y el mismo contorno que las tarjetas. */
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-profundo">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("sr-only", className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("bg-secondary", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border bg-card", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={className} {...props} />;
}

export function TableHead({ className, scope = "col", ...props }: React.ComponentProps<"th">) {
  return <th scope={scope} className={cn("px-4 py-3 text-left align-top", className)} {...props} />;
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-top tabular-nums", className)} {...props} />;
}
