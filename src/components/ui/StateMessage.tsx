import type { ReactNode } from "react";

type Kind = "empty" | "error" | "loading";

const icons: Record<Kind, string> = { empty: "○", error: "!", loading: "…" };

/** Estado de carga, vacío o error con aspecto consistente. */
export function StateMessage({
  kind,
  title,
  children,
  action,
}: {
  kind: Kind;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const isError = kind === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center"
    >
      <span
        aria-hidden="true"
        className={`mb-4 flex size-12 items-center justify-center rounded-full text-xl font-bold ${
          isError ? "bg-danger-soft text-danger" : "bg-radar-soft text-radar"
        } ${kind === "loading" ? "animate-pulse" : ""}`}
      >
        {icons[kind]}
      </span>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {children ? <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p> : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
