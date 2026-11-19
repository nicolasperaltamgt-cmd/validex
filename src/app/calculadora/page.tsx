import type { Metadata } from "next";
import { Suspense } from "react";
import { CalculatorFromUrl } from "@/components/calculator/CalculatorFromUrl";
import { PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.calculator };

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.calculator}
        title="Calculadora de costos y margen"
        description="Cargá tus costos y mirá tu margen al instante."
      />
      <Suspense fallback={null}>
        <CalculatorFromUrl />
      </Suspense>
    </>
  );
}
