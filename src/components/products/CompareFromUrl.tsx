"use client";

import { useSearchParams } from "next/navigation";
import { getProducts } from "@/data";
import { CompareView } from "@/components/products/CompareView";

/** Lee `?ids=` en el navegador (así la página puede publicarse como archivo estático). */
export function CompareFromUrl() {
  const ids = useSearchParams().get("ids");
  const initialIds = ids ? ids.split(",").map((x) => x.trim()).filter(Boolean) : [];
  return <CompareView products={getProducts()} initialIds={initialIds} />;
}
