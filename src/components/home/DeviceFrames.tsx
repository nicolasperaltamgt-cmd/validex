import Image from "next/image";

/** Marco de navegador con una captura real de Validex (datos ficticios). */
export function BrowserFrame({
  src,
  alt,
  label,
  priority = false,
}: {
  src: string;
  alt: string;
  label: string;
  priority?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border-2 border-profundo bg-panel shadow-2xl shadow-radar/15">
      <figcaption className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-muted">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2 rounded-full bg-ink/20" />
          <span className="size-2 rounded-full bg-ink/20" />
          <span className="size-2 rounded-full bg-ink/20" />
        </span>
        <span className="ml-2 truncate">{label}</span>
        <span className="ml-auto shrink-0 rounded-full border border-signal/30 bg-signal-soft px-2 py-0.5 text-[11px] font-medium text-signal">
          Datos ficticios
        </span>
      </figcaption>
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={860}
        priority={priority}
        sizes="(min-width: 1024px) 700px, 100vw"
        className="h-auto w-full"
      />
    </figure>
  );
}

/** Marco de celular con una captura real de Validex en pantalla chica. */
export function PhoneFrame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={`overflow-hidden rounded-[2.2rem] border-[7px] border-[#2a2145] bg-paper shadow-2xl shadow-black/50 ${className}`}>
      <Image src={src} alt={alt} width={390} height={844} sizes="220px" className="h-auto w-full" />
    </figure>
  );
}
