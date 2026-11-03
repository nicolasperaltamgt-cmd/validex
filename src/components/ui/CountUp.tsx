"use client";

import { useEffect, useState } from "react";

/** Número que sube de 0 hasta su valor. Con "menos movimiento" activado, muestra el valor final directo. */
export function CountUp({ valor, duracion = 900, className = "" }: { valor: number; duracion?: number; className?: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(valor);
      return;
    }
    let cuadro = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      setN(Math.round(valor * suave));
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, duracion]);

  return <span className={className}>{n}</span>;
}
