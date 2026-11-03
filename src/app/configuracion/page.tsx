import type { Metadata } from "next";
import { SettingsForm } from "@/components/SettingsForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t.nav.settings };

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow={t.nav.settings} title="Configuración" description="Preferencias de esta sesión." />
      <SettingsForm />
    </>
  );
}
