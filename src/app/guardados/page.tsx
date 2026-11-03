import type { Metadata } from "next";
import { getProducts } from "@/data";
import { SavedList } from "@/components/products/SavedList";
import { Disclaimer, PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.saved };

import { FondoApp } from "@/components/layout/FondoApp";

export default function SavedPage() {
  return (
    <>
      <FondoApp />
      <PageHeader
        eyebrow={t.nav.saved}
        title="Mis productos guardados"
        description="Tu lista para revisar después."
      />
      <div className="mb-6">
        <Disclaimer>
          Sin cuenta, se guarda solo en este navegador. Ingresá para guardarlo en tu cuenta.
        </Disclaimer>
      </div>
      <SavedList products={getProducts()} />
    </>
  );
}
