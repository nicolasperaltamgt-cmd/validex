import Image from "next/image";
import Link from "next/link";
import type { AvoidItem } from "@/lib/avoid";
import { formatMoney, formatPercent } from "@/lib/format";
import { cardClass } from "@/components/kit/card";
import { cn } from "@/lib/cn";

/** Tarjeta de un producto que no conviene: score bajo, números clave y los motivos en etiquetas cortas. */
export function AvoidCard({ item, heading: Heading = "h3" }: { item: AvoidItem; heading?: "h2" | "h3" }) {
  const { product: p } = item;
  return (
    <article className={cn(cardClass, "flex flex-col overflow-hidden")}>
      <div className="relative aspect-[4/3] bg-panel">
        {p.image ? <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-contain" /> : null}
        <span className="absolute right-3 top-3 rounded-full bg-danger px-3 py-1 font-display text-lg font-black text-white">{item.score}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Heading className="font-display text-lg font-bold leading-snug">{p.name}</Heading>
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.reasons.map((r) => (
            <li key={r} className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">{r}</li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
          <div>
            <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Margen</dt>
            <dd className={cn("font-bold tabular-nums", item.marginPct < 0 && "text-danger")}>{formatPercent(item.marginPct)}</dd>
          </div>
          <div>
            <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">Ganancia</dt>
            <dd className={cn("font-bold tabular-nums", item.profit < 0 && "text-danger")}>{formatMoney(item.profit, "USD")}</dd>
          </div>
        </dl>
        <Link href={`/analisis/${p.id}`} className="mt-4 text-sm font-bold text-radar-dark underline underline-offset-4">
          Ver por qué<span className="sr-only"> {p.name}</span> →
        </Link>
      </div>
    </article>
  );
}
