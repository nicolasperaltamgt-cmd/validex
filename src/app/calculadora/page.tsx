import type { Metadata } from "next";
import { getProduct } from "@/data";
import { Calculator, type CalcDefaults } from "@/components/calculator/Calculator";
import { PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.calculator };

// Valores de ejemplo editables (no representan ningún producto real).
const EXAMPLE: CalcDefaults = {
  purchase: "10",
  shipping: "3",
  taxes: "2",
  commissionPct: "10",
  salePrice: "25",
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>;
}) {
  const { producto } = await searchParams;
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

  return (
    <>
      <PageHeader
        eyebrow={t.nav.calculator}
        title="Calculadora de costos y margen"
        description="Cargá tus costos y mirá tu margen al instante."
      />
      <Calculator
        key={product?.id ?? "ejemplo"}
        defaults={defaults}
        productName={product?.name}
      />
    </>
  );
}
