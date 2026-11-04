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
        description="Buscá y filtrá. Todas son referencias reales con fuente, todavía sin verificar."
      />
      <CatalogView products={getProducts()} />
    </>
  );
}
