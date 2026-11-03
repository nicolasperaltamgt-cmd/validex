"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TABS = [
  {
    href: "/hoy",
    label: "Drop",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.2" />
      </svg>
    ),
  },
  {
    href: "/tantear",
    label: "Tantear",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </svg>
    ),
  },
  {
    href: "/importador",
    label: "Importador",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 9.5h8M8 12.5h5" />
      </svg>
    ),
  },
  {
    href: "/guardados",
    label: "Guardados",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
];

/** Pestañas fijas abajo, solo en pantallas chicas. En pantallas grandes se usa el menú de arriba. */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Pestañas"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 rounded-full border border-ink/15 bg-paper/90 px-2 shadow-xl shadow-black/15 backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`m-1 flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-semibold ${
                  active ? "bg-radar-soft font-bold text-ink" : "text-ink/75"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
