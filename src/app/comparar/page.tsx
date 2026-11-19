import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareFromUrl } from "@/components/products/CompareFromUrl";
import { Disclaimer, PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: "Comparar productos" };

export default function ComparePage() {
  return (
    <>
      <PageHeader
        eyebrow="Comparar"
        title="Compará productos lado a lado"
        description="Elegí hasta 3. Todas son referencias reales con fuente, todavía sin verificar."
      />
      <Suspense fallback={null}>
        <CompareFromUrl />
      </Suspense>
      <div className="mt-8">
        <Disclaimer>{t.disclaimerShort}</Disclaimer>
      </div>
    </>
  );
}
