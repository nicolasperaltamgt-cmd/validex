import type { Metadata } from "next";
import { Suspense } from "react";
import { TantearForm } from "@/components/calculator/TantearForm";

export const metadata: Metadata = { title: "Tantear un producto" };

import { FondoApp } from "@/components/layout/FondoApp";

export default function TantearPage() {
  return (
    <>
      <FondoApp />
      <Suspense fallback={null}>
        <TantearForm />
      </Suspense>
    </>
  );
}
