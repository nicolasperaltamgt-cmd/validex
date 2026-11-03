"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Hace que su contenido aparezca de a poco cuando se llega a verlo al bajar.
 * Si el navegador no soporta la detección o la persona prefiere menos movimiento, se muestra directo.
 */
export function Reveal({
  children,
  retraso = 0,
  className = "",
}: {
  children: ReactNode;
  /** Demora en milisegundos, para escalonar varios elementos. */
  retraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisto(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`aparece ${visto ? "visto" : ""} ${className}`}
      style={{ "--retraso": `${retraso}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
