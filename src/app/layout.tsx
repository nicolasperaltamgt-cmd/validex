import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/layout/RegisterServiceWorker";
import { SessionProvider } from "@/state/session-store";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DemoBanner, SiteFooter } from "@/components/layout/SiteFooter";
import { SyncNotice } from "@/components/layout/SyncNotice";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { t } from "@/i18n";
import { Toaster } from "@/components/kit/sonner";
import { TooltipProvider } from "@/components/kit/tooltip";
import { conBase } from "@/lib/base-path";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: "Validex",
  // Versión de prueba: no se ofrece a los buscadores salvo que se publique con NEXT_PUBLIC_INDEXAR=si.
  robots: process.env.NEXT_PUBLIC_INDEXAR === "si" ? undefined : { index: false, follow: false },
  appleWebApp: { capable: true, title: "Validex", statusBarStyle: "black-translucent" },
  icons: { apple: conBase("/icons/apple-touch-icon.png") },
  openGraph: {
    title: `${t.brand} — ${t.brandTagline}`,
    description: "Evaluá productos y calculá tu margen en segundos. Versión de prueba con datos reales sin verificar y de ejemplo.",
    images: [{ url: conBase("/images/og.png"), width: 1200, height: 630, alt: "Validex: validá antes de invertir" }],
    locale: "es_AR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  title: { default: `${t.brand} — ${t.brandTagline}`, template: `%s · ${t.brand}` },
  description:
    "Descubrí oportunidades comerciales, evaluá productos y validá su potencial antes de invertir. Versión de prueba con referencias reales sin verificar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-dvh overflow-x-clip flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <noscript>
          <style>{`.aparece{opacity:1!important}`}</style>
        </noscript>
        <a
          href="#contenido"
          className="sr-only z-50 rounded-lg bg-radar px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <SessionProvider>
          <TooltipProvider delayDuration={200}>
          <DemoBanner />
          <SiteHeader />
          <SyncNotice />
          <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            {children}
          </main>
          <SiteFooter />
          <MobileTabBar />
          <Toaster />
          <RegisterServiceWorker />
        </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
