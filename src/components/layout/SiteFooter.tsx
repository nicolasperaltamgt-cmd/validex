import Link from "next/link";
import { t } from "@/i18n";

export function DemoBanner() {
  return (
    <div role="region" aria-label="Aviso de versión de prueba" className="border-b border-line bg-panel px-4 py-2 text-center text-xs text-ink-soft sm:text-sm">
      <span aria-hidden="true" className="mr-1.5 text-signal">◆</span>
      Versión de prueba: datos sin verificar.{" "}
      <Link href="/ayuda" className="font-semibold underline underline-offset-2">
        Más información
      </Link>
    </div>
  );
}

const herramientas = [
  { href: "/oportunidades", label: t.nav.opportunities },
  { href: "/catalogo", label: t.nav.catalog },
  { href: "/calculadora", label: t.nav.calculator },
  { href: "/comparar", label: t.nav.compare },
  { href: "/categorias", label: "Oferta por categoría" },
];

const legales = [
  { href: "/presentacion", label: "Presentación" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/ayuda", label: t.nav.help },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "/configuracion", label: t.nav.settings },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-muted sm:px-6">
        <nav aria-label="Más herramientas">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li className="font-semibold text-ink-soft">Más herramientas</li>
            {herramientas.map((l) => (
              <li key={l.href}>
                <Link className="hover:text-ink hover:underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {legales.map((l) => (
            <li key={l.href}>
              <Link className="hover:text-ink hover:underline" href={l.href}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>© {t.brand} — versión de prueba</li>
        </ul>
        <p className="max-w-xl leading-relaxed">{t.disclaimerShort}</p>
      </div>
    </footer>
  );
}
