import type { Metadata } from "next";
import { DropView } from "@/components/products/DropView";
import { Disclaimer } from "@/components/ui/PageHeader";
import { fetchDolar } from "@/lib/dolar";

export const metadata: Metadata = { title: "Tu drop del día" };

// La cotización se vuelve a pedir como máximo cada 10 minutos.
export const revalidate = 600;

import { FondoApp } from "@/components/layout/FondoApp";

export default async function TodayPage() {
  const dolar = await fetchDolar();
  return (
    <>
      <FondoApp />
      <DropView dolar={dolar} />
      <div className="mx-auto mt-10 max-w-5xl">
        <Disclaimer>
          Referencias sin verificar, con sus fuentes en cada producto. El score es una regla simple, no una predicción de ventas.
        </Disclaimer>
      </div>
    </>
  );
}
