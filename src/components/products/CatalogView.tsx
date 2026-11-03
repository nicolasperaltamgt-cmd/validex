"use client";

import { useMemo, useState } from "react";
import type { Competition, Product, Trend } from "@/data/types";
import { assess } from "@/lib/assessment";
import { buttonClass } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/StateMessage";
import { ProductCard } from "./ProductCard";
import { t } from "@/i18n";
import { Input } from "@/components/kit/input";
import { NativeSelect } from "@/components/kit/native-select";
import { scoreProduct } from "@/lib/score";

type Sort = "score" | "name" | "margin" | "recent";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function CatalogView({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [market, setMarket] = useState("");
  const [trend, setTrend] = useState<"" | Trend>("");
  const [competition, setCompetition] = useState<"" | Competition>("");
  const [sort, setSort] = useState<Sort>("score");

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);
  const markets = useMemo(() => [...new Set(products.map((p) => p.market))].sort(), [products]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list = products.filter(
      (p) =>
        (!q || normalize(`${p.name} ${p.category} ${p.market}`).includes(q)) &&
        (!category || p.category === category) &&
        (!market || p.market === market) &&
        (!trend || p.trend === trend) &&
        (!competition || p.competition === competition),
    );
    const margin = (p: Product) => assess(p).calc.marginPct;
    const score = (p: Product) => scoreProduct(p).score;
    return [...list].sort((a, b) =>
      sort === "score"
        ? score(b) - score(a)
        : sort === "margin"
        ? margin(b) - margin(a)
        : sort === "recent"
          ? b.updatedAt.localeCompare(a.updatedAt)
          : a.name.localeCompare(b.name, "es"),
    );
  }, [products, query, category, market, trend, competition, sort]);

  const hasFilters = Boolean(query || category || market || trend || competition);
  const clear = () => {
    setQuery("");
    setCategory("");
    setMarket("");
    setTrend("");
    setCompetition("");
  };

  return (
    <div>
      <form
        role="search"
        aria-label="Buscar y filtrar productos"
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 rounded-2xl border-2 border-profundo bg-surface p-4"
      >
        <div className="mb-3">
          <label htmlFor="q" className="mb-1 block text-sm font-medium">
            Buscar
          </label>
          <Input
            id="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre, categoría o país"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select id="cat" label="Categoría" value={category} onChange={setCategory}
            options={categories.map((c) => [c, c])} />
          <Select id="mkt" label="Mercado" value={market} onChange={setMarket}
            options={markets.map((m) => [m, m])} />
          <Select id="trd" label="Tendencia" value={trend} onChange={(v) => setTrend(v as "" | Trend)}
            options={(["up", "steady", "down"] as const).map((k) => [k, t.trend[k]])} />
          <Select id="cmp" label="Competencia" value={competition}
            onChange={(v) => setCompetition(v as "" | Competition)}
            options={(["low", "medium", "high"] as const).map((k) => [k, t.competition[k]])} />
          <Select id="srt" label="Ordenar por" value={sort} onChange={(v) => setSort(v as Sort)}
            options={[["score", "Score (mayor primero)"], ["name", "Nombre"], ["margin", "Margen ilustrativo"], ["recent", "Más recientes"]]}
            allowEmpty={false} />
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {results.length} de {products.length} productos
        </p>
        {hasFilters ? (
          <button type="button" onClick={clear} className={buttonClass("ghost")}>
            {t.actions.clearFilters}
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <StateMessage
          kind="empty"
          title="Sin resultados"
          action={
            <button type="button" onClick={clear} className={buttonClass("primary")}>
              {t.actions.clearFilters}
            </button>
          }
        >
          Ningún producto de demostración coincide con tu búsqueda. Probá con otros términos o quitá filtros.
        </StateMessage>
      ) : (
        <>
        <h2 className="sr-only">Productos</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <li key={p.id} className="flex">
              <div className="flex w-full flex-col">
                <ProductCard product={p} />
              </div>
            </li>
          ))}
        </ul>
        </>
      )}
    </div>
  );
}

function Select({
  id, label, value, onChange, options, allowEmpty = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (readonly [string, string])[];
  allowEmpty?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)} className="text-sm">
        {allowEmpty ? <option value="">Todas</option> : null}
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
