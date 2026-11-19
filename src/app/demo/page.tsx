import type { Metadata } from "next";
import { getRealProducts } from "@/data";
import { DemoView } from "@/components/products/DemoView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Probá con tu presupuesto" };

export default function DemoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demo en un minuto"
        title="Encontrá tu primera oportunidad"
        description="Ingresá tu presupuesto, mirá qué conviene investigar primero y entendé su rentabilidad y sus riesgos. Los datos son referencias reales todavía sin verificar."
      />
      <DemoView products={getRealProducts()} />
    </>
  );
}
