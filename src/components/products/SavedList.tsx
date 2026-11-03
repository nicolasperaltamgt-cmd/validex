"use client";

import Link from "next/link";
import type { Product } from "@/data/types";
import { useSession } from "@/state/session-store";
import { buttonClass } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/StateMessage";
import { ProductCard } from "./ProductCard";
import { t } from "@/i18n";

export function SavedList({ products }: { products: Product[] }) {
  const { savedIds, clearSaved } = useSession();
  const saved = savedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  if (saved.length === 0) {
    return (
      <StateMessage
        kind="empty"
        title="Todavía no guardaste productos"
        action={
          <Link href="/catalogo" className={buttonClass("primary")}>
            Ir al catálogo
          </Link>
        }
      >
        Usá el botón “{t.actions.save}” en cualquier producto para verlo acá.
      </StateMessage>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">
          {saved.length} {saved.length === 1 ? "producto guardado" : "productos guardados"}
        </p>
        <div className="flex gap-2">
          {saved.length >= 2 ? (
            <Link href={`/comparar?ids=${saved.slice(0, 3).map((p) => p.id).join(",")}`} className={buttonClass("secondary")}>
              Comparar
            </Link>
          ) : null}
          <button type="button" onClick={clearSaved} className={buttonClass("ghost")}>
            Vaciar lista
          </button>
        </div>
      </div>
      <h2 className="sr-only">Tus productos guardados</h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((p) => (
          <li key={p.id} className="flex">
            <div className="flex w-full flex-col">
              <ProductCard product={p} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
