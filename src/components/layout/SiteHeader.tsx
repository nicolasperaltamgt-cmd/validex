"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { InstallButton } from "@/components/layout/InstallButton";
import { useSession } from "@/state/session-store";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/kit/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/kit/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/kit/dropdown-menu";

/** Lo esencial: lo único que hay en el menú principal. */
const principales = [
  { href: "/hoy", label: t.nav.today },
  { href: "/tantear", label: t.nav.tantear },
  { href: "/importador", label: t.nav.importer },
  { href: "/guardados", label: t.nav.saved },
];

/** Lo demás vive en "Más" (celular) y en el pie de página (PC). */
export const secundarios = [
  { href: "/evitar", label: "Evitá estos" },
  { href: "/oportunidades", label: t.nav.opportunities },
  { href: "/catalogo", label: t.nav.catalog },
  { href: "/calculadora", label: t.nav.calculator },
  { href: "/comparar", label: t.nav.compare },
  { href: "/ayuda", label: t.nav.help },
  { href: "/configuracion", label: t.nav.settings },
];

// El botón de ingreso solo aparece si las cuentas están configuradas en esta publicación.
const HAY_CUENTAS = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export function SiteHeader() {
  const pathname = usePathname();
  const { savedIds, user } = useSession();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const cuenta = HAY_CUENTAS ? { href: "/ingresar", label: user ? "Mi cuenta" : "Ingresar" } : null;
  const menuMas = cuenta ? [...secundarios, cuenta] : secundarios;

  return (
    <header className="sticky top-2 z-40 px-3 sm:px-6">
      <div className="mx-auto mt-2 grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 rounded-full border border-ink/15 bg-paper/90 px-5 shadow-lg shadow-profundo/10 backdrop-blur lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label={`${t.brand} — ${t.nav.home}`} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label={t.nav.main} className="hidden items-center gap-1 lg:flex">
          {principales.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? "bg-radar-soft text-radar-dark"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {l.label}
              {l.href === "/guardados" && savedIds.length > 0 ? (
                <span className="ml-1.5 rounded-full bg-radar px-1.5 py-0.5 text-xs text-paper">{savedIds.length}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex min-h-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5 hover:text-ink">
              Más herramientas
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menuMas.map((l) => (
                <DropdownMenuItem key={l.href} asChild>
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <InstallButton className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-radar hover:bg-ink/5" />
          {pathname !== "/hoy" ? (
            <Link
              href="/hoy"
              className={cn(buttonVariants({ variant: "dark" }), "min-h-0 whitespace-nowrap px-5 py-2")}
            >
              Ver el drop
            </Link>
          ) : null}
          {cuenta ? (
            <Link
              href={cuenta.href}
              aria-current={isActive(cuenta.href) ? "page" : undefined}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              {cuenta.label}
            </Link>
          ) : null}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 px-5 text-sm font-semibold lg:hidden">
            Más
          </DialogTrigger>
          <DialogContent variant="sheet" closeLabel="Cerrar menú" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Más opciones</DialogTitle>
            <nav aria-label="Más opciones" className="pt-8">
              <ul className="flex flex-col">
                {menuMas.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === l.href ? "page" : undefined}
                      className={`flex min-h-11 items-center rounded-lg px-3 text-base font-medium ${
                        pathname === l.href ? "bg-radar-soft text-radar-dark" : "text-ink"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-2 px-3">
                <InstallButton className="min-h-11 w-full rounded-lg border border-radar/40 px-4 text-sm font-semibold text-radar" />
              </div>
            </nav>
          </DialogContent>
        </Dialog>
      </div>

    </header>
  );
}
