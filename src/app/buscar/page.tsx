import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/data";
import { meliSignals } from "@/data/meli-signals";
import { BuscadorView } from "@/components/products/BuscadorView";
import { PageHeader } from "@/components/ui/PageHeader";
import { scoreProduct } from "@/lib/score";

export const metadata: Metadata = { title: "Buscar ideas de producto" };

export default function BuscarPage() {
  const productos = getProducts().map((p) => ({ id: p.id, nombre: p.name, categoria: p.category, descripcion: p.description, score: scoreProduct(p).score }));
  const fecha = new Date(meliSignals.fetchedAt).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  return (
    <>
      <PageHeader eyebrow="Buscar" title="Buscá una idea de producto" description="Lo que ya analizamos y lo que se mueve hoy en Mercado Libre, con acceso directo a Tantear." />
      <Suspense fallback={null}>
        <BuscadorView productos={productos} tendencias={meliSignals.trends} categorias={meliSignals.descubrir ?? []} fecha={fecha} />
      </Suspense>
    </>
  );
}
