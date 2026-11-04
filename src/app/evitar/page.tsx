import type { Metadata } from "next";
import Link from "next/link";
import { getRealProducts } from "@/data";
import { avoidList, AVOID_BELOW } from "@/lib/avoid";
import { AvoidCard } from "@/components/products/AvoidCard";
import { buttonVariants } from "@/components/kit/button";

export const metadata: Metadata = {
  title: "Evitá estos",
  description: "Los productos de menor score del catálogo y por qué no conviene comprarlos todavía.",
};

export default function EvitarPage() {
  const lista = avoidList(getRealProducts());
  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-danger">Antes de comprar</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-balance sm:text-5xl">Evitá estos.</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">Score menor a {AVOID_BELOW}: te ahorran una mala compra.</p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((item) => (
          <li key={item.product.id} className="contents">
            <AvoidCard item={item} heading="h2" />
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-muted">Datos sin verificar. Cambian con el precio y el costo real.</p>
      <div className="mt-6">
        <Link href="/hoy" className={buttonVariants({ variant: "dark" })}>Ver los que sí conviene mirar →</Link>
      </div>
    </div>
  );
}
