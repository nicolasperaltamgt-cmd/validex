import type { Metadata } from "next";
import { getProducts } from "@/data";
import { CatalogView } from "@/components/products/CatalogView";
import { PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.catalog };

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.catalog}
        title="Catálogo de productos"
        description="Buscá y filtrá. Cada producto indica si su dato es una referencia real sin verificar o un ejemplo ficticio."
      />
      <CatalogView products={getProducts()} />
    </>
  );
}
