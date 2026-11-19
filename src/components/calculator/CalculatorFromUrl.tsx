"use client";

import { useSearchParams } from "next/navigation";
import { getProduct } from "@/data";
import { Calculator, type CalcDefaults } from "@/components/calculator/Calculator";

// Valores de ejemplo editables (no representan ningún producto real).
const EXAMPLE: CalcDefaults = {
  purchase: "10",
  shipping: "3",
  taxes: "2",
  commissionPct: "10",
  salePrice: "25",
};

/** Lee `?producto=` en el navegador (así la página puede publicarse como archivo estático) y precarga sus costos. */
export function CalculatorFromUrl() {
  const producto = useSearchParams().get("producto");
  const product = producto ? getProduct(producto) : undefined;

  const defaults: CalcDefaults = product
    ? {
        purchase: String(product.costs.purchase),
        shipping: String(product.costs.shipping),
        taxes: String(product.costs.taxes),
        commissionPct: String(product.costs.commissionPct),
        salePrice: String(product.referencePriceUsd),
      }
    : EXAMPLE;

  return <Calculator key={product?.id ?? "ejemplo"} defaults={defaults} productName={product?.name} />;
}
