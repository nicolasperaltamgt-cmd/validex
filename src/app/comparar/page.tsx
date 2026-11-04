import type { Metadata } from "next";
import { getProducts } from "@/data";
import { CompareView } from "@/components/products/CompareView";
import { Disclaimer, PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: "Comparar productos" };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const initialIds = ids ? ids.split(",").map((x) => x.trim()).filter(Boolean) : [];

  return (
    <>
      <PageHeader
        eyebrow="Comparar"
        title="Compará productos lado a lado"
        description="Elegí hasta 3. Todas son referencias reales con fuente, todavía sin verificar."
      />
      <CompareView products={getProducts()} initialIds={initialIds} />
      <div className="mt-8">
        <Disclaimer>{t.disclaimerShort}</Disclaimer>
      </div>
    </>
  );
}
