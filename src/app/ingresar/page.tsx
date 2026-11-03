import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function AccountPage() {
  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Mi cuenta" description="Ingresá para guardar tus productos de forma permanente." />
      <AccountPanel />
    </>
  );
}
