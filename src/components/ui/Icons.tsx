import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  chart: <path d="M5 20v-7M12 20V5M19 20v-11" />,
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="5" width="7.5" height="14" rx="2" />
      <rect x="13.5" y="5" width="7.5" height="14" rx="2" />
    </>
  ),
  bookmark: <path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z" />,
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.8-3.3 7.9-8 9-4.7-1.1-8-4.2-8-9V6z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
      <path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.5L5.2 4h13.6L20 9.5M4.5 9.5v10.5h15V9.5" />
      <path d="M4 9.5c0 1.4 1.2 2.5 2.7 2.5S9.4 10.9 9.4 9.5c0 1.4 1.2 2.5 2.6 2.5s2.6-1.1 2.6-2.5c0 1.4 1.2 2.5 2.7 2.5S20 10.9 20 9.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.2" cy="9.2" r="2.4" />
      <path d="M17 14.2c2.4.1 4 2 4 4.8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5l9.5 16.5h-19z" />
      <path d="M12 10v4.5M12 17.2h.01" />
    </>
  ),
};

export type IconName = keyof typeof paths;

/** Íconos de trazo simple (propios, sin librería). Decorativos: no se leen en lectores de pantalla. */
export function Icon({ name, size = 22, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

/** Ícono dentro de una pastilla con degradado de marca. */
export function IconBadge({ name }: { name: IconName }) {
  return (
    <span className="flex size-12 items-center justify-center rounded-2xl border border-radar/30 bg-radar-soft text-radar">
      <Icon name={name} />
    </span>
  );
}
